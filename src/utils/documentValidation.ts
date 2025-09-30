// Document validation utilities by country/nationality

export interface DocumentValidation {
  isValid: boolean;
  message: string;
  documentType: string;
}

export const documentTypes = {
  PT: { name: "NIF", placeholder: "123456789", maxLength: 9 },
  ES: { name: "DNI/NIE", placeholder: "12345678A", maxLength: 10 },
  FR: { name: "Numéro de Sécurité Sociale", placeholder: "1234567890123", maxLength: 15 },
  IT: { name: "Codice Fiscale", placeholder: "RSSMRA80A01H501A", maxLength: 16 },
  DE: { name: "Personalausweisnummer", placeholder: "T22000129", maxLength: 10 },
  UK: { name: "National Insurance Number", placeholder: "AB123456C", maxLength: 9 },
  BR: { name: "CPF", placeholder: "12345678901", maxLength: 11 },
  US: { name: "SSN", placeholder: "123-45-6789", maxLength: 11 },
  default: { name: "Documento de Identificação", placeholder: "Número do documento", maxLength: 20 }
};

// Portuguese NIF validation (keeping as NIF for business documents)
export const validatePortugueseNIF = (nif: string): DocumentValidation => {
  if (!nif) {
    return { isValid: true, message: "NIF é opcional", documentType: "NIF" };
  }

  if (!/^\d{9}$/.test(nif)) {
    return { isValid: false, message: "NIF deve ter 9 dígitos numéricos", documentType: "NIF" };
  }

  const digits = nif.split('').map(Number);
  const checksum = digits.slice(0, 8).reduce((sum, digit, index) => sum + digit * (9 - index), 0);
  const remainder = checksum % 11;
  const isValid = remainder < 2 ? digits[8] === 0 : digits[8] === 11 - remainder;

  return {
    isValid,
    message: isValid ? "NIF válido" : "NIF inválido. Verifique os dígitos.",
    documentType: "NIF"
  };
};

// Portuguese Citizen Card validation (for participants)
export const validatePortugueseCC = (cc: string): DocumentValidation => {
  if (!cc) {
    return { isValid: false, message: "Cartão de Cidadão é obrigatório", documentType: "Cartão de Cidadão" };
  }

  // Remove spaces and keep only digits
  const cleaned = cc.replace(/\s/g, '');
  
  // Check format: 8 digits
  if (!/^\d{8}$/.test(cleaned)) {
    return { isValid: false, message: "Deve ter exatamente 8 dígitos", documentType: "Cartão de Cidadão" };
  }

  return {
    isValid: true,
    message: "Cartão de Cidadão válido",
    documentType: "Cartão de Cidadão"
  };
};

// Spanish DNI/NIE validation
export const validateSpanishDNI = (dni: string): DocumentValidation => {
  if (!dni) {
    return { isValid: true, message: "DNI/NIE é opcional", documentType: "DNI/NIE" };
  }

  const dniPattern = /^(\d{8}[A-Z]|[XYZ]\d{7}[A-Z])$/i;
  if (!dniPattern.test(dni)) {
    return { isValid: false, message: "Formato inválido. Use 12345678A ou X1234567A", documentType: "DNI/NIE" };
  }

  const letters = "TRWAGMYFPDXBNJZSQVHLCKE";
  let number: number;
  
  if (dni.match(/^[XYZ]/i)) {
    // NIE
    const prefix = dni.charAt(0).toUpperCase();
    const prefixValue = prefix === 'X' ? '0' : prefix === 'Y' ? '1' : '2';
    number = parseInt(prefixValue + dni.substring(1, 8));
  } else {
    // DNI
    number = parseInt(dni.substring(0, 8));
  }

  const expectedLetter = letters[number % 23];
  const providedLetter = dni.charAt(dni.length - 1).toUpperCase();
  const isValid = expectedLetter === providedLetter;

  return {
    isValid,
    message: isValid ? "DNI/NIE válido" : "Letra de controlo incorreta",
    documentType: "DNI/NIE"
  };
};

