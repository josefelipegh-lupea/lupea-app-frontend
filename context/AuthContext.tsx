// AuthContext.tsx
"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
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
  refreshProfile: () => Promise<ClientProfileResponse | ProviderProfile | null>;
  refreshLoginProfile: (prefetchedData?: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<LoginResponse["user"] | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [profile, setProfile] = useState<
    ClientProfileResponse | ProviderProfile | null
  >(null);
  const [loginProfile, setLoginProfile] = useState<
    LoginResponse["profile"] | null
  >(null);
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
    if (!jwt || !user) return null;

    try {
      const data =
        user.role === "provider"
          ? await getProviderProfile(jwt)
          : await getClientProfile(jwt);

      setProfile(data);
      localStorage.setItem("fullProfile", JSON.stringify(data));
      return data;
    } catch (error) {
      console.error("Error al refrescar perfil:", error);
      return null;
    }
  };

  const refreshLoginProfile = useCallback(async (prefetchedData?: any) => {
    const jwt = localStorage.getItem("jwt");
    const currentUser = localStorage.getItem("userData");
    if (!jwt || !currentUser) return;

    const userData = JSON.parse(currentUser);
    const isProvider = userData.role === "provider";

    try {
      const data = prefetchedData
        ? prefetchedData
        : await (async () => {
            const endpoint = isProvider
              ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/provider-profiles/me`
              : `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/client-profiles/me`;

            const response = await fetch(endpoint, {
              headers: {
                Authorization: `Bearer ${jwt}`,
              },
            });

            if (!response.ok) {
              return null;
            }

            return response.json();
          })();

      if (data) {
        const resolvedData = await data;
        if (!resolvedData) {
          return;
        }

        setLoginProfile(() => {
          let loginProfileData;

          if (isProvider) {
            loginProfileData = {
              id: resolvedData.id,
              displayName: resolvedData.businessName || resolvedData.username,
              tokensAvailable: resolvedData.tokensAvailable || 0,
              privacyLevel: "public",
              status: resolvedData.status,
            };
          } else {
            loginProfileData = {
              id: resolvedData.id,
              displayName: resolvedData.displayName,
              tokensAvailable: resolvedData.tokensAvailable || 0,
              tokensFreeAvailable: resolvedData.tokensFreeAvailable || 0,
              tokensPurchasedAvailable: resolvedData.tokensPurchasedAvailable || 0,
              tokensTotal: resolvedData.tokensTotal || resolvedData.tokensAvailable || 0,
              tokensPurchasedThisMonth: resolvedData.tokensPurchasedThisMonth || 0,
              tokensLastRenewal: resolvedData.tokensLastRenewal || "",
              tokensNextRenewal: resolvedData.tokensNextRenewal || "",
              monthlyConsumption: resolvedData.monthlyConsumption || {
                usedTokens: 0,
                percentage: 0,
              },
              tokenMetricsMonth: resolvedData.tokenMetricsMonth || "",
              freeTokensGrantedThisMonth: resolvedData.freeTokensGrantedThisMonth || 0,
              privacyLevel: resolvedData.privacyLevel,
            };
          }

          localStorage.setItem(
            "loginProfile",
            JSON.stringify(loginProfileData),
          );
          return loginProfileData;
        });
      }
    } catch (error) {
      console.error("Error al refrescar loginProfile:", error);
    }
  }, []);

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
        refreshLoginProfile,
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
