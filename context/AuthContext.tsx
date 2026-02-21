"use client";
import { LoginResponse } from "@/app/lib/api/auth";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AuthContextType {
  user: LoginResponse["user"] | null;
  clientProfile: LoginResponse["clientProfile"] | null;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<LoginResponse["user"] | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("auth_data");
      return saved ? (JSON.parse(saved) as LoginResponse).user : null;
    }
    return null;
  });

  const [clientProfile, setClientProfile] = useState<
    LoginResponse["clientProfile"] | null
  >(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("auth_data");
      return saved ? (JSON.parse(saved) as LoginResponse).clientProfile : null;
    }
    return null;
  });

  const login = (data: LoginResponse) => {
    setUser(data.user);
    setClientProfile(data.clientProfile);
    localStorage.setItem("auth_data", JSON.stringify(data));
    localStorage.setItem("jwt", data.jwt);
  };

  const logout = () => {
    setUser(null);
    setClientProfile(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, clientProfile, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};
