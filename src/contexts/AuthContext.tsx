import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthContextType } from "@/types";
import { api } from "@/lib/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token and fetch user on mount
  useEffect(() => {
    const token = localStorage.getItem("skillswap-token");
    if (token) {
      api.setToken(token);
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      // Clear invalid token
      api.clearToken();
      localStorage.removeItem("skillswap-user");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user: userData, token } = await api.login(email, password);
      setUser(userData);
      localStorage.setItem("skillswap-user", JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const register = async (
    userData: Partial<User> & { password: string },
  ): Promise<boolean> => {
    try {
      const { user: newUser, token } = await api.register({
        name: userData.name || "",
        email: userData.email || "",
        password: userData.password,
        location: userData.location,
        skillsOffered: userData.skillsOffered?.map(skill => skill.name) || [],
        skillsWanted: userData.skillsWanted?.map(skill => skill.name) || [],
        availability: userData.availability || [],
      });
      
      setUser(newUser);
      localStorage.setItem("skillswap-user", JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("skillswap-user");
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = await api.updateUserProfile(user.id, userData);
      setUser(updatedUser);
      localStorage.setItem("skillswap-user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateProfile,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
