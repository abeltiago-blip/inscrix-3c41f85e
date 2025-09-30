-- Atualizar todos os templates removendo emojis, cantos redondos e corrigindo logo
UPDATE email_templates SET html_template = '<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar Password - INSCRIX</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Inter'', Arial, sans-serif; background: linear-gradient(135deg, hsl(203, 58%, 49%) 0%, hsl(142, 76%, 36%) 100%); color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background: white; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, hsl(203, 58%, 49%) 0%, hsl(142, 76%, 36%) 100%); padding: 40px 30px; text-align: center;">
            <div style="background: white; width: 120px; height: 60px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
                <img src="https://ece8ba08-91dc-4e96-a558-34d9f72bceb3.sandbox.lovable.dev/assets/logo-inscrix.png" alt="INSCRIX" style="height: 40px; width: auto;" />
            </div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 10px;">
                    <path d="M12 1L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 1Z" fill="white" stroke="white" stroke-width="2"/>
                </svg>
                Recuperar Password
            </h1>
        </div>
        
        <!-- Conteúdo -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px; color: #555;">
                Olá <strong style="color: hsl(203, 58%, 49%);">{{user_name}}</strong>,
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; color: #666;">
                Recebemos um pedido para redefinir a password da sua conta <strong>INSCRIX</strong>. Clique no botão abaixo para criar uma nova password.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="{{reset_link}}" style="display: inline-block; background: linear-gradient(135deg, hsl(203, 58%, 49%) 0%, hsl(142, 76%, 36%) 100%); color: white; padding: 18px 40px; text-decoration: none; font-size: 18px; font-weight: bold; box-shadow: 0 8px 20px rgba(79, 172, 254, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 8px;">
                        <path d="M16 10V6C16 4.93913 15.5786 3.92172 14.8284 3.17157C14.0783 2.42143 13.0609 2 12 2C10.9391 2 9.92172 2.42143 9.17157 3.17157C8.42143 3.92172 8 4.93913 8 6V10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <rect x="3" y="10" width="18" height="12" rx="2" ry="2" stroke="white" stroke-width="2" fill="none"/>
                        <circle cx="12" cy="16" r="1" fill="white"/>
                    </svg>
                    REDEFINIR PASSWORD
                </a>
            </div>
            
            <div style="background: #f0f9ff; border-left: 4px solid hsl(203, 58%, 49%); padding: 20px;">
                <h3 style="margin: 0 0 10px 0; color: hsl(203, 58%, 49%); font-size: 16px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 8px;">
                        <circle cx="12" cy="12" r="10" stroke="hsl(203, 58%, 49%)" stroke-width="2" fill="none"/>
                        <path d="M12 6V12L16 14" stroke="hsl(203, 58%, 49%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Este link expira em 1 hora
                </h3>
                <p style="margin: 10px 0; color: #666; font-size: 14px;">
                    Se não solicitou esta alteração, pode ignorar este email. A sua password atual permanecerá inalterada.
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f0f9ff; padding: 30px; text-align: center; border-top: 1px solid #eee;">
            <img src="https://ece8ba08-91dc-4e96-a558-34d9f72bceb3.sandbox.lovable.dev/assets/logo-inscrix.png" alt="INSCRIX" style="height: 30px; width: auto; margin-bottom: 15px;" />
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
WHERE template_key = 'password_reset';

