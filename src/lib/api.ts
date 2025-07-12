import { User, SwapRequest, Review, AdminMessage, Skill } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Generic API response type
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

// API Client class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('skillswap-token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data: ApiResponse<T> = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('skillswap-token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('skillswap-token');
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response.data!;
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    location?: string;
    skillsOffered?: string[];
    skillsWanted?: string[];
    availability?: string[];
  }): Promise<{ user: User; token: string }> {
    const response = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response.data!;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<User>('/auth/me');
    return response.data!;
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword: newPassword,
      }),
    });
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  // User endpoints
  async searchUsers(filters: {
    skill?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<{ users: User[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams();
    if (filters.skill) params.append('skill', filters.skill);
    if (filters.location) params.append('location', filters.location);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await this.request<{ users: User[]; total: number; page: number; totalPages: number }>(
      `/users/search?${params}`
    );
    return response.data!;
  }

  async getUserProfile(userId: string): Promise<User> {
    const response = await this.request<User>(`/users/${userId}`);
    return response.data!;
  }

  async updateUserProfile(userId: string, userData: Partial<User>): Promise<User> {
    const response = await this.request<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return response.data!;
  }

  async updateUserSkills(userId: string, skills: {
    skillsOffered: string[];
    skillsWanted: string[];
  }): Promise<User> {
    const response = await this.request<User>(`/users/${userId}/skills`, {
      method: 'PUT',
      body: JSON.stringify(skills),
    });
    return response.data!;
  }

  async getUserStats(userId: string): Promise<{
    totalSwaps: number;
    completedSwaps: number;
    averageRating: number;
    totalRatings: number;
  }> {
    const response = await this.request<{
      totalSwaps: number;
      completedSwaps: number;
      averageRating: number;
      totalRatings: number;
    }>(`/users/${userId}/stats`);
    return response.data!;
  }

  // Swap endpoints
  async createSwap(swapData: {
    receiver: string;
    requestedSkill: string;
    offeredSkill: string;
    message: string;
    meetingType?: string;
    proposedDate?: string;
  }): Promise<SwapRequest> {
    const response = await this.request<SwapRequest>('/swaps', {
      method: 'POST',
      body: JSON.stringify(swapData),
    });
    return response.data!;
  }

  async getUserSwaps(filters: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ swaps: SwapRequest[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await this.request<{ swaps: SwapRequest[]; total: number; page: number; totalPages: number }>(
      `/swaps?${params}`
    );
    return response.data!;
  }

  async getSwap(swapId: string): Promise<SwapRequest> {
    const response = await this.request<SwapRequest>(`/swaps/${swapId}`);
    return response.data!;
  }

  async acceptSwap(swapId: string): Promise<SwapRequest> {
    const response = await this.request<SwapRequest>(`/swaps/${swapId}/accept`, {
      method: 'PUT',
    });
    return response.data!;
  }

  async rejectSwap(swapId: string): Promise<SwapRequest> {
    const response = await this.request<SwapRequest>(`/swaps/${swapId}/reject`, {
      method: 'PUT',
    });
    return response.data!;
  }

  async cancelSwap(swapId: string): Promise<void> {
    await this.request(`/swaps/${swapId}`, {
      method: 'DELETE',
    });
  }

  async completeSwap(swapId: string): Promise<SwapRequest> {
    const response = await this.request<SwapRequest>(`/swaps/${swapId}/complete`, {
      method: 'PUT',
    });
    return response.data!;
  }

  // Rating endpoints
  async createRating(ratingData: {
    swap: string;
    reviewee: string;
    rating: number;
    feedback: string;
    categories?: {
      communication: number;
      skillLevel: number;
      punctuality: number;
      helpfulness: number;
    };
    wouldRecommend?: boolean;
    isPublic?: boolean;
  }): Promise<Review> {
    const response = await this.request<Review>('/ratings', {
      method: 'POST',
      body: JSON.stringify(ratingData),
    });
    return response.data!;
  }

  async getUserRatings(userId: string, page = 1, limit = 20): Promise<{
    ratings: Review[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await this.request<{
      ratings: Review[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/ratings/user/${userId}?page=${page}&limit=${limit}`);
    return response.data!;
  }

  async getRatingsGiven(page = 1, limit = 20): Promise<{
    ratings: Review[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await this.request<{
      ratings: Review[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/ratings/given?page=${page}&limit=${limit}`);
    return response.data!;
  }

  async getRatingsReceived(page = 1, limit = 20): Promise<{
    ratings: Review[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await this.request<{
      ratings: Review[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/ratings/received?page=${page}&limit=${limit}`);
    return response.data!;
  }

  // Admin endpoints
  async getAdminDashboard(): Promise<{
    totalUsers: number;
    totalSwaps: number;
    pendingSwaps: number;
    totalRatings: number;
    recentActivity: any[];
  }> {
    const response = await this.request<{
      totalUsers: number;
      totalSwaps: number;
      pendingSwaps: number;
      totalRatings: number;
      recentActivity: any[];
    }>('/admin/dashboard');
    return response.data!;
  }

  async banUser(userId: string, reason: string): Promise<void> {
    await this.request(`/admin/users/${userId}/ban`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async unbanUser(userId: string): Promise<void> {
    await this.request(`/admin/users/${userId}/unban`, {
      method: 'PUT',
    });
  }

  async createAdminMessage(messageData: {
    title: string;
    message: string;
    type: string;
    priority?: string;
    targetUserType?: string;
  }): Promise<AdminMessage> {
    const response = await this.request<AdminMessage>('/admin/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
    return response.data!;
  }
}

// Create and export API instance
export const api = new ApiClient(API_BASE_URL);
export default api;