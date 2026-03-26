-- Migration: add_wallet_send_function
-- Adds the wallet_send RPC used by the Send Money feature.
-- Transfers an amount from the logged-in user's wallet to another user by email.

CREATE OR REPLACE FUNCTION wallet_send(p_recipient_email text, p_amount numeric)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_sender          uuid := auth.uid();
  v_recipient       uuid;
  v_sender_wallet   uuid;
  v_recipient_wallet uuid;
  v_bal             numeric;
BEGIN
  -- Look up recipient by email
  SELECT id INTO v_recipient
  FROM auth.users
  WHERE email = p_recipient_email;

  IF v_recipient IS NULL THEN
    RAISE EXCEPTION 'Recipient not found';
  END IF;

  IF v_sender = v_recipient THEN
    RAISE EXCEPTION 'Cannot send money to yourself';
  END IF;

  -- Get sender wallet and current balance
  SELECT id, balance INTO v_sender_wallet, v_bal
  FROM wallets
  WHERE user_id = v_sender;

  IF v_bal < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Get recipient wallet
  SELECT id INTO v_recipient_wallet
  FROM wallets
  WHERE user_id = v_recipient;

  IF v_recipient_wallet IS NULL THEN
    RAISE EXCEPTION 'Recipient does not have a wallet';
  END IF;

  -- Deduct from sender
  UPDATE wallets
  SET balance = balance - p_amount
  WHERE id = v_sender_wallet;

  INSERT INTO transactions (user_id, wallet_id, amount, type)
  VALUES (v_sender, v_sender_wallet, p_amount, 'withdraw');

  -- Add to recipient
  UPDATE wallets
  SET balance = balance + p_amount
  WHERE id = v_recipient_wallet;

  INSERT INTO transactions (user_id, wallet_id, amount, type)
  VALUES (v_recipient, v_recipient_wallet, p_amount, 'deposit');

END;
$$;
