import { supabase } from "../lib/supabaseClient";
import { ServiceResponse } from "../types";

export async function signUp(
  email: string,
  password: string,
  fullName?: string
): Promise<ServiceResponse<{ email: string | null }>> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName ?? "" },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: { email: data.user?.email ?? email },
    };
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Sign up failed" };
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<ServiceResponse<{ email: string | null }>> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: { email: data.user?.email ?? email },
    };
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Sign in failed" };
  }
}

export async function signOut(): Promise<ServiceResponse<null>> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: null };
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Sign out failed" };
  }
}