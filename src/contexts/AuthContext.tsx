import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthContextType } from "@/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const initialUsers: User[] = [
  {
    id: "admin-1",
    name: "Admin User",
    email: "admin@skillswap.com",
    location: "New York, NY",
    isPublic: true,
    availability: ["weekdays", "evenings"],
    skillsOffered: [],
    skillsWanted: [],
    rating: 5,
    reviewCount: 0,
    joinedDate: new Date(),
    isBanned: false,
    role: "admin",
  },
  {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    location: "San Francisco, CA",
    isPublic: true,
    availability: ["weekends", "evenings"],
    skillsOffered: [
      {
        id: "skill-1",
        name: "Photoshop",
        category: "Design",
        description: "Advanced photo editing and design",
        level: "expert",
        isApproved: true,
      },
      {
        id: "skill-2",
        name: "JavaScript",
        category: "Programming",
        description: "Frontend development with React",
        level: "advanced",
        isApproved: true,
      },
    ],
    skillsWanted: [
      {
        id: "skill-3",
        name: "Spanish",
        category: "Language",
        description: "Conversational Spanish",
        level: "beginner",
        isApproved: true,
      },
    ],
    rating: 4.8,
    reviewCount: 12,
    joinedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    isBanned: false,
    role: "user",
  },
  {
    id: "user-2",
    name: "Sarah Wilson",
    email: "sarah@example.com",
    location: "Austin, TX",
    isPublic: true,
    availability: ["weekends"],
    skillsOffered: [
      {
        id: "skill-4",
        name: "Spanish",
        category: "Language",
        description: "Native Spanish speaker",
        level: "expert",
        isApproved: true,
      },
      {
        id: "skill-5",
        name: "Yoga",
        category: "Fitness",
        description: "Certified yoga instructor",
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
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);

  useEffect(() => {
    const savedUser = localStorage.getItem("skillswap-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = users.find((u) => u.email === email);
    if (foundUser && !foundUser.isBanned) {
      setUser(foundUser);
      localStorage.setItem("skillswap-user", JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = async (
    userData: Partial<User> & { password: string },
  ): Promise<boolean> => {
    if (users.some((u) => u.email === userData.email)) {
      return false;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name || "",
      email: userData.email || "",
      location: userData.location,
      profilePhoto: userData.profilePhoto,
      isPublic: true,
      availability: userData.availability || [],
      skillsOffered: userData.skillsOffered || [],
      skillsWanted: userData.skillsWanted || [],
      rating: 0,
      reviewCount: 0,
      joinedDate: new Date(),
      isBanned: false,
      role: "user",
    };

    setUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    localStorage.setItem("skillswap-user", JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("skillswap-user");
  };

  const updateProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));
      localStorage.setItem("skillswap-user", JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
