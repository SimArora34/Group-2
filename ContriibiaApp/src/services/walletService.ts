// MOCK MODE – Supabase calls are bypassed for client demo
import mockData from "../../data/mockData.json";
import { ServiceResponse, Transaction, Wallet } from "../types";

let walletBalance = mockData.mockWallet.balance;
const transactions = [...(mockData.mockTransactions as Transaction[])];

export async function getWallet(): Promise<ServiceResponse<Wallet>> {
  return {
    success: true,
    data: { ...mockData.mockWallet, balance: walletBalance } as Wallet,
  };
}

export async function getTransactions(): Promise<
  ServiceResponse<Transaction[]>
> {
  return { success: true, data: transactions };
}

export async function deposit(amount: number): Promise<ServiceResponse<null>> {
  walletBalance += amount;
  transactions.unshift({
    id: `t${Date.now()}`,
    user_id: "u1",
    wallet_id: "w1",
    amount,
    type: "deposit",
    created_at: new Date().toISOString(),
  });
  return { success: true, data: null };
}

export async function withdraw(amount: number): Promise<ServiceResponse<null>> {
  walletBalance -= amount;
  transactions.unshift({
    id: `t${Date.now()}`,
    user_id: "u1",
    wallet_id: "w1",
    amount,
    type: "withdraw",
    created_at: new Date().toISOString(),
  });
  return { success: true, data: null };
}
