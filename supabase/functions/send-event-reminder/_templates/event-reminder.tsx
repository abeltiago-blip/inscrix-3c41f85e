import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface EventReminderEmailProps {
  participantName: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventLocation: string
  eventAddress: string
  registrationNumber: string
  daysUntilEvent: number
  ticketDownloadUrl?: string
  eventUrl: string
  checkInInstructions?: string
}

export const EventReminderEmail = ({
  participantName = 'João Silva',
  eventTitle = 'Corrida da Cidade',
  eventDate = '15 de Janeiro de 2024',
  eventTime = '09:00',
  eventLocation = 'Parque da Cidade',
  eventAddress = 'Rua Principal, 123, Lisboa',
  registrationNumber = 'REG-2024-123456',
  daysUntilEvent = 3,
  ticketDownloadUrl,
  eventUrl = 'https://inscrix.pt/eventos',
  checkInInstructions = 'Apresente o seu bilhete ou código QR na entrada'
}: EventReminderEmailProps) => (
  <Html>
    <Head />
    <Preview>Lembrete: {eventTitle} em {daysUntilEvent} dias - {registrationNumber}</Preview>
    <Body style={main}>
      <Container style={container}>
        
        {/* Header */}
        <Section style={header}>
          <Row>
            <Column>
              <Heading style={h1}>INSCRIX</Heading>
              <Text style={headerText}>Lembrete do Evento</Text>
            </Column>
          </Row>
        </Section>

        {/* Reminder Message */}
        <Section style={reminderSection}>
          <div style={{...reminderIcon, color: '#ffc107'}}>⏰</div>
          <Heading style={h2}>
            {daysUntilEvent === 1 ? 'Evento é Amanhã!' : `Evento em ${daysUntilEvent} dias!`}
          </Heading>
          <Text style={reminderText}>
            Olá {participantName}, não se esqueça do seu evento:
          </Text>
        </Section>

        {/* Event Details */}
        <Section style={eventSection}>
          <Heading style={eventTitle}>{eventTitle}</Heading>
          <Row style={eventDetailRow}>
            <Column style={iconColumn}>
              <div style={{...eventIcon, color: '#007bff'}}>📅</div>
            </Column>
            <Column style={textColumn}>
              <Text style={eventDetailLabel}>Data e Hora</Text>
              <Text style={eventDetailValue}>{eventDate} às {eventTime}</Text>
            </Column>
          </Row>
          <Row style={eventDetailRow}>
            <Column style={iconColumn}>
              <div style={{...eventIcon, color: '#28a745'}}>📍</div>
            </Column>
            <Column style={textColumn}>
              <Text style={eventDetailLabel}>Local</Text>
              <Text style={eventDetailValue}>{eventLocation}</Text>
              <Text style={eventAddress}>{eventAddress}</Text>
            </Column>
          </Row>
          <Row style={eventDetailRow}>
            <Column style={iconColumn}>
              <div style={{...eventIcon, color: '#6c757d'}}>🎫</div>
            </Column>
            <Column style={textColumn}>
              <Text style={eventDetailLabel}>Sua Inscrição</Text>
              <Text style={eventDetailValue}>{registrationNumber}</Text>
            </Column>
          </Row>
        </Section>

        {/* Countdown */}
        <Section style={countdownSection}>
          <Heading style={h3}>Contagem Regressiva</Heading>
          <Row>
            <Column style={countdownColumn}>
              <Text style={countdownNumber}>{daysUntilEvent}</Text>
              <Text style={countdownLabel}>
                {daysUntilEvent === 1 ? 'dia' : 'dias'}
              </Text>
            </Column>
            <Column style={countdownColumn}>
              <Text style={countdownNumber}>
                {Math.floor(Math.random() * 24)}
              </Text>
              <Text style={countdownLabel}>horas</Text>
            </Column>
            <Column style={countdownColumn}>
              <Text style={countdownNumber}>
                {Math.floor(Math.random() * 60)}
              </Text>
              <Text style={countdownLabel}>minutos</Text>
            </Column>
          </Row>
        </Section>

        {/* Action Buttons */}
        <Section style={buttonSection}>
          {ticketDownloadUrl && (
            <Button style={primaryButton} href={ticketDownloadUrl}>
              Descarregar Bilhete
            </Button>
          )}
          
          <Button style={secondaryButton} href={eventUrl}>
            Ver Detalhes do Evento
          </Button>
        </Section>

        {/* Checklist */}
        <Section style={checklistSection}>
          <Heading style={h3}>Lista de Verificação</Heading>
          <Text style={checklistItem}>
            ☐ Confirmar transporte e chegada com antecedência
          </Text>
          <Text style={checklistItem}>
            ☐ Preparar documento de identificação
          </Text>
          <Text style={checklistItem}>
            ☐ Descarregar bilhete ou ter código QR disponível
          </Text>
          <Text style={checklistItem}>
            ☐ Verificar condições meteorológicas
          </Text>
          <Text style={checklistItem}>
            ☐ Preparar equipamento necessário (se aplicável)
          </Text>
        </Section>

        {/* Check-in Instructions */}
        <Section style={instructionsSection}>
          <Heading style={h3}>Instruções de Check-in</Heading>
          <Text style={instructionText}>
            {checkInInstructions}
          </Text>
          <Text style={instructionText}>
            • Chegue 30 minutos antes do início
          </Text>
          <Text style={instructionText}>
            • O check-in estará disponível 2 horas antes do evento
          </Text>
          <Text style={instructionText}>
            • Em caso de dificuldades, procure a equipa de apoio no local
          </Text>
        </Section>

        <Hr style={hr} />

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            Estamos ansiosos por vê-lo no evento!
            <br />
            Em caso de dúvidas, não hesite em contactar-nos.
          </Text>
          <Text style={footerText}>
            © 2024 INSCRIX - Plataforma de Gestão de Eventos
          </Text>
        </Section>

      </Container>
    </Body>
  </Html>
)

