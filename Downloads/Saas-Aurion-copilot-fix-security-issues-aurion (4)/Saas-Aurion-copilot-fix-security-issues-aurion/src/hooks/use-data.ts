 
// React Query hooks for data fetching and mutations
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useClerkSafe } from './use-clerk-safe';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  localStorageService, 
  mockWorkData, 
  mockTeamMembers,
  mockProfile,
  delay 
} from '@/services/mock-data';
import { useTasksStore, useEventsStore, useStatsStore } from '@/stores/app-store';
import { useToast } from '@/components/ui/use-toast';
import type { Task, Event, Generation } from '@/types/database';

// ============================================
// TASKS HOOKS
// ============================================
export function useTasks() {
  const { user } = useClerkSafe();
  const { setTasks, setLoading, setError } = useTasksStore();
  
  return useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      setLoading(true);
      try {
        await delay(300);
        
        const supabase = getSupabase();
        if (isSupabaseConfigured() && user && supabase) {
          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          setTasks(data || []);
          return data || [];
        }
        
        // Fallback to local storage
        const tasks = localStorageService.getTasks();
        setTasks(tasks);
        return tasks;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load tasks';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    enabled: true,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { addTask } = useTasksStore();
  const { toast } = useToast();
  const { user } = useClerkSafe();
  
  return useMutation({
    mutationFn: async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      await delay(200);
      
      const newTask: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        user_id: user?.id || 'local',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const supabase = getSupabase();
      if (isSupabaseConfigured() && user && supabase) {
        const { data, error } = await supabase
          .from('tasks')
          .insert(newTask as never)
          .select()
          .single();
        
        if (error) throw error;
        return data as Task;
      }
      
      // Local storage fallback
      const tasks = localStorageService.getTasks();
      tasks.unshift(newTask);
      localStorageService.saveTasks(tasks);
      return newTask;
    },
    onSuccess: (task) => {
      addTask(task);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Tâche créée',
        description: 'La tâche a été ajoutée avec succès.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de créer la tâche',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { updateTask } = useTasksStore();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      await delay(150);
      
      const supabase = getSupabase();
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('tasks')
          .update({ ...updates, updated_at: new Date().toISOString() } as never)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data as Task;
      }
      
      // Local storage fallback
      const tasks = localStorageService.getTasks();
      const index = tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updates, updated_at: new Date().toISOString() };
        localStorageService.saveTasks(tasks);
        return tasks[index];
      }
      throw new Error('Task not found');
    },
    onSuccess: (task) => {
      updateTask(task.id, task);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de modifier la tâche',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { deleteTask } = useTasksStore();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(150);
      
      const supabase = getSupabase();
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) throw error;
        return id;
      }
      
      // Local storage fallback
      const tasks = localStorageService.getTasks().filter(t => t.id !== id);
      localStorageService.saveTasks(tasks);
      return id;
    },
    onSuccess: (id) => {
      deleteTask(id);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Tâche supprimée',
        description: 'La tâche a été supprimée.',
      });
    },
  });
}

// ============================================
// EVENTS HOOKS
// ============================================
export function useEvents() {
  const { user } = useClerkSafe();
  const { setEvents } = useEventsStore();
  
  return useQuery({
    queryKey: ['events', user?.id],
    queryFn: async () => {
      await delay(300);
      
      const supabase = getSupabase();
      if (isSupabaseConfigured() && user && supabase) {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id)
          .order('start_time', { ascending: true });
        
        if (error) throw error;
        setEvents(data || []);
        return data || [];
      }
      
      const events = localStorageService.getEvents();
      setEvents(events);
      return events;
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const { addEvent } = useEventsStore();
  const { toast } = useToast();
  const { user } = useClerkSafe();
  
  return useMutation({
    mutationFn: async (eventData: Omit<Event, 'id' | 'created_at' | 'user_id'>) => {
      await delay(200);
      
      const newEvent: Event = {
        ...eventData,
        id: crypto.randomUUID(),
        user_id: user?.id || 'local',
        created_at: new Date().toISOString(),
      };
      
      const supabase = getSupabase();
      if (isSupabaseConfigured() && user && supabase) {
        const { data, error } = await supabase
          .from('events')
          .insert(newEvent as never)
          .select()
          .single();
        
        if (error) throw error;
        return data as Event;
      }
      
      const events = localStorageService.getEvents();
      events.push(newEvent);
      localStorageService.saveEvents(events);
      return newEvent;
    },
    onSuccess: (event) => {
      addEvent(event);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Événement créé',
        description: 'L\'événement a été ajouté au calendrier.',
      });
    },
  });
}

// ============================================
// STATS HOOKS
// ============================================
export function useStats() {
  const { setStats } = useStatsStore();
  
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      await delay(400);
      const stats = {
        revenue: "$124,500",
        users: "45.2k",
        bounceRate: "42%",
        interviews: 12,
        hired: 3,
        onboardingProgress: 68,
        output: 45,
        employees: 24,
        hirings: 5,
        projects: 8,
        weeklyHours: 32.5
      };
      setStats(stats);
      return stats;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useWorkData() {
  return useQuery({
    queryKey: ['workData'],
    queryFn: async () => {
      await delay(300);
      return mockWorkData;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useTeamMembers() {
  return useQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      await delay(200);
      return mockTeamMembers;
    },
    staleTime: 1000 * 60 * 30,
  });
}

// ============================================
// GENERATIONS HOOKS
// ============================================
export function useGenerations() {
  const { user } = useClerkSafe();
  
  return useQuery({
    queryKey: ['generations', user?.id],
    queryFn: async () => {
      await delay(300);
      
      const supabase = getSupabase();
      if (isSupabaseConfigured() && user && supabase) {
        const { data, error } = await supabase
          .from('generations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
      }
      
      return localStorageService.getGenerations();
    },
  });
}

export function useCreateGeneration() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useClerkSafe();
  
  return useMutation({
    mutationFn: async (data: { type: 'image' | 'video'; prompt: string }) => {
      await delay(2000);
      
      const newGeneration: Generation = {
        id: crypto.randomUUID(),
        user_id: user?.id || 'local',
        type: data.type,
        prompt: data.prompt,
        result_url: data.type === 'image' 
          ? `https://picsum.photos/seed/${Date.now()}/1024/1024`
          : null,
        status: 'completed',
        metadata: { style: 'realistic' },
        created_at: new Date().toISOString(),
      };
      
      const supabase = getSupabase();
      if (isSupabaseConfigured() && user && supabase) {
        const { data: inserted, error } = await supabase
          .from('generations')
          .insert(newGeneration as never)
          .select()
          .single();
        
        if (error) throw error;
        return inserted as Generation;
      }
      
      const generations = localStorageService.getGenerations();
      generations.unshift(newGeneration);
      localStorageService.saveGenerations(generations);
      return newGeneration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generations'] });
      toast({
        title: 'Génération terminée !',
        description: 'Votre contenu a été créé avec succès.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur de génération',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    },
  });
}

// ============================================
// USER PROFILE HOOK
// ============================================
export function useProfile() {
  const { user } = useClerkSafe();
  
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      await delay(200);
      
      const supabase = getSupabase();
      if (isSupabaseConfigured() && user && supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('clerk_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data;
      }
      
      // Return mock profile with Clerk user data merged
      return {
        ...mockProfile,
        full_name: user?.fullName || mockProfile.full_name,
        email: user?.primaryEmailAddress?.emailAddress || mockProfile.email,
        avatar_url: user?.imageUrl || mockProfile.avatar_url,
      };
    },
    enabled: !!user,
  });
}