// Brazilian CPF validation
export const validateBrazilianCPF = (cpf: string): DocumentValidation => {
  if (!cpf) {
    return { isValid: true, message: "CPF é opcional", documentType: "CPF" };
  }

  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) {
    return { isValid: false, message: "CPF deve ter 11 dígitos", documentType: "CPF" };
  }

  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cleaned)) {
    return { isValid: false, message: "CPF inválido", documentType: "CPF" };
  }

  // Validate check digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let checkDigit1 = 11 - (sum % 11);
  if (checkDigit1 >= 10) checkDigit1 = 0;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  let checkDigit2 = 11 - (sum % 11);
  if (checkDigit2 >= 10) checkDigit2 = 0;

  const isValid = checkDigit1 === parseInt(cleaned.charAt(9)) && 
                  checkDigit2 === parseInt(cleaned.charAt(10));

  return {
    isValid,
    message: isValid ? "CPF válido" : "CPF inválido",
    documentType: "CPF"
  };
};

// UK National Insurance Number validation
export const validateUKNIN = (nin: string): DocumentValidation => {
  if (!nin) {
    return { isValid: true, message: "National Insurance Number é opcional", documentType: "National Insurance Number" };
  }

  const ninPattern = /^[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]\d{6}[A-D]$/i;
  const isValid = ninPattern.test(nin.replace(/\s/g, ''));

  return {
    isValid,
    message: isValid ? "National Insurance Number válido" : "Formato inválido. Use AB123456C",
    documentType: "National Insurance Number"
  };
};

// Generic validation for other countries
export const validateGenericDocument = (document: string, country: string): DocumentValidation => {
  const docType = documentTypes[country as keyof typeof documentTypes] || documentTypes.default;
  
  if (!document) {
    return { isValid: true, message: `${docType.name} é opcional`, documentType: docType.name };
  }

  if (document.length < 3) {
    return { isValid: false, message: `${docType.name} deve ter pelo menos 3 caracteres`, documentType: docType.name };
  }

  if (document.length > docType.maxLength) {
    return { isValid: false, message: `${docType.name} muito longo`, documentType: docType.name };
  }

  return { isValid: true, message: `${docType.name} aceite`, documentType: docType.name };
};

// Main validation function that routes to appropriate validator
export const validateDocumentByCountry = (document: string, nationality: string): DocumentValidation => {
  switch (nationality) {
    case "Portugal":
      return validatePortugueseCC(document);
    case "Espanha":
    case "Spain":
      return validateSpanishDNI(document);
    case "Brasil":
    case "Brazil":
      return validateBrazilianCPF(document);
    case "Reino Unido":
    case "United Kingdom":
    case "UK":
      return validateUKNIN(document);
    default:
      return validateGenericDocument(document, nationality);
  }
};

// Format document input based on country
export const formatDocumentInput = (value: string, nationality: string): string => {
  switch (nationality) {
    case "Portugal":
      // For Portuguese CC, keep only digits, limit to 8 characters
      return value.replace(/\D/g, "").slice(0, 8);
    case "Brasil":
    case "Brazil":
      return value.replace(/\D/g, "").slice(0, 11);
    case "Reino Unido":
    case "United Kingdom":
    case "UK":
      return value.toUpperCase().slice(0, 9);
    default:
      return value.slice(0, 20);
  }
};

// Get document type info for a country
export const getDocumentTypeInfo = (nationality: string) => {
  switch (nationality) {
    case "Portugal":
      return { name: "Cartão de Cidadão", placeholder: "12345678" };
    case "Espanha":
    case "Spain":
      return { name: "DNI/NIE", placeholder: "12345678A" };
    case "Brasil":
    case "Brazil":
      return { name: "CPF", placeholder: "12345678901" };
    case "Reino Unido":
    case "United Kingdom":
    case "UK":
      return { name: "National Insurance Number", placeholder: "AB123456C" };
    case "França":
    case "France":
      return { name: "Numéro de Sécurité Sociale", placeholder: "1234567890123" };
    case "Itália":
    case "Italy":
      return { name: "Codice Fiscale", placeholder: "RSSMRA80A01H501A" };
    case "Alemanha":
    case "Germany":
      return { name: "Personalausweisnummer", placeholder: "T22000129" };
    case "Estados Unidos":
    case "United States":
    case "USA":
      return { name: "SSN", placeholder: "123-45-6789" };
    default:
      return { name: "Documento de Identificação", placeholder: "Número do documento" };
  }
};