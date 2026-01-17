/**
 * @fileoverview Zustand stores for application state management
 * 
 * These stores handle local state for various features:
 * - Timer tracking for projects
 * - Task management
 * - Calendar events
 * - Projects and generations
 * - UI preferences (persisted)
 * - Dashboard statistics
 * 
 * @module stores/app-store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Task, Project, Event, Generation, StatsState } from '@/types/database';

// ============================================
// CONSTANTS
// ============================================

/** Storage key for UI settings persistence */
const UI_STORAGE_KEY = 'aurion-ui-settings' as const;

/** Maximum number of items to keep in history */
const MAX_HISTORY_ITEMS = 100 as const;

// ============================================
// TIMER STORE - For time tracking
// ============================================

/**
 * Timer state and actions for project time tracking
 */
interface TimerState {
  /** Whether the timer is currently running */
  readonly isRunning: boolean;
  /** Total elapsed seconds */
  readonly elapsedSeconds: number;
  /** Start timestamp in milliseconds, null if not started */
  readonly startTime: number | null;
  /** Associated project ID */
  readonly currentProjectId: string | null;
  
  // Actions
  /** Start the timer, optionally associating with a project */
  start: (projectId?: string) => void;
  /** Pause the timer */
  pause: () => void;
  /** Reset the timer to initial state */
  reset: () => void;
  /** Update elapsed time (called by interval) */
  tick: () => void;
}

/**
 * Timer store for tracking time spent on projects
 * 
 * @example
 * ```tsx
 * const { isRunning, elapsedSeconds, start, pause } = useTimerStore();
 * 
 * // Start timer for a project
 * start('project-123');
 * 
 * // In a useEffect, call tick every second
 * useEffect(() => {
 *   const interval = setInterval(() => tick(), 1000);
 *   return () => clearInterval(interval);
 * }, [tick]);
 * ```
 */
export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  elapsedSeconds: 0,
  startTime: null,
  currentProjectId: null,
  
  start: (projectId) => {
    const { elapsedSeconds } = get();
    set({
      isRunning: true,
      startTime: Date.now() - elapsedSeconds * 1000,
      currentProjectId: projectId ?? null,
    });
  },
  
  pause: () => {
    set({ isRunning: false });
  },
  
  reset: () => {
    set({
      isRunning: false,
      elapsedSeconds: 0,
      startTime: null,
      currentProjectId: null,
    });
  },
  
  tick: () => {
    const { isRunning, startTime } = get();
    if (isRunning && startTime !== null) {
      set({ elapsedSeconds: Math.floor((Date.now() - startTime) / 1000) });
    }
  },
}));

// ============================================
// TASKS STORE - Local task management
// ============================================

/**
 * Task state and actions for local task management
 */
interface TasksState {
  /** List of user tasks */
  readonly tasks: readonly Task[];
  /** Loading state indicator */
  readonly isLoading: boolean;
  /** Error message if any */
  readonly error: string | null;
  
  // Actions
  /** Set all tasks (from API) */
  setTasks: (tasks: Task[]) => void;
  /** Add a new task */
  addTask: (task: Task) => void;
  /** Update an existing task by ID */
  updateTask: (id: string, updates: Partial<Task>) => void;
  /** Remove a task by ID */
  deleteTask: (id: string) => void;
  /** Toggle task completion status */
  toggleTaskStatus: (id: string) => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Set error message */
  setError: (error: string | null) => void;
  /** Clear all tasks */
  clearTasks: () => void;
}

/**
 * Tasks store for managing user tasks
 * 
 * @example
 * ```tsx
 * const { tasks, addTask, toggleTaskStatus } = useTasksStore();
 * 
 * // Add a new task
 * addTask({ id: '1', title: 'New task', ... });
 * 
 * // Toggle completion
 * toggleTaskStatus('1');
 * ```
 */
