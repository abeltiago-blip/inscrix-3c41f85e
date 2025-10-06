import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, UserCheck, Database, AlertTriangle, Mail } from "lucide-react";

const PoliticaPrivacidade = () => {
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
            {t("privacy.header.title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t("privacy.header.subtitle")}
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Badge variant="secondary">{t("privacy.header.update_badge")}</Badge>
            <Badge variant="outline">{t("privacy.header.compliance_badge")}</Badge>
          </div>
        </div>

        {/* GDPR Notice */}
        <Card className="mb-8 border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Shield className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="font-semibold text-green-900 mb-2">{t("privacy.header.gdpr_title")}</h3>
                <p className="text-sm text-green-800">
                 {t("privacy.header.gdpr_desc")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* 1. Responsável pelo Tratamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                {t("privacy.section1.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("privacy.section1.company_name")}</h4>
                <ul className="space-y-1">
                  <li><strong>{t("privacy.section1.address.title")}:</strong>{t("privacy.section1.address.desc")}</li>
                  <li><strong>{t("privacy.section1.email.title")}</strong> privacidade@inscrix.pt</li>
                  <li><strong>{t("privacy.section1.phone.title")}</strong> +351 220 123 456</li>
                  <li><strong>{t("privacy.section1.nif.title")}</strong> 123456789</li>
                </ul>
              </div>
              <p>
                {t("privacy.section1.dpo_contact")}
              </p>
            </CardContent>
          </Card>
          
          {/* 2. Dados Recolhidos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                {t("privacy.section2.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("privacy.section2.item2_1_title")}</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>{t("privacy.section2.item2_1_list.item1")}</li>
                  <li>{t("privacy.section2.item2_1_list.item2")}</li>
                  <li>{t("privacy.section2.item2_1_list.item3")}</li>
                  <li>{t("privacy.section2.item2_1_list.item4")}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("privacy.section2.item2_2_title")}</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>{t("privacy.section2.item2_2_list.item1")}</li>
                  <li>{t("privacy.section2.item2_2_list.item2")}</li>
                  <li>{t("privacy.section2.item2_2_list.item3")}</li>
                  <li>{t("privacy.section2.item2_2_list.item4")}</li>
                  <li>{t("privacy.section2.item2_2_list.item5")}</li>
                  <li>{t("privacy.section2.item2_2_list.item6")}</li>
                  <li>{t("privacy.section2.item2_2_list.item7")}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("privacy.section2.item2_3_title")}</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>{t("privacy.section2.item2_3_list.item1")}</li>
                  <li>{t("privacy.section2.item2_3_list.item2")}</li>
                  <li>{t("privacy.section2.item2_3_list.item3")}</li>
                  <li>{t("privacy.section2.item2_3_list.item4")}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("privacy.section2.item2_4_title")}</h4>
                <p>
                  <strong>{t("privacy.section2.item2_4_desc.descline1")}</strong> {t("privacy.section2.item2_4_desc.descline2")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 3. Finalidades do Tratamento */}
          <Card>
            <CardHeader>
              <CardTitle>{t("privacy.section3.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("privacy.section3.item3_1_title")}</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>{t("privacy.section3.item3_1_list.item1")}</li>
                  <li>{t("privacy.section3.item3_1_list.item2")}</li>
                  <li>{t("privacy.section3.item3_1_list.item3")}</li>
                  <li>{t("privacy.section3.item3_1_list.item4")}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("privacy.section3.item3_2_title")}</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>{t("privacy.section3.item3_2_list.item1")}</li>
                  <li>{t("privacy.section3.item3_2_list.item2")}</li>
                  <li>{t("privacy.section3.item3_2_list.item3")}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("privacy.section3.item3_3_title")}</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>{t("privacy.section3.item3_3_list.item1")}</li>
                  <li>{t("privacy.section3.item3_3_list.item2")}</li>
                  <li>{t("privacy.section3.item3_3_list.item3")}</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 4. Base Legal */}
          <Card>
            <CardHeader>
              <CardTitle>{t("privacy.section4.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li><strong>{t("privacy.section4.list.item1_key")}</strong> {t("privacy.section4.list.item1_value")}</li>
                <li><strong>{t("privacy.section4.list.item2_key")}</strong> {t("privacy.section4.list.item2_value")}</li>
                <li><strong>{t("privacy.section4.list.item3_key")}</strong> {t("privacy.section4.list.item3_value")}</li>
                <li><strong>{t("privacy.section4.list.item4_key")}</strong> {t("privacy.section4.list.item4_value")}</li>
              </ul>
            </CardContent>
          </Card>

          {/* 5. Partilha de Dados */}
          <Card>
            <CardHeader>
              <CardTitle>{t("privacy.section5.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("privacy.section5.item5_1_title")}</h4>
                <p>
                  {t("privacy.section5.item5_1_desc")}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("privacy.section5.item5_2_title")}</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>{t("privacy.section5.item5_2_list.item1")}</li>
                  <li>{t("privacy.section5.item5_2_list.item2")}</li>
                  <li>{t("privacy.section5.item5_2_list.item3")}</li>
                  <li>{t("privacy.section5.item5_2_list.item4")}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("privacy.section5.item5_3_title")}</h4>
                <p>
                  {t("privacy.section5.item5_3_desc")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 6. Retenção de Dados */}
          <Card>
            <CardHeader>
              <CardTitle>{t("privacy.section6.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li><strong>{t("privacy.section6.list.item1_key")}</strong> {t("privacy.section6.list.item1_value")}</li>
                <li><strong>{t("privacy.section6.list.item2_key")}</strong> {t("privacy.section6.list.item2_value")}</li>
                <li><strong>{t("privacy.section6.list.item3_key")}</strong> {t("privacy.section6.list.item3_value")}</li>
                <li><strong>{t("privacy.section6.list.item4_key")}</strong> {t("privacy.section6.list.item4_value")}</li>
              </ul>
              <p>
                {t("privacy.section6.after_list_desc")}
              </p>
            </CardContent>
          </Card>

          {/* 7. Seus Direitos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                {t("privacy.section7.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{t("privacy.section7.right1_title")}</h4>
                  <p>{t("privacy.section7.right1_desc")}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{t("privacy.section7.right2_title")}</h4>
                  <p>{t("privacy.section7.right2_desc")}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{t("privacy.section7.right3_title")}</h4>
                  <p>{t("privacy.section7.right3_desc")}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{t("privacy.section7.right4_title")}</h4>
                  <p>{t("privacy.section7.right4_desc")}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{t("privacy.section7.right5_title")}</h4>
                  <p>{t("privacy.section7.right5_desc")}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{t("privacy.section7.right6_title")}</h4>
                  <p>{t("privacy.section7.right6_desc")}</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="font-semibold mb-2">{t("privacy.section7.contact_title")}</p>
                <p>{t("privacy.section7.contact_desc")}</p>
                <p className="text-xs mt-2">{t("privacy.section7.contact_footnote")}</p>
              </div>
            </CardContent>
          </Card>

          {/* 8. Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                {t("privacy.section8.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>{t("privacy.section8.intro_desc")}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <ul className="space-y-1 list-disc list-inside">
                  <li>{t("privacy.section8.list1.item1")}</li>
                  <li>{t("privacy.section8.list1.item2")}</li>
                  <li>{t("privacy.section8.list1.item3")}</li>
                  <li>{t("privacy.section8.list1.item4")}</li>
                </ul>
                <ul className="space-y-1 list-disc list-inside">
                  <li>{t("privacy.section8.list2.item1")}</li>
                  <li>{t("privacy.section8.list2.item2")}</li>
                  <li>{t("privacy.section8.list2.item3")}</li>
                  <li>{t("privacy.section8.list2.item4")}</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 9. Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>{t("privacy.section9.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("privacy.section9.subtitle")}</h4>
                <ul className="space-y-2">
                  <li><strong>{t("privacy.section9.list.item1_key")}</strong> {t("privacy.section9.list.item1_value")}</li>
                  <li><strong>{t("privacy.section9.list.item2_key")}</strong> {t("privacy.section9.list.item2_value")}</li>
                  <li><strong>{t("privacy.section9.list.item3_key")}</strong> {t("privacy.section9.list.item3_value")}</li>
                  <li><strong>{t("privacy.section9.list.item4_key")}</strong> {t("privacy.section9.list.item4_value")}</li>
                </ul>
              </div>
              <p>
                {t("privacy.section9.footer_desc")}
              </p>
            </CardContent>
          </Card>

          {/* 10. Transferências Internacionais */}
          <Card>
            <CardHeader>
              <CardTitle>{t("privacy.section10.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                {t("privacy.section10.intro_desc")}
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>{t("privacy.section10.list.item1")}</li>
                <li>{t("privacy.section10.list.item2")}</li>
                <li>{t("privacy.section10.list.item3")}</li>
              </ul>
            </CardContent>
          </Card>

          {/* 11. Alterações à Política */}
          <Card>
            <CardHeader>
              <CardTitle>{t("privacy.section11.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                {t("privacy.section11.intro_desc")}
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>{t("privacy.section11.list.item1")}</li>
                <li>{t("privacy.section11.list.item2")}</li>
                <li>{t("privacy.section11.list.item3")}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold mb-2">{t("privacy.contact_footer.title")}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("privacy.contact_footer.desc")}
                </p>
                <div className="flex justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      <Mail className="h-3 w-3 mr-1" />
                      privacidade@inscrix.pt
                    </Badge>
                    <Badge variant="secondary">
                      <Mail className="h-3 w-3 mr-1" />
                      dpo@inscrix.pt
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  {t("privacy.contact_footer.footnote")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PoliticaPrivacidade;
