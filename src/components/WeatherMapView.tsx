'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  CloudRain,
  Thermometer,
  Wind,
  Layers,
  AlertTriangle,
  Sparkles,
  MapPin,
  RefreshCw,
  Clock,
  ShieldCheck,
  ArrowRight,
  Info,
} from 'lucide-react';
import { GeoLocation, WeatherMapLayer, MapRiskSummary } from '@/lib/types';
import { WeatherMap } from './WeatherMap';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { getLocalizedLocationName } from '@/lib/i18n/locations';

interface WeatherMapViewProps {
  currentLocation: GeoLocation;
  onOpenChat: (q?: string) => void;
  onLocationChange?: (loc: GeoLocation) => void;
}

export const WeatherMapView: React.FC<WeatherMapViewProps> = ({
  currentLocation,
  onOpenChat,
  onLocationChange,
}) => {
  const { language, t } = useTranslation();
  const [activeLayer, setActiveLayer] = useState<WeatherMapLayer>('rainfall');
  const [hourOffset, setHourOffset] = useState<number>(0);
  const [riskSummary, setRiskSummary] = useState<MapRiskSummary | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch risk summary from the grid API
  const fetchSummary = async (refresh = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/weather/grid${refresh ? '?refresh=true' : ''}`);
      if (res.ok) {
        const data = await res.json();
        setRiskSummary(data.riskSummary);
        setLastUpdated(data.updatedAt);
      }
    } catch (e) {
      console.error('Failed to load risk summary:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const locName = getLocalizedLocationName(currentLocation, language);

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5 sm:space-y-6">
      {/* ======================================================== */}
      {/* 1. HEADER SECTION                                        */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Compass className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">{t.maps.intelligence}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.maps.pageTitle}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t.maps.pageSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchSummary(true)}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>{loading ? t.common.loading : t.common.refresh}</span>
          </button>

          <button
            onClick={() => onOpenChat(`Give me a national weather map intelligence overview for India right now.`)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1d68f5] hover:bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t.nav.askWeatherGPT}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. WEATHER RISK SUMMARY CARDS                            */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Heavy Rain Areas */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span className="text-base">🌧️</span>
              <span>{t.maps.heavyRainAreas}</span>
            </div>
            <span className="h-2 w-2 rounded-full bg-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {riskSummary?.heavyRainCount ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
            {riskSummary && riskSummary.heavyRainAreas.length > 0
              ? riskSummary.heavyRainAreas.join(', ')
              : 'None active currently'}
          </p>
        </div>

        {/* Hot Areas */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span className="text-base">🌡️</span>
              <span>{t.maps.hotAreas}</span>
            </div>
            <span className="h-2 w-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {riskSummary?.hotAreaCount ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
            {riskSummary && riskSummary.hotAreas.length > 0
              ? riskSummary.hotAreas.join(', ')
              : 'None exceeding 35°C'}
          </p>
        </div>

        {/* Strong Wind Areas */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-cyan-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span className="text-base">💨</span>
              <span>{t.maps.strongWindAreas}</span>
            </div>
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {riskSummary?.strongWindCount ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
            {riskSummary && riskSummary.strongWindAreas.length > 0
              ? riskSummary.strongWindAreas.join(', ')
              : 'Calm across monitored grid'}
          </p>
        </div>

        {/* Active Grid Coverage */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span className="text-base">📍</span>
              <span>{t.maps.monitoredRegions}</span>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {riskSummary?.totalPoints ?? 24}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Full synoptic Indian coverage
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. INTERACTIVE WEATHER MAP ENGINE (Full Mode)            */}
      {/* ======================================================== */}
      <div className="rounded-3xl bg-white p-3.5 sm:p-6 shadow-sm border border-slate-200/80">
        <WeatherMap
          mode="full"
          currentLocation={currentLocation}
          activeLayer={activeLayer}
          onLayerChange={setActiveLayer}
          onOpenChat={onOpenChat}
          onLocationChange={onLocationChange}
          selectedHourOffset={hourOffset}
          onHourOffsetChange={setHourOffset}
          heightClass="h-[360px] sm:h-[460px] lg:h-[540px]"
        />
      </div>

      {/* ======================================================== */}
      {/* 4. RAIN ALERT ZONES NOTICE & INSIGHTS FOOTER             */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Notice */}
        <div className="rounded-3xl bg-amber-50/70 border border-amber-200/80 p-5 flex items-start gap-3.5">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
              {t.maps.noticeTitle}
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              {t.maps.noticeDesc}
            </p>
          </div>
        </div>

        {/* Quick Location Intelligence */}
        <div className="rounded-3xl bg-blue-50/70 border border-blue-200/80 p-5 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base">📍</span>
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                {t.maps.focusedLocation}: {locName}
              </h4>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              {t.maps.clickMapPrompt}
            </p>
          </div>

          <button
            onClick={() => onOpenChat(`What is the meteorological map radar overview for ${locName}?`)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold whitespace-nowrap shadow-sm transition-colors"
          >
            {t.nav.askWeatherGPT}
          </button>
        </div>
      </div>
    </div>
  );
};