export default EventReminderEmail

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const header = {
  backgroundColor: '#ffc107',
  padding: '20px 30px',
}

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
}

const headerText = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '5px 0 0 0',
  opacity: 0.8,
}

const reminderSection = {
  padding: '30px',
  textAlign: 'center' as const,
}

const reminderIcon = {
  fontSize: '48px',
  margin: '0',
}

const h2 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '20px 0 10px 0',
}

const reminderText = {
  color: '#666666',
  fontSize: '16px',
  margin: '0',
}

const eventSection = {
  backgroundColor: '#f8f9fa',
  padding: '30px',
  margin: '20px 0',
  borderRadius: '8px',
}

const eventTitle = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 20px 0',
  textAlign: 'center' as const,
}

const eventDetailRow = {
  margin: '15px 0',
}

const iconColumn = {
  width: '40px',
  verticalAlign: 'top',
}

const textColumn = {
  verticalAlign: 'top',
}

const eventIcon = {
  fontSize: '24px',
  margin: '0',
}

const eventDetailLabel = {
  color: '#666666',
  fontSize: '12px',
  fontWeight: 'bold',
  margin: '0 0 5px 0',
  textTransform: 'uppercase' as const,
}

const eventDetailValue = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
}

const eventAddress = {
  color: '#666666',
  fontSize: '14px',
  margin: '5px 0 0 0',
}

const countdownSection = {
  padding: '30px',
  textAlign: 'center' as const,
  backgroundColor: '#007bff',
  color: '#ffffff',
}

const h3 = {
  color: 'inherit',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 20px 0',
}

const countdownColumn = {
  textAlign: 'center' as const,
  padding: '10px',
}

const countdownNumber = {
  color: '#ffffff',
  fontSize: '36px',
  fontWeight: 'bold',
  margin: '0',
}

const countdownLabel = {
  color: '#ffffff',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  margin: '5px 0 0 0',
  opacity: 0.8,
}

const buttonSection = {
  padding: '30px',
  textAlign: 'center' as const,
}

const primaryButton = {
  backgroundColor: '#28a745',
  borderRadius: '5px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  width: '200px',
  padding: '12px 0',
  margin: '10px',
}

const secondaryButton = {
  backgroundColor: '#6c757d',
  borderRadius: '5px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  width: '200px',
  padding: '12px 0',
  margin: '10px',
}

const checklistSection = {
  padding: '20px 30px',
}

const checklistItem = {
  color: '#666666',
  fontSize: '14px',
  margin: '10px 0',
  paddingLeft: '10px',
}

const instructionsSection = {
  padding: '20px 30px',
  backgroundColor: '#e7f3ff',
}

const instructionText = {
  color: '#666666',
  fontSize: '14px',
  margin: '8px 0',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const footer = {
  padding: '20px 30px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '10px 0',
}