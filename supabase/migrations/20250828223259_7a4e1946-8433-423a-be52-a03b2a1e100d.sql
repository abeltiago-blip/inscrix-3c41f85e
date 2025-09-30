-- Create newsletter subscriptions table
CREATE TABLE public.newsletter_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  categories JSONB NOT NULL DEFAULT '["events", "promotions", "news"]'::jsonb,
  preferences JSONB NOT NULL DEFAULT '{
    "frequency": "weekly",
    "location": null,
    "sports": [],
    "age_group": null
  }'::jsonb,
  confirmation_token TEXT,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(email)
);

-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  subject_template TEXT NOT NULL,
  html_template TEXT NOT NULL,
  variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  category TEXT NOT NULL DEFAULT 'system',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email logs table
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID REFERENCES auth.users(id),
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  provider TEXT NOT NULL DEFAULT 'resend',
  provider_message_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Newsletter subscriptions policies
CREATE POLICY "Users can manage their own newsletter subscription"
ON public.newsletter_subscriptions
FOR ALL
USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Public can subscribe to newsletter"
ON public.newsletter_subscriptions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all newsletter subscriptions"
ON public.newsletter_subscriptions
FOR SELECT
USING (get_current_user_role() = 'admin');

-- Email templates policies
CREATE POLICY "Admins can manage email templates"
ON public.email_templates
FOR ALL
USING (get_current_user_role() = 'admin');

CREATE POLICY "Everyone can view active email templates"
ON public.email_templates
FOR SELECT
USING (is_active = true);

-- Email logs policies
CREATE POLICY "Admins can view all email logs"
ON public.email_logs
FOR SELECT
USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can view their own email logs"
ON public.email_logs
FOR SELECT
USING (auth.uid() = recipient_user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_newsletter_subscriptions_updated_at
BEFORE UPDATE ON public.newsletter_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default email templates
INSERT INTO public.email_templates (template_key, name, description, subject_template, html_template, category, variables) VALUES
('password_reset', 'Password Reset', 'Email sent when user requests password reset', 'Recuperar palavra-passe - INSCRIX', '<h1>Recuperar Palavra-passe</h1><p>Olá {{participant_name}},</p><p>Recebemos um pedido para redefinir a palavra-passe da sua conta INSCRIX.</p><p><a href="{{reset_link}}" style="background:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Redefinir Palavra-passe</a></p><p>Se não solicitou esta alteração, pode ignorar este email.</p>', 'authentication', '["participant_name", "reset_link"]'),

('email_verification', 'Email Verification', 'Email sent to verify new user email', 'Confirme o seu email - INSCRIX', '<h1>Confirme o seu Email</h1><p>Olá {{participant_name}},</p><p>Bem-vindo ao INSCRIX! Para ativar a sua conta, confirme o seu endereço de email.</p><p><a href="{{verification_link}}" style="background:#28a745;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Confirmar Email</a></p>', 'authentication', '["participant_name", "verification_link"]'),

('organizer_welcome', 'Organizer Welcome', 'Welcome email for new organizers', 'Bem-vindo ao INSCRIX - Organizador', '<h1>Bem-vindo ao INSCRIX!</h1><p>Olá {{organizer_name}},</p><p>A sua conta de organizador foi criada com sucesso! Pode agora começar a criar e gerir os seus eventos desportivos.</p><p><a href="{{dashboard_link}}" style="background:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Aceder ao Dashboard</a></p>', 'onboarding', '["organizer_name", "dashboard_link"]'),

('team_registration', 'Team Registration', 'Confirmation for team registrations', 'Registo de Equipa Confirmado - {{event_title}}', '<h1>Registo de Equipa Confirmado</h1><p>Olá {{team_captain_name}},</p><p>O registo da equipa <strong>{{team_name}}</strong> para o evento <strong>{{event_title}}</strong> foi confirmado!</p><p><strong>Detalhes:</strong></p><ul><li>Data: {{event_date}}</li><li>Local: {{event_location}}</li><li>Equipa: {{team_name}}</li></ul>', 'registration', '["team_captain_name", "team_name", "event_title", "event_date", "event_location"]'),

('newsletter_confirmation', 'Newsletter Subscription', 'Confirmation for newsletter subscription', 'Subscrição Newsletter INSCRIX Confirmada', '<h1>Subscrição Confirmada!</h1><p>Obrigado por subscrever a newsletter do INSCRIX!</p><p>Irá receber atualizações sobre:</p><ul><li>Novos eventos desportivos</li><li>Promoções especiais</li><li>Notícias do mundo desportivo</li></ul><p><a href="{{unsubscribe_link}}">Cancelar subscrição</a></p>', 'newsletter', '["unsubscribe_link"]'),

('event_published', 'Event Published', 'Notification when event is published', 'Evento Publicado - {{event_title}}', '<h1>Evento Publicado!</h1><p>Olá {{organizer_name}},</p><p>O seu evento <strong>{{event_title}}</strong> foi publicado e está agora disponível para inscrições!</p><p><a href="{{event_link}}" style="background:#28a745;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Ver Evento</a></p>', 'event_management', '["organizer_name", "event_title", "event_link"]'),

('registration_deadline', 'Registration Deadline', 'Reminder about registration deadline', 'Último Dia para Inscrições - {{event_title}}', '<h1>Últimas Horas!</h1><p>As inscrições para <strong>{{event_title}}</strong> terminam em breve!</p><p><strong>Prazo:</strong> {{deadline_date}}</p><p><a href="{{event_link}}" style="background:#dc3545;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Inscrever Agora</a></p>', 'marketing', '["event_title", "deadline_date", "event_link"]'),

('event_cancelled', 'Event Cancelled', 'Notification when event is cancelled', 'Evento Cancelado - {{event_title}}', '<h1>Evento Cancelado</h1><p>Olá {{participant_name}},</p><p>Lamentamos informar que o evento <strong>{{event_title}}</strong> foi cancelado.</p><p><strong>Motivo:</strong> {{cancellation_reason}}</p><p>O reembolso será processado automaticamente nos próximos dias úteis.</p>', 'event_management', '["participant_name", "event_title", "cancellation_reason"]'),

('results_available', 'Results Available', 'Notification when event results are published', 'Resultados Disponíveis - {{event_title}}', '<h1>Resultados Publicados!</h1><p>Olá {{participant_name}},</p><p>Os resultados do evento <strong>{{event_title}}</strong> já estão disponíveis!</p><p><a href="{{results_link}}" style="background:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Ver Resultados</a></p>', 'results', '["participant_name", "event_title", "results_link"]'),

('refund_processed', 'Refund Processed', 'Confirmation of refund processing', 'Reembolso Processado - {{event_title}}', '<h1>Reembolso Processado</h1><p>Olá {{participant_name}},</p><p>O seu reembolso de <strong>€{{refund_amount}}</strong> para o evento <strong>{{event_title}}</strong> foi processado.</p><p>O valor será creditado no seu método de pagamento original em 3-5 dias úteis.</p>', 'financial', '["participant_name", "event_title", "refund_amount"]');