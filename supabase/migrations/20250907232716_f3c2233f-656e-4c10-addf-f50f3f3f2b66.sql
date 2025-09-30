-- Create email templates for registration and payment confirmations
INSERT INTO email_templates (
  template_key, 
  name, 
  subject_template, 
  html_template, 
  variables, 
  category, 
  is_active
) VALUES 
(
  'registration_confirmation',
  'Confirmação de Inscrição',
  'Inscrição Confirmada - {{event_title}}',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Inscrição Confirmada</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">INSCRIX</h1>
            <h2 style="color: #1f2937; margin: 0;">Inscrição Confirmada!</h2>
        </div>
        
        <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
            Olá <strong>{{participant_name}}</strong>,
        </p>
        
        <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
            A sua inscrição no evento <strong>{{event_title}}</strong> foi confirmada com sucesso!
        </p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Detalhes da Inscrição:</h3>
            <p style="margin: 5px 0;"><strong>Evento:</strong> {{event_title}}</p>
            <p style="margin: 5px 0;"><strong>Data:</strong> {{event_date}}</p>
            <p style="margin: 5px 0;"><strong>Local:</strong> {{event_location}}</p>
            <p style="margin: 5px 0;"><strong>Participante:</strong> {{participant_name}}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> {{participant_email}}</p>
        </div>
        
        <p style="color: #374151; line-height: 1.6; margin: 20px 0;">
            Receberá mais informações sobre o evento nos próximos dias. 
            Se tiver alguma questão, não hesite em contactar-nos.
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Este email foi enviado automaticamente pelo sistema INSCRIX.<br>
                Por favor, não responda diretamente a este email.
            </p>
        </div>
    </div>
</body>
</html>',
  ARRAY['participant_name', 'participant_email', 'event_title', 'event_date', 'event_location'],
  'registration',
  true
),
(
  'payment_confirmation',
  'Confirmação de Pagamento',
  'Pagamento Confirmado - {{event_title}}',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Pagamento Confirmado</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">INSCRIX</h1>
            <h2 style="color: #059669; margin: 0;">✓ Pagamento Confirmado!</h2>
        </div>
        
        <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
            Olá <strong>{{participant_name}}</strong>,
        </p>
        
        <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
            O seu pagamento para o evento <strong>{{event_title}}</strong> foi processado com sucesso!
        </p>
        
        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">✓ Inscrição Completa</h3>
            <p style="margin: 0; color: #374151;">
                A sua inscrição está agora completa e garantida. 
                O seu bilhete está em anexo neste email.
            </p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Detalhes do Pagamento:</h3>
            <p style="margin: 5px 0;"><strong>Evento:</strong> {{event_title}}</p>
            <p style="margin: 5px 0;"><strong>Participante:</strong> {{participant_name}}</p>
            <p style="margin: 5px 0;"><strong>Valor:</strong> {{payment_amount}}</p>
            <p style="margin: 5px 0;"><strong>Estado:</strong> Pago ✓</p>
        </div>
        
        <p style="color: #374151; line-height: 1.6; margin: 20px 0;">
            <strong>Importante:</strong> Guarde este email e o bilhete em anexo. 
            Vai precisar de apresentar o bilhete (físico ou digital) no dia do evento.
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Este email foi enviado automaticamente pelo sistema INSCRIX.<br>
                Por favor, não responda diretamente a este email.
            </p>
        </div>
    </div>
</body>
</html>',
  ARRAY['participant_name', 'participant_email', 'event_title', 'event_date', 'event_location', 'payment_amount'],
  'payment',
  true
)
ON CONFLICT (template_key) DO UPDATE SET
  name = EXCLUDED.name,
  subject_template = EXCLUDED.subject_template,
  html_template = EXCLUDED.html_template,
  variables = EXCLUDED.variables,
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active;