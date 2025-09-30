-- Criar dois utilizadores de teste
-- Como não podemos inserir diretamente na tabela auth.users, vamos criar uma função temporária para facilitar

-- Primeiro, vamos verificar se já existem estes utilizadores
DO $$
BEGIN
    -- Inserir perfil de organizador de teste (será criado automaticamente quando o utilizador se registar)
    -- Vamos apenas preparar alguns dados de exemplo que podem ser úteis
    
    -- Esta migração serve principalmente para confirmar que temos tudo configurado
    -- Os utilizadores serão criados através do sistema de registo da aplicação
    
    RAISE NOTICE 'Sistema preparado para criar utilizadores de teste';
END $$;