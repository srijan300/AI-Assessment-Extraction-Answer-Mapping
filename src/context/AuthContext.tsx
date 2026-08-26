import React, { createContext, useContext, useState } from "react";

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  schoolName: string;
  classroom: string;
}

interface AuthContextType {
  user: UserProfile;
  isAuthenticated: boolean;
  updateProfile: (updatedData: Partial<UserProfile>) => void;
  login: (email?: string) => void;
  logout: () => void;
}

const DEFAULT_USER: UserProfile = {
  name: "Teacher",
  email: "teacher@evaluator.org",
  role: "Evaluator",
  schoolName: "Delhi Public School, Bokaro Steel City",
  classroom: "Grade 10 Mathematics",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem("veda_user_profile");
      if (saved) {
        return { ...DEFAULT_USER, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Failed to load user profile", e);
    }
    return DEFAULT_USER;
  });

  const updateProfile = (updatedData: Partial<UserProfile>) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updatedData };
      try {
        localStorage.setItem("veda_user_profile", JSON.stringify(nextUser));
      } catch (e) {
        console.warn("Failed to persist user profile", e);
      }
      return nextUser;
    });
  };

  const login = (email?: string) => {
    const nextUser = {
      ...user,
      email: email || user.email,
    };
    setUser(nextUser);
    localStorage.setItem("veda_user_profile", JSON.stringify(nextUser));
  };

  const logout = () => {
    setUser(DEFAULT_USER);
    localStorage.removeItem("veda_user_profile");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: true,
        updateProfile,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
