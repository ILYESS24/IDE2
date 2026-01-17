 
import { useQuery } from '@tanstack/react-query';
import { 
  mockCandidates, 
  mockDevices, 
  mockProjects, 
  mockNotifications, 
  mockCommunityPosts,
  delay
} from '@/services/mock-data';

export function useCandidates() {
  return useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      await delay(300);
      return mockCandidates;
    }
  });
}

export function useDevices() {
  return useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      await delay(300);
      return mockDevices;
    }
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      await delay(300);
      return mockProjects;
    }
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      await delay(200);
      return mockNotifications;
    }
  });
}

export function useCommunityPosts() {
  return useQuery({
    queryKey: ['community'],
    queryFn: async () => {
      await delay(400);
      return mockCommunityPosts;
    }
  });
}

