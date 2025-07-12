export interface User {
  id: string;
  name: string;
  email: string;
  location?: string;
  profilePhoto?: string;
  isPublic: boolean;
  availability: string[];
  skillsOffered: Skill[];
  skillsWanted: Skill[];
  rating: number;
  reviewCount: number;
  joinedDate: Date;
  isBanned: boolean;
  role: "user" | "admin";
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  isApproved: boolean;
}

export interface SwapRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  requestedSkill: string;
  offeredSkill: string;
  message: string;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  swapRequestId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface AdminMessage {
  id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "update";
  createdAt: Date;
  isActive: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    userData: Partial<User> & { password: string },
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

export interface SkillSwapContextType {
  users: User[];
  swapRequests: SwapRequest[];
  reviews: Review[];
  adminMessages: AdminMessage[];
  createSwapRequest: (
    request: Omit<SwapRequest, "id" | "createdAt" | "updatedAt" | "status">,
  ) => void;
  updateSwapRequest: (id: string, status: SwapRequest["status"]) => void;
  deleteSwapRequest: (id: string) => void;
  addReview: (review: Omit<Review, "id" | "createdAt">) => void;
  searchUsers: (skill: string) => User[];
  banUser: (userId: string) => void;
  approveSkill: (skillId: string) => void;
  rejectSkill: (skillId: string) => void;
  sendAdminMessage: (message: Omit<AdminMessage, "id" | "createdAt">) => void;
}
