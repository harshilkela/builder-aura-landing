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
  const [users, setUsers] = useState<User[]>([]);
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
