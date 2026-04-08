import { supabase } from "../lib/supabaseClient";
import { ServiceResponse, Transaction, Wallet } from "../types";

export async function getWallet(): Promise<ServiceResponse<Wallet>> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: authError?.message ?? "Not authenticated",
    };
  }

  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as Wallet };
}

export async function getTransactions(): Promise<
  ServiceResponse<Transaction[]>
> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: authError?.message ?? "Not authenticated",
    };
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: (data ?? []) as Transaction[] };
}

export async function deposit(amount: number): Promise<ServiceResponse<null>> {
  if (!amount || amount <= 0) {
    return { success: false, error: "Amount must be greater than 0" };
  }

  const { error } = await supabase.rpc("wallet_deposit", {
    p_amount: amount,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: null };
}

export async function withdraw(amount: number): Promise<ServiceResponse<null>> {
  if (!amount || amount <= 0) {
    return { success: false, error: "Amount must be greater than 0" };
  }

  const { error } = await supabase.rpc("wallet_withdraw", {
    p_amount: amount,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: null };
}

export async function sendMoney(
  recipientEmail: string,
  amount: number,
): Promise<ServiceResponse<null>> {
  const cleanEmail = recipientEmail.trim().toLowerCase();

  if (!cleanEmail) {
    return { success: false, error: "Recipient email is required" };
  }

  if (!amount || amount <= 0) {
    return { success: false, error: "Amount must be greater than 0" };
  }

  const { error } = await supabase.rpc("wallet_send", {
    p_recipient_email: cleanEmail,
    p_amount: amount,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: null };
}

export async function lookupUserByEmail(email: string) {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    return { success: false, error: "Email is required" };
  }

  // Step 1: Try profiles
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, email")
    .ilike("email", cleanEmail)
    .maybeSingle();

  if (profile) {
    return {
      success: true,
      data: {
        full_name: profile.full_name ?? null,
        email: profile.email ?? cleanEmail,
      },
    };
  }

  // Step 2: fallback — allow ANY email that looks valid (for demo)
  return {
    success: true,
    data: {
      full_name: null,
      email: cleanEmail,
    },
  };
}