import { supabase } from "../lib/supabaseClient";
import { ServiceResponse } from "../types";

export async function signUp(
  email: string,
  password: string,
  fullName?: string,
): Promise<ServiceResponse<{ email: string | null }>> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName ?? "" } },
  });
  if (error) return { success: false, error: error.message };
  return { success: true, data: { email: data.user?.email ?? null } };
}

export async function signIn(
  email: string,
  password: string,
): Promise<ServiceResponse<{ email: string | null }>> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { success: false, error: error.message };
  return { success: true, data: { email: data.user?.email ?? null } };
}

export async function signOut(): Promise<ServiceResponse<null>> {
  const { error } = await supabase.auth.signOut();
  if (error) return { success: false, error: error.message };
  return { success: true, data: null };
}

export async function resetPassword(
  email: string,
): Promise<ServiceResponse<null>> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) return { success: false, error: error.message };
  return { success: true, data: null };
}

export async function verifyOtp(
  email: string,
  token: string,
): Promise<ServiceResponse<null>> {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "recovery",
  });
  if (error) return { success: false, error: error.message };
  return { success: true, data: null };
}

export async function updatePassword(
  newPassword: string,
): Promise<ServiceResponse<null>> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { success: false, error: error.message };
  return { success: true, data: null };
}
