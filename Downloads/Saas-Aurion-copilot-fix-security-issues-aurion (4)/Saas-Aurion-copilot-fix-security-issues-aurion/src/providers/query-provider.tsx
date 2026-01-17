import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { ReactNode, useMemo } from 'react';
import { logger } from '@/services/logger';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface QueryError extends Error {
  status?: number;
  code?: string;
  isRetryable?: boolean;
}

// ============================================
// ERROR HANDLING CONFIGURATION
// ============================================

// HTTP status codes that should not trigger retry
const NON_RETRYABLE_STATUS_CODES = new Set([400, 401, 403, 404, 422]);

const handleQueryError = (error: QueryError, query: unknown): void => {
  // Avoid logging sensitive data
  const safeQuery = typeof query === 'object' && query !== null
    ? { queryKey: (query as { queryKey?: unknown }).queryKey }
    : {};

  logger.error('[QueryCache] Query failed', {
    message: error.message,
    status: error.status,
    code: error.code,
    query: JSON.stringify(safeQuery),
  });
};

const handleMutationError = (
  error: QueryError, 
  variables: unknown, 
  _context: unknown, 
  mutation: unknown
): void => {
  // Sanitize variables to avoid logging sensitive data
  const safeMutation = typeof mutation === 'object' && mutation !== null
    ? { mutationKey: (mutation as { options?: { mutationKey?: unknown } }).options?.mutationKey }
    : {};

  logger.error('[MutationCache] Mutation failed', {
    message: error.message,
    status: error.status,
    mutation: JSON.stringify(safeMutation),
    // Don't log variables - may contain sensitive data
  });
};

// ============================================
// RETRY LOGIC
// ============================================

const shouldRetry = (failureCount: number, error: unknown): boolean => {
  const queryError = error as QueryError;
  
  // Don't retry client errors (4xx) except rate limiting
  if (queryError.status && NON_RETRYABLE_STATUS_CODES.has(queryError.status)) {
    return false;
  }

  // Retry rate limiting with longer delay
  if (queryError.status === 429) {
    return failureCount < 2;
  }

  // Max 3 retries for other errors
  return failureCount < 3;
};

const calculateRetryDelay = (attemptIndex: number, error: unknown): number => {
  const queryError = error as QueryError;
  
  // Longer delay for rate limiting
  if (queryError.status === 429) {
    return 60_000; // 1 minute
  }

  // Exponential backoff with jitter
  const baseDelay = 1_000;
  const maxDelay = 30_000;
  const exponentialDelay = baseDelay * Math.pow(2, attemptIndex);
  const jitter = Math.random() * 1_000;

  return Math.min(exponentialDelay + jitter, maxDelay);
};

// ============================================
// QUERY CLIENT FACTORY
// ============================================

const createQueryClient = (): QueryClient => {
  const queryCache = new QueryCache({
    onError: (error, query) => handleQueryError(error as QueryError, query),
  });

  const mutationCache = new MutationCache({
    onError: (error, variables, context, mutation) => 
      handleMutationError(error as QueryError, variables, context, mutation),
  });

  return new QueryClient({
    queryCache,
    mutationCache,
    defaultOptions: {
      queries: {
        // Freshness: 30s balance between updates and performance
        staleTime: 30_000,
        
        // Garbage collection: 10 minutes
        gcTime: 600_000,
        
        // Retry configuration
        retry: shouldRetry,
        retryDelay: calculateRetryDelay,
        
        // Refetch behavior
        refetchOnWindowFocus: 'always',
        refetchOnReconnect: 'always',
        refetchOnMount: true,
        
        // Network mode: use cache when offline
        networkMode: 'offlineFirst',
        
        // Structural sharing for referential equality
        structuralSharing: true,
      },
      mutations: {
        // Single retry for mutations
        retry: 1,
        retryDelay: 1_000,
        
        // Always require network for mutations
        networkMode: 'online',
        
        // No caching for mutations
        gcTime: 0,
      },
    },
  });
};

// ============================================
// QUERY KEYS FACTORY
// Type-safe query key generation
// ============================================

export const queryKeys = {
  user: {
    all: ['user'] as const,
    profile: (userId: string) => ['user', 'profile', userId] as const,
    credits: (userId: string) => ['user', 'credits', userId] as const,
    plan: (userId: string) => ['user', 'plan', userId] as const,
    usage: (userId: string) => ['user', 'usage', userId] as const,
  },
  
  dashboard: {
    all: ['dashboard'] as const,
    stats: (userId: string) => ['dashboard', 'stats', userId] as const,
    activity: (userId: string) => ['dashboard', 'activity', userId] as const,
  },
  
  tools: {
    all: ['tools'] as const,
    list: () => ['tools', 'list'] as const,
    detail: (toolId: string) => ['tools', 'detail', toolId] as const,
    access: (toolId: string, userId: string) => ['tools', 'access', toolId, userId] as const,
  },
  
  billing: {
    all: ['billing'] as const,
    invoices: (userId: string) => ['billing', 'invoices', userId] as const,
    subscription: (userId: string) => ['billing', 'subscription', userId] as const,
  },
} as const;

// ============================================
// PROVIDER COMPONENT
// ============================================

interface QueryProviderProps {
  readonly children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps): JSX.Element {
  // Memoize client to prevent recreation on re-renders
  const queryClient = useMemo(() => createQueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// Re-export for convenience
export { queryKeys as keys };
