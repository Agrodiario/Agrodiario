import { apiClient } from "../config/api.client";
import { RegisterDto, LoginDto, AuthResponse, User } from "../types/auth.types";

class AuthService {
  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register", data);
    return response.data;
  }

  async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials,
    );
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>("/auth/me");
    return response.data;
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiClient.get(`/auth/verify-email?token=${token}`);
    return response.data;
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const response = await apiClient.post("/auth/resend-verification", {
      email,
    });
    return response.data;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const response = await apiClient.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  }
}

export const authService = new AuthService();
