export type UUID = string;

export interface Profile {
  id: UUID;
  full_name: string | null;
  email: string | null;
  username: string | null;
  phone?: string | null;
  created_at: string;
}

export interface Card {
  id: UUID;
  user_id: UUID;
  holder_name: string;
  last4: string;
  expiry: string;
  type: 'personal' | 'business';
  bank_name: string | null;
  is_frozen: boolean;
  is_default: boolean;
  billing_address_1: string | null;
  billing_address_2: string | null;
  billing_city: string | null;
  billing_province: string | null;
  billing_country: string | null;
  created_at: string;
}

export interface BankAccount {
  id: UUID;
  user_id: UUID;
  account_number: string;
  bank_name: string;
  account_type: 'SAVINGS' | 'CURRENT';
  is_default: boolean;
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
