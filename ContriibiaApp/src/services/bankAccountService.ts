import { supabase } from '../lib/supabaseClient';
import { BankAccount, ServiceResponse, UUID } from '../types';

export async function getBankAccounts(): Promise<ServiceResponse<BankAccount[]>> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []) as BankAccount[] };
}

export async function getDefaultBankAccount(): Promise<ServiceResponse<BankAccount | null>> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as BankAccount | null };
}

export async function addBankAccount(account: {
  account_number: string;
  bank_name: string;
  account_type: 'SAVINGS' | 'CURRENT';
  is_default?: boolean;
}): Promise<ServiceResponse<BankAccount>> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('bank_accounts')
    .insert({ ...account, user_id: user.id })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as BankAccount };
}

export async function deleteBankAccount(id: UUID): Promise<ServiceResponse<null>> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('bank_accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };
  return { success: true, data: null };
}
