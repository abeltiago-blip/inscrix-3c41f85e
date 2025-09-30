// Security monitoring hook for tracking suspicious activity

import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SecurityEvent {
  eventType: string;
  details?: Record<string, any>;
  riskScore?: number;
}

export const useSecurityMonitoring = () => {
  const { user } = useAuth();

  const logSecurityEvent = async (event: SecurityEvent) => {
    try {
      // Get client IP and user agent for better tracking
      const userAgent = navigator.userAgent;
      const details = {
        ...event.details,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
      };

      // Log to our security events table
      const { error } = await supabase.rpc('log_security_event', {
        p_event_type: event.eventType,
        p_user_id: user?.id || null,
        p_user_agent: userAgent,
        p_details: details,
        p_risk_score: event.riskScore || 0
      });

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  const trackLoginAttempt = (success: boolean, error?: string) => {
    logSecurityEvent({
      eventType: 'login_attempt',
      details: { success, error },
      riskScore: success ? 0 : 20
    });
  };

  const trackRegistrationAttempt = (success: boolean, userType: string, error?: string) => {
    logSecurityEvent({
      eventType: 'registration_attempt',
      details: { success, userType, error },
      riskScore: success ? 5 : 15
    });
  };

  const trackPaymentAttempt = (amount: number, success: boolean, error?: string) => {
    logSecurityEvent({
      eventType: 'payment_attempt',
      details: { amount, success, error },
      riskScore: success ? 10 : 25
    });
  };

  const trackSuspiciousInput = (fieldName: string, value: string, reason: string) => {
    logSecurityEvent({
      eventType: 'suspicious_input',
      details: { fieldName, valueLength: value.length, reason },
      riskScore: 40
    });
  };

  const trackDataAccess = (resourceType: string, resourceId: string) => {
    logSecurityEvent({
      eventType: 'data_access',
      details: { resourceType, resourceId },
      riskScore: 5
    });
  };

  // Monitor for suspicious activity patterns
  useEffect(() => {
    // Track page views for analytics
    logSecurityEvent({
      eventType: 'page_view',
      details: { path: window.location.pathname },
      riskScore: 0
    });

    // Monitor for rapid form submissions
    let formSubmissions = 0;
    const resetCount = () => { formSubmissions = 0; };
    const timer = setInterval(resetCount, 60000); // Reset every minute

    const handleFormSubmit = () => {
      formSubmissions++;
      if (formSubmissions > 5) { // More than 5 submissions per minute
        logSecurityEvent({
          eventType: 'rapid_form_submissions',
          details: { count: formSubmissions },
          riskScore: 30
        });
      }
    };

    document.addEventListener('submit', handleFormSubmit);

    return () => {
      clearInterval(timer);
      document.removeEventListener('submit', handleFormSubmit);
    };
  }, [user]);

  return {
    logSecurityEvent,
    trackLoginAttempt,
    trackRegistrationAttempt,
    trackPaymentAttempt,
    trackSuspiciousInput,
    trackDataAccess
  };
};

export default useSecurityMonitoring;