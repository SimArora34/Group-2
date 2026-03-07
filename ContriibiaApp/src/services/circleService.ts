import { Circle, ServiceResponse, UUID } from "../types";

export async function createCircle(
  data: Partial<Circle>
): Promise<ServiceResponse<Circle>> {
  return Promise.resolve({
    success: true,
    data: {
      id: "demo-circle" as UUID,
      name: data.name ?? "Demo Circle",
      owner_id: (data.owner_id ?? "demo-user") as UUID,
      contribution_amount: data.contribution_amount ?? 0,
      created_at: new Date().toISOString(),
    },
  });
}

export async function getUserCircles(
  userId: UUID
): Promise<ServiceResponse<Circle[]>> {
  return Promise.resolve({ success: true, data: [] });
}

export async function joinCircle(
  circleId: UUID,
  userId: UUID
): Promise<ServiceResponse<{ circleId: UUID; userId: UUID }>> {
  return Promise.resolve({
    success: true,
    data: { circleId, userId },
  });
}