export interface UserProfile {
  id: string;
  name: string;
  mobile: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  nameTA?: string;
  defaultRate?: number;
}

export interface CustomerPreset {
  id: string;
  name: string;
  nameTA?: string;
  mobile?: string;
}
