import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Função para promover o primeiro usuário a admin
export const promoteFirstUserToAdmin = async () => {
  try {
    console.log("Verificando usuários existentes...");
    
    // Verificar se já existe um admin
    const { data: adminUsers } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin');

    if (adminUsers && adminUsers.length > 0) {
      console.log("Já existe um administrador no sistema");
      return { success: false, message: "Já existe um administrador no sistema" };
    }

    // Buscar o primeiro usuário criado
    const { data: firstUser } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (!firstUser) {
      console.log("Nenhum usuário encontrado");
      return { success: false, message: "Nenhum usuário encontrado" };
    }

    // Promover a admin
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('user_id', firstUser.user_id);

    if (error) {
      console.error("Erro ao promover usuário:", error);
      return { success: false, message: error.message };
    }

    console.log(`Usuário ${firstUser.email} promovido a administrador`);
    return { 
      success: true, 
      message: `Usuário ${firstUser.email} promovido a administrador com sucesso!`,
      user: firstUser
    };

  } catch (error) {
    console.error("Erro inesperado:", error);
    return { success: false, message: "Erro inesperado ao promover usuário" };
  }
};

// Hook para verificar se o usuário atual é admin
export const useAdminCheck = () => {
  const { toast } = useToast();

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .single();

      return data?.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar permissões de administrador",
        variant: "destructive",
      });
      return false;
    }
  };

  return { checkAdminStatus };
};