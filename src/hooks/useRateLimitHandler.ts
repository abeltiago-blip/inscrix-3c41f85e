import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RateLimitState {
  isRateLimited: boolean;
  retryAfter: number;
  lastAttempt: number;
}

export const useRateLimitHandler = () => {
  const { toast } = useToast();
  const [rateLimitState, setRateLimitState] = useState<RateLimitState>({
    isRateLimited: false,
    retryAfter: 0,
    lastAttempt: 0
  });

  const handleRateLimit = useCallback((retryAfter: number) => {
    setRateLimitState({
      isRateLimited: true,
      retryAfter,
      lastAttempt: Date.now()
    });

    // Show countdown toast
    let countdown = Math.ceil(retryAfter / 1000);
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        toast({
          title: "Aguarde para tentar novamente",
          description: `Próxima tentativa em ${countdown} segundos`,
          duration: 1000,
        });
      } else {
        clearInterval(countdownInterval);
        setRateLimitState(prev => ({ ...prev, isRateLimited: false }));
        toast({
          title: "Pode tentar novamente",
          description: "O limite de tempo foi ultrapassado",
        });
      }
    }, 1000);

    // Auto clear after delay
    setTimeout(() => {
      clearInterval(countdownInterval);
      setRateLimitState(prev => ({ ...prev, isRateLimited: false }));
    }, retryAfter);
  }, [toast]);

  const canRetry = useCallback(() => {
    if (!rateLimitState.isRateLimited) return true;
    
    const timePassed = Date.now() - rateLimitState.lastAttempt;
    return timePassed >= rateLimitState.retryAfter;
  }, [rateLimitState]);

  const getRetryTimeLeft = useCallback(() => {
    if (!rateLimitState.isRateLimited) return 0;
    
    const timePassed = Date.now() - rateLimitState.lastAttempt;
    const timeLeft = rateLimitState.retryAfter - timePassed;
    return Math.max(0, Math.ceil(timeLeft / 1000));
  }, [rateLimitState]);

  return {
    rateLimitState,
    handleRateLimit,
    canRetry,
    getRetryTimeLeft
  };
};