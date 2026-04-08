import { supabase } from "../lib/supabaseClient";
import { ServiceResponse, UUID } from "../types";

export type ClubContribution = {
  id: UUID;
  circle_id: UUID;
  user_id: UUID;
  amount: number;
  status: string;
  contributed_at: string;
};

export type ClubPayout = {
  id: UUID;
  circle_id: UUID;
  recipient_user_id: UUID;
  payout_amount: number;
  payout_date: string;
  round_number: number | null;
};

export async function getLatestContributionForCurrentUser(
  circleId: UUID
): Promise<ServiceResponse<ClubContribution | null>> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "User not authenticated" };
  }

  const { data, error } = await supabase
    .from("club_contributions")
    .select("*")
    .eq("circle_id", circleId)
    .eq("user_id", user.id)
    .order("contributed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: (data as ClubContribution | null) ?? null };
}

export async function getLatestPayoutForCurrentUser(
  circleId: UUID
): Promise<ServiceResponse<ClubPayout | null>> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "User not authenticated" };
  }

  const { data, error } = await supabase
    .from("club_payouts")
    .select("*")
    .eq("circle_id", circleId)
    .eq("recipient_user_id", user.id)
    .order("payout_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: (data as ClubPayout | null) ?? null };
}