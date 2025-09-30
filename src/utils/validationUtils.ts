// Enhanced validation utilities with security sanitization

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export class SecurityUtils {
  // Input sanitization to prevent XSS and injection attacks
  static sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/\0/g, '') // Remove null bytes
      .slice(0, 1000); // Limit length to prevent DoS
  }

  // Sanitize medical conditions and notes fields
  static sanitizeLongText(text: string): string {
    if (!text) return '';
    
    return text
      .trim()
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/\0/g, '')
      .slice(0, 2000); // Allow longer text but still limit
  }

  // Check for suspicious patterns that might indicate attacks
  static detectSuspiciousInput(input: string): boolean {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /\bexec\b/i,
      /\bunion\b.*\bselect\b/i,
      /\binsert\b.*\binto\b/i,
      /\bdelete\b.*\bfrom\b/i,
      /\bdrop\b.*\btable\b/i,
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(input));
  }

  // Rate limiting check (simple implementation)
  private static requestCounts: Map<string, { count: number; resetTime: number }> = new Map();
  
  static checkRateLimit(identifier: string, maxRequests = 10, windowMs = 60000): boolean {
    const now = Date.now();
    const record = this.requestCounts.get(identifier);
    
    if (!record || now > record.resetTime) {
      this.requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= maxRequests) {
      return false;
    }
    
    record.count++;
    return true;
  }
}

export class ValidationUtils {
  static validateEmail(email: string): ValidationResult {
    if (!email) return { isValid: false, message: 'Email é obrigatório' };
    
    // Sanitize input first
    const cleanEmail = SecurityUtils.sanitizeInput(email);
    
    // Check for suspicious patterns
    if (SecurityUtils.detectSuspiciousInput(cleanEmail)) {
      return { isValid: false, message: 'Email contém caracteres inválidos' };
    }
    
    // Enhanced email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      return { isValid: false, message: 'Email inválido' };
    }
    
    // Check email length
    if (cleanEmail.length > 254) {
      return { isValid: false, message: 'Email muito longo' };
    }
    
    return { isValid: true };
  }

  static validatePassword(password: string): ValidationResult {
    if (!password) return { isValid: false, message: 'Palavra-passe é obrigatória' };
    
    if (password.length < 6) {
      return { isValid: false, message: 'Palavra-passe deve ter pelo menos 6 caracteres' };
    }
    
    return { isValid: true };
  }

  static validatePasswordConfirmation(password: string, confirmPassword: string): ValidationResult {
    if (!confirmPassword) {
      return { isValid: false, message: 'Confirmação de palavra-passe é obrigatória' };
    }
    
    if (password !== confirmPassword) {
      return { isValid: false, message: 'As palavras-passe não coincidem' };
    }
    
    return { isValid: true };
  }

  static validateCC(cc: string): ValidationResult {
    if (!cc) return { isValid: false, message: 'Cartão de Cidadão é obrigatório' };
    
    const cleanCC = cc.replace(/\s/g, '');
    
    if (cleanCC.length !== 8) {
      return { isValid: false, message: 'Cartão de Cidadão deve ter 8 dígitos' };
    }
    
    if (!/^\d{8}$/.test(cleanCC)) {
      return { isValid: false, message: 'Cartão de Cidadão deve conter apenas números' };
    }
    
    return { isValid: true };
  }

  static validatePhone(phone: string): ValidationResult {
    if (!phone) return { isValid: false, message: 'Telefone é obrigatório' };
    
    const cleanPhone = phone.replace(/\s/g, '');
    
    if (cleanPhone.length < 9) {
      return { isValid: false, message: 'Telefone deve ter pelo menos 9 dígitos' };
    }
    
    return { isValid: true };
  }

  static validateRequiredString(value: string, fieldName: string, minLength = 1): ValidationResult {
    if (!value || value.trim().length < minLength) {
      return { isValid: false, message: `${fieldName} é obrigatório` };
    }
    
    // Sanitize and check for suspicious content
    const sanitized = SecurityUtils.sanitizeInput(value);
    if (SecurityUtils.detectSuspiciousInput(value)) {
      return { isValid: false, message: `${fieldName} contém caracteres inválidos` };
    }
    
    if (sanitized.length !== value.trim().length) {
      return { isValid: false, message: `${fieldName} contém caracteres não permitidos` };
    }
    
    return { isValid: true };
  }

  // New validation for medical conditions and notes
  static validateMedicalConditions(text: string): ValidationResult {
    if (!text) return { isValid: true }; // Optional field
    
    const sanitized = SecurityUtils.sanitizeLongText(text);
    if (SecurityUtils.detectSuspiciousInput(text)) {
      return { isValid: false, message: 'Texto contém caracteres inválidos' };
    }
    
    if (sanitized.length > 2000) {
      return { isValid: false, message: 'Texto muito longo (máximo 2000 caracteres)' };
    }
    
    return { isValid: true };
  }

  // Enhanced phone validation with better security
  static validatePhoneSecure(phone: string): ValidationResult {
    if (!phone) return { isValid: false, message: 'Telefone é obrigatório' };
    
    const cleanPhone = phone.replace(/\s/g, '');
    
    // Check for suspicious patterns
    if (SecurityUtils.detectSuspiciousInput(phone)) {
      return { isValid: false, message: 'Telefone contém caracteres inválidos' };
    }
    
    // Only allow digits, spaces, +, -, (, )
    if (!/^[\d\s\+\-\(\)]{9,15}$/.test(phone)) {
      return { isValid: false, message: 'Formato de telefone inválido' };
    }
    
    if (cleanPhone.length < 9 || cleanPhone.length > 15) {
      return { isValid: false, message: 'Telefone deve ter entre 9 a 15 dígitos' };
    }
    
    return { isValid: true };
  }

  static validateAge(birthDate: string): ValidationResult {
    if (!birthDate) return { isValid: false, message: 'Data de nascimento é obrigatória' };
    
    const birth = new Date(birthDate);
    const today = new Date();
    
    if (birth > today) {
      return { isValid: false, message: 'Data de nascimento não pode ser no futuro' };
    }
    
    const age = today.getFullYear() - birth.getFullYear();
    
    if (age < 6) {
      return { isValid: false, message: 'Idade mínima é 6 anos' };
    }
    
    if (age > 120) {
      return { isValid: false, message: 'Idade inválida' };
    }
    
    return { isValid: true };
  }

  static formatCC(value: string): string {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue.replace(/(\d{4})(\d{4})/, '$1 $2').substring(0, 9);
  }

  static formatPhone(value: string): string {
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length <= 9) {
      return cleanValue.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    
    return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
  }
}

export const {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateCC,
  validatePhone,
  validateRequiredString,
  validateAge,
  formatCC,
  formatPhone,
  validateMedicalConditions,
  validatePhoneSecure
} = ValidationUtils;