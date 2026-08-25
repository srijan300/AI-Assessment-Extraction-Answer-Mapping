import React, { createContext, useContext, useState } from "react";

export interface UserProfile {
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email?: string) => void;
  logout: () => void;
}

const DEFAULT_USER: UserProfile = {
  name: "Teacher",
  email: "teacher@evaluator.org",
  role: "Evaluator",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_USER);

  const login = (email?: string) => {
    setUser({
      name: "Teacher",
      email: email || "teacher@evaluator.org",
      role: "Evaluator",
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
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
