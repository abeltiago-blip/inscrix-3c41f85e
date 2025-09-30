import { describe, it, expect } from 'vitest';
import { 
  validateBrazilianCPF, 
  validatePortugueseNIF, 
  validateSpanishDNI, 
  validateUKNIN,
  validateDocumentByCountry,
  formatDocumentInput,
  getDocumentTypeInfo
} from '../documentValidation';

describe('Document Validation', () => {
  describe('validateBrazilianCPF', () => {
    it('should validate correct CPF numbers', () => {
      const result = validateBrazilianCPF('11144477735');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('CPF válido');
      expect(result.documentType).toBe('CPF');
    });

    it('should validate formatted CPF numbers', () => {
      const result = validateBrazilianCPF('111.444.777-35');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('CPF válido');
    });

    it('should reject CPF with all same digits', () => {
      const result = validateBrazilianCPF('11111111111');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('CPF inválido');
    });

    it('should reject CPF with wrong length', () => {
      const result = validateBrazilianCPF('123456789');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('CPF deve ter 11 dígitos');
    });

    it('should reject CPF with invalid check digits', () => {
      const result = validateBrazilianCPF('11144477734');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('CPF inválido');
    });

    it('should accept empty CPF as optional', () => {
      const result = validateBrazilianCPF('');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('CPF é opcional');
    });
  });

  describe('validatePortugueseNIF', () => {
    it('should validate correct NIF numbers', () => {
      const result = validatePortugueseNIF('123456789');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('NIF válido');
      expect(result.documentType).toBe('NIF');
    });

    it('should reject NIF with wrong format', () => {
      const result = validatePortugueseNIF('12345678a');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('NIF deve ter 9 dígitos numéricos');
    });

    it('should reject NIF with wrong length', () => {
      const result = validatePortugueseNIF('12345678');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('NIF deve ter 9 dígitos numéricos');
    });

    it('should accept empty NIF as optional', () => {
      const result = validatePortugueseNIF('');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('NIF é opcional');
    });
  });

  describe('validateSpanishDNI', () => {
    it('should validate correct DNI numbers', () => {
      const result = validateSpanishDNI('12345678Z');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('DNI/NIE válido');
      expect(result.documentType).toBe('DNI/NIE');
    });

    it('should validate correct NIE numbers', () => {
      const result = validateSpanishDNI('X1234567L');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('DNI/NIE válido');
    });

    it('should reject DNI with wrong control letter', () => {
      const result = validateSpanishDNI('12345678A');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Letra de controlo incorreta');
    });

    it('should reject DNI with invalid format', () => {
      const result = validateSpanishDNI('1234567');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Formato inválido. Use 12345678A ou X1234567A');
    });

    it('should accept empty DNI as optional', () => {
      const result = validateSpanishDNI('');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('DNI/NIE é opcional');
    });
  });

  describe('validateUKNIN', () => {
    it('should validate correct National Insurance Numbers', () => {
      const result = validateUKNIN('AB123456C');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('National Insurance Number válido');
    });

    it('should handle spaced format', () => {
      const result = validateUKNIN('AB 12 34 56 C');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('National Insurance Number válido');
    });

    it('should reject invalid format', () => {
      const result = validateUKNIN('1B123456C');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Formato inválido. Use AB123456C');
    });

    it('should accept empty NIN as optional', () => {
      const result = validateUKNIN('');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('National Insurance Number é opcional');
    });
  });

  describe('validateDocumentByCountry', () => {
    it('should route to correct validator for Portugal', () => {
      const result = validateDocumentByCountry('123456789', 'Portugal');
      expect(result.documentType).toBe('NIF');
    });

    it('should route to correct validator for Spain', () => {
      const result = validateDocumentByCountry('12345678Z', 'Espanha');
      expect(result.documentType).toBe('DNI/NIE');
    });

    it('should route to correct validator for Brazil', () => {
      const result = validateDocumentByCountry('11144477735', 'Brasil');
      expect(result.documentType).toBe('CPF');
    });

    it('should route to correct validator for UK', () => {
      const result = validateDocumentByCountry('AB123456C', 'Reino Unido');
      expect(result.documentType).toBe('National Insurance Number');
    });

    it('should use generic validator for unsupported countries', () => {
      const result = validateDocumentByCountry('123456', 'Alemanha');
      expect(result.documentType).toBe('Personalausweisnummer');
    });
  });

  describe('formatDocumentInput', () => {
    it('should format Portuguese documents correctly', () => {
      const result = formatDocumentInput('123abc456789xyz', 'Portugal');
      expect(result).toBe('123456789');
    });

    it('should format Brazilian documents correctly', () => {
      const result = formatDocumentInput('111.444.777-35abc', 'Brasil');
      expect(result).toBe('11144477735');
    });

    it('should format UK documents correctly', () => {
      const result = formatDocumentInput('ab123456c', 'Reino Unido');
      expect(result).toBe('AB123456C');
    });

    it('should limit length for generic documents', () => {
      const longInput = 'a'.repeat(30);
      const result = formatDocumentInput(longInput, 'Alemanha');
      expect(result.length).toBe(20);
    });
  });

  describe('getDocumentTypeInfo', () => {
    it('should return correct info for Portugal', () => {
      const info = getDocumentTypeInfo('Portugal');
      expect(info.name).toBe('Cartão de Cidadão');
      expect(info.placeholder).toBe('123456789');
    });

    it('should return correct info for Spain', () => {
      const info = getDocumentTypeInfo('Espanha');
      expect(info.name).toBe('DNI/NIE');
      expect(info.placeholder).toBe('12345678A');
    });

    it('should return default info for unsupported countries', () => {
      const info = getDocumentTypeInfo('Coreia do Sul');
      expect(info.name).toBe('Documento de Identificação');
      expect(info.placeholder).toBe('Número do documento');
    });
  });
});