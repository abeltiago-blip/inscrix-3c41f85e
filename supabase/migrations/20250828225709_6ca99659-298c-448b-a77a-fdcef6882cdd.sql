-- Atualizar templates de email com design moderno e apelativo da Inscrix

-- Template de Recuperação de Palavra-passe
UPDATE email_templates 
SET html_template = '<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar Palavra-passe - INSCRIX</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
        <!-- Header com gradiente -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <div style="background: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
                <h2 style="color: #667eea; margin: 0; font-size: 24px; font-weight: bold;">INSCRIX</h2>
            </div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">🔐 Recuperar Palavra-passe</h1>
        </div>
        
        <!-- Conteúdo -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px; color: #555;">
                Olá <strong style="color: #667eea;">{{user_name}}</strong>,
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; color: #666;">
                Recebemos um pedido para redefinir a palavra-passe da sua conta INSCRIX. Clique no botão abaixo para criar uma nova palavra-passe segura.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="{{reset_link}}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-size: 18px; font-weight: bold; box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3); transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 1px;">
                    🚀 Redefinir Palavra-passe
                </a>
            </div>
            
            <div style="background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; border-radius: 8px; margin: 30px 0;">
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
            <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #667eea;">
                INSCRIX - A sua plataforma de eventos desportivos
            </p>
            <p style="margin: 0; font-size: 14px; color: #999;">
                Conectando atletas e organizadores em toda a comunidade
            </p>
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
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 40px 30px; text-align: center;">
            <div style="background: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
                <h2 style="color: #4facfe; margin: 0; font-size: 24px; font-weight: bold;">INSCRIX</h2>
            </div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">✉️ Confirme o seu Email</h1>
        </div>
        
        <!-- Conteúdo -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px; color: #555;">
                Olá <strong style="color: #4facfe;">{{user_name}}</strong>,
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; color: #666;">
                Bem-vindo ao <strong>INSCRIX</strong>! 🎉 Para ativar a sua conta e começar a descobrir eventos incríveis, confirme o seu endereço de email.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="{{verification_link}}" style="display: inline-block; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-size: 18px; font-weight: bold; box-shadow: 0 8px 20px rgba(79, 172, 254, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                    🎯 Confirmar Email
                </a>
            </div>
            
            <div style="background: #f0f9ff; border-left: 4px solid #4facfe; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="margin: 0 0 10px 0; color: #4facfe; font-size: 16px;">🏆 O que pode fazer no INSCRIX:</h3>
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
            <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #4facfe;">
                INSCRIX - A sua plataforma de eventos desportivos
            </p>
            <p style="margin: 0; font-size: 14px; color: #999;">
                Junte-se à comunidade mais ativa de Portugal!
            </p>
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
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 40px 30px; text-align: center;">
            <div style="background: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
                <h2 style="color: #fa709a; margin: 0; font-size: 24px; font-weight: bold;">INSCRIX</h2>
            </div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">🎊 Bem-vindo, Organizador!</h1>
        </div>
        
        <!-- Conteúdo -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px; color: #555;">
                Olá <strong style="color: #fa709a;">{{organizer_name}}</strong>,
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; color: #666;">
                A sua conta de organizador foi criada com sucesso! 🚀 Agora pode começar a criar e gerir os seus eventos desportivos com as ferramentas mais avançadas do mercado.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="{{dashboard_link}}" style="display: inline-block; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-size: 18px; font-weight: bold; box-shadow: 0 8px 20px rgba(250, 112, 154, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                    🎯 Aceder ao Dashboard
                </a>
            </div>
            
            <div style="background: #fff5f5; border-left: 4px solid #fa709a; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #fa709a; font-size: 16px;">🛠️ Funcionalidades disponíveis:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #666;">
                    <li><strong>Criação de Eventos:</strong> Configure todos os detalhes dos seus eventos</li>
                    <li><strong>Gestão de Inscrições:</strong> Controle total sobre os participantes</li>
                    <li><strong>Sistema de Pagamentos:</strong> Receba pagamentos automaticamente</li>
                    <li><strong>Check-in QR:</strong> Sistema moderno de entrada nos eventos</li>
                    <li><strong>Relatórios:</strong> Acompanhe o desempenho dos seus eventos</li>
                </ul>
            </div>
            
            <div style="text-align: center; background: #f9f9f9; padding: 25px; border-radius: 12px; margin: 30px 0;">
                <h3 style="margin: 0 0 10px 0; color: #fa709a;">💡 Dica Pro</h3>
                <p style="margin: 0; font-size: 14px; color: #666;">
                    Complete o seu perfil e adicione uma foto para transmitir mais confiança aos participantes!
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #fff5f5; padding: 30px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #fa709a;">
                INSCRIX - Organizadores de Sucesso
            </p>
            <p style="margin: 0; font-size: 14px; color: #999;">
                Transformamos as suas ideias em eventos inesquecíveis
            </p>
        </div>
    </div>
