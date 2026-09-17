'use client';

import React from 'react';
import {
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  Sun,
  Eye,
  Radio,
  Sparkles,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { WeatherFactorItem } from '@/lib/sectoral/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface WeatherFactorsPanelProps {
  factors: WeatherFactorItem[];
  dopplerStatus: {
    title: string;
    description: string;
    isAlertActive: boolean;
  };
  locationName: string;
}

export const WeatherFactorsPanel: React.FC<WeatherFactorsPanelProps> = ({
  factors,
  dopplerStatus,
  locationName,
}) => {
  const { t } = useTranslation();
  const getFactorIcon = (id: string) => {
    switch (id) {
      case 'temp':
        return <Thermometer className="h-4 w-4 text-amber-500" />;
      case 'humidity':
        return <Droplets className="h-4 w-4 text-blue-500" />;
      case 'rain_prob':
        return <CloudRain className="h-4 w-4 text-sky-500" />;
      case 'wind':
        return <Wind className="h-4 w-4 text-teal-600" />;
      case 'uv':
        return <Sun className="h-4 w-4 text-amber-500" />;
      case 'visibility':
        return <Eye className="h-4 w-4 text-slate-500" />;
      case 'precip_24h':
        return <CloudRain className="h-4 w-4 text-indigo-500" />;
      default:
        return <Thermometer className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="rounded-3xl bg-white p-4 sm:p-6 border border-slate-200/80 shadow-sm space-y-6 flex flex-col justify-between">
      <div>
        {/* Header matching Image 2 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {t.sectoral.weatherFactors}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
              Deterministic parameter drivers
            </p>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
            Open-Meteo & IMD Live
          </span>
        </div>

        {/* Factors List matching Image 2 */}
        <div className="divide-y divide-slate-100 text-xs mt-1">
          {factors.map((factor) => (
            <div key={factor.id} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1 rounded-lg bg-slate-50 border border-slate-100">
                  {getFactorIcon(factor.id)}
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block">{factor.name}</span>
                  {factor.comparisonNote && (
                    <span className="text-[10px] text-slate-400 block font-normal">
                      {factor.comparisonNote}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{factor.value}</span>
                {factor.statusLabel && (
                  <span
                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                      factor.statusColor || 'text-slate-600 bg-slate-100'
                    }`}
                  >
                    {factor.statusLabel}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Radar / Alert Subcard matching Image 2 */}
      <div className="space-y-4 pt-2">
        <div
          className={`p-4 rounded-2xl border transition-all ${
            dopplerStatus.isAlertActive
              ? 'bg-rose-50/80 border-rose-200'
              : 'bg-blue-50/60 border-blue-200/70'
          }`}
        >
          <div className="flex items-center gap-2">
            {dopplerStatus.isAlertActive ? (
              <ShieldAlert className="h-4 w-4 text-rose-600 flex-shrink-0 animate-bounce" />
            ) : (
              <Radio className="h-4 w-4 text-blue-600 flex-shrink-0" />
            )}
            <h5
              className={`text-xs font-bold ${
                dopplerStatus.isAlertActive ? 'text-rose-900' : 'text-blue-900'
              }`}
            >
              {dopplerStatus.title}
            </h5>
          </div>
          <p
            className={`text-[11px] mt-1.5 leading-relaxed ${
              dopplerStatus.isAlertActive ? 'text-rose-800' : 'text-blue-800/90'
            }`}
          >
            {dopplerStatus.description}
          </p>
        </div>

        {/* Methodology Footer Note matching Image 2 */}
        <div className="flex items-start gap-2 text-[10px] text-slate-400 leading-relaxed pt-2 border-t border-slate-100">
          <Sparkles className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
          <span>
            WeatherGPT AI fuses real-time NWP forecast models, official IMD warnings, and sector-phenological rules to formulate continuous operational alerts.
          </span>
        </div>
      </div>
    </div>
  );
};
