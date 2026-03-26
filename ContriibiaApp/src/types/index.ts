export type UUID = string;

export interface Profile {
  id: UUID;
  full_name: string | null;
  email: string | null;
  username: string | null;
  phone?: string | null;
  created_at: string;
  // Verification info
  legal_name?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  // Home / verification address
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  // Personal billing address (settings)
  personal_addr1?: string | null;
  personal_addr2?: string | null;
  personal_city?: string | null;
  personal_province?: string | null;
  personal_postal?: string | null;
  // Business billing address (settings)
  business_addr1?: string | null;
  business_addr2?: string | null;
  business_city?: string | null;
  business_province?: string | null;
  business_postal?: string | null;
}

export interface Card {
  id: UUID;
  user_id: UUID;
  holder_name: string;
  last4: string;
  expiry: string;
  type: "personal" | "business";
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
  account_type: "SAVINGS" | "CURRENT";
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
