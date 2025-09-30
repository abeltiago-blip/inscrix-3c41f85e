-- Continuar atualização dos templates restantes

-- Template de Evento Publicado
UPDATE email_templates 
SET html_template = '<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Evento Publicado - INSCRIX</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Inter'', Arial, sans-serif; background: linear-gradient(135deg, hsl(142, 76%, 36%) 0%, hsl(203, 58%, 49%) 100%); color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background: white; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, hsl(142, 76%, 36%) 0%, hsl(203, 58%, 49%) 100%); padding: 40px 30px; text-align: center;">
            <div style="background: white; width: 120px; height: 60px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
                <img src="https://wbshfbodqsuvyjtugygj.supabase.co/storage/v1/object/public/assets/logo-inscrix.png" alt="INSCRIX" style="height: 40px; width: auto;" />
            </div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">🎉 Evento Publicado!</h1>
        </div>
        
        <!-- Conteúdo -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px; color: #555;">
                Parabéns <strong style="color: hsl(142, 76%, 36%);">{{organizer_name}}</strong>!
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; color: #666;">
                O seu evento <strong style="color: hsl(142, 76%, 36%);">{{event_name}}</strong> foi publicado com sucesso e está agora disponível para inscrições! 🚀
            </p>
            
            <div style="background: #f0fff0; border: 2px solid hsl(142, 76%, 36%); padding: 25px;">
                <h3 style="margin: 0 0 15px 0; color: hsl(142, 76%, 36%); font-size: 18px;">📅 Detalhes do Evento:</h3>
                <p style="margin: 5px 0; color: #666;"><strong>📍 Data:</strong> {{event_date}}</p>
                <p style="margin: 5px 0; color: #666;"><strong>🌍 Local:</strong> {{event_location}}</p>
                <p style="margin: 5px 0; color: #666;"><strong>🎯 Status:</strong> Publicado e ativo</p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="{{event_link}}" style="display: inline-block; background: linear-gradient(135deg, hsl(142, 76%, 36%) 0%, hsl(203, 58%, 49%) 100%); color: white; padding: 18px 40px; text-decoration: none; font-size: 18px; font-weight: bold; box-shadow: 0 8px 20px rgba(52, 168, 83, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                    👀 VER EVENTO PÚBLICO
                </a>
            </div>
            
            <div style="background: #f9f9f9; padding: 25px;">
                <h3 style="margin: 0 0 15px 0; color: hsl(142, 76%, 36%);">📈 Próximos Passos:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #666;">
                    <li>Partilhe o evento nas suas redes sociais</li>
                    <li>Monitorize as inscrições no dashboard</li>
                    <li>Prepare os materiais de check-in</li>
                    <li>Configure lembretes automáticos</li>
                </ul>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f0fff0; padding: 30px; text-align: center; border-top: 1px solid #eee;">
            <img src="https://wbshfbodqsuvyjtugygj.supabase.co/storage/v1/object/public/assets/logo-inscrix.png" alt="INSCRIX" style="height: 30px; width: auto; margin-bottom: 15px;" />
            <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: bold; color: hsl(142, 76%, 36%);">
                INSCRIX - Eventos que Marcam
            </p>
            <p style="margin: 0 0 15px 0; font-size: 14px; color: #999;">
                O seu sucesso é a nossa motivação!
            </p>
            <div style="margin-top: 20px;">
                <a href="https://inscrix.com/faq" style="color: hsl(142, 76%, 36%); text-decoration: none; margin: 0 10px; font-size: 12px;">FAQ</a> |
                <a href="https://inscrix.com/contactos" style="color: hsl(142, 76%, 36%); text-decoration: none; margin: 0 10px; font-size: 12px;">Contactos</a> |
                <a href="https://inscrix.com/termosecondicoesinscrix" style="color: hsl(142, 76%, 36%); text-decoration: none; margin: 0 10px; font-size: 12px;">Termos</a> |
                <a href="https://inscrix.com/politica-privacidade" style="color: hsl(142, 76%, 36%); text-decoration: none; margin: 0 10px; font-size: 12px;">Privacidade</a>
            </div>
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
<body style="margin: 0; padding: 0; font-family: ''Inter'', Arial, sans-serif; background: linear-gradient(135deg, hsl(290, 91%, 50%) 0%, hsl(5, 75%, 64%) 100%); color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background: white; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, hsl(290, 91%, 50%) 0%, hsl(5, 75%, 64%) 100%); padding: 40px 30px; text-align: center;">
            <div style="background: white; width: 120px; height: 60px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
                <img src="https://wbshfbodqsuvyjtugygj.supabase.co/storage/v1/object/public/assets/logo-inscrix.png" alt="INSCRIX" style="height: 40px; width: auto;" />
            </div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">🏆 Equipa Registada!</h1>
        </div>
        
        <!-- Conteúdo -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px; color: #555;">
                Parabéns <strong style="color: hsl(290, 91%, 50%);">{{team_captain_name}}</strong>!
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; color: #666;">
                O registo da equipa <strong style="color: hsl(290, 91%, 50%);">{{team_name}}</strong> para o evento <strong>{{event_name}}</strong> foi confirmado com sucesso! 🎉
            </p>
            
            <div style="background: #faf0ff; border: 2px solid hsl(290, 91%, 50%); padding: 25px;">
                <h3 style="margin: 0 0 15px 0; color: hsl(290, 91%, 50%); font-size: 18px;">📋 Detalhes da Inscrição:</h3>
                <p style="margin: 8px 0; color: #666;"><strong>👥 Equipa:</strong> {{team_name}}</p>
                <p style="margin: 8px 0; color: #666;"><strong>🏃‍♂️ Capitão:</strong> {{team_captain_name}}</p>
                <p style="margin: 8px 0; color: #666;"><strong>📅 Data do Evento:</strong> {{event_date}}</p>
                <p style="margin: 8px 0; color: #666;"><strong>📍 Local:</strong> {{event_location}}</p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="{{event_link}}" style="display: inline-block; background: linear-gradient(135deg, hsl(290, 91%, 50%) 0%, hsl(5, 75%, 64%) 100%); color: white; padding: 18px 40px; text-decoration: none; font-size: 18px; font-weight: bold; box-shadow: 0 8px 20px rgba(219, 39, 219, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                    📱 VER DETALHES DO EVENTO
                </a>
            </div>
            
            <div style="background: #f9f9f9; padding: 25px;">
                <h3 style="margin: 0 0 15px 0; color: hsl(290, 91%, 50%);">✅ Próximos Passos:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #666;">
                    <li>Confirme todos os membros da equipa</li>
                    <li>Prepare o equipamento necessário</li>
                    <li>Reveja as regras da competição</li>
                    <li>Aguarde informações sobre o check-in</li>
                </ul>
            </div>
            
            <div style="text-align: center; background: #faf0ff; padding: 20px;">
                <p style="margin: 0; font-size: 14px; color: #666;">
                    💪 <strong>Boa sorte!</strong> Estamos ansiosos para ver a vossa performance!
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #faf0ff; padding: 30px; text-align: center; border-top: 1px solid #eee;">
            <img src="https://wbshfbodqsuvyjtugygj.supabase.co/storage/v1/object/public/assets/logo-inscrix.png" alt="INSCRIX" style="height: 30px; width: auto; margin-bottom: 15px;" />
            <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: bold; color: hsl(290, 91%, 50%);">
                INSCRIX - Unidos pelo Desporto
            </p>
            <p style="margin: 0 0 15px 0; font-size: 14px; color: #999;">
                Onde as equipas se formam e os sonhos se realizam
            </p>
            <div style="margin-top: 20px;">
                <a href="https://inscrix.com/faq" style="color: hsl(290, 91%, 50%); text-decoration: none; margin: 0 10px; font-size: 12px;">FAQ</a> |
                <a href="https://inscrix.com/contactos" style="color: hsl(290, 91%, 50%); text-decoration: none; margin: 0 10px; font-size: 12px;">Contactos</a> |
                <a href="https://inscrix.com/termosecondicoesinscrix" style="color: hsl(290, 91%, 50%); text-decoration: none; margin: 0 10px; font-size: 12px;">Termos</a> |
                <a href="https://inscrix.com/politica-privacidade" style="color: hsl(290, 91%, 50%); text-decoration: none; margin: 0 10px; font-size: 12px;">Privacidade</a>
            </div>
        </div>
    </div>
</body>
</html>'
WHERE template_key = 'team_registration';