import { supabase } from "../lib/supabaseClient";
import { Circle, ServiceResponse, UUID } from "../types";

type CreateCircleInput = {
  name: string;
  contribution_amount?: number;
  visibility?: "public" | "private";
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
    })
    .select()
    .single();

  if (error || !circle) {
    return { success: false, error: error?.message || "Failed to create circle" };
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

export async function getPublicCircles(): Promise<ServiceResponse<Circle[]>> {
  const { data, error } = await supabase
    .from("circles")
    .select("*")
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: (data ?? []) as Circle[] };
}

export async function getUserCircles(
  userId?: UUID
): Promise<ServiceResponse<Circle[]>> {
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
    .select("*")
    .in("id", circleIds)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: (data ?? []) as Circle[] };
}

export async function getPrivateUserCircles(): Promise<ServiceResponse<Circle[]>> {
  const result = await getUserCircles();

  if (!result.success) return result;

  return {
    success: true,
    data: (result.data ?? []).filter((circle) => circle.visibility === "private"),
  };
}

export async function getJoinedPublicCircles(): Promise<ServiceResponse<Circle[]>> {
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