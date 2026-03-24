// MOCK MODE – Supabase calls are bypassed for client demo
import mockData from "../../data/mockData.json";
import { ServiceResponse, Transaction, UUID } from "../types";

const transactions = mockData.mockTransactions as Transaction[];

export async function getUserTransactions(
  _userId: UUID,
): Promise<ServiceResponse<Transaction[]>> {
  return { success: true, data: transactions };
}

export async function getCurrentUserTransactions(): Promise<
  ServiceResponse<Transaction[]>
> {
  return { success: true, data: transactions };
}
