-- Atualizar templates de email com design da INSCRIX
-- Cores: Primary hsl(209, 67%, 31%), Secondary hsl(5, 75%, 64%), Accent hsl(203, 58%, 49%)

-- Template de Recuperação de Palavra-passe
UPDATE email_templates 
SET html_template = '<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar Palavra-passe - INSCRIX</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Inter'', Arial, sans-serif; background: linear-gradient(135deg, hsl(209, 67%, 31%) 0%, hsl(203, 58%, 49%) 100%); color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background: white; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, hsl(209, 67%, 31%) 0%, hsl(203, 58%, 49%) 100%); padding: 40px 30px; text-align: center;">
            <div style="background: white; width: 120px; height: 60px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
                <img src="https://wbshfbodqsuvyjtugygj.supabase.co/storage/v1/object/public/assets/logo-inscrix.png" alt="INSCRIX" style="height: 40px; width: auto;" />
            </div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">🔐 Recuperar Palavra-passe</h1>
        </div>
        
        <!-- Conteúdo -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px; color: #555;">
                Olá <strong style="color: hsl(209, 67%, 31%);">{{user_name}}</strong>,
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; color: #666;">
                Recebemos um pedido para redefinir a palavra-passe da sua conta INSCRIX. Clique no botão abaixo para criar uma nova palavra-passe segura.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="{{reset_link}}" style="display: inline-block; background: linear-gradient(135deg, hsl(209, 67%, 31%) 0%, hsl(203, 58%, 49%) 100%); color: white; padding: 18px 40px; text-decoration: none; font-size: 18px; font-weight: bold; box-shadow: 0 8px 20px rgba(40, 89, 142, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                    🚀 REDEFINIR PALAVRA-PASSE
                </a>
            </div>
            
            <div style="background: #f8f9ff; border-left: 4px solid hsl(209, 67%, 31%); padding: 20px;">
                <p style="margin: 0; font-size: 14px; color: #666;">
                    <strong>🔒 Segurança:</strong> Se não solicitou esta alteração, pode ignorar este email. A sua conta permanece segura.
                </p>
            </div>
            
            <p style="font-size: 14px; color: #999; text-align: center; margin-top: 40px;">
                Este link expira em 24 horas por questões de segurança.
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8f9ff; padding: 30px; text-align: center; border-top: 1px solid #eee;">
            <img src="https://wbshfbodqsuvyjtugygj.supabase.co/storage/v1/object/public/assets/logo-inscrix.png" alt="INSCRIX" style="height: 30px; width: auto; margin-bottom: 15px;" />
            <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: bold; color: hsl(209, 67%, 31%);">
                INSCRIX - A sua plataforma de eventos desportivos
            </p>
            <p style="margin: 0 0 15px 0; font-size: 14px; color: #999;">
                Conectando atletas e organizadores em toda a comunidade
            </p>
            <div style="margin-top: 20px;">
                <a href="https://inscrix.com/faq" style="color: hsl(209, 67%, 31%); text-decoration: none; margin: 0 10px; font-size: 12px;">FAQ</a> |
                <a href="https://inscrix.com/contactos" style="color: hsl(209, 67%, 31%); text-decoration: none; margin: 0 10px; font-size: 12px;">Contactos</a> |
                <a href="https://inscrix.com/termosecondicoesinscrix" style="color: hsl(209, 67%, 31%); text-decoration: none; margin: 0 10px; font-size: 12px;">Termos</a> |
                <a href="https://inscrix.com/politica-privacidade" style="color: hsl(209, 67%, 31%); text-decoration: none; margin: 0 10px; font-size: 12px;">Privacidade</a>
            </div>
        </div>
    </div>
</body>
</html>'
WHERE template_key = 'password_reset';

-- Template de Verificação de Email
UPDATE email_templates 
SET html_template = '<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirme o seu Email - INSCRIX</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Inter'', Arial, sans-serif; background: linear-gradient(135deg, hsl(203, 58%, 49%) 0%, hsl(142, 76%, 36%) 100%); color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background: white; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, hsl(203, 58%, 49%) 0%, hsl(142, 76%, 36%) 100%); padding: 40px 30px; text-align: center;">
            <div style="background: white; width: 120px; height: 60px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
                <img src="https://wbshfbodqsuvyjtugygj.supabase.co/storage/v1/object/public/assets/logo-inscrix.png" alt="INSCRIX" style="height: 40px; width: auto;" />
            </div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">✉️ Confirme o seu Email</h1>
        </div>
        
        <!-- Conteúdo -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px; color: #555;">
                Olá <strong style="color: hsl(203, 58%, 49%);">{{user_name}}</strong>,
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; color: #666;">
                Bem-vindo ao <strong>INSCRIX</strong>! 🎉 Para ativar a sua conta e começar a descobrir eventos incríveis, confirme o seu endereço de email.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="{{verification_link}}" style="display: inline-block; background: linear-gradient(135deg, hsl(203, 58%, 49%) 0%, hsl(142, 76%, 36%) 100%); color: white; padding: 18px 40px; text-decoration: none; font-size: 18px; font-weight: bold; box-shadow: 0 8px 20px rgba(79, 172, 254, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                    🎯 CONFIRMAR EMAIL
                </a>
            </div>
            
            <div style="background: #f0f9ff; border-left: 4px solid hsl(203, 58%, 49%); padding: 20px;">
                <h3 style="margin: 0 0 10px 0; color: hsl(203, 58%, 49%); font-size: 16px;">🏆 O que pode fazer no INSCRIX:</h3>
                <ul style="margin: 10px 0; padding-left: 20px; color: #666;">
                    <li>Descobrir eventos desportivos na sua região</li>
                    <li>Inscrever-se facilmente em competições</li>
                    <li>Acompanhar os seus resultados</li>
                    <li>Conectar-se com outros atletas</li>
                </ul>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f0f9ff; padding: 30px; text-align: center; border-top: 1px solid #eee;">
            <img src="https://wbshfbodqsuvyjtugygj.supabase.co/storage/v1/object/public/assets/logo-inscrix.png" alt="INSCRIX" style="height: 30px; width: auto; margin-bottom: 15px;" />
            <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: bold; color: hsl(203, 58%, 49%);">
                INSCRIX - A sua plataforma de eventos desportivos
            </p>
            <p style="margin: 0 0 15px 0; font-size: 14px; color: #999;">
                Junte-se à comunidade mais ativa de Portugal!
            </p>
            <div style="margin-top: 20px;">
                <a href="https://inscrix.com/faq" style="color: hsl(203, 58%, 49%); text-decoration: none; margin: 0 10px; font-size: 12px;">FAQ</a> |
                <a href="https://inscrix.com/contactos" style="color: hsl(203, 58%, 49%); text-decoration: none; margin: 0 10px; font-size: 12px;">Contactos</a> |
                <a href="https://inscrix.com/termosecondicoesinscrix" style="color: hsl(203, 58%, 49%); text-decoration: none; margin: 0 10px; font-size: 12px;">Termos</a> |
                <a href="https://inscrix.com/politica-privacidade" style="color: hsl(203, 58%, 49%); text-decoration: none; margin: 0 10px; font-size: 12px;">Privacidade</a>
            </div>
        </div>
    </div>
