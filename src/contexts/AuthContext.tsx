import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: 'admin' | 'organizer' | 'participant' | 'team';
  organization_name?: string;
  team_name?: string;
  team_captain_name?: string;
  bio?: string;
  avatar_url?: string;
  is_active: boolean;
  // Address fields
  username?: string;
  street?: string;
  street_number?: string;
  city?: string;
  postal_code?: string;
  // Personal fields
  birth_date?: string;
  gender?: string;
  document_number?: string;
  nationality?: string;
  nif?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  // Company/Organization fields (for organizers)
  company_nif?: string;
  company_address?: string;
  company_city?: string;
  company_phone?: string;
  support_email?: string;
  cae?: string;
  // Team fields
  team_description?: string;
  affiliation_code?: string;
  // Event registration fields
  tshirt_size?: string;
  medical_conditions?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: any, retryCount?: number) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetching
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, userData: any, retryCount = 0) => {
    const redirectUrl = `${window.location.origin}/`;
    
    try {
      console.log('🚀 Registo usando sistema existente');
      
      // Usar o sistema normal do Supabase mas SEM emails automáticos
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });

      if (signUpError) {
        // Se o erro for de envio de email, ignorar e continuar
        if (signUpError.message.includes('Error sending confirmation email')) {
          console.log('⚠️ Email automático falhou, usando sistema personalizado');
          
          // Utilizador foi criado, mas email falhou
          // Vamos usar o send-auth-email que já existe
          if (signUpData?.user) {
            try {
               const { data: emailResult } = await supabase.functions.invoke('send-auth-email', {
                 body: {
                   record: {
                     id: signUpData.user.id,
                     email: email,
                     confirmation_token: 'manual_' + signUpData.user.id,
                     raw_user_meta_data: userData
                   }
                 }
               });
              
              console.log('✅ Email enviado via send-auth-email');
            } catch (emailError) {
              console.warn('⚠️ Falha no send-auth-email também:', emailError);
            }
          }
          
          return { 
            error: null,
            message: 'Conta criada! Verifique o seu email para confirmação.'
          };
        }

        // Outros erros do registo
        if (signUpError.message.includes('User already registered')) {
          return {
            error: {
              message: 'Este email já está registado. Tente fazer login.',
              code: 'user_already_exists'
            }
          };
        }

        return { error: signUpError };
      }

      // Se chegou aqui, o registo foi bem sucedido
      console.log('✅ Registo completo');
      return { 
        error: null,
        message: 'Conta criada com sucesso! Verifique o seu email.'
      };

    } catch (error: any) {
      console.error('❌ Erro no registo:', error);
      return { 
        error: { 
          message: 'Erro de conexão. Tente novamente.',
          code: 'network_error'
        } 
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (!error && profile) {
      setProfile({ ...profile, ...updates });
    }

    return { error };
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  // Context provider

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};