</body>
</html>'
WHERE template_key = 'organizer_welcome';

-- Template de Evento Publicado
UPDATE email_templates 
SET html_template = '<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Evento Publicado - INSCRIX</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 40px 30px; text-align: center;">
            <div style="background: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
                <h2 style="color: #20b2aa; margin: 0; font-size: 24px; font-weight: bold;">INSCRIX</h2>
            </div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">🎉 Evento Publicado!</h1>
        </div>
        
        <!-- Conteúdo -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px; color: #555;">
                Parabéns <strong style="color: #20b2aa;">{{organizer_name}}</strong>!
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; color: #666;">
                O seu evento <strong style="color: #20b2aa;">{{event_name}}</strong> foi publicado com sucesso e está agora disponível para inscrições! 🚀
            </p>
            
            <div style="background: #f0fdfd; border: 2px solid #a8edea; padding: 25px; border-radius: 12px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #20b2aa; font-size: 18px;">📅 Detalhes do Evento:</h3>
                <p style="margin: 5px 0; color: #666;"><strong>📍 Data:</strong> {{event_date}}</p>
                <p style="margin: 5px 0; color: #666;"><strong>🌍 Local:</strong> {{event_location}}</p>
                <p style="margin: 5px 0; color: #666;"><strong>🎯 Status:</strong> Publicado e ativo</p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="{{event_link}}" style="display: inline-block; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-size: 18px; font-weight: bold; box-shadow: 0 8px 20px rgba(168, 237, 234, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                    👀 Ver Evento Público
                </a>
            </div>
            
            <div style="background: #f9f9f9; padding: 25px; border-radius: 12px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #20b2aa;">📈 Próximos Passos:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #666;">
                    <li>Partilhe o evento nas suas redes sociais</li>
                    <li>Monitorize as inscrições no dashboard</li>
                    <li>Prepare os materiais de check-in</li>
                    <li>Configure lembretes automáticos</li>
                </ul>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f0fdfd; padding: 30px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #20b2aa;">
                INSCRIX - Eventos que Marcam
            </p>
            <p style="margin: 0; font-size: 14px; color: #999;">
                O seu sucesso é a nossa motivação!
            </p>
        </div>
    </div>
</body>
</html>'
WHERE template_key = 'event_published';

-- Template de Registo de Equipa
UPDATE email_templates 
SET html_template = '<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registo de Equipa Confirmado - INSCRIX</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); padding: 40px 30px; text-align: center;">
            <div style="background: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
                <h2 style="color: #ff6b9d; margin: 0; font-size: 24px; font-weight: bold;">INSCRIX</h2>
            </div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">🏆 Equipa Registada!</h1>
        </div>
        
        <!-- Conteúdo -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px; color: #555;">
                Parabéns <strong style="color: #ff6b9d;">{{team_captain_name}}</strong>!
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; color: #666;">
                O registo da equipa <strong style="color: #ff6b9d;">{{team_name}}</strong> para o evento <strong>{{event_name}}</strong> foi confirmado com sucesso! 🎉
            </p>
            
            <div style="background: #fff0f5; border: 2px solid #ff9a9e; padding: 25px; border-radius: 12px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #ff6b9d; font-size: 18px;">📋 Detalhes da Inscrição:</h3>
                <p style="margin: 8px 0; color: #666;"><strong>👥 Equipa:</strong> {{team_name}}</p>
                <p style="margin: 8px 0; color: #666;"><strong>🏃‍♂️ Capitão:</strong> {{team_captain_name}}</p>
                <p style="margin: 8px 0; color: #666;"><strong>📅 Data do Evento:</strong> {{event_date}}</p>
                <p style="margin: 8px 0; color: #666;"><strong>📍 Local:</strong> {{event_location}}</p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="{{event_link}}" style="display: inline-block; background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-size: 18px; font-weight: bold; box-shadow: 0 8px 20px rgba(255, 154, 158, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                    📱 Ver Detalhes do Evento
                </a>
            </div>
            
            <div style="background: #f9f9f9; padding: 25px; border-radius: 12px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #ff6b9d;">✅ Próximos Passos:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #666;">
                    <li>Confirme todos os membros da equipa</li>
                    <li>Prepare o equipamento necessário</li>
                    <li>Reveja as regras da competição</li>
                    <li>Aguarde informações sobre o check-in</li>
                </ul>
            </div>
            
            <div style="text-align: center; background: #fff0f5; padding: 20px; border-radius: 12px;">
                <p style="margin: 0; font-size: 14px; color: #666;">
                    💪 <strong>Boa sorte!</strong> Estamos ansiosos para ver a vossa performance!
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #fff0f5; padding: 30px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #ff6b9d;">
                INSCRIX - Unidos pelo Desporto
            </p>
            <p style="margin: 0; font-size: 14px; color: #999;">
                Onde as equipas se formam e os sonhos se realizam
            </p>
        </div>
    </div>
</body>
</html>'
WHERE template_key = 'team_registration';