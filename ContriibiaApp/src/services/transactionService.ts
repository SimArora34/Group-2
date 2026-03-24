import { supabase } from "../lib/supabaseClient";
import { ServiceResponse, Transaction, UUID } from "../types";

export async function getUserTransactions(
  userId: UUID,
): Promise<ServiceResponse<Transaction[]>> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []) as Transaction[] };
}

export async function getCurrentUserTransactions(): Promise<
  ServiceResponse<Transaction[]>
> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: "Not authenticated" };

  return getUserTransactions(user.id);
}
