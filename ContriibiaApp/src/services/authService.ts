// MOCK MODE – Supabase calls are bypassed for client demo
// To restore, revert this file from git
import mockData from "../../data/mockData.json";
import { ServiceResponse } from "../types";

const MOCK_USER = mockData.users[0];

export async function signUp(
  email: string,
  _password: string,
  _fullName?: string,
): Promise<ServiceResponse<{ email: string | null }>> {
  return { success: true, data: { email } };
}

export async function signIn(
  email: string,
  _password: string,
): Promise<ServiceResponse<{ email: string | null }>> {
  return { success: true, data: { email: email || MOCK_USER.email } };
}

export async function signOut(): Promise<ServiceResponse<null>> {
  return { success: true, data: null };
}

export async function resetPassword(
  _email: string,
): Promise<ServiceResponse<null>> {
  return { success: true, data: null };
}

export async function verifyOtp(
  _email: string,
  _token: string,
): Promise<ServiceResponse<null>> {
  return { success: true, data: null };
}

export async function updatePassword(
  _newPassword: string,
): Promise<ServiceResponse<null>> {
  return { success: true, data: null };
}
