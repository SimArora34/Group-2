import { supabase } from "../lib/supabaseClient";
import { Profile, ServiceResponse, UUID } from "../types";

export async function getProfile(
  userId: UUID,
): Promise<ServiceResponse<Profile>> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Profile };
}

export async function getCurrentProfile(): Promise<ServiceResponse<Profile>> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: authError?.message ?? "Not authenticated" };

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Profile };
}
