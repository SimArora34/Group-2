// MOCK MODE – Supabase calls are bypassed for client demo
import mockData from "../../data/mockData.json";
import { Circle, ServiceResponse, UUID } from "../types";

const circles = [...(mockData.mockCircles as Circle[])];

export async function createCircle(
  data: Partial<Circle>,
): Promise<ServiceResponse<Circle>> {
  const newCircle: Circle = {
    id: `c${circles.length + 1}`,
    name: data.name ?? "New Circle",
    owner_id: "u1",
    contribution_amount: data.contribution_amount ?? 0,
    created_at: new Date().toISOString(),
  };
  circles.push(newCircle);
  return { success: true, data: newCircle };
}

export async function getUserCircles(
  _userId: UUID,
): Promise<ServiceResponse<Circle[]>> {
  return { success: true, data: circles };
}

export async function joinCircle(
  circleId: UUID,
  userId: UUID,
): Promise<ServiceResponse<{ circleId: UUID; userId: UUID }>> {
  return { success: true, data: { circleId, userId } };
}
