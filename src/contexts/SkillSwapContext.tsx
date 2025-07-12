import React, { createContext, useContext, useState } from "react";
import {
  User,
  SwapRequest,
  Review,
  AdminMessage,
  SkillSwapContextType,
} from "@/types";

const SkillSwapContext = createContext<SkillSwapContextType | undefined>(
  undefined,
);

export const useSkillSwap = () => {
  const context = useContext(SkillSwapContext);
  if (context === undefined) {
    throw new Error("useSkillSwap must be used within a SkillSwapProvider");
  }
  return context;
};

const initialSwapRequests: SwapRequest[] = [
  {
    id: "swap-1",
    fromUserId: "user-1",
    toUserId: "user-2",
    requestedSkill: "Spanish",
    offeredSkill: "Photoshop",
    message: "Hi! I'd love to learn Spanish in exchange for Photoshop lessons.",
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

const initialReviews: Review[] = [];

const initialAdminMessages: AdminMessage[] = [
  {
    id: "msg-1",
    title: "Welcome to SkillSwap!",
    content:
      "Welcome to our platform! Please make sure to keep all interactions respectful and professional.",
    type: "info",
    createdAt: new Date(),
    isActive: true,
  },
];

export const SkillSwapProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Mock users data for demonstration
  const mockUsers: User[] = [
    {
      id: "user-2",
      name: "Sarah Wilson",
      email: "sarah@example.com",
      location: "Austin, TX",
      profilePhoto: "",
      isPublic: true,
      availability: ["weekends"],
      skillsOffered: [
        {
          id: "skill-4",
          name: "Spanish",
          category: "Language",
          description: "Native Spanish speaker, can teach all levels",
          level: "expert",
          isApproved: true,
        },
        {
          id: "skill-5",
          name: "Yoga",
          category: "Fitness",
          description: "Certified yoga instructor with 5 years experience",
          level: "expert",
          isApproved: true,
        },
      ],
      skillsWanted: [
        {
          id: "skill-6",
          name: "Excel",
          category: "Office",
          description: "Advanced Excel formulas and pivot tables",
          level: "intermediate",
          isApproved: true,
        },
      ],
      rating: 4.9,
      reviewCount: 8,
      joinedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      isBanned: false,
      role: "user",
    },
    {
      id: "user-3",
      name: "Mike Chen",
      email: "mike@example.com",
      location: "Seattle, WA",
      profilePhoto: "",
      isPublic: true,
      availability: ["evenings", "weekends"],
      skillsOffered: [
        {
          id: "skill-7",
          name: "Guitar",
          category: "Music",
          description: "10+ years playing acoustic and electric guitar",
          level: "advanced",
          isApproved: true,
        },
        {
          id: "skill-8",
          name: "Python",
          category: "Programming",
          description: "Backend development and data analysis",
          level: "expert",
          isApproved: true,
        },
      ],
      skillsWanted: [
        {
          id: "skill-9",
          name: "Photography",
          category: "Arts",
          description: "Portrait and landscape photography",
          level: "intermediate",
          isApproved: true,
        },
      ],
      rating: 4.7,
      reviewCount: 15,
      joinedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      isBanned: false,
      role: "user",
    },
    {
      id: "user-4",
      name: "Emma Davis",
      email: "emma@example.com",
      location: "Boston, MA",
      profilePhoto: "",
      isPublic: true,
      availability: ["weekdays", "mornings"],
      skillsOffered: [
        {
          id: "skill-10",
          name: "Cooking",
          category: "Cooking",
          description: "Italian and French cuisine, baking",
          level: "advanced",
          isApproved: true,
        },
        {
          id: "skill-11",
          name: "Excel",
          category: "Office",
          description: "Advanced formulas, macros, and data visualization",
          level: "expert",
          isApproved: true,
        },
      ],
      skillsWanted: [
        {
          id: "skill-12",
          name: "Fitness Training",
          category: "Fitness",
          description: "Personal training and workout planning",
          level: "beginner",
          isApproved: true,
        },
      ],
      rating: 4.8,
      reviewCount: 22,
      joinedDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      isBanned: false,
      role: "user",
    },
  ];

  const [users, setUsers] = useState<User[]>(mockUsers);
  const [swapRequests, setSwapRequests] =
    useState<SwapRequest[]>(initialSwapRequests);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [adminMessages, setAdminMessages] =
    useState<AdminMessage[]>(initialAdminMessages);

  const createSwapRequest = (
    request: Omit<SwapRequest, "id" | "createdAt" | "updatedAt" | "status">,
  ) => {
    const newRequest: SwapRequest = {
      ...request,
      id: `swap-${Date.now()}`,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSwapRequests((prev) => [...prev, newRequest]);
  };

  const updateSwapRequest = (id: string, status: SwapRequest["status"]) => {
    setSwapRequests((prev) =>
      prev.map((request) =>
        request.id === id
          ? { ...request, status, updatedAt: new Date() }
          : request,
      ),
    );
  };

  const deleteSwapRequest = (id: string) => {
    setSwapRequests((prev) => prev.filter((request) => request.id !== id));
  };

  const addReview = (review: Omit<Review, "id" | "createdAt">) => {
    const newReview: Review = {
      ...review,
      id: `review-${Date.now()}`,
      createdAt: new Date(),
    };
    setReviews((prev) => [...prev, newReview]);

    // Update user rating
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === review.revieweeId) {
          const userReviews = [...reviews, newReview].filter(
            (r) => r.revieweeId === user.id,
          );
          const avgRating =
            userReviews.reduce((sum, r) => sum + r.rating, 0) /
            userReviews.length;
          return {
            ...user,
            rating: Math.round(avgRating * 10) / 10,
            reviewCount: userReviews.length,
          };
        }
        return user;
      }),
    );
  };

  const searchUsers = (skill: string): User[] => {
    if (!skill.trim()) return users;

    return users.filter((user) =>
      user.skillsOffered.some((s) =>
        s.name.toLowerCase().includes(skill.toLowerCase()),
      ),
    );
  };

  const banUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, isBanned: true } : user,
      ),
    );
  };

  const approveSkill = (skillId: string) => {
    setUsers((prev) =>
      prev.map((user) => ({
        ...user,
        skillsOffered: user.skillsOffered.map((skill) =>
          skill.id === skillId ? { ...skill, isApproved: true } : skill,
        ),
        skillsWanted: user.skillsWanted.map((skill) =>
          skill.id === skillId ? { ...skill, isApproved: true } : skill,
        ),
      })),
    );
  };

  const rejectSkill = (skillId: string) => {
    setUsers((prev) =>
      prev.map((user) => ({
        ...user,
        skillsOffered: user.skillsOffered.filter(
          (skill) => skill.id !== skillId,
        ),
        skillsWanted: user.skillsWanted.filter((skill) => skill.id !== skillId),
      })),
    );
  };

  const sendAdminMessage = (
    message: Omit<AdminMessage, "id" | "createdAt">,
  ) => {
    const newMessage: AdminMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      createdAt: new Date(),
    };
    setAdminMessages((prev) => [...prev, newMessage]);
  };

  const value: SkillSwapContextType = {
    users,
    swapRequests,
    reviews,
    adminMessages,
    createSwapRequest,
    updateSwapRequest,
    deleteSwapRequest,
    addReview,
    searchUsers,
    banUser,
    approveSkill,
    rejectSkill,
    sendAdminMessage,
  };

  return (
    <SkillSwapContext.Provider value={value}>
      {children}
    </SkillSwapContext.Provider>
  );
};
