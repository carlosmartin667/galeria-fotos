export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario?: {
    id?: string;
    nombre?: string;
    email?: string;
    rol?: string;
  };
  nombre?: string;
  email?: string;
  rol?: string;
}

export interface CurrentSession {
  token: string | null;
  guestMode: boolean;
  nombre?: string;
  email?: string;
  rol?: string;
}
