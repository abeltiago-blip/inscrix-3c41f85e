import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail } from "lucide-react";
import Footer from "@/components/Footer";

export default function PasswordReset() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password-confirm`,
      });

      if (error) throw error;

      setSent(true);
      toast({
        title: t("passwordReset.emailSentTitle"),
        description: t("passwordReset.emailSentDesc"),
      });
    } catch (error: any) {
      toast({
        title: t("common2.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-8 px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">
                {t("passwordReset.title")}
              </CardTitle>
              <CardDescription>
                {t("passwordReset.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sent ? (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <Mail className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{t("passwordReset.emailSentTitle")}</h3>
                  <p className="text-muted-foreground">
                    {t("passwordReset.emailSentMessage")}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSent(false);
                      setEmail("");
                    }}
                  >
                    {t("passwordReset.resendButton")}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("common.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("passwordReset.emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? t("passwordReset.sending") : t("passwordReset.sendInstructions")}
                  </Button>
                </form>
              )}

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {t("passwordReset.backToLogin")}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
