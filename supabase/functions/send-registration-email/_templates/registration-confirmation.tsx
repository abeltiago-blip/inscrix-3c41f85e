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
  Img,
  Row,
  Column,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface RegistrationConfirmationEmailProps {
  participantName: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  eventAddress: string
  registrationNumber: string
  ticketType: string
  amountPaid: number
  paymentStatus: string
  ticketDownloadUrl?: string
  qrCodeUrl?: string
  eventUrl: string
}

export const RegistrationConfirmationEmail = ({
  participantName = 'João Silva',
  eventTitle = 'Corrida da Cidade',
  eventDate = '15 de Janeiro de 2024, 09:00',
  eventLocation = 'Parque da Cidade',
  eventAddress = 'Rua Principal, 123, Lisboa',
  registrationNumber = 'REG-2024-123456',
  ticketType = 'Inscrição Individual',
  amountPaid = 25.00,
  paymentStatus = 'paid',
  ticketDownloadUrl,
  qrCodeUrl,
  eventUrl = 'https://inscrix.pt/eventos'
}: RegistrationConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Inscrição confirmada para {eventTitle} - {registrationNumber}</Preview>
    <Body style={main}>
      <Container style={container}>
        
        {/* Header */}
        <Section style={header}>
          <Row>
            <Column>
              <Heading style={h1}>INSCRIX</Heading>
              <Text style={headerText}>Plataforma de Gestão de Eventos</Text>
            </Column>
          </Row>
        </Section>

        {/* Success Message */}
        <Section style={successSection}>
          <div style={{...successIcon, color: '#28a745'}}>✓</div>
          <Heading style={h2}>Inscrição Confirmada!</Heading>
          <Text style={successText}>
            Olá {participantName}, a sua inscrição foi processada com sucesso.
          </Text>
        </Section>

        {/* Event Details */}
        <Section style={eventSection}>
          <Heading style={h3}>Detalhes do Evento</Heading>
          <Row style={eventRow}>
            <Column>
              <Text style={eventTitle}>{eventTitle}</Text>
              <Text style={eventDetail}>
                <strong>Data:</strong> {eventDate}
              </Text>
              <Text style={eventDetail}>
                <strong>Local:</strong> {eventLocation}
              </Text>
              <Text style={eventDetail}>
                <strong>Morada:</strong> {eventAddress}
              </Text>
            </Column>
          </Row>
        </Section>

        {/* Registration Details */}
        <Section style={registrationSection}>
          <Heading style={h3}>Detalhes da Inscrição</Heading>
          <Row style={detailRow}>
            <Column style={detailColumn}>
              <Text style={detailLabel}>Número de Inscrição:</Text>
              <Text style={detailValue}>{registrationNumber}</Text>
            </Column>
            <Column style={detailColumn}>
              <Text style={detailLabel}>Tipo de Bilhete:</Text>
              <Text style={detailValue}>{ticketType}</Text>
            </Column>
          </Row>
          <Row style={detailRow}>
            <Column style={detailColumn}>
              <Text style={detailLabel}>Valor Pago:</Text>
              <Text style={detailValue}>€{amountPaid.toFixed(2)}</Text>
            </Column>
            <Column style={detailColumn}>
              <Text style={detailLabel}>Estado do Pagamento:</Text>
              <Text style={paymentStatus === 'paid' ? paidStatus : pendingStatus}>
                {paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
              </Text>
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

        {/* QR Code Section */}
        {qrCodeUrl && (
          <Section style={qrSection}>
            <Heading style={h3}>Código QR para Check-in</Heading>
            <Text style={qrText}>
              Use este código QR para fazer o check-in no evento:
            </Text>
            <Img src={qrCodeUrl} alt="QR Code para Check-in" style={qrImage} />
            <Text style={qrNote}>
              Guarde este email ou descarregue o bilhete para apresentar na entrada.
            </Text>
          </Section>
        )}

        {/* Instructions */}
        <Section style={instructionsSection}>
          <Heading style={h3}>Instruções Importantes</Heading>
          <Text style={instruction}>
            • Chegue ao local com 30 minutos de antecedência
          </Text>
          <Text style={instruction}>
            • Traga um documento de identificação válido
          </Text>
          <Text style={instruction}>
            • Apresente este email ou o bilhete PDF na entrada
          </Text>
          <Text style={instruction}>
            • Em caso de dúvidas, contacte a organização do evento
          </Text>
        </Section>

        <Hr style={hr} />

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            Este email foi enviado automaticamente pela plataforma INSCRIX.
            <br />
            Se não solicitou esta inscrição, por favor ignore este email.
          </Text>
          <Text style={footerText}>
            © 2024 INSCRIX - Plataforma de Gestão de Eventos
          </Text>
        </Section>

      </Container>
    </Body>
  </Html>
)

export default RegistrationConfirmationEmail

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
  backgroundColor: '#007bff',
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

const successSection = {
  padding: '30px',
  textAlign: 'center' as const,
}

const successIcon = {
  fontSize: '48px',
  margin: '0',
}

const h2 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '20px 0 10px 0',
}

const successText = {
  color: '#666666',
  fontSize: '16px',
  margin: '0',
}

const eventSection = {
  backgroundColor: '#f8f9fa',
  padding: '20px 30px',
  margin: '20px 0',
}

const h3 = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 15px 0',
}

const eventRow = {
  margin: '10px 0',
}

const eventTitle = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
}

const eventDetail = {
  color: '#666666',
  fontSize: '14px',
  margin: '5px 0',
}

const registrationSection = {
  padding: '20px 30px',
}

const detailRow = {
  margin: '10px 0',
}

const detailColumn = {
  width: '50%',
  paddingRight: '10px',
}

const detailLabel = {
  color: '#666666',
  fontSize: '12px',
  fontWeight: 'bold',
  margin: '0 0 5px 0',
  textTransform: 'uppercase' as const,
}

const detailValue = {
  color: '#1a1a1a',
  fontSize: '14px',
  margin: '0',
}

const paidStatus = {
  color: '#28a745',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
}

const pendingStatus = {
  color: '#ffc107',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
}

const buttonSection = {
  padding: '20px 30px',
  textAlign: 'center' as const,
}

const primaryButton = {
  backgroundColor: '#007bff',
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

const qrSection = {
  padding: '20px 30px',
  textAlign: 'center' as const,
  backgroundColor: '#f8f9fa',
}

const qrText = {
  color: '#666666',
  fontSize: '14px',
  margin: '10px 0',
}

const qrImage = {
  width: '150px',
  height: '150px',
  margin: '20px auto',
}

const qrNote = {
  color: '#666666',
  fontSize: '12px',
  fontStyle: 'italic',
  margin: '10px 0',
}

const instructionsSection = {
  padding: '20px 30px',
}

const instruction = {
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