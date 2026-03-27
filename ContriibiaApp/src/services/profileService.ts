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
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user)
    return { success: false, error: authError?.message ?? "Not authenticated" };

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return { success: false, error: error.message };
  const profileEmail = (data as Profile).email?.trim();
  const profilePhone = (data as Profile).phone?.trim();

  return {
    success: true,
    data: {
      ...(data as Profile),
      email: user.email ?? profileEmail ?? null,
      phone: profilePhone || user.user_metadata?.phone || null,
    },
  };
}

export async function updateCurrentProfile(updates: {
  full_name: string;
  username: string;
  email: string;
  phone: string;
}): Promise<ServiceResponse<Profile>> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: authError?.message ?? "Not authenticated" };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: updates.full_name,
      username: updates.username,
      email: updates.email,
    })
    .eq("id", user.id);

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  const shouldUpdateEmail = updates.email.trim() !== (user.email ?? "").trim();
  const { error: userUpdateError } = await supabase.auth.updateUser({
    ...(shouldUpdateEmail ? { email: updates.email } : {}),
    data: {
      ...user.user_metadata,
      full_name: updates.full_name,
      username: updates.username,
      phone: updates.phone,
    },
  });

  if (userUpdateError) {
    return { success: false, error: userUpdateError.message };
  }

  return getCurrentProfile();
}

export async function saveVerificationInfo(data: {
  legal_name?: string;
  date_of_birth?: string;
  gender?: string;
}): Promise<ServiceResponse<null>> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user)
    return { success: false, error: authError?.message ?? "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", user.id);
  if (error) return { success: false, error: error.message };
  return { success: true, data: null };
}

export async function saveAddress(data: {
  address_line1?: string;
  address_line2?: string;
  city?: string;
  province?: string;
  postal_code?: string;
}): Promise<ServiceResponse<null>> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user)
    return { success: false, error: authError?.message ?? "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", user.id);
  if (error) return { success: false, error: error.message };
  return { success: true, data: null };
}

export async function savePersonalBillingAddress(data: {
  personal_addr1: string;
  personal_addr2?: string;
  personal_city: string;
  personal_province: string;
  personal_postal: string;
}): Promise<ServiceResponse<null>> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user)
    return { success: false, error: authError?.message ?? "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", user.id);
  if (error) return { success: false, error: error.message };
  return { success: true, data: null };
}

export async function saveBusinessBillingAddress(data: {
  business_addr1: string;
  business_addr2?: string;
  business_city: string;
  business_province: string;
  business_postal: string;
}): Promise<ServiceResponse<null>> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user)
    return { success: false, error: authError?.message ?? "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", user.id);
  if (error) return { success: false, error: error.message };
  return { success: true, data: null };
}
