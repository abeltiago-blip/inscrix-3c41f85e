import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { validateDocumentByCountry, formatDocumentInput, getDocumentTypeInfo } from "@/utils/documentValidation";
import { LegalConsent } from "@/components/LegalConsent";

interface TeamFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: string;
  city: string;
  citizenCard: string; // Cartão de Cidadão - 8 dígitos obrigatório
  gender: string;
  nationality: string;
  teamName: string;
  teamDescription: string;
  affiliationCode: string;
}

export function TeamRegisterForm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<TeamFormData>({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    city: "",
    citizenCard: "",
    gender: "",
    nationality: "Portugal",
    teamName: "",
    teamDescription: "",
    affiliationCode: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [legalConsents, setLegalConsents] = useState({
    acceptedTerms: false,
    acceptedPrivacy: false,
    acceptedMarketing: false,
  });
  const [validations, setValidations] = useState({
    username: { isValid: false, isChecking: false, message: "" },
    email: { isValid: false, isChecking: false, message: "" },
    citizenCard: { isValid: false, message: "" },
    password: { isValid: false, message: "" },
    confirmPassword: { isValid: false, message: "" },
    teamName: { isValid: false, isChecking: false, message: "" }
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp } = useAuth();

  // Validation functions (similar to ParticipantRegisterForm)
  const validateUsername = async (username: string) => {
    if (!username) {
      setValidations(prev => ({
        ...prev,
        username: { isValid: false, isChecking: false, message: "" }
      }));
      return;
    }

    if (username.length < 3 || username.length > 15) {
      setValidations(prev => ({
        ...prev,
        username: { isValid: false, isChecking: false, message: "Nome de utilizador deve ter entre 3 a 15 caracteres" }
      }));
      return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      setValidations(prev => ({
        ...prev,
        username: { isValid: false, isChecking: false, message: "Apenas letras e números são permitidos" }
      }));
      return;
    }

    setValidations(prev => ({
      ...prev,
      username: { isValid: false, isChecking: true, message: t("orgReg.usernameChecking") }
    }));

    setTimeout(() => {
      const isAvailable = !["admin", "test", "inscrix"].includes(username.toLowerCase());
      setValidations(prev => ({
        ...prev,
        username: { 
          isValid: isAvailable, 
          isChecking: false, 
          message: isAvailable ? t("orgReg.usernameAvailable") : t("orgReg.usernameUnavailable") 
        }
      }));
    }, 1000);
  };

  const validateEmail = async (email: string) => {
    if (!email) {
      setValidations(prev => ({
        ...prev,
        email: { isValid: false, isChecking: false, message: "" }
      }));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidations(prev => ({
        ...prev,
        email: { isValid: false, isChecking: false, message: "Por favor, insira um email válido" }
      }));
      return;
    }

    setValidations(prev => ({
      ...prev,
      email: { isValid: false, isChecking: true, message: "A verificar se email já está cadastrado..." }
    }));

    setTimeout(() => {
      const isAvailable = !["admin@inscrix.pt", "test@test.com"].includes(email.toLowerCase());
      setValidations(prev => ({
        ...prev,
        email: { 
          isValid: isAvailable, 
          isChecking: false, 
          message: isAvailable ? "Email disponível" : "Email já está cadastrado. Use outro email." 
        }
      }));
    }, 1000);
  };

  const validateTeamName = async (teamName: string) => {
    if (!teamName) {
      setValidations(prev => ({
        ...prev,
        teamName: { isValid: false, isChecking: false, message: "" }
      }));
      return;
    }

    if (teamName.length < 3 || teamName.length > 50) {
      setValidations(prev => ({
        ...prev,
        teamName: { isValid: false, isChecking: false, message: "Nome da equipa deve ter entre 3 a 50 caracteres" }
      }));
      return;
    }

    setValidations(prev => ({
      ...prev,
      teamName: { isValid: false, isChecking: true, message: "A verificar disponibilidade..." }
    }));

    setTimeout(() => {
      const isAvailable = !["FC Porto", "Benfica", "Sporting"].includes(teamName);
      setValidations(prev => ({
        ...prev,
        teamName: { 
          isValid: isAvailable, 
          isChecking: false, 
          message: isAvailable ? "Nome da equipa disponível" : "Já existe uma equipa com esse nome. Escolha um nome diferente." 
        }
      }));
    }, 1000);
  };

  const validateCitizenCard = (citizenCard: string, nationality: string) => {
    if (!citizenCard) {
      setValidations(prev => ({
        ...prev,
        citizenCard: { isValid: false, message: t("authParticipant.citizenCardRequired")}
      }));
      return;
    }
    
    // Para Portugal, validar apenas os 8 primeiros dígitos
    if (nationality === "Portugal") {
      const cleaned = citizenCard.replace(/\D/g, "");
      if (cleaned.length !== 8) {
        setValidations(prev => ({
          ...prev,
          citizenCard: { isValid: false, message: t("authParticipant.citizenCardInvalid") }
        }));
        return;
      }
      
      setValidations(prev => ({
        ...prev,
        citizenCard: { isValid: true, message: t("authParticipant.citizenCardValid")}
      }));
      return;
    }
    
    // Para outras nacionalidades, usar a validação original
    const validation = validateDocumentByCountry(citizenCard, nationality);
    setValidations(prev => ({
      ...prev,
      citizenCard: validation
    }));
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setValidations(prev => ({
        ...prev,
        password: { isValid: false, message: "" }
      }));
      return;
    }

    const minLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    const isValid = minLength && hasLetter && hasNumber;
    let message = "";
    
    if (!minLength) message = "Palavra-passe deve ter pelo menos 8 caracteres";
    else if (!hasLetter || !hasNumber) message = "Palavra-passe deve incluir letras e números";
    else message = "Palavra-passe forte";

    setValidations(prev => ({
      ...prev,
      password: { isValid, message }
    }));
  };

  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) {
      setValidations(prev => ({
        ...prev,
        confirmPassword: { isValid: false, message: "" }
      }));
      return;
    }

    const isValid = confirmPassword === password;
    setValidations(prev => ({
      ...prev,
      confirmPassword: { 
        isValid, 
        message: isValid ? "Palavras-passe coincidem" : "As palavras-passe não coincidem" 
      }
    }));
  };

  // Effect hooks for real-time validation
  useEffect(() => {
    const timeoutId = setTimeout(() => validateUsername(formData.username), 500);
    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  useEffect(() => {
    const timeoutId = setTimeout(() => validateEmail(formData.email), 500);
    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  useEffect(() => {
    const timeoutId = setTimeout(() => validateTeamName(formData.teamName), 500);
    return () => clearTimeout(timeoutId);
  }, [formData.teamName]);

  useEffect(() => {
    validateCitizenCard(formData.citizenCard, formData.nationality);
  }, [formData.citizenCard, formData.nationality]);

  useEffect(() => {
    validatePassword(formData.password);
  }, [formData.password]);

  useEffect(() => {
    validateConfirmPassword(formData.confirmPassword, formData.password);
  }, [formData.confirmPassword, formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "phone") {
      const cleaned = value.replace(/\D/g, "");
      setFormData(prev => ({ ...prev, [name]: cleaned }));
      return;
    }

    if (name === "citizenCard") {
      if (formData.nationality === "Portugal") {
        const cleaned = value.replace(/\D/g, "").substring(0, 8);
        setFormData(prev => ({ ...prev, [name]: cleaned }));
      } else {
        const formatted = formatDocumentInput(value, formData.nationality);
        setFormData(prev => ({ ...prev, [name]: formatted }));
      }
      return;
    }

    if (name === "firstName" || name === "lastName") {
      if (!/^[a-zA-ZÀ-ÿ\s]*$/.test(value)) return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    const basicFieldsValid = validations.username.isValid &&
           validations.email.isValid &&
           validations.password.isValid &&
           validations.confirmPassword.isValid &&
           validations.teamName.isValid &&
           formData.firstName.length >= 2 &&
           formData.lastName.length >= 2 &&
           formData.phone.length >= 9 &&
           formData.city.length >= 2 &&
           formData.gender &&
           validations.citizenCard.isValid;
    
    const legalConsentsValid = legalConsents.acceptedTerms && legalConsents.acceptedPrivacy;
    
    return basicFieldsValid && legalConsentsValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast({
        title: "Formulário inválido",
        description: "Por favor, corrija os erros antes de continuar",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: 'team',
        phone: formData.phone,
        team_name: formData.teamName,
        team_captain_name: `${formData.firstName} ${formData.lastName}`,
        gender: formData.gender,
        nationality: formData.nationality,
        accepted_terms: legalConsents.acceptedTerms,
        accepted_privacy: legalConsents.acceptedPrivacy,
        marketing_consent: legalConsents.acceptedMarketing
      };

      const { error } = await signUp(formData.email, formData.password, userData);

      if (error) {
        const errorMessage =
          typeof error.message === "string" &&
          error.message.trim() !== "" &&
          error.message.trim() !== "{}"
            ? error.message
            : "Tente novamente mais tarde";
        toast({
          title: "Erro ao criar conta",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Conta de equipa criada com sucesso!",
          description: "Verifique o seu email para ativar a conta",
        });
        navigate("/login");
      }
    } catch (error) {
      toast({
        title: "Erro ao criar conta",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getValidationIcon = (validation: { isValid: boolean; isChecking: boolean }) => {
    if (validation.isChecking) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    if (validation.isValid) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <XCircle className="h-4 w-4 text-destructive" />;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Team Information Section */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-semibold text-primary mb-4">{t("authTeam.teamInfoTitle")}</h3>
        
        <div className="space-y-4">
          {/* Team Name */}
          <div className="space-y-2">
            <Label htmlFor="teamName">{t("authTeam.teamNameLabel")} *</Label>
            <div className="relative">
              <Input
                id="teamName"
                name="teamName"
                value={formData.teamName}
                onChange={handleChange}
                placeholder={t("authTeam.teamNamePlaceholder")}
                required
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                {formData.teamName && getValidationIcon(validations.teamName)}
              </div>
            </div>
            {formData.teamName && validations.teamName.message && (
              <p className={`text-xs ${validations.teamName.isValid ? "text-green-600" : "text-destructive"}`}>
                {validations.teamName.message}
              </p>
            )}
          </div>

          {/* Team Description */}
          <div className="space-y-2">
            <Label htmlFor="teamDescription">{t("authTeam.teamDescriptionLabel")}</Label>
            <Textarea
              id="teamDescription"
              name="teamDescription"
              value={formData.teamDescription}
              onChange={handleChange}
              placeholder={t("authTeam.teamDescriptionPlaceholder")}
              rows={3}
            />
          </div>

          {/* Affiliation Code */}
          <div className="space-y-2">
            <Label htmlFor="affiliationCode">{t("authTeam.affiliationCodeLabel")}</Label>
            <Input
              id="affiliationCode"
              name="affiliationCode"
              value={formData.affiliationCode}
              onChange={handleChange}
              placeholder={t("authTeam.affiliationCodePlaceholder")}
            />
          </div>
        </div>
      </div>

      {/* Responsible Person Information */}
      <div className="bg-muted/30 p-4 rounded-lg">
        <h3 className="font-semibold text-primary mb-4">{t("authTeam.responsibleTitle")}</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">{t("authTeam.usernameLabel")} *</Label>
              <div className="relative">
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Ex: joao123"
                  required
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {formData.username && getValidationIcon(validations.username)}
                </div>
              </div>
              {formData.username && validations.username.message && (
                <p className={`text-xs ${validations.username.isValid ? "text-green-600" : "text-destructive"}`}>
                  {validations.username.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{t("authTeam.emailLabel")} *</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="responsavel@equipa.com"
                  required
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {formData.email && getValidationIcon(validations.email)}
                </div>
              </div>
              {formData.email && validations.email.message && (
                <p className={`text-xs ${validations.email.isValid ? "text-green-600" : "text-destructive"}`}>
                  {validations.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">{t("authTeam.firstNameLabel")} *</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder={t("authTeam.firstNamePlaceholder")}
                required
              />
              {formData.firstName && formData.firstName.length < 2 && (
                <p className="text-xs text-destructive">{t("authTeam.firstNameMinLength")}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">{t("authTeam.lastNameLabel")} *</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder={t("authTeam.lastNamePlaceholder")}
                required
              />
              {formData.lastName && formData.lastName.length < 2 && (
                <p className="text-xs text-destructive">{t("authTeam.lastNameMinLength")}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">{t("authTeam.passwordLabel")} *</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t("authTeam.passwordPlaceholder")}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {formData.password && validations.password.message && (
                <p className={`text-xs ${validations.password.isValid ? "text-green-600" : "text-destructive"}`}>
                  {validations.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("authTeam.confirmPasswordLabel")} *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={t("authTeam.confirmPasswordPlaceholder")}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {formData.confirmPassword && validations.confirmPassword.message && (
                <p className={`text-xs ${validations.confirmPassword.isValid ? "text-green-600" : "text-destructive"}`}>
                  {validations.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">{t("authTeam.phoneLabel")} *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="912345678"
                required
              />
              {formData.phone && formData.phone.length < 9 && (
                <p className="text-xs text-destructive">Número de telefone deve ter pelo menos 9 dígitos</p>
              )}
            </div>

            {/* Citizen Card */}
            <div className="space-y-2">
              <Label htmlFor="citizenCard">{t("authTeam.citizenCardLabel")} *</Label>
              <Input
                id="citizenCard"
                name="citizenCard"
                value={formData.citizenCard}
                onChange={handleChange}
                placeholder="12345678"
                required
              />
              {validations.citizenCard.message && (
                <p className={`text-xs ${validations.citizenCard.isValid ? "text-green-600" : "text-destructive"}`}>
                  {validations.citizenCard.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">{t("authTeam.genderLabel")} *</Label>
              <Select onValueChange={(value) => handleSelectChange("gender", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder={t("authTeam.genderPlaceholder")}/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">{t("authTeam.genderMale")}</SelectItem>
                  <SelectItem value="feminino">{t("authTeam.genderFemale")}</SelectItem>
                  <SelectItem value="outro">{t("authTeam.genderOther")}</SelectItem>
                  <SelectItem value="prefiro-nao-dizer">{t("authTeam.genderNoSay")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nationality */}
            <div className="space-y-2">
              <Label htmlFor="nationality">{t("authTeam.nationalityLabel")} *</Label>
              <Select 
                value={formData.nationality} 
                onValueChange={(value) => handleSelectChange("nationality", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Portugal">{t("authTeam.countryPortugal")}</SelectItem>
                  <SelectItem value="Espanha">{t("authTeam.countrySpain")}</SelectItem>
                  <SelectItem value="França">{t("authTeam.countryFrance")}</SelectItem>
                  <SelectItem value="Itália">{t("authTeam.countryItaly")}</SelectItem>
                  <SelectItem value="Alemanha">{t("authTeam.countryGermany")}</SelectItem>
                  <SelectItem value="Reino Unido">{t("authTeam.countryUK")}</SelectItem>
                  <SelectItem value="Brasil">{t("authTeam.countryBrazil")}</SelectItem>
                  <SelectItem value="Estados Unidos">{t("authTeam.countryUS")}</SelectItem>
                  <SelectItem value="Outro">{t("authTeam.countryOther")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Address and City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">{t("authTeam.addressLabel")}</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder={t("authTeam.addressPlaceholder")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">{t("authTeam.cityLabel")} *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder={t("authTeam.cityPlaceholder")}
                required
              />
              {formData.city && formData.city.length < 2 && (
                <p className="text-xs text-destructive">Cidade deve ter pelo menos 2 caracteres</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <LegalConsent 
        onConsentChange={setLegalConsents}
        disabled={isLoading}
      />

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || !isFormValid()}
      >
        {isLoading ? t("authTeam.creating") : t("authTeam.submit")}
      </Button>
    </form>
  );
}
