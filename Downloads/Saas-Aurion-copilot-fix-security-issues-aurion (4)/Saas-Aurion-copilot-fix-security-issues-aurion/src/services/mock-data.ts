// ============================================
// MOCK DATA SERVICE - UI DEMO DATA ONLY
// ============================================
//
// This service provides mock data for UI components
// and uses localStorage for non-critical UI state
// (tasks, events, generation history).
//
// ⚠️ NOT USED FOR PRODUCTION BUSINESS LOGIC
// For credits/plans, use @/services/supabase-db
// ============================================

import { Task, Event, Generation, Project, Employee, Candidate, Device, Notification, CommunityPost } from '@/types/database';

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockStats = [
  { label: "Revenue", value: "$0", change: "0%", type: "yellow" },
  { label: "Users", value: "0", change: "0%", type: "dark" },
  { label: "Bounce Rate", value: "0%", change: "0%", type: "outline" },
];

export const mockWorkData = [
  { name: 'Jan', value: 0 },
  { name: 'Feb', value: 0 },
  { name: 'Mar', value: 0 },
  { name: 'Apr', value: 0 },
  { name: 'May', value: 0 },
  { name: 'Jun', value: 0 },
];

export const mockTeamMembers: Employee[] = [];

export const mockCandidates: Candidate[] = [];

export const mockDevices: Device[] = [];

export const mockProjects: Project[] = [];

export const mockNotifications: Notification[] = [];

export const mockCommunityPosts: CommunityPost[] = [];

export const mockProfile = {
  full_name: "John Doe",
  email: "john@example.com",
  avatar_url: "https://github.com/shadcn.png",
  plan: "Pro",
};

// Local Storage Service
export const localStorageService = {
  getTasks: (): Task[] => {
    const stored = localStorage.getItem('tasks');
    return stored ? JSON.parse(stored) : [];
  },
  saveTasks: (tasks: Task[]) => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  },
  
  getEvents: (): Event[] => {
    const stored = localStorage.getItem('events');
    return stored ? JSON.parse(stored) : [];
  },
  saveEvents: (events: Event[]) => {
    localStorage.setItem('events', JSON.stringify(events));
  },

  getGenerations: (): Generation[] => {
    const stored = localStorage.getItem('generations');
    return stored ? JSON.parse(stored) : [];
  },
  saveGenerations: (generations: Generation[]) => {
    localStorage.setItem('generations', JSON.stringify(generations));
  }
};