export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,
  
  setTasks: (tasks) => set({ tasks, error: null }),
  
  addTask: (task) => set((state) => ({ 
    tasks: [task, ...state.tasks].slice(0, MAX_HISTORY_ITEMS),
    error: null,
  })),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
  })),
  
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id),
  })),
  
  toggleTaskStatus: (id) => set((state) => ({
    tasks: state.tasks.map((t) =>
      t.id === id
        ? { 
            ...t, 
            completed: !t.completed,
            status: !t.completed ? 'completed' : 'pending',
          }
        : t
    ),
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearTasks: () => set({ tasks: [], error: null }),
}));

// ============================================
// EVENTS STORE - Calendar events
// ============================================

/**
 * Events state and actions for calendar management
 */
interface EventsState {
  /** List of calendar events */
  readonly events: readonly Event[];
  /** Currently selected date */
  readonly selectedDate: Date;
  
  // Actions
  /** Set all events (from API) */
  setEvents: (events: Event[]) => void;
  /** Add a new event */
  addEvent: (event: Event) => void;
  /** Update an existing event by ID */
  updateEvent: (id: string, updates: Partial<Event>) => void;
  /** Remove an event by ID */
  deleteEvent: (id: string) => void;
  /** Change selected date */
  setSelectedDate: (date: Date) => void;
  /** Get events for a specific date */
  getEventsForDate: (date: Date) => Event[];
}

/**
 * Events store for calendar management
 */
export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  selectedDate: new Date(),
  
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  updateEvent: (id, updates) => set((state) => ({
    events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
  })),
  deleteEvent: (id) => set((state) => ({
    events: state.events.filter((e) => e.id !== id),
  })),
  setSelectedDate: (date) => set({ selectedDate: date }),
  getEventsForDate: (date) => {
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);
    
    return get().events.filter(e => {
      const eventDate = new Date(e.start_time);
      return eventDate >= dateStart && eventDate <= dateEnd;
    });
  },
}));

// ============================================
// PROJECTS STORE - Project management
// ============================================

/**
 * Projects state and actions
 */
interface ProjectsState {
  /** List of user projects */
  readonly projects: readonly Project[];
  /** Currently active project ID */
  readonly currentProjectId: string | null;
  
  // Actions
  /** Set all projects (from API) */
  setProjects: (projects: Project[]) => void;
  /** Add a new project */
  addProject: (project: Project) => void;
  /** Update an existing project */
  updateProject: (id: string, updates: Partial<Project>) => void;
  /** Remove a project */
  deleteProject: (id: string) => void;
  /** Set current active project */
  setCurrentProject: (id: string | null) => void;
  /** Get project by ID */
  getProjectById: (id: string) => Project | undefined;
}

/**
 * Projects store for project management
 */
export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  currentProjectId: null,
  
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
  })),
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== id),
    currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
  })),
  setCurrentProject: (id) => set({ currentProjectId: id }),
  getProjectById: (id) => get().projects.find(p => p.id === id),
}));

// ============================================
// GENERATIONS STORE - AI generations history
// ============================================

/**
 * Generations state and actions for AI content history
 */
interface GenerationsState {
  /** List of AI generations */
  readonly generations: readonly Generation[];
  /** Currently selected generation */
  readonly currentGeneration: Generation | null;
  /** Whether a generation is in progress */
  readonly isGenerating: boolean;
  
  // Actions
  /** Set all generations (from API) */
  setGenerations: (generations: Generation[]) => void;
  /** Add a new generation (prepended) */
  addGeneration: (generation: Generation) => void;
  /** Update an existing generation */
  updateGeneration: (id: string, updates: Partial<Generation>) => void;
  /** Remove a generation */
  deleteGeneration: (id: string) => void;
  /** Set current generation */
  setCurrentGeneration: (generation: Generation | null) => void;
  /** Set generating state */
  setIsGenerating: (generating: boolean) => void;
}

/**
 * Generations store for AI content history
 */
