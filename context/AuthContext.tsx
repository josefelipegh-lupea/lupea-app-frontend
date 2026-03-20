// AuthContext.tsx
"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { LoginResponse } from "@/app/lib/api/auth";
import {
  getClientProfile,
  ClientProfileResponse,
} from "@/app/lib/api/client/clientProfile";
import {
  getProviderProfile,
  ProviderProfile,
} from "@/app/lib/api/vendor/vendorProfile";

interface AuthContextType {
  user: LoginResponse["user"] | null;
  jwt: string | null;
  profile: ClientProfileResponse | ProviderProfile | null;
  loginProfile: LoginResponse["profile"] | null;
  role: "client" | "provider" | null;
  isLoading: boolean;
  login: (data: LoginResponse) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<LoginResponse["user"] | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [profile, setProfile] = useState<
    ClientProfileResponse | ProviderProfile | null
  >(null);
  const [loginProfile, setLoginProfile] = useState<LoginResponse["profile"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const role = user?.role === "provider" ? "provider" : user ? "client" : null;

  const fetchProfileData = async (jwt: string, currentRole: string) => {
    try {
      const data =
        currentRole === "provider"
          ? await getProviderProfile(jwt)
          : await getClientProfile(jwt);
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const login = async (data: LoginResponse) => {
    localStorage.setItem("jwt", data.jwt);
    localStorage.setItem("userData", JSON.stringify(data.user));
    setUser(data.user);
    setJwt(data.jwt);
    
    if (data.profile) {
      setLoginProfile(data.profile);
      localStorage.setItem("loginProfile", JSON.stringify(data.profile));
    }
    
    await fetchProfileData(data.jwt, data.user.role);
  };

  useEffect(() => {
    const init = async () => {
      const jwt = localStorage.getItem("jwt");
      const savedUser = localStorage.getItem("userData");
      const savedLoginProfile = localStorage.getItem("loginProfile");
      const savedProfile = localStorage.getItem("fullProfile");
      
      if (jwt && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setJwt(jwt);
        setUser(parsedUser);
        
        if (savedLoginProfile) {
          const parsed = JSON.parse(savedLoginProfile);
          setLoginProfile(parsed);
        }
        
        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile);
          setProfile(parsedProfile as ClientProfileResponse);
        } else {
          await fetchProfileData(jwt, parsedUser.role);
        }
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setJwt(null);
    setProfile(null);
    setLoginProfile(null);
    window.location.href = "/login";
  };

  const refreshProfile = async () => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt || !user) return;

    try {
      const data =
        user.role === "provider"
          ? await getProviderProfile(jwt)
          : await getClientProfile(jwt);

      setProfile(data);
      localStorage.setItem("fullProfile", JSON.stringify(data));
    } catch (error) {
      console.error("Error al refrescar perfil:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loginProfile,
        role,
        login,
        jwt,
        logout,
        isLoading,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
