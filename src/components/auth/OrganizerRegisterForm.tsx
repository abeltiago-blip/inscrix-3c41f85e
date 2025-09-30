import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, CheckCircle, XCircle, Loader2, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { validateDocumentByCountry, formatDocumentInput, getDocumentTypeInfo } from "@/utils/documentValidation";
import { useRateLimitHandler } from "@/hooks/useRateLimitHandler";
import { LegalConsent } from "@/components/LegalConsent";

interface OrganizerFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  phone: string;
  citizenCard: string; // Cartão de Cidadão - 8 dígitos
  gender: string;
  nationality: string;
  companyName: string;
  companyNif: string;
  companyAddress: string;
  companyCity: string;
  companyPhone: string;
  supportEmail: string;
  cae: string;
}

export function OrganizerRegisterForm() {
  const [formData, setFormData] = useState<OrganizerFormData>({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    phone: "",
    citizenCard: "",
    gender: "",
    nationality: "Portugal",
    companyName: "",
    companyNif: "",
    companyAddress: "",
    companyCity: "",
    companyPhone: "",
    supportEmail: "",
    cae: ""
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
    supportEmail: { isValid: false, message: "" },
    citizenCard: { isValid: false, message: "" },
    companyNif: { isValid: false, message: "" },
    password: { isValid: false, message: "" },
    confirmPassword: { isValid: false, message: "" }
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { rateLimitState, handleRateLimit, canRetry, getRetryTimeLeft } = useRateLimitHandler();

  // Validation functions
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
      username: { isValid: false, isChecking: true, message: "A verificar disponibilidade..." }
    }));

    setTimeout(() => {
      const isAvailable = !["admin", "test", "inscrix"].includes(username.toLowerCase());
      setValidations(prev => ({
        ...prev,
        username: { 
          isValid: isAvailable, 
          isChecking: false, 
          message: isAvailable ? "Nome de utilizador disponível" : "Nome de utilizador indisponível. Escolha outro nome." 
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

  const validateSupportEmail = (supportEmail: string) => {
    if (!supportEmail) {
      setValidations(prev => ({
        ...prev,
        supportEmail: { isValid: true, message: "Email de suporte é opcional" }
      }));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(supportEmail);
    
    setValidations(prev => ({
      ...prev,
      supportEmail: { 
        isValid, 
        message: isValid ? "Email válido" : "Por favor, insira um email válido" 
      }
    }));
  };

  const validateCitizenCard = (citizenCard: string, nationality: string) => {
    if (!citizenCard) {
      setValidations(prev => ({
        ...prev,
        citizenCard: { isValid: true, message: "CC é opcional" }
      }));
      return;
    }
    
    // Para Portugal, validar apenas os 8 primeiros dígitos
    if (nationality === "Portugal") {
      const cleaned = citizenCard.replace(/\D/g, "");
      if (cleaned.length !== 8) {
        setValidations(prev => ({
          ...prev,
          citizenCard: { isValid: false, message: "CC deve ter 8 dígitos numéricos" }
        }));
        return;
      }
      
      setValidations(prev => ({
        ...prev,
        citizenCard: { isValid: true, message: "CC válido" }
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

  const validateCompanyNIF = (nif: string) => {
    if (!nif) {
      setValidations(prev => ({
        ...prev,
        companyNif: { isValid: false, message: "NIF da empresa é obrigatório" }
      }));
      return;
    }

    if (!/^\d{9}$/.test(nif)) {
      setValidations(prev => ({
        ...prev,
        companyNif: { isValid: false, message: "NIF deve ter 9 dígitos numéricos" }
      }));
      return;
    }

    const digits = nif.split('').map(Number);
    const checksum = digits.slice(0, 8).reduce((sum, digit, index) => sum + digit * (9 - index), 0);
    const remainder = checksum % 11;
    const isValid = remainder < 2 ? digits[8] === 0 : digits[8] === 11 - remainder;

    setValidations(prev => ({
      ...prev,
      companyNif: { 
        isValid, 
        message: isValid ? "NIF válido" : "NIF inválido. Verifique os dígitos." 
      }
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
    validateSupportEmail(formData.supportEmail);
  }, [formData.supportEmail]);

  useEffect(() => {
    validateCitizenCard(formData.citizenCard, formData.nationality);
  }, [formData.citizenCard, formData.nationality]);

  useEffect(() => {
    validateCompanyNIF(formData.companyNif);
  }, [formData.companyNif]);

  useEffect(() => {
    validatePassword(formData.password);
  }, [formData.password]);

  useEffect(() => {
    validateConfirmPassword(formData.confirmPassword, formData.password);
  }, [formData.confirmPassword, formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "phone" || name === "companyPhone") {
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

    if (name === "companyNif") {
      const cleaned = value.replace(/\D/g, "").slice(0, 9);
      setFormData(prev => ({ ...prev, [name]: cleaned }));
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
           validations.companyNif.isValid &&
           (formData.supportEmail === "" || validations.supportEmail.isValid) &&
           (formData.citizenCard === "" || validations.citizenCard.isValid) &&
           formData.firstName.length >= 2 &&
           formData.lastName.length >= 2 &&
           formData.phone.length >= 9 &&
           formData.gender &&
           formData.companyName.length >= 2 &&
           formData.companyAddress.length >= 10 &&
           formData.companyCity.length >= 2;
    
    const legalConsentsValid = legalConsents.acceptedTerms && legalConsents.acceptedPrivacy;
    
    return basicFieldsValid && legalConsentsValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submission started");
    console.log("Form validity:", isFormValid());
    
    if (!isFormValid()) {
      console.log("Form is invalid");
      toast({
        title: "Formulário inválido",
        description: "Por favor, corrija os erros antes de continuar",
        variant: "destructive",
      });
      return;
    }

    // Check rate limit
    if (!canRetry()) {
      const timeLeft = getRetryTimeLeft();
      toast({
        title: "Aguarde antes de tentar novamente",
        description: `Tente novamente em ${timeLeft} segundos`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const attemptSignUp = async (retryCount = 0) => {
      try {
        const userData = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: 'organizer',
          phone: formData.phone,
          organization_name: formData.companyName,
          gender: formData.gender,
          nationality: formData.nationality,
          accepted_terms: legalConsents.acceptedTerms,
          accepted_privacy: legalConsents.acceptedPrivacy,
          marketing_consent: legalConsents.acceptedMarketing
        };

        console.log("Calling signUp with:", { email: formData.email, userData });

        const { error } = await signUp(formData.email, formData.password, userData, retryCount);
        
        console.log("SignUp result:", { error });
        
        if (error) {
          console.error("SignUp error:", error);
          
          // Handle specific error types
          switch (error.code) {
            case 'user_exists':
              toast({
                title: "Email já registado",
                description: error.message,
                variant: "destructive",
              });
              break;
              
            case 'rate_limit_retry':
              toast({
                title: "A tentar novamente...",
                description: error.message,
              });
              handleRateLimit(error.retryAfter);
              
              // Automatic retry after delay
              setTimeout(() => {
                if (error.retryCount < 3) {
                  attemptSignUp(error.retryCount);
                }
              }, error.retryAfter);
              return;
              
            case 'rate_limit_exceeded':
              toast({
                title: "Limite de emails atingido",
                description: error.message,
                variant: "destructive",
              });
              handleRateLimit(300000); // 5 minutes
              break;
              
            case 'timeout_error':
            case 'network_error':
              toast({
                title: "Erro de conexão",
                description: error.message,
                variant: "destructive",
              });
              break;
              
            default:
              toast({
                title: "Erro ao criar conta",
                description: error.message || "Tente novamente mais tarde",
                variant: "destructive",
              });
          }
        } else {
          console.log("SignUp successful");
          toast({
            title: "Conta de organizador criada com sucesso!",
            description: "Verifique o seu email para ativar a conta",
          });
          navigate("/login");
        }
      } catch (error) {
        console.error("Catch error:", error);
        toast({
          title: "Erro inesperado",
          description: "Tente novamente mais tarde",
          variant: "destructive",
        });
      }
    };

    try {
      await attemptSignUp();
    } finally {
      setIsLoading(false);
    }
  };

  const getValidationIcon = (validation: { isValid: boolean; isChecking?: boolean }) => {
    if (validation.isChecking) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    if (validation.isValid) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <XCircle className="h-4 w-4 text-destructive" />;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Information Section */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-semibold text-primary mb-4">Informações da Empresa/Organização</h3>
        
        <div className="space-y-4">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Nome da Empresa/Organização *</Label>
            <Input
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Ex: EventosDesportivos Lda"
              required
            />
            {formData.companyName && formData.companyName.length < 2 && (
              <p className="text-xs text-destructive">Nome da empresa deve ter pelo menos 2 caracteres</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company NIF */}
            <div className="space-y-2">
              <Label htmlFor="companyNif">NIF da Empresa *</Label>
              <Input
                id="companyNif"
                name="companyNif"
                value={formData.companyNif}
                onChange={handleChange}
                placeholder="123456789"
                required
              />
              {formData.companyNif && validations.companyNif.message && (
                <p className={`text-xs ${validations.companyNif.isValid ? "text-green-600" : "text-destructive"}`}>
                  {validations.companyNif.message}
                </p>
              )}
            </div>

            {/* CAE */}
            <div className="space-y-2">
              <Label htmlFor="cae">CAE - Código de Atividade (Opcional)</Label>
              <Input
                id="cae"
                name="cae"
                value={formData.cae}
                onChange={handleChange}
                placeholder="12345"
              />
            </div>
          </div>

          {/* Company Address */}
          <div className="space-y-2">
            <Label htmlFor="companyAddress">Morada da Sede *</Label>
            <Input
              id="companyAddress"
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleChange}
              placeholder="Rua, número, código postal"
              required
            />
            {formData.companyAddress && formData.companyAddress.length < 10 && (
              <p className="text-xs text-destructive">Indique a morada completa da sede</p>
            )}
          </div>

          {/* Company City */}
          <div className="space-y-2">
            <Label htmlFor="companyCity">Cidade da Sede *</Label>
            <Input
              id="companyCity"
              name="companyCity"
              value={formData.companyCity}
              onChange={handleChange}
              placeholder="Lisboa"
              required
            />
            {formData.companyCity && formData.companyCity.length < 2 && (
              <p className="text-xs text-destructive">Cidade deve ter pelo menos 2 caracteres</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Phone */}
            <div className="space-y-2">
              <Label htmlFor="companyPhone">Telefone da Empresa (Opcional)</Label>
              <Input
                id="companyPhone"
                name="companyPhone"
                value={formData.companyPhone}
                onChange={handleChange}
                placeholder="212345678"
              />
            </div>

            {/* Support Email */}
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Email de Suporte (Opcional)</Label>
              <Input
                id="supportEmail"
                name="supportEmail"
                type="email"
                value={formData.supportEmail}
                onChange={handleChange}
                placeholder="suporte@empresa.com"
              />
              {formData.supportEmail && validations.supportEmail.message && (
                <p className={`text-xs ${validations.supportEmail.isValid ? "text-green-600" : "text-destructive"}`}>
                  {validations.supportEmail.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Responsible Person Information */}
      <div className="bg-muted/30 p-4 rounded-lg">
        <h3 className="font-semibold text-primary mb-4">Dados Pessoais do Responsável</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Nome de Utilizador *</Label>
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
              <Label htmlFor="email">Email Pessoal *</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="joao@email.com"
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
              <Label htmlFor="firstName">Primeiro Nome *</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="João"
                required
              />
              {formData.firstName && formData.firstName.length < 2 && (
                <p className="text-xs text-destructive">Deve ter pelo menos 2 caracteres</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Último Nome *</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Silva"
                required
              />
              {formData.lastName && formData.lastName.length < 2 && (
                <p className="text-xs text-destructive">Deve ter pelo menos 2 caracteres</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Palavra-passe *</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres"
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
              <Label htmlFor="confirmPassword">Confirmar Palavra-passe *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repita a palavra-passe"
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
              <Label htmlFor="phone">Telefone Pessoal *</Label>
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
              <Label htmlFor="citizenCard">Cartão de Cidadão (8 dígitos) - Opcional</Label>
              <Input
                id="citizenCard"
                name="citizenCard"
                value={formData.citizenCard}
                onChange={handleChange}
                placeholder="12345678"
              />
              {formData.citizenCard && validations.citizenCard.message && (
                <p className={`text-xs ${validations.citizenCard.isValid ? "text-green-600" : "text-destructive"}`}>
                  {validations.citizenCard.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Género *</Label>
              <Select onValueChange={(value) => handleSelectChange("gender", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                  <SelectItem value="prefiro-nao-dizer">Prefiro não dizer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nationality */}
            <div className="space-y-2">
              <Label htmlFor="nationality">Nacionalidade *</Label>
              <Select 
                value={formData.nationality} 
                onValueChange={(value) => handleSelectChange("nationality", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Portugal">Portugal</SelectItem>
                  <SelectItem value="Espanha">Espanha</SelectItem>
                  <SelectItem value="França">França</SelectItem>
                  <SelectItem value="Itália">Itália</SelectItem>
                  <SelectItem value="Alemanha">Alemanha</SelectItem>
                  <SelectItem value="Reino Unido">Reino Unido</SelectItem>
                  <SelectItem value="Brasil">Brasil</SelectItem>
                  <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
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
        disabled={isLoading || !isFormValid() || !canRetry()}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            A criar conta...
          </>
        ) : !canRetry() ? (
          <>
            <Clock className="h-4 w-4 mr-2" />
            Aguarde {getRetryTimeLeft()}s
          </>
        ) : (
          "Criar Conta de Organizador"
        )}
      </Button>
    </form>
  );
}