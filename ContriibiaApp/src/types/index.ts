export type UUID = string;

export interface Profile {
  id: UUID;
  full_name: string | null;
  email: string | null;
  created_at: string;
}

export interface Circle {
  id: UUID;
  name: string;
  owner_id: UUID;
  contribution_amount: number;
  created_at: string;
}

export interface CircleMember {
  id: UUID;
  circle_id: UUID;
  user_id: UUID;
  joined_at: string;
}

export interface Transaction {
  id: UUID;
  user_id: UUID;
  wallet_id: UUID;
  amount: number;
  type: "deposit" | "withdraw";
  created_at: string;
}

export interface Wallet {
  id: UUID;
  user_id: UUID;
  balance: number;
  created_at: string;
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}