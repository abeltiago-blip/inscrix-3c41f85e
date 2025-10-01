import { useState } from "react"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Phone } from "lucide-react";
import logoInscrix from "@/assets/logo-inscrix.png";
import inscrixIcons from "@/assets/inscrix-icons.png";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';


const Footer = () => {
  const { t } = useTranslation();

  // Newsletter form state
  const [newsletterName, setNewsletterName] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterTerms, setNewsletterTerms] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactTerms, setContactTerms] = useState(false);

  // Newsletter submit handler
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("✅ Newsletter form submitted", {
      name: newsletterName,
      email: newsletterEmail,
      termsAccepted: newsletterTerms
    });
    alert("📩 Thank you for subscribing!");
    setNewsletterName("");
    setNewsletterEmail("");
    setNewsletterTerms(false);
  };

  // Contact submit handler
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("✅ Contact form submitted", {
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
      message: contactMessage,
      termsAccepted: contactTerms
    });
    alert("📨 Your message has been sent!");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setContactMessage("");
    setContactTerms(false);
  };

  return (
    <>
      {/* Newsletter & Contact Section */}
      <section 
        className="py-16 px-4 text-foreground relative overflow-hidden"
      >
        {/* Background overlay with icons pattern */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${inscrixIcons})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        ></div>
        
        <div className="container mx-auto max-w-6xl relative z-10 text-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch justify-center max-w-4xl mx-auto">
            
            {/* Left Column - Newsletter */}
            <div className="space-y-8 text-center flex flex-col h-full">
              <div className="bg-background/95 backdrop-blur-sm rounded-lg border-2 border-orange-500 p-6 shadow-lg flex-1 flex flex-col justify-between">
                <div className="mb-6">
                  <h2 className="text-4xl font-bold mb-4">{t("newsletter.title")}</h2>
                  <p className="text-lg opacity-90 leading-relaxed mb-6">
                    {t("newsletter.description")}
                  </p>
                  <h3 className="flex items-center justify-center gap-0 text-xl font-semibold text-foreground mb-2">
                    <Mail className="h-5 w-5" />
                    {t("newsletter.subscribeTitle")}
                  </h3>
                </div>
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <Input
                    placeholder={t("newsletter.namePlaceholder")}
                    className="h-12"
                    value={newsletterName}
                    onChange={(e) => setNewsletterName(e.target.value)}
                  />
                  <Input
                    type="email"
                    placeholder={t("newsletter.emailPlaceholder")}
                    className="h-12"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                  />
                  <div className="flex items-start space-x-2 text-left">
                    <Checkbox
                      id="newsletter-terms"
                      className="mt-1"
                      checked={newsletterTerms}
                      onCheckedChange={(checked) =>
                        setNewsletterTerms(checked as boolean)
                      }
                    />
                    <label htmlFor="newsletter-terms" className="text-xs text-muted-foreground leading-relaxed">
                      {t("newsletter.termsLabel")}{" "}
                      <Link to="/termosecondicoesinscrix" className="text-primary hover:underline">
                        {t("newsletter.termsLink")}
                      </Link>{" "}
                      e a{" "}
                      <Link to="/politica-privacidade" className="text-primary hover:underline">
                        {t("newsletter.privacyLink")}
                      </Link>
                      . {t("newsletter.contactAgreement")}
                    </label>
                  </div>
                  <Button type="submit" className="w-full h-12 text-base font-semibold">
                    {t("newsletter.subscribeButton")}
                  </Button>
                </form>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="lg:mt-0 flex flex-col h-full">
              <Card className="bg-background/95 backdrop-blur-sm border-2 border-orange-500 text-foreground shadow-lg flex-1 flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Phone className="h-5 w-5" />
                    {t("contactCard.title")}
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    {t("contactCard.description")}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                  <form onSubmit={handleSend} className="space-y-4">
                    <Input
                      placeholder={t("contactCard.namePlaceholder")}
                      className="h-12"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                    />
                    <Input
                      type="email"
                      placeholder={t("contactCard.emailPlaceholder")}
                      className="h-12"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                    <Input
                      type="tel"
                      placeholder={t("contactCard.phonePlaceholder")}
                      className="h-12"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                    <textarea 
                      className="w-full p-4 border border-input rounded-md resize-none h-24 text-base" 
                      placeholder={t("contactCard.messagePlaceholder")}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                    />
                    <div className="flex items-start space-x-2 text-left">
                      <Checkbox
                        id="contact-terms"
                        className="mt-1"
                        checked={contactTerms}
                        onCheckedChange={(checked) =>
                          setContactTerms(checked as boolean)
                        }
                      />
                      <label htmlFor="contact-terms" className="text-xs text-muted-foreground leading-relaxed">
                        {t("contactCard.termsLabel")}{" "}
                        <Link to="/termosecondicoesinscrix" className="text-primary hover:underline">
                          {t("contactCard.termsLink")}
                        </Link>{" "}
                        e a{" "}
                        <Link to="/politica-privacidade" className="text-primary hover:underline">
                          {t("contactCard.privacyLink")}
                        </Link>
                        . {t("contactCard.dataAgreement")}
                      </label>
                    </div>
                    <Button type="submit" className="w-full h-12 text-base font-semibold">
                      {t("contactCard.submitButton")}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
<footer className="bg-background border-t py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <img 
                src={logoInscrix} 
                alt="INSCRIX – Gestão e Organização de Eventos" 
                className="h-8 w-auto mb-4"
              />
              <p className="text-muted-foreground mb-4">
                {t("footerDescription.text")}              
              </p>
              <div className="flex space-x-4">
                {/* Activity icons from the icons asset */}
                <div className="flex items-center space-x-2">
                  <img 
                    src={inscrixIcons} 
                    alt="INSCRIX Activity Icons" 
                    className="h-16 w-auto opacity-60 hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">{t("footer2.learnMore")}</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/sobreainscrix" className="hover:text-primary">{t("footer2.aboutUs")}</Link></li>
                <li><Link to="/faq" className="hover:text-primary">{t("footer2.faqs")}</Link></li>
                <li><Link to="/contactos" className="hover:text-primary">{t("footer2.contact")}</Link></li>
                <li><Link to="/termosecondicoesinscrix" className="hover:text-primary">{t("footer2.termsAndConditions")}</Link></li>
                <li><Link to="/politica-privacidade" className="hover:text-primary">{t("footer2.privacyPolicy")}</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">{t("contactInfo.getInTouch")}</h3>
              <div className="space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:hello@inscrix.pt" className="hover:text-primary">
                    {t("contactInfo.email")}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a href="tel:+351xxxxxxxxx" className="hover:text-primary">
                    {t("contactInfo.phone")}
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>{t("copyright.text")}</p>
            <p className="mt-2">
              {t("copyright.madeByPrefix")}{" "}
              <a 
                href="https://www.bowie.pt/pt/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                {t("copyright.madeByName")}
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
