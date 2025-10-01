import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, TrendingUp, CheckCircle, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

const OrganizerSection = () => {
  const { t } = useTranslation();
  const features = [
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: t("organizerSection.features.0.title"),
      description: t("organizerSection.features.0.description"),
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: t("organizerSection.features.1.title"),
      description: t("organizerSection.features.1.description"),
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: t("organizerSection.features.2.title"),
      description: t("organizerSection.features.2.description"),
    },
    {
      icon: <Smartphone className="h-8 w-8 text-primary" />,
      title: t("organizerSection.features.3.title"),
      description: t("organizerSection.features.3.description"),
    },
  ];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            {t("organizerSection.title")}
            <span className="text-primary block">{t("organizerSection.subtitle")}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          {t("organizerSection.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
            <Link to="/create-event">
             {t("organizerSection.ctaButton")}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default OrganizerSection;
