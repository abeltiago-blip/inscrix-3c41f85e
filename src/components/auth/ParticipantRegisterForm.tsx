import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { validateDocumentByCountry, formatDocumentInput, getDocumentTypeInfo } from "@/utils/documentValidation";
import { SecurityUtils, validateMedicalConditions } from "@/utils/validationUtils";
import useSecurityMonitoring from "@/hooks/useSecurityMonitoring";
import { LegalConsent } from "@/components/LegalConsent";

interface ParticipantFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  phone: string;
  street: string;
  streetNumber: string;
  city: string;
  postalCode: string;
  citizenCard: string; // Cartão de Cidadão - 8 dígitos obrigatório
  nif: string; // Número de Identificação Fiscal
  gender: string;
  nationality: string;
  birthDate: string;
}

export function ParticipantRegisterForm() {
  const [formData, setFormData] = useState<ParticipantFormData>({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    phone: "",
    street: "",
    streetNumber: "",
    city: "",
    postalCode: "",
    citizenCard: "",
    nif: "",
    gender: "",
    nationality: "Portugal",
    birthDate: ""
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
    confirmPassword: { isValid: false, message: "" }
  });

  const { toast } = useToast();
  const navigate = useNavigate();
    const { signUp } = useAuth();
    const securityMonitoring = useSecurityMonitoring();

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

    // Simulate API call to check username availability
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

    // Simulate API call to check email availability
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

  const validateCitizenCard = (citizenCard: string, nationality: string) => {
    if (!citizenCard) {
      setValidations(prev => ({
        ...prev,
        citizenCard: { isValid: false, message: "Cartão de Cidadão é obrigatório" }
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
    validateCitizenCard(formData.citizenCard, formData.nationality);
  }, [formData.citizenCard, formData.nationality]);

  useEffect(() => {
    validatePassword(formData.password);
  }, [formData.password]);

  useEffect(() => {
    validateConfirmPassword(formData.confirmPassword, formData.password);
  }, [formData.confirmPassword, formData.password]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format phone number
    if (name === "phone") {
      const cleaned = value.replace(/\D/g, "");
      setFormData(prev => ({ ...prev, [name]: cleaned }));
      return;
    }

    // Format NIF (9 digits only)
    if (name === "nif") {
      const cleaned = value.replace(/\D/g, "").substring(0, 9);
      setFormData(prev => ({ ...prev, [name]: cleaned }));
      return;
    }

    // Format citizen card number (only 8 digits for Portugal)
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

    // Only letters for names
    if (name === "firstName" || name === "lastName") {
      if (!/^[a-zA-ZÀ-ÿ\s]*$/.test(value)) return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    // Debug validation states
    const checks = {
      username: validations.username.isValid,
      email: validations.email.isValid,
      password: validations.password.isValid,
      confirmPassword: validations.confirmPassword.isValid,
      firstName: formData.firstName.length >= 2,
      lastName: formData.lastName.length >= 2,
      phone: formData.phone.length >= 9,
      gender: !!formData.gender,
      birthDate: !!formData.birthDate,
      city: formData.city.length >= 2,
      // citizenCard: validations.citizenCard.isValid,
      acceptedTerms: legalConsents.acceptedTerms,
      acceptedPrivacy: legalConsents.acceptedPrivacy
    };
    
    const failedChecks = Object.entries(checks).filter(([key, value]) => !value);
    
    if (failedChecks.length > 0) {
      console.log("Campos em falta ou inválidos:", failedChecks.map(([key]) => key));
    }
    
    const basicFieldsValid = Object.entries(checks).slice(0, -2).every(([key, value]) => value);
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
      // Check for suspicious input before submitting
      const fieldsToCheck = [
        formData.firstName,
        formData.lastName, 
        formData.email,
        formData.phone
      ];
      
      const suspiciousField = fieldsToCheck.find(SecurityUtils.detectSuspiciousInput);
      if (suspiciousField) {
        securityMonitoring.trackSuspiciousInput('registration_form', suspiciousField, 'Suspicious pattern detected');
        toast({
          title: "Entrada inválida",
          description: "Por favor, verifique os dados inseridos",
          variant: "destructive",
        });
        return;
      }

      const userData = {
        first_name: SecurityUtils.sanitizeInput(formData.firstName),
        last_name: SecurityUtils.sanitizeInput(formData.lastName),
        role: 'participant',
        phone: SecurityUtils.sanitizeInput(formData.phone),
        gender: formData.gender,
        nationality: formData.nationality,
        birth_date: formData.birthDate,
        accepted_terms: legalConsents.acceptedTerms,
        accepted_privacy: legalConsents.acceptedPrivacy,
        marketing_consent: legalConsents.acceptedMarketing
      };

      // Attempt registration with retry logic
      const attemptRegistration = async (retryCount = 0): Promise<{ error: any }> => {
        const result = await signUp(formData.email, formData.password, userData, retryCount);
        
        // Handle retry cases
        if (result.error && result.error.canRetry && retryCount < 3) {
          const delay = result.error.retryAfter || 5000;
          
          toast({
            title: "Tentando novamente...",
            description: result.error.message,
            variant: "default",
          });

          // Wait for the specified delay
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Retry the registration
          return attemptRegistration(retryCount + 1);
        }

        return result;
      };

      const { error } = await attemptRegistration();

      if (error) {
        // Handle specific error types with appropriate messages and actions
        if (error.code === 'timeout_retry' || error.code === 'signup_timeout_retry') {
          toast({
            title: "Servidor ocupado",
            description: error.message + " O registo pode demorar alguns minutos devido à carga do servidor.",
            variant: "destructive",
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSubmit(e)}
              >
                Tentar novamente
              </Button>
            )
          });
        } else if (error.code === 'rate_limit_retry') {
          toast({
            title: "Muitos emails",
            description: error.message + " Tentando automaticamente...",
            variant: "destructive",
          });
          
          // Auto-retry after delay
          setTimeout(() => {
            handleSubmit(e);
          }, error.retryAfter);
        } else if (error.code === 'user_exists' || error.code === 'user_already_exists') {
          toast({
            title: "Email já registado",
            description: error.message,
            variant: "destructive",
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Fazer Login
              </Button>
            )
          });
        } else if (error.code === 'network_error') {
          toast({
            title: "Erro de conexão",
            description: error.message,
            variant: "destructive",
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSubmit(e)}
              >
                Tentar novamente
              </Button>
            )
          });
        } else {
          // Default error handling with better messaging
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
        }

        securityMonitoring.trackRegistrationAttempt(false, "participant", error.message);
        return;
      }

      // Success handling
      securityMonitoring.trackRegistrationAttempt(true, 'participant');
      
      toast({
        title: "Conta criada com sucesso! 🎉",
        description: "Verifique o seu email para confirmar a conta. O email pode demorar alguns minutos a chegar devido à carga do servidor.",
        variant: "default",
        duration: 8000,
      });

      // Redirect after successful registration
      setTimeout(() => {
        navigate('/login?message=confirm_email');
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      securityMonitoring.trackRegistrationAttempt(false, 'participant', errorMessage);
      
      toast({
        title: "Erro ao criar conta",
        description: "Erro inesperado. Tente novamente mais tarde ou contacte o suporte se o problema persistir.",
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
          <Label htmlFor="email">Email *</Label>
          <div className="relative">
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu.email@exemplo.com"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Citizen Card */}
        {/* <div className="space-y-2">
          <Label htmlFor="citizenCard" className="text-sm">Cartão de Cidadão *</Label>
          <Input
            id="citizenCard"
            name="citizenCard"
            value={formData.citizenCard}
            onChange={handleChange}
            placeholder="12345678"
            
          />
          {validations.citizenCard.message && (
            <p className={`text-xs ${validations.citizenCard.isValid ? "text-green-600" : "text-destructive"}`}>
              {validations.citizenCard.message}
            </p>
          )}
        </div> */}

        {/* NIF */}
        <div className="space-y-2">
          <Label htmlFor="nif" className="text-sm">NIF</Label>
          <Input
            id="nif"
            name="nif"
            value={formData.nif}
            onChange={handleChange}
            placeholder="123456789"
          />
          {formData.nif && formData.nif.length > 0 && formData.nif.length !== 9 && (
            <p className="text-xs text-destructive">NIF deve ter 9 dígitos</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone *</Label>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Birth Date */}
        <div className="space-y-2">
          <Label htmlFor="birthDate">Data de Nascimento *</Label>
          <Input
            id="birthDate"
            name="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={handleChange}
            required
          />
        </div>

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

      {/* Address Fields */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="street">Rua (Opcional)</Label>
            <Input
              id="street"
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="Nome da rua"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="streetNumber">Número (Opcional)</Label>
            <Input
              id="streetNumber"
              name="streetNumber"
              value={formData.streetNumber}
              onChange={handleChange}
              placeholder="123"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Cidade *</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Lisboa"
              required
            />
            {formData.city && formData.city.length < 2 && (
              <p className="text-xs text-destructive">Cidade deve ter pelo menos 2 caracteres</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="postalCode">Código Postal (Opcional)</Label>
            <Input
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="1000-001"
            />
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
        {isLoading ? "A criar conta..." : "Criar Conta de Participante"}
      </Button>
    </form>
  );
}