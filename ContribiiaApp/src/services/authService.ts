import { supabase } from "../lib/supabaseClient";
import { ServiceResponse } from "../types";

export async function signUp(
  email: string,
  password: string,
  fullName?: string,
  username?: string,
  phone?: string,
): Promise<ServiceResponse<{ email: string | null; hasSession: boolean }>> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName ?? "",
        username: username ?? "",
        phone: phone ?? "",
      },
    },
  });
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("already registered") || msg.includes("user already registered") || msg.includes("email already")) {
      return { success: false, error: "This email is already registered. Please log in instead." };
    }
    return { success: false, error: error.message };
  }

  // Supabase silently succeeds for duplicate emails when confirmation is enabled
  // — it returns a fake user with no identities. Detect and surface this.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { success: false, error: "This email is already registered. Please log in instead." };
  }

  // If Supabase returned a session directly (email confirmation disabled), we're done.
  if (data.session) {
    return { success: true, data: { email: data.user?.email ?? null, hasSession: true } };
  }

  // Email confirmation is enabled — try signing in immediately so the flow can continue.
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (!signInError && signInData.session) {
    return { success: true, data: { email: data.user?.email ?? null, hasSession: true } };
  }

  // No session yet — user must confirm their email before continuing.
  return { success: true, data: { email: data.user?.email ?? null, hasSession: false } };
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
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
    },
  });
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
    type: "email",
  });
  if (error) return { success: false, error: error.message };
  return { success: true, data: null };
}

export async function updatePassword(
  newPassword: string,
): Promise<ServiceResponse<null>> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) return { success: false, error: sessionError.message };
  if (!session) {
    return {
      success: false,
      error:
        "Auth session missing. Please sign in or re-verify your reset code.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { success: false, error: error.message };
  return { success: true, data: null };
}
