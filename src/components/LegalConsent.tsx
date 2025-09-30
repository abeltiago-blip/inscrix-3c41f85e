import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ExternalLink } from "lucide-react";

interface LegalConsentProps {
  onConsentChange: (consents: {
    acceptedTerms: boolean;
    acceptedPrivacy: boolean;
    acceptedMarketing: boolean;
  }) => void;
  disabled?: boolean;
}

export function LegalConsent({ onConsentChange, disabled = false }: LegalConsentProps) {
  const [consents, setConsents] = useState({
    acceptedTerms: false,
    acceptedPrivacy: false,
    acceptedMarketing: false,
  });

  const handleConsentChange = (type: keyof typeof consents, value: boolean) => {
    const newConsents = { ...consents, [type]: value };
    setConsents(newConsents);
    onConsentChange(newConsents);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <h4 className="font-medium text-sm">Consentimentos Legais</h4>
      
      {/* Terms and Conditions */}
      <div className="flex items-start space-x-3">
        <Checkbox
          id="acceptedTerms"
          checked={consents.acceptedTerms}
          onCheckedChange={(checked) => 
            handleConsentChange('acceptedTerms', checked as boolean)
          }
          disabled={disabled}
          className="mt-0.5"
        />
        <div className="space-y-1 flex-1">
          <Label 
            htmlFor="acceptedTerms" 
            className="text-sm leading-relaxed cursor-pointer"
          >
            Aceito os{' '}
            <a 
              href="/termos-condicoes" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80 inline-flex items-center gap-1"
            >
              Termos e Condições
              <ExternalLink className="h-3 w-3" />
            </a>
            {' '}* (obrigatório)
          </Label>
        </div>
      </div>

      {/* Privacy Policy */}
      <div className="flex items-start space-x-3">
        <Checkbox
          id="acceptedPrivacy"
          checked={consents.acceptedPrivacy}
          onCheckedChange={(checked) => 
            handleConsentChange('acceptedPrivacy', checked as boolean)
          }
          disabled={disabled}
          className="mt-0.5"
        />
        <div className="space-y-1 flex-1">
          <Label 
            htmlFor="acceptedPrivacy" 
            className="text-sm leading-relaxed cursor-pointer"
          >
            Aceito a{' '}
            <a 
              href="/politica-privacidade" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80 inline-flex items-center gap-1"
            >
              Política de Privacidade
              <ExternalLink className="h-3 w-3" />
            </a>
            {' '}* (obrigatório)
          </Label>
        </div>
      </div>

      {/* Marketing Communications */}
      <div className="flex items-start space-x-3">
        <Checkbox
          id="acceptedMarketing"
          checked={consents.acceptedMarketing}
          onCheckedChange={(checked) => 
            handleConsentChange('acceptedMarketing', checked as boolean)
          }
          disabled={disabled}
          className="mt-0.5"
        />
        <div className="space-y-1 flex-1">
          <Label 
            htmlFor="acceptedMarketing" 
            className="text-sm leading-relaxed cursor-pointer"
          >
            Aceito receber comunicações de marketing, newsletters e informações sobre eventos (opcional)
          </Label>
          <p className="text-xs text-muted-foreground">
            Pode alterar esta preferência a qualquer momento nas definições da sua conta.
          </p>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        <p>
          * Os campos marcados são obrigatórios para criar a sua conta. 
          Os seus dados pessoais serão tratados de acordo com o RGPD.
        </p>
      </div>
    </div>
  );
}