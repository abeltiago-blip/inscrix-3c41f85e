-- Vamos criar uma função para facilitar a criação de utilizadores de teste
-- Como não podemos inserir diretamente na auth.users, vamos preparar os perfis

-- Inserir perfil do organizador (será associado quando o utilizador se registar)
-- Primeiro vamos verificar se existe um utilizador com este email

-- Esta função vai ajudar a criar perfis automaticamente
CREATE OR REPLACE FUNCTION public.create_test_user_profile(
  p_user_id uuid,
  p_email text,
  p_first_name text,
  p_last_name text,
  p_role user_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    email,
    first_name,
    last_name,
    role,
    is_active
  ) VALUES (
    p_user_id,
    p_email,
    p_first_name,
    p_last_name,
    p_role,
    true
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    updated_at = now();
END;
$$;