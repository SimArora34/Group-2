import { supabase } from "../lib/supabaseClient";
import { Profile, ServiceResponse, UUID } from "../types";

export async function getProfile(
  userId: UUID
): Promise<ServiceResponse<Profile>> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, created_at")
      .eq("id", userId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Profile };
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Failed to get profile" };
  }
}

export async function getCurrentProfile(): Promise<ServiceResponse<Profile>> {
  try {
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;

    if (!uid) {
      return { success: false, error: "Not signed in" };
    }

    return getProfile(uid);
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Failed to get profile" };
  }
}