export const useGenerationsStore = create<GenerationsState>((set) => ({
  generations: [],
  currentGeneration: null,
  isGenerating: false,
  
  setGenerations: (generations) => set({ generations }),
  addGeneration: (generation) => set((state) => ({ 
    generations: [generation, ...state.generations].slice(0, MAX_HISTORY_ITEMS),
  })),
  updateGeneration: (id, updates) => set((state) => ({
    generations: state.generations.map((g) => (g.id === id ? { ...g, ...updates } : g)),
  })),
  deleteGeneration: (id) => set((state) => ({
    generations: state.generations.filter((g) => g.id !== id),
    currentGeneration: state.currentGeneration?.id === id ? null : state.currentGeneration,
  })),
  setCurrentGeneration: (generation) => set({ currentGeneration: generation }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
}));

// ============================================
// UI STORE - UI state (persisted)
// ============================================

/** Theme options */
type Theme = 'light' | 'dark' | 'system';

/**
 * UI state and actions for persisted UI preferences
 */
interface UIState {
  /** Whether sidebar is collapsed */
  readonly sidebarCollapsed: boolean;
  /** Current theme setting */
  readonly theme: Theme;
  /** Whether notifications are enabled */
  readonly notifications: boolean;
  /** Locale/language preference */
  readonly locale: string;
  
  // Actions
  /** Toggle sidebar collapsed state */
  toggleSidebar: () => void;
  /** Set collapsed state directly */
  setSidebarCollapsed: (collapsed: boolean) => void;
  /** Set theme preference */
  setTheme: (theme: Theme) => void;
  /** Toggle notifications */
  toggleNotifications: () => void;
  /** Set locale */
  setLocale: (locale: string) => void;
  /** Reset all UI preferences to defaults */
  resetUIPreferences: () => void;
}

/** Default UI state values */
const DEFAULT_UI_STATE = {
  sidebarCollapsed: false,
  theme: 'light' as Theme,
  notifications: true,
  locale: 'fr',
} as const;

/**
 * UI store for persisted UI preferences
 * Automatically persists to localStorage
 */
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      ...DEFAULT_UI_STATE,
      
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setTheme: (theme) => set({ theme }),
      toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
      setLocale: (locale) => set({ locale }),
      resetUIPreferences: () => set(DEFAULT_UI_STATE),
    }),
    {
      name: UI_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Only persist specific fields
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        notifications: state.notifications,
        locale: state.locale,
      }),
    }
  )
);

// ============================================
// STATS STORE - Dashboard statistics
// ============================================

/**
 * Stats state and actions for dashboard data
 */
interface StatsStore {
  /** Dashboard statistics */
  readonly stats: Readonly<Partial<StatsState>>;
  /** Last update timestamp */
  readonly lastUpdated: Date | null;
  
  // Actions
  /** Update stats (merges with existing) */
  setStats: (stats: Partial<StatsState>) => void;
  /** Clear all stats */
  clearStats: () => void;
}

/** Default stats values */
const DEFAULT_STATS: Partial<StatsState> = {
  employees: 0,
  hirings: 0,
  projects: 0,
  weeklyHours: 0,
  onboardingProgress: 0,
} as const;

/**
 * Stats store for dashboard statistics
 */
export const useStatsStore = create<StatsStore>((set) => ({
  stats: DEFAULT_STATS,
  lastUpdated: null,
  
  setStats: (newStats) => set((state) => ({ 
    stats: { ...state.stats, ...newStats },
    lastUpdated: new Date(),
  })),
  clearStats: () => set({ stats: DEFAULT_STATS, lastUpdated: null }),
}));

// ============================================
// SELECTOR HELPERS
// ============================================

/**
 * Type-safe selector for getting specific stat value
 */
export function useStatValue<K extends keyof StatsState>(key: K): StatsState[K] | undefined {
  return useStatsStore((state) => state.stats[key] as StatsState[K] | undefined);
}

/**
 * Get all active (non-completed) tasks
 */
export function useActiveTasks(): readonly Task[] {
  return useTasksStore((state) => state.tasks.filter(t => !t.completed));
}

/**
 * Get completed tasks count
 */
export function useCompletedTasksCount(): number {
  return useTasksStore((state) => state.tasks.filter(t => t.completed).length);
}
