import { supabase } from "../lib/supabaseClient";
import { ServiceResponse, Transaction, Wallet } from "../types";

export async function getWallet(): Promise<ServiceResponse<Wallet>> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Wallet };
}

export async function getTransactions(): Promise<
  ServiceResponse<Transaction[]>
> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []) as Transaction[] };
}

export async function deposit(amount: number): Promise<ServiceResponse<null>> {
  const { error } = await supabase.rpc("wallet_deposit", { p_amount: amount });
  if (error) return { success: false, error: error.message };
  return { success: true, data: null };
}

export async function withdraw(amount: number): Promise<ServiceResponse<null>> {
  const { error } = await supabase.rpc("wallet_withdraw", { p_amount: amount });
  if (error) return { success: false, error: error.message };
  return { success: true, data: null };
}

export async function sendMoney(
  recipientEmail: string,
  amount: number,
): Promise<ServiceResponse<null>> {
  const { error } = await supabase.rpc("wallet_send", {
    p_recipient_email: recipientEmail,
    p_amount: amount,
  });
  if (error) return { success: false, error: error.message };
  return { success: true, data: null };
}

export async function lookupUserByEmail(
  email: string,
): Promise<ServiceResponse<{ full_name: string | null; email: string | null }>> {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("email", email)
    .single();
  if (error || !data) return { success: false, error: "User not found" };
  return { success: true, data };
}
