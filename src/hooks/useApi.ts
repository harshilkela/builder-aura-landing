import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { User, SwapRequest, Review } from '@/types';

// User hooks
export const useUsers = (filters: { skill?: string; location?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['users', 'search', filters],
    queryFn: () => api.searchUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.getUserProfile(userId),
    enabled: !!userId,
  });
};

export const useUserStats = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId, 'stats'],
    queryFn: () => api.getUserStats(userId),
    enabled: !!userId,
  });
};

// Swap hooks
export const useSwaps = (filters: { status?: string; page?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: ['swaps', filters],
    queryFn: () => api.getUserSwaps(filters),
  });
};

export const useSwap = (swapId: string) => {
  return useQuery({
    queryKey: ['swap', swapId],
    queryFn: () => api.getSwap(swapId),
    enabled: !!swapId,
  });
};

export const useCreateSwap = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createSwap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swaps'] });
    },
  });
};

export const useUpdateSwap = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ swapId, action }: { swapId: string; action: 'accept' | 'reject' | 'complete' }) => {
      switch (action) {
        case 'accept':
          return api.acceptSwap(swapId);
        case 'reject':
          return api.rejectSwap(swapId);
        case 'complete':
          return api.completeSwap(swapId);
        default:
          throw new Error('Invalid action');
      }
    },
    onSuccess: (_, { swapId }) => {
      queryClient.invalidateQueries({ queryKey: ['swaps'] });
      queryClient.invalidateQueries({ queryKey: ['swap', swapId] });
    },
  });
};

export const useDeleteSwap = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.cancelSwap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swaps'] });
    },
  });
};

// Rating hooks
export const useUserRatings = (userId: string, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['ratings', 'user', userId, page, limit],
    queryFn: () => api.getUserRatings(userId, page, limit),
    enabled: !!userId,
  });
};

export const useRatingsGiven = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['ratings', 'given', page, limit],
    queryFn: () => api.getRatingsGiven(page, limit),
  });
};

export const useRatingsReceived = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['ratings', 'received', page, limit],
    queryFn: () => api.getRatingsReceived(page, limit),
  });
};

export const useCreateRating = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createRating,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.reviewee] });
    },
  });
};

// Admin hooks
export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.getAdminDashboard(),
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) => 
      api.banUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUnbanUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.unbanUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};