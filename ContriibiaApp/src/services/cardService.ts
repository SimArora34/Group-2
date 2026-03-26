import { supabase } from '../lib/supabaseClient';
import { Card, ServiceResponse, UUID } from '../types';

export async function getCards(): Promise<ServiceResponse<Card[]>> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []) as Card[] };
}

export async function getDefaultCard(type: 'personal' | 'business' = 'personal'): Promise<ServiceResponse<Card | null>> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: 'Not authenticated' };

  // Try default first, fall back to first card of that type
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', type)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Card | null };
}

export async function addCard(card: {
  holder_name: string;
  last4: string;
  expiry: string;
  type: 'personal' | 'business';
  bank_name?: string;
  billing_address_1?: string;
  billing_address_2?: string;
  billing_city?: string;
  billing_province?: string;
  billing_country?: string;
}): Promise<ServiceResponse<Card>> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('cards')
    .insert({ ...card, user_id: user.id })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Card };
}

export async function updateCard(id: UUID, updates: Partial<Pick<Card, 'holder_name' | 'expiry' | 'is_frozen' | 'is_default'>>): Promise<ServiceResponse<null>> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('cards')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };
  return { success: true, data: null };
}

export async function deleteCard(id: UUID): Promise<ServiceResponse<null>> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };
  return { success: true, data: null };
}
