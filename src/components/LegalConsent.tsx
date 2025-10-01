import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      <h4 className="font-medium text-sm">{t("legalConsent.title")}</h4>
      
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
            {t("legalConsent.termsLabel").split(t("legalConsent.termsLinkText"))[0]}
            <a 
              href="/termos-condicoes" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80 inline-flex items-center gap-1"
            >
              {t("legalConsent.termsLinkText")}
              <ExternalLink className="h-3 w-3" />
            </a>
            {t("legalConsent.termsLabel").split(t("legalConsent.termsLinkText"))[1]}
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
            {t("legalConsent.privacyLabel").split(t("legalConsent.privacyLinkText"))[0]}
            <a 
              href="/politica-privacidade" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80 inline-flex items-center gap-1"
            >
              {t("legalConsent.privacyLinkText")}
              <ExternalLink className="h-3 w-3" />
            </a>
            {t("legalConsent.privacyLabel").split(t("legalConsent.privacyLinkText"))[1]}
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
            {t("legalConsent.marketingLabel")}
          </Label>
          <p className="text-xs text-muted-foreground">
            {t("legalConsent.marketingDesc")}
          </p>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        <p>
         {t("legalConsent.requiredNote")}
        </p>
      </div>
    </div>
  );
}