UPDATE email_templates SET html_template = '<!DOCTYPE html>
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
                <img src="https://ece8ba08-91dc-4e96-a558-34d9f72bceb3.sandbox.lovable.dev/assets/logo-inscrix.png" alt="INSCRIX" style="height: 40px; width: auto;" />
            </div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 10px;">
                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="white" stroke-width="2" fill="none"/>
                    <polyline points="22,6 12,13 2,6" stroke="white" stroke-width="2" fill="none"/>
                </svg>
                Confirme o seu Email
            </h1>
        </div>
        
        <!-- Conteúdo -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px; color: #555;">
                Olá <strong style="color: hsl(203, 58%, 49%);">{{user_name}}</strong>,
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; color: #666;">
                Bem-vindo ao <strong>INSCRIX</strong>! Para ativar a sua conta e começar a descobrir eventos incríveis, confirme o seu endereço de email.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="{{verification_link}}" style="display: inline-block; background: linear-gradient(135deg, hsl(203, 58%, 49%) 0%, hsl(142, 76%, 36%) 100%); color: white; padding: 18px 40px; text-decoration: none; font-size: 18px; font-weight: bold; box-shadow: 0 8px 20px rgba(79, 172, 254, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 8px;">
                        <polyline points="20,6 9,17 4,12" stroke="white" stroke-width="2" fill="none"/>
                    </svg>
                    CONFIRMAR EMAIL
                </a>
            </div>
            
            <div style="background: #f0f9ff; border-left: 4px solid hsl(203, 58%, 49%); padding: 20px;">
                <h3 style="margin: 0 0 10px 0; color: hsl(203, 58%, 49%); font-size: 16px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 8px;">
                        <circle cx="12" cy="12" r="10" stroke="hsl(203, 58%, 49%)" stroke-width="2" fill="none"/>
                        <path d="M9 12L11 14L15 10" stroke="hsl(203, 58%, 49%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    O que pode fazer no INSCRIX:
                </h3>
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
            <img src="https://ece8ba08-91dc-4e96-a558-34d9f72bceb3.sandbox.lovable.dev/assets/logo-inscrix.png" alt="INSCRIX" style="height: 30px; width: auto; margin-bottom: 15px;" />
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

