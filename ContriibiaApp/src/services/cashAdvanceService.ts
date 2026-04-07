import { supabase } from "../lib/supabaseClient";
import { ServiceResponse, UUID } from "../types";

export type CashAdvanceStatus = "pending" | "approved" | "rejected";

export interface CashAdvanceRequest {
  id: UUID;
  user_id: UUID;
  amount: number;
  status: CashAdvanceStatus;
  created_at: string;
}

export async function requestCashAdvance(
  amount: number,
): Promise<ServiceResponse<CashAdvanceRequest>> {
  if (!amount || amount <= 0) {
    return { success: false, error: "Amount must be greater than 0" };
  }

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
    .from("cash_advances")
    .insert({
      user_id: user.id,
      amount,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as CashAdvanceRequest };
}

export async function getMyCashAdvances(): Promise<
  ServiceResponse<CashAdvanceRequest[]>
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
    .from("cash_advances")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: (data ?? []) as CashAdvanceRequest[] };
}

export async function getCashAdvanceById(
  id: UUID,
): Promise<ServiceResponse<CashAdvanceRequest>> {
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
    .from("cash_advances")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as CashAdvanceRequest };
}