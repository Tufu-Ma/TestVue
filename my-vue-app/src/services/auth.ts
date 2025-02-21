import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export const register = async (username: string, email: string, password: string): Promise<void> => {
  await axios.post(`${API_URL}/register`, { username, email, password });
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(`${API_URL}/login`, { email, password });
  return response.data;
};