</body>
</html>'
WHERE template_key = 'email_verification';

-- Template de Boas-vindas do Organizador
UPDATE email_templates 
SET html_template = '<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo Organizador - INSCRIX</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Inter'', Arial, sans-serif; background: linear-gradient(135deg, hsl(5, 75%, 64%) 0%, hsl(209, 67%, 31%) 100%); color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background: white; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, hsl(5, 75%, 64%) 0%, hsl(209, 67%, 31%) 100%); padding: 40px 30px; text-align: center;">
            <div style="background: white; width: 120px; height: 60px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
                <img src="https://wbshfbodqsuvyjtugygj.supabase.co/storage/v1/object/public/assets/logo-inscrix.png" alt="INSCRIX" style="height: 40px; width: auto;" />
            </div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">🎊 Bem-vindo, Organizador!</h1>
        </div>
        
        <!-- Conteúdo -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px; color: #555;">
                Olá <strong style="color: hsl(5, 75%, 64%);">{{organizer_name}}</strong>,
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; color: #666;">
                A sua conta de organizador foi criada com sucesso! 🚀 Agora pode começar a criar e gerir os seus eventos desportivos com as ferramentas mais avançadas do mercado.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="{{dashboard_link}}" style="display: inline-block; background: linear-gradient(135deg, hsl(5, 75%, 64%) 0%, hsl(209, 67%, 31%) 100%); color: white; padding: 18px 40px; text-decoration: none; font-size: 18px; font-weight: bold; box-shadow: 0 8px 20px rgba(222, 105, 120, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                    🎯 ACEDER AO DASHBOARD
                </a>
            </div>
            
            <div style="background: #fff5f5; border-left: 4px solid hsl(5, 75%, 64%); padding: 20px;">
                <h3 style="margin: 0 0 15px 0; color: hsl(5, 75%, 64%); font-size: 16px;">🛠️ Funcionalidades disponíveis:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #666;">
                    <li><strong>Criação de Eventos:</strong> Configure todos os detalhes dos seus eventos</li>
                    <li><strong>Gestão de Inscrições:</strong> Controle total sobre os participantes</li>
                    <li><strong>Sistema de Pagamentos:</strong> Receba pagamentos automaticamente</li>
                    <li><strong>Check-in QR:</strong> Sistema moderno de entrada nos eventos</li>
                    <li><strong>Relatórios:</strong> Acompanhe o desempenho dos seus eventos</li>
                </ul>
            </div>
            
            <div style="text-align: center; background: #f9f9f9; padding: 25px;">
                <h3 style="margin: 0 0 10px 0; color: hsl(5, 75%, 64%);">💡 Dica Pro</h3>
                <p style="margin: 0; font-size: 14px; color: #666;">
                    Complete o seu perfil e adicione uma foto para transmitir mais confiança aos participantes!
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #fff5f5; padding: 30px; text-align: center; border-top: 1px solid #eee;">
            <img src="https://wbshfbodqsuvyjtugygj.supabase.co/storage/v1/object/public/assets/logo-inscrix.png" alt="INSCRIX" style="height: 30px; width: auto; margin-bottom: 15px;" />
            <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: bold; color: hsl(5, 75%, 64%);">
                INSCRIX - Organizadores de Sucesso
            </p>
            <p style="margin: 0 0 15px 0; font-size: 14px; color: #999;">
                Transformamos as suas ideias em eventos inesquecíveis
            </p>
            <div style="margin-top: 20px;">
                <a href="https://inscrix.com/faq" style="color: hsl(5, 75%, 64%); text-decoration: none; margin: 0 10px; font-size: 12px;">FAQ</a> |
                <a href="https://inscrix.com/contactos" style="color: hsl(5, 75%, 64%); text-decoration: none; margin: 0 10px; font-size: 12px;">Contactos</a> |
                <a href="https://inscrix.com/termosecondicoesinscrix" style="color: hsl(5, 75%, 64%); text-decoration: none; margin: 0 10px; font-size: 12px;">Termos</a> |
                <a href="https://inscrix.com/politica-privacidade" style="color: hsl(5, 75%, 64%); text-decoration: none; margin: 0 10px; font-size: 12px;">Privacidade</a>
            </div>
        </div>
    </div>
</body>
</html>'
WHERE template_key = 'organizer_welcome';