UPDATE email_templates SET html_template = '<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo ao INSCRIX - Organizador</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Inter'', Arial, sans-serif; background: linear-gradient(135deg, hsl(203, 58%, 49%) 0%, hsl(142, 76%, 36%) 100%); color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background: white; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, hsl(203, 58%, 49%) 0%, hsl(142, 76%, 36%) 100%); padding: 40px 30px; text-align: center;">
            <div style="background: white; width: 120px; height: 60px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
                <img src="https://ece8ba08-91dc-4e96-a558-34d9f72bceb3.sandbox.lovable.dev/assets/logo-inscrix.png" alt="INSCRIX" style="height: 40px; width: auto;" />
            </div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 10px;">
                    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="8.5" cy="7" r="4" stroke="white" stroke-width="2" fill="none"/>
                    <polyline points="17,11 19,13 23,9" stroke="white" stroke-width="2" fill="none"/>
                </svg>
                Bem-vindo, Organizador!
            </h1>
        </div>
        
        <!-- Conteúdo -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px; color: #555;">
                Olá <strong style="color: hsl(203, 58%, 49%);">{{organizer_name}}</strong>,
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; color: #666;">
                Bem-vindo ao <strong>INSCRIX</strong>! A sua conta de organizador foi criada com sucesso. Agora pode começar a criar e gerir os seus eventos desportivos.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="{{dashboard_link}}" style="display: inline-block; background: linear-gradient(135deg, hsl(203, 58%, 49%) 0%, hsl(142, 76%, 36%) 100%); color: white; padding: 18px 40px; text-decoration: none; font-size: 18px; font-weight: bold; box-shadow: 0 8px 20px rgba(79, 172, 254, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 8px;">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="white" stroke-width="2" fill="none"/>
                        <rect x="9" y="9" width="6" height="6" stroke="white" stroke-width="2" fill="none"/>
                        <path d="M9 1V3M15 1V3M9 21V23M15 21V23M1 9H3M1 15H3M21 9H23M21 15H23" stroke="white" stroke-width="2"/>
                    </svg>
                    ACEDER AO DASHBOARD
                </a>
            </div>
            
            <div style="background: #f0f9ff; border-left: 4px solid hsl(203, 58%, 49%); padding: 20px;">
                <h3 style="margin: 0 0 10px 0; color: hsl(203, 58%, 49%); font-size: 16px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 8px;">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="hsl(203, 58%, 49%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <polyline points="2,17 12,22 22,17" stroke="hsl(203, 58%, 49%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <polyline points="2,12 12,17 22,12" stroke="hsl(203, 58%, 49%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Funcionalidades disponíveis:
                </h3>
                <ul style="margin: 10px 0; padding-left: 20px; color: #666;">
                    <li>Criar e gerir eventos desportivos</li>
                    <li>Configurar inscrições e bilhetes</li>
                    <li>Acompanhar registos em tempo real</li>
                    <li>Gerir check-ins dos participantes</li>
                    <li>Enviar comunicações aos inscritos</li>
                </ul>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f0f9ff; padding: 30px; text-align: center; border-top: 1px solid #eee;">
            <img src="https://ece8ba08-91dc-4e96-a558-34d9f72bceb3.sandbox.lovable.dev/assets/logo-inscrix.png" alt="INSCRIX" style="height: 30px; width: auto; margin-bottom: 15px;" />
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
WHERE template_key = 'organizer_welcome';

UPDATE email_templates SET html_template = '<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Evento Publicado - INSCRIX</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Inter'', Arial, sans-serif; background: linear-gradient(135deg, hsl(203, 58%, 49%) 0%, hsl(142, 76%, 36%) 100%); color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background: white; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, hsl(203, 58%, 49%) 0%, hsl(142, 76%, 36%) 100%); padding: 40px 30px; text-align: center;">
            <div style="background: white; width: 120px; height: 60px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
                <img src="https://ece8ba08-91dc-4e96-a558-34d9f72bceb3.sandbox.lovable.dev/assets/logo-inscrix.png" alt="INSCRIX" style="height: 40px; width: auto;" />
            </div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 10px;">
                    <path d="M8 2V6M16 2V6M3.5 9.09H20.5M21 8.5V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V8.5C3 7.39543 3.89543 6.5 5 6.5H19C20.1046 6.5 21 7.39543 21 8.5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Evento Publicado!
            </h1>
        </div>
        
        <!-- Conteúdo -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px; color: #555;">
                Olá <strong style="color: hsl(203, 58%, 49%);">{{organizer_name}}</strong>,
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; color: #666;">
                Excelente! O seu evento <strong>{{event_name}}</strong> foi publicado com sucesso na plataforma <strong>INSCRIX</strong> e já está disponível para inscrições.
            </p>
            
            <div style="background: #f0f9ff; border: 2px solid hsl(203, 58%, 49%); padding: 25px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: hsl(203, 58%, 49%); font-size: 18px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 8px;">
                        <circle cx="12" cy="12" r="10" stroke="hsl(203, 58%, 49%)" stroke-width="2" fill="none"/>
                        <path d="M12 6V12L16 14" stroke="hsl(203, 58%, 49%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Detalhes do Evento:
                </h3>
                <p style="margin: 8px 0; color: #666;"><strong>Data:</strong> {{event_date}}</p>
                <p style="margin: 8px 0; color: #666;"><strong>Local:</strong> {{event_location}}</p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="{{event_link}}" style="display: inline-block; background: linear-gradient(135deg, hsl(203, 58%, 49%) 0%, hsl(142, 76%, 36%) 100%); color: white; padding: 18px 40px; text-decoration: none; font-size: 18px; font-weight: bold; box-shadow: 0 8px 20px rgba(79, 172, 254, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 8px;">
                        <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="white" stroke-width="2" fill="none"/>
                        <circle cx="12" cy="12" r="3" stroke="white" stroke-width="2" fill="none"/>
                    </svg>
                    VER EVENTO PUBLICADO
                </a>
            </div>
            
            <div style="background: #f0f9ff; border-left: 4px solid hsl(142, 76%, 36%); padding: 20px;">
                <h3 style="margin: 0 0 10px 0; color: hsl(142, 76%, 36%); font-size: 16px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 8px;">
                        <polyline points="20,6 9,17 4,12" stroke="hsl(142, 76%, 36%)" stroke-width="2" fill="none"/>
                    </svg>
                    Próximos passos:
                </h3>
                <ul style="margin: 10px 0; padding-left: 20px; color: #666;">
                    <li>Partilhe o link do evento nas suas redes sociais</li>
                    <li>Acompanhe as inscrições no dashboard</li>
                    <li>Configure lembretes automáticos</li>
                    <li>Prepare os materiais para o check-in</li>
                </ul>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f0f9ff; padding: 30px; text-align: center; border-top: 1px solid #eee;">
            <img src="https://ece8ba08-91dc-4e96-a558-34d9f72bceb3.sandbox.lovable.dev/assets/logo-inscrix.png" alt="INSCRIX" style="height: 30px; width: auto; margin-bottom: 15px;" />
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
WHERE template_key = 'event_published';

UPDATE email_templates SET html_template = '<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inscrição de Equipa - INSCRIX</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Inter'', Arial, sans-serif; background: linear-gradient(135deg, hsl(203, 58%, 49%) 0%, hsl(142, 76%, 36%) 100%); color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background: white; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, hsl(203, 58%, 49%) 0%, hsl(142, 76%, 36%) 100%); padding: 40px 30px; text-align: center;">
            <div style="background: white; width: 120px; height: 60px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
                <img src="https://ece8ba08-91dc-4e96-a558-34d9f72bceb3.sandbox.lovable.dev/assets/logo-inscrix.png" alt="INSCRIX" style="height: 40px; width: auto;" />
            </div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 10px;">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="9" cy="7" r="4" stroke="white" stroke-width="2" fill="none"/>
                    <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7018C21.7033 16.0495 20.9011 15.5911 20 15.4584" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 18.9974 6.11683 18.9974 7.005C18.9974 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Inscrição de Equipa
            </h1>
        </div>
        
        <!-- Conteúdo -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px; color: #555;">
                Olá <strong style="color: hsl(203, 58%, 49%);">{{team_captain_name}}</strong>,
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; color: #666;">
                A inscrição da equipa <strong>{{team_name}}</strong> no evento <strong>{{event_name}}</strong> foi realizada com sucesso!
            </p>
            
            <div style="background: #f0f9ff; border: 2px solid hsl(203, 58%, 49%); padding: 25px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: hsl(203, 58%, 49%); font-size: 18px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 8px;">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="hsl(203, 58%, 49%)" stroke-width="2" fill="none"/>
                        <rect x="7" y="9" width="10" height="7" stroke="hsl(203, 58%, 49%)" stroke-width="2" fill="none"/>
                        <circle cx="12" cy="13" r="2" stroke="hsl(203, 58%, 49%)" stroke-width="2" fill="none"/>
                    </svg>
                    Detalhes da Inscrição:
                </h3>
                <p style="margin: 8px 0; color: #666;"><strong>Equipa:</strong> {{team_name}}</p>
                <p style="margin: 8px 0; color: #666;"><strong>Evento:</strong> {{event_name}}</p>
                <p style="margin: 8px 0; color: #666;"><strong>Data:</strong> {{event_date}}</p>
                <p style="margin: 8px 0; color: #666;"><strong>Local:</strong> {{event_location}}</p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="{{event_link}}" style="display: inline-block; background: linear-gradient(135deg, hsl(203, 58%, 49%) 0%, hsl(142, 76%, 36%) 100%); color: white; padding: 18px 40px; text-decoration: none; font-size: 18px; font-weight: bold; box-shadow: 0 8px 20px rgba(79, 172, 254, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 8px;">
                        <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="white" stroke-width="2" fill="none"/>
                        <circle cx="12" cy="12" r="3" stroke="white" stroke-width="2" fill="none"/>
                    </svg>
                    VER DETALHES DO EVENTO
                </a>
            </div>
            
            <div style="background: #f0f9ff; border-left: 4px solid hsl(142, 76%, 36%); padding: 20px;">
                <h3 style="margin: 0 0 10px 0; color: hsl(142, 76%, 36%); font-size: 16px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 8px;">
                        <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4905 2.02168 11.3363C2.16356 9.18206 2.99721 7.13214 4.39828 5.49883C5.79935 3.86553 7.69279 2.72636 9.79619 2.24019C11.8996 1.75403 14.1003 1.94229 16.07 2.78" stroke="hsl(142, 76%, 36%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <polyline points="22,4 12,14.01 9,11.01" stroke="hsl(142, 76%, 36%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Próximos passos:
                </h3>
                <ul style="margin: 10px 0; padding-left: 20px; color: #666;">
                    <li>Confirme todos os membros da equipa</li>
                    <li>Mantenha-se atento às comunicações do evento</li>
                    <li>Prepare a documentação necessária</li>
                    <li>Chegue com antecedência no dia do evento</li>
                </ul>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f0f9ff; padding: 30px; text-align: center; border-top: 1px solid #eee;">
            <img src="https://ece8ba08-91dc-4e96-a558-34d9f72bceb3.sandbox.lovable.dev/assets/logo-inscrix.png" alt="INSCRIX" style="height: 30px; width: auto; margin-bottom: 15px;" />
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
WHERE template_key = 'team_registration';