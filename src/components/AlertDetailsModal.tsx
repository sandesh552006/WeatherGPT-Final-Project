'use client';

import React, { useEffect } from 'react';
import {
  X,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
} from 'lucide-react';
import { WeatherAlert, IMD_SEVERITY_CONFIG } from '@/lib/alertTypes';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { getLanguageLocale } from '@/lib/i18n/types';

interface AlertDetailsModalProps {
  alert: WeatherAlert | null;
  onClose: () => void;
  onOpenChat: (q?: string) => void;
}

export const AlertDetailsModal: React.FC<AlertDetailsModalProps> = ({
  alert,
  onClose,
  onOpenChat,
}) => {
  const { language, t } = useTranslation();
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!alert) return null;

  const config = IMD_SEVERITY_CONFIG[alert.severity];

  const handleAskWeatherGPT = () => {
    const q = `Explain this ${alert.severity} warning for ${alert.event} in ${alert.location}: What does it mean and what safety precautions should I take?`;
    onOpenChat(q);
    onClose();
  };

  const issuedFormatted = (() => {
    try {
      return new Date(alert.issuedAt).toLocaleString(getLanguageLocale(language), {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return alert.issuedAt;
    }
  })();

  const validUntilFormatted = (() => {
    try {
      return new Date(alert.validUntil).toLocaleString(getLanguageLocale(language), {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return alert.validUntil;
    }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">{config.icon}</span>
              <span
                className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${config.badgeBg} ${config.badgeText}`}
              >
                {alert.severity} — {config.actionAdvice}
              </span>
              <span className="text-xs text-slate-400 font-medium">ID: {alert.id.slice(0, 10)}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{alert.event}</h2>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mt-1">
              <MapPin className="h-3.5 w-3.5 text-rose-500" />
              <span>{alert.location}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="Close modal (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
          {/* Validity & Source Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                Issued Time
              </span>
              <span className="font-bold text-slate-800">{issuedFormatted}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                Valid Until
              </span>
              <span className="font-bold text-slate-800">{validUntilFormatted}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                Official Authority
              </span>
              <span className="font-bold text-blue-600">{alert.source}</span>
            </div>
          </div>

          {/* Detailed Meteorological Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Warning Description
            </h4>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed">
              {alert.description}
            </div>
          </div>

          {/* Actionable Safety Checklist */}
          {alert.safetyGuidance && alert.safetyGuidance.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Actionable Safety Guidance</span>
              </h4>
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
                {alert.safetyGuidance.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Disclaimer */}
          <div className="p-3.5 rounded-xl bg-slate-50 text-[11px] text-slate-500 flex items-start gap-2">
            <Building className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p>
              Official bulletins are issued under the statutory authority of the India Meteorological
              Department (Ministry of Earth Sciences) and the National Disaster Management Authority (NDMA).
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleAskWeatherGPT}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1d68f5] hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>{t.nav.askWeatherGPT}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            {t.common?.close || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
