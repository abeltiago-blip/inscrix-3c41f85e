import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, FileText, Shield, AlertTriangle, Mail, Phone } from "lucide-react";

const TermosCondicoes = () => {
  const { t } = useTranslation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t("terms.title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
           {t("terms.description")}
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Badge variant="secondary">{t("terms.last_update")}</Badge>
            <Badge variant="outline">{t("terms.version")}</Badge>
          </div>
        </div>

        {/* Legal Notice */}
        <Card className="mb-8 border-orange-200 bg-orange-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-orange-500 mt-1" />
              <div>
                <h3 className="font-semibold text-orange-900 mb-2">{t("terms.legal_notice.title")}</h3>
                <p className="text-sm text-orange-800">
                  {t("terms.legal_notice.content")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* 1. Definições */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {t("terms.sections.definitions.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">{t("terms.sections.definitions.description")}</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><strong>{t("terms.sections.definitions.content.Inscrix.title")}</strong> {t("terms.sections.definitions.content.Inscrix.desc")}</li>
                  <li><strong>{t("terms.sections.definitions.content.Utilizador.title")}</strong> {t("terms.sections.definitions.content.Utilizador.desc")}</li>
                  <li><strong>{t("terms.sections.definitions.content.Organizador.title")}</strong> {t("terms.sections.definitions.content.Organizador.desc")}</li>
                  <li><strong>{t("terms.sections.definitions.content.Participante.title")}</strong> {t("terms.sections.definitions.content.Participante.desc")}</li>
                  <li><strong>{t("terms.sections.definitions.content.Evento.title")}</strong> {t("terms.sections.definitions.content.Evento.desc")}</li>
                  <li><strong>{t("terms.sections.definitions.content.Serviços.title")}</strong> {t("terms.sections.definitions.content.Servicios.desc")}</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 2. Aceitação dos Termos */}
          <Card>
            <CardHeader>
              <CardTitle>{t("terms.sections.acceptance.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                {t("terms.sections.acceptance.content.para1")}
              </p>
              <p>
                {t("terms.sections.acceptance.content.para2")}
              </p>
              <p>
                {t("terms.sections.acceptance.content.para3")}
              </p>
            </CardContent>
          </Card>

          {/* 3. Descrição dos Serviços */}
          <Card>
            <CardHeader>
              <CardTitle>{t("terms.sections.services.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <h4 className="font-semibold text-foreground">{t("terms.sections.services.subtitle")}</h4>
              <ul className="space-y-2 list-disc list-inside">
                <li>{t("terms.sections.services.content.services1")}</li>
                <li>{t("terms.sections.services.content.services2")}</li>
                <li>{t("terms.sections.services.content.services3")}</li>
                <li>{t("terms.sections.services.content.services4")}</li>
                <li>{t("terms.sections.services.content.services5")}</li>
                <li>{t("terms.sections.services.content.services6")}</li>
                <li>{t("terms.sections.services.content.services7")}</li>
              </ul>
              <p>
                {t("terms.sections.services.desc")}
              </p>
            </CardContent>
          </Card>

          {/* 4. Registo e Conta de Utilizador */}
          <Card>
            <CardHeader>
              <CardTitle>{t("terms.sections.user_account.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.sections.user_account.para1")}</h4>
                <p>
                  {t("terms.sections.user_account.content.item1")}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">4.2 {t("terms.sections.user_account.content.item2_title")}</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>{t("terms.sections.user_account.content.item2_list.bullet1")}</li>
                  <li>{t("terms.sections.user_account.content.item2_list.bullet2")}</li>
                  <li>{t("terms.sections.user_account.content.item2_list.bullet3")}</li>
                  <li>{t("terms.sections.user_account.content.item2_list.bullet4")}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.sections.user_account.para2")}</h4>
                <p>
                  {t("terms.sections.user_account.content.item3")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 5. Obrigações dos Organizadores */}
          <Card>
            <CardHeader>
              <CardTitle>{t("terms.sections.organizers.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <h4 className="font-semibold text-foreground">{t("terms.sections.organizers.intro")}</h4>
              <ul className="space-y-2 list-disc list-inside">
                <li>{t("terms.sections.organizers.list1")}</li>
                <li>{t("terms.sections.organizers.list2")}</li>
                <li>{t("terms.sections.organizers.list3")}</li>
                <li>{t("terms.sections.organizers.list4")}</li>
                <li>{t("terms.sections.organizers.list5")}</li>
                <li>{t("terms.sections.organizers.list6")}</li>
                <li>{t("terms.sections.organizers.list7")}</li>
                <li>{t("terms.sections.organizers.list8")}</li>
              </ul>
            </CardContent>
          </Card>

          {/* 6. Direitos e Obrigações dos Participantes */}
          <Card>
            <CardHeader>
              <CardTitle>{t("terms.sections.participants.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.sections.participants.rightsTitle")}</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>{t("terms.sections.participants.rights.list1")}</li>
                  <li>{t("terms.sections.participants.rights.list2")}</li>
                  <li>{t("terms.sections.participants.rights.list3")}</li>
                  <li>{t("terms.sections.participants.rights.list4")}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.sections.participants.obligationsTitle")}</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>{t("terms.sections.participants.obligations.list1")}</li>
                  <li>{t("terms.sections.participants.obligations.list2")}</li>
                  <li>{t("terms.sections.participants.obligations.list3")}</li>
                  <li>{t("terms.sections.participants.obligations.list4")}</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 7. Pagamentos e Reembolsos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                {t("terms.sections.payments.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.sections.payments.paymentProcessingTitle")}</h4>
                <p>
                  {t("terms.sections.payments.paymentProcessingText")}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.sections.payments.serviceFeesTitle")}</h4>
                <p>
                  {t("terms.sections.payments.paymentProcessingText")}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.sections.payments.refundsTitle")}</h4>
                <p>
                  {t("terms.sections.payments.refundsText")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 8. Propriedade Intelectual */}
          <Card>
            <CardHeader>
              <CardTitle>{t("terms.sections.intellectual_property.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                {t("terms.sections.intellectual_property.text1")}
              </p>
              <p>
                {t("terms.sections.intellectual_property.text2")}
              </p>
              <p>
                {t("terms.sections.intellectual_property.text3")}
              </p>
            </CardContent>
          </Card>

          {/* 9. Limitação de Responsabilidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {t("terms.sections.liability.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                {t("terms.sections.liability.text1")}
              </p>
              <p>
                {t("terms.sections.liability.text2")}
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>{t("terms.sections.liability.list1")}</li>
                <li>{t("terms.sections.liability.list2")}</li>
                <li>{t("terms.sections.liability.list3")}</li>
                <li>{t("terms.sections.liability.list4")}</li>
                <li>{t("terms.sections.liability.list5")}</li>
              </ul>
            </CardContent>
          </Card>

          {/* 10. Lei Aplicável */}
          <Card>
            <CardHeader>
              <CardTitle>{t("terms.sections.law.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                {t("terms.sections.law.content.text1")}
              </p>
              <p>
                {t("terms.sections.law.content.text2")}
              </p>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold mb-2">{t("terms.contact.title")}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("terms.contact.description")}
                </p>
                <div className="flex justify-center gap-4 text-sm">
                  <Badge variant="secondary">
                    <Mail className="h-3 w-3 mr-1" />
                    {t("terms.contact.email")}
                  </Badge>
                  <Badge variant="secondary">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{t("terms.contact.phone")}</span>
                    </div>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermosCondicoes;
