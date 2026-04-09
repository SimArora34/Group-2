import { supabase } from "../lib/supabaseClient";
import { Circle, ServiceResponse, UUID } from "../types";

type CreateCircleInput = {
  name: string;
  contribution_amount?: number;
  visibility?: "public" | "private";
  savings_goal?: number;
  duration_months?: number;
  cycle_start_date?: string;
  contribution_frequency?: string;
  total_positions?: number;
};

export async function createCircle(
  data: CreateCircleInput
): Promise<ServiceResponse<Circle>> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "User not authenticated" };
  }

  const { data: circle, error } = await supabase
    .from("circles")
    .insert({
      name: data.name,
      owner_id: user.id,
      contribution_amount: data.contribution_amount ?? 0,
      visibility: data.visibility ?? "private",
      total_members: 1,
      savings_goal: data.savings_goal ?? null,
      duration_months: data.duration_months ?? null,
      cycle_start_date: data.cycle_start_date ?? null,
      contribution_frequency: data.contribution_frequency ?? null,
      total_positions: data.total_positions ?? null,
    })
    .select()
    .single();

  if (error || !circle) {
    return {
      success: false,
      error: error?.message || "Failed to create circle",
    };
  }

  const { error: memberError } = await supabase.from("circle_members").insert({
    circle_id: circle.id,
    user_id: user.id,
  });

  if (memberError) {
    await supabase.from("circles").delete().eq("id", circle.id);
    return { success: false, error: memberError.message };
  }

  return { success: true, data: circle as Circle };
}

export async function getPublicCircles(): Promise<ServiceResponse<any[]>> {
  const { data, error } = await supabase
    .from("circles")
    .select(`
      *,
      circle_members (
        id,
        user_id,
        order_position,
        status,
        joined_at
      )
    `)
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data ?? [] };
}

export async function getUserCircles(
  userId?: UUID
): Promise<ServiceResponse<any[]>> {
  let currentUserId = userId;

  if (!currentUserId) {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    currentUserId = user.id;
  }

  const { data: memberships, error: membershipError } = await supabase
    .from("circle_members")
    .select("circle_id")
    .eq("user_id", currentUserId);

  if (membershipError) {
    return { success: false, error: membershipError.message };
  }

  const circleIds = (memberships ?? []).map(
    (membership: { circle_id: UUID }) => membership.circle_id
  );

  if (circleIds.length === 0) {
    return { success: true, data: [] };
  }

  const { data, error } = await supabase
    .from("circles")
    .select(`
      *,
      circle_members (
        id,
        user_id,
        order_position,
        status,
        joined_at
      )
    `)
    .in("id", circleIds)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data ?? [] };
}

export async function getPrivateUserCircles(): Promise<ServiceResponse<any[]>> {
  const result = await getUserCircles();

  if (!result.success) return result;

  return {
    success: true,
    data: (result.data ?? []).filter((circle) => circle.visibility === "private"),
  };
}

export async function getJoinedPublicCircles(): Promise<ServiceResponse<any[]>> {
  const result = await getUserCircles();

  if (!result.success) return result;

  return {
    success: true,
    data: (result.data ?? []).filter((circle) => circle.visibility === "public"),
  };
}

export async function joinCircle(
  circleId: UUID,
  userId?: UUID
): Promise<ServiceResponse<{ circleId: UUID; userId: UUID }>> {
  let currentUserId = userId;

  if (!currentUserId) {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    currentUserId = user.id;
  }

  const { error } = await supabase.from("circle_members").insert({
    circle_id: circleId,
    user_id: currentUserId,
  });

  if (error) {
    if (
      error.message.toLowerCase().includes("duplicate") ||
      error.message.toLowerCase().includes("unique")
    ) {
      return {
        success: true,
        data: { circleId, userId: currentUserId },
      };
    }

    return { success: false, error: error.message };
  }

  const { data: circle, error: circleError } = await supabase
    .from("circles")
    .select("total_members")
    .eq("id", circleId)
    .single();

  if (!circleError && circle) {
    await supabase
      .from("circles")
      .update({
        total_members: Number(circle.total_members || 0) + 1,
      })
      .eq("id", circleId);
  }

  return {
    success: true,
    data: { circleId, userId: currentUserId },
  };
}

/**
 * Leave a circle.
 * - If the current user is the owner AND there are other members → transfer ownership
 *   to the next member (lowest order_position, or earliest joined_at).
 * - If the current user is the owner AND no other members → delete the circle entirely.
 * - Otherwise → remove the member row and decrement total_members.
 */
export async function leaveCircle(
  circleId: UUID
): Promise<ServiceResponse<{ deleted: boolean }>> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "User not authenticated" };
  }

  // Fetch the circle to check ownership
  const { data: circle, error: circleError } = await supabase
    .from("circles")
    .select("id, owner_id")
    .eq("id", circleId)
    .single();

  if (circleError || !circle) {
    return { success: false, error: circleError?.message ?? "Circle not found" };
  }

  const isOwner = circle.owner_id === user.id;

  if (isOwner) {
    // Find other members
    const { data: others } = await supabase
      .from("circle_members")
      .select("user_id, order_position, joined_at")
      .eq("circle_id", circleId)
      .neq("user_id", user.id)
      .order("order_position", { ascending: true })
      .limit(1);

    if (!others || others.length === 0) {
      // No other members — delete the entire circle
      const { error: delError } = await supabase
        .from("circles")
        .delete()
        .eq("id", circleId);
      if (delError) return { success: false, error: delError.message };
      return { success: true, data: { deleted: true } };
    }

    // Transfer ownership to the next member
    const nextOwner = others[0];
    const { error: transferError } = await supabase
      .from("circles")
      .update({ owner_id: nextOwner.user_id })
      .eq("id", circleId);

    if (transferError) return { success: false, error: transferError.message };
  }

  // Remove the member row
  const { error: removeError } = await supabase
    .from("circle_members")
    .delete()
    .eq("circle_id", circleId)
    .eq("user_id", user.id);

  if (removeError) return { success: false, error: removeError.message };

  // Decrement total_members
  const { data: updated } = await supabase
    .from("circles")
    .select("total_members")
    .eq("id", circleId)
    .single();

  if (updated) {
    await supabase
      .from("circles")
      .update({ total_members: Math.max(0, Number(updated.total_members) - 1) })
      .eq("id", circleId);
  }

  return { success: true, data: { deleted: false } };
}