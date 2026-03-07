import { supabase } from "../lib/supabaseClient";
import { ServiceResponse, Transaction, UUID } from "../types";

export async function getUserTransactions(
  userId: UUID
): Promise<ServiceResponse<Transaction[]>> {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("id, user_id, wallet_id, amount, type, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

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

export async function getCurrentUserTransactions(): Promise<
  ServiceResponse<Transaction[]>
> {
  try {
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;

    if (!uid) {
      return { success: false, error: "Not signed in" };
    }

    return getUserTransactions(uid);
  } catch (e: any) {
    return {
      success: false,
      error: e?.message ?? "Failed to get transactions",
    };
  }
}