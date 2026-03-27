// NOTE: The 'circles' and 'circle_members' tables are not yet in the database schema.
// This service will be implemented once those tables are added to Supabase.
// See src/docs/databaseSchema.md for the current schema.
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
  // If not already in the list, find it in publicClubs and add it
  const alreadyJoined = circles.some((c) => c.id === circleId);
  if (!alreadyJoined) {
    const publicClubs = (mockData as any).publicClubs ?? [];
    const found = publicClubs.find((c: any) => c.id === circleId);
    if (found) {
      circles.push({
        id: found.id,
        name: found.name,
        owner_id: userId,
        contribution_amount: found.contribution_amount,
        created_at: new Date().toISOString(),
      });
    }
  }
  return { success: true, data: { circleId, userId } };
}

// Convenience wrapper — fetches circles for the currently signed-in user.
// When the circles table is added to Supabase this will be updated to query it.
export async function getCurrentUserCircles(): Promise<
  ServiceResponse<Circle[]>
> {
  return { success: true, data: circles };
}
