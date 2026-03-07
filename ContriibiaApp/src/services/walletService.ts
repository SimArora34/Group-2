import { supabase } from "../lib/supabaseClient";
import { ServiceResponse, Transaction, Wallet } from "../types";

export async function getWallet(): Promise<ServiceResponse<Wallet>> {
  try {
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;

    if (!uid) {
      return { success: false, error: "Not signed in" };
    }

    const { data, error } = await supabase
      .from("wallets")
      .select("id, user_id, balance, created_at")
      .eq("user_id", uid)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Wallet };
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Failed to get wallet" };
  }
}

export async function getTransactions(): Promise<
  ServiceResponse<Transaction[]>
> {
  try {
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;

    if (!uid) {
      return { success: false, error: "Not signed in" };
    }

    const { data, error } = await supabase
      .from("transactions")
      .select("id, user_id, wallet_id, amount, type, created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data ?? []) as Transaction[] };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message ?? "Failed to get transactions",
    };
  }
}

export async function deposit(amount: number): Promise<ServiceResponse<null>> {
  try {
    const { error } = await supabase.rpc("wallet_deposit", {
      p_amount: amount,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: null };
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Deposit failed" };
  }
}

export async function withdraw(amount: number): Promise<ServiceResponse<null>> {
  try {
    const { error } = await supabase.rpc("wallet_withdraw", {
      p_amount: amount,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: null };
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Withdraw failed" };
  }
}