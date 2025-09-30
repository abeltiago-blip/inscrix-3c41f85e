// Centralized error handling utility

import { toast } from "@/hooks/use-toast";

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  context?: Record<string, any>;
}

export class ErrorHandler {
  static handle(error: unknown, context?: string): void {
    let errorMessage = 'Ocorreu um erro inesperado';
    let errorCode: string | undefined;

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      const errorObj = error as any;
      errorMessage = errorObj.message || errorObj.error || errorObj.details || 'Erro desconhecido';
      errorCode = errorObj.code;
    }

    // Map common error codes to user-friendly messages
    const userFriendlyMessage = this.mapErrorToUserMessage(errorMessage, errorCode);

    console.error(`Error in ${context || 'Application'}:`, error);

    toast({
      title: "Erro",
      description: userFriendlyMessage,
      variant: "destructive",
    });
  }

  private static mapErrorToUserMessage(message: string, code?: string): string {
    // Authentication errors
    if (message.includes('Invalid login credentials')) {
      return 'Email ou palavra-passe incorretos';
    }
    if (message.includes('Email already exists') || message.includes('duplicate key')) {
      return 'Este email já está registado';
    }
    if (message.includes('Password should be')) {
      return 'A palavra-passe deve ter pelo menos 6 caracteres';
    }

    // Network errors
    if (message.includes('network') || message.includes('fetch')) {
      return 'Erro de conexão. Verifique a sua internet';
    }

    // Validation errors
    if (message.includes('documento já está registado')) {
      return 'Este Cartão de Cidadão já está registado neste evento';
    }

    // Payment errors
    if (message.includes('payment') || message.includes('stripe')) {
      return 'Erro no processamento do pagamento. Tente novamente';
    }

    // Default fallback
    return message.length > 100 ? 'Ocorreu um erro. Tente novamente' : message;
  }

  static async handleAsync<T>(
    asyncFn: () => Promise<T>,
    context?: string,
    fallbackValue?: T
  ): Promise<T | undefined> {
    try {
      return await asyncFn();
    } catch (error) {
      this.handle(error, context);
      return fallbackValue;
    }
  }

  static validateRequired(
    data: Record<string, any>,
    requiredFields: string[],
    customMessages?: Record<string, string>
  ): void {
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(field => 
        customMessages?.[field] || field
      ).join(', ');
      
      throw new Error(`Campos obrigatórios: ${fieldNames}`);
    }
  }
}

export const handleError = ErrorHandler.handle.bind(ErrorHandler);
export const handleAsyncError = ErrorHandler.handleAsync.bind(ErrorHandler);
export const validateRequired = ErrorHandler.validateRequired.bind(ErrorHandler);