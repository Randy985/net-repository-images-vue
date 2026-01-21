import { defineStore } from "pinia";
import api from "@/api/http";
import router from "@/router";

interface User {
  username: string;
  email: string;
  roleId: number;
}

interface AuthResponse {
  accessToken: string;
  expiresAt: string;
  username: string;
  email: string;
  roleId: number;
}

export const useAuthStore = defineStore("auth", {
  state: () => {
    let savedUser: User | null = null;
    try {
      const raw = localStorage.getItem("user");
      if (raw && raw !== "undefined") {
        savedUser = JSON.parse(raw) as User;
      }
    } catch {
      savedUser = null;
    }
    return {
      accessToken: localStorage.getItem("accessToken") || "",
      user: savedUser,
    };
  },

  actions: {
    async register(username: string, email: string, password: string, roleId = 2) {
      const res = await api.post<AuthResponse>("/auth/register", {
        username,
        email,
        password,
        roleId,
      });
      this.setSession(res.data);
      router.push("/dashboard");
    },

    async login(email: string, password: string) {
      const res = await api.post<AuthResponse>("/auth/login", { email, password });
      this.setSession(res.data);
      router.push("/dashboard");
    },

    async refresh() {
      const res = await api.post<AuthResponse>("/auth/refresh", {});
      this.setSession(res.data);
    },

    async logout() {
      try {
        await api.post("/auth/logout", { refreshToken: "" });
      } catch { }
      this.accessToken = "";
      this.user = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      router.push("/login");
    },

    setSession(data: AuthResponse) {
      this.accessToken = data.accessToken;
      this.user = {
        username: data.username,
        email: data.email,
        roleId: data.roleId,
      };
      localStorage.setItem("accessToken", this.accessToken);
      localStorage.setItem("user", JSON.stringify(this.user));
    },

    isTokenExpired() {
      if (!this.accessToken) return true;
      const payload = JSON.parse(atob(this.accessToken.split(".")[1]));
      return Date.now() >= payload.exp * 1000;
    },

  },
});
