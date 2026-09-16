'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Droplets,
  Wind,
  Gauge,
  Eye,
  AlertTriangle,
  ArrowRight,
  Send,
  Sparkles,
  Bot,
  RefreshCw,
} from 'lucide-react';
import { WeatherData, GeoLocation, WeatherMapLayer } from '@/lib/types';
import { WeatherAlert, AlertSummaryCounts } from '@/lib/alertTypes';
import { WeatherMap } from './WeatherMap';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { getLanguageLocale } from '@/lib/i18n/types';
import { getLocalizedLocationName, getLocalizedCountry, getLocalizedAdmin1 } from '@/lib/i18n/locations';
import { createClient } from '@/lib/supabase/client';

/**
 * Safely extracts and formats the user's first name from their authenticated email.
 * Examples:
 * - sandeshdongare55@gmail.com -> Sandesh
 * - sanketjande12@gmail.com -> Sanket
 * - sanket.jande12@gmail.com -> Sanket
 * - sanket_jande12@gmail.com -> Sanket
 * - sanket-jande12@gmail.com -> Sanket
 * Returns null if the name cannot be reasonably extracted, triggering the safe fallback "Hello! 👋".
 */
function extractFirstName(email?: string | null): string | null {
  if (!email || typeof email !== 'string') return null;
  const trimmed = email.trim();
  if (!trimmed || !trimmed.includes('@')) return null;

  // 1. Portion before '@'
  let localPart = trimmed.split('@')[0].trim();
  if (!localPart) return null;
  localPart = localPart.split('+')[0];

  // 2. Common separators (. _ -)
  const separatorMatch = localPart.split(/[._-]+/);
  if (separatorMatch.length > 1) {
    const firstSegment = separatorMatch[0].replace(/\d+$/g, '').trim();
    if (firstSegment && firstSegment.length >= 2) {
      return formatCapitalized(firstSegment);
    }
  }

  // 3. camelCase formatting (e.g. sandeshDongare)
  const camelMatch = localPart.match(/^([a-zA-Z]+?)([A-Z].*)$/);
  if (camelMatch && camelMatch[1] && camelMatch[1].length >= 2) {
    return formatCapitalized(camelMatch[1]);
  }

  // 4. Remove trailing digits: sandeshdongare55 -> sandeshdongare, sanketjande12 -> sanketjande
  const withoutDigits = localPart.replace(/\d+$/g, '');
  if (!withoutDigits || withoutDigits.length < 2) return null;

  // 5. Compound name / surname splitting
  const knownSurnames = [
    'dongare', 'dongre', 'jande', 'salunke', 'salunkhe', 'patil', 'pawar',
    'sharma', 'verma', 'gupta', 'kumar', 'singh', 'deshmukh', 'kulkarni',
    'joshi', 'shinde', 'jadhav', 'chavan', 'more', 'gaikwad', 'bhosale',
    'kale', 'kamble', 'sawant', 'rathod', 'mishra', 'pandey', 'tiwari',
    'yadav', 'reddy', 'nair', 'pillai', 'iyer', 'shukla', 'thakur', 'shah', 'patel'
  ];

  const lower = withoutDigits.toLowerCase();
  for (const surname of knownSurnames) {
    if (lower.endsWith(surname) && lower.length > surname.length + 1) {
      const firstPart = lower.slice(0, lower.length - surname.length);
      if (firstPart.length >= 2) {
        return formatCapitalized(firstPart);
      }
    }
  }

  const knownFirstNames = [
    'sandesh', 'sanket', 'ayush', 'rahul', 'amit', 'rohit', 'sachin',
    'aniket', 'prasad', 'aditya', 'vikram', 'nikhil', 'gaurav', 'mayur',
    'pratik', 'sourabh', 'saurabh', 'akshay', 'vishal', 'swapnil', 'mahesh',
    'ganesh', 'rajesh', 'suresh', 'ramesh', 'dinesh', 'deepak', 'prakash',
    'rohan', 'kunal', 'varun', 'arjun', 'priya', 'pooja', 'neha', 'sneha'
  ];

  for (const fn of knownFirstNames) {
    if (lower.startsWith(fn) && lower.length >= fn.length) {
      return formatCapitalized(fn);
    }
  }

  if (withoutDigits.length >= 2 && withoutDigits.length <= 15 && /^[a-zA-Z]+$/.test(withoutDigits)) {
    return formatCapitalized(withoutDigits);
  }

  return null;
}

function formatCapitalized(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

interface DashboardViewProps {
  weather: WeatherData | null;
  loading: boolean;
  onOpenChat: (initialQuestion?: string) => void;
  onLocationChange: (loc: GeoLocation) => void;
  onRefresh: () => void;
  onNavigateToAlerts?: () => void;
  alerts?: WeatherAlert[];
  summaryCounts?: AlertSummaryCounts;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  weather,
  loading,
  onOpenChat,
  onLocationChange,
  onRefresh,
  onNavigateToAlerts,
  alerts,
  summaryCounts,
}) => {
  const { language, t, translateCondition } = useTranslation();
  const [miniInput, setMiniInput] = useState('');
  const [mapTab, setMapTab] = useState<WeatherMapLayer>('satellite');
  const [userName, setUserName] = useState<string | null>(null);

  // Read authenticated user email from existing Supabase session
  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user?.email) {
          const name = extractFirstName(data.user.email);
          if (name) setUserName(name);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user?.email) {
          const name = extractFirstName(session.user.email);
          setUserName(name);
        } else {
          setUserName(null);
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    } catch {
      // Safe fallback keeps default greeting
    }
  }, []);

  const now = new Date();
  const locale = getLanguageLocale(language);
  const dateFormatted = now.toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeFormatted = now.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const handleMiniSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (miniInput.trim()) {
      onOpenChat(miniInput.trim());
      setMiniInput('');
    }
  };

  const sampleQuestions = [
    { emoji: '🌧️', text: t.chat.qRain24h },
    { emoji: '🌡️', text: t.chat.qTempToday },
    { emoji: '☔', text: t.chat.qUmbrella },
  ];

  // Dynamic greeting: "Hello, Sandesh! 👋" or safe fallback "Hello! 👋"
  const greetingText = userName
    ? `${t.home.greeting.replace(/[!！\s]+$/, '')}, ${userName}!`
    : t.home.greeting;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            {greetingText} <span className="inline-block animate-wave origin-bottom-right">👋</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {t.home.welcomeMessage}
          </p>
        </div>

        <div className="text-right flex items-center sm:block gap-4 sm:gap-0 bg-white/70 backdrop-blur-sm sm:bg-transparent px-4 py-2 sm:p-0 rounded-2xl border sm:border-0 border-slate-200/60">
          <p className="text-xs text-slate-500 font-medium">{dateFormatted}</p>
          <p className="text-lg font-bold text-slate-800 tracking-tight">{timeFormatted}</p>
        </div>
      </div>

      {/* Top 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Current Weather Deep Navy Card */}
        <div className="rounded-3xl bg-gradient-to-br from-[#0d2144] via-[#0b1b36] to-[#08162e] text-white p-6 shadow-xl relative overflow-hidden flex flex-col justify-between border border-slate-800">
          {/* Subtle decorative glow */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-start justify-between">
            {/* Location Hierarchy Computation */}
            {(() => {
              const loc = weather?.location;
              const locPrimary = getLocalizedLocationName(loc, language);
              const locTaluka = loc?.subdistrict || loc?.admin3 || '';
              const locDistrict = loc?.district || loc?.admin2 || '';
              const locState = getLocalizedAdmin1(loc?.state || loc?.admin1, language);
              const locCountry = getLocalizedCountry(loc?.country, language);

              const locMiddleParts: string[] = [];
              if (
                locTaluka &&
                locTaluka.toLowerCase() !== locPrimary.toLowerCase() &&
                !locTaluka.toLowerCase().startsWith(locPrimary.toLowerCase())
              ) {
                locMiddleParts.push(locTaluka);
              }
              if (
                locDistrict &&
                locDistrict.toLowerCase() !== locPrimary.toLowerCase() &&
                locDistrict.toLowerCase() !== locTaluka.toLowerCase() &&
                !locDistrict.toLowerCase().startsWith(locPrimary.toLowerCase())
              ) {
                locMiddleParts.push(locDistrict);
              }

              const locSubdistrictDistrict = locMiddleParts.join(', ');
              const locStateCountry = [locState, locCountry].filter(Boolean).join(', ');

              return (
                <div className="flex items-start gap-1.5">
                  <MapPin className="h-4 w-4 text-rose-500 fill-rose-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h2 className="text-base font-bold text-white tracking-wide">
                      {locPrimary}
                    </h2>
                    {locSubdistrictDistrict && (
                      <p className="text-xs text-slate-300 font-medium leading-tight mt-0.5">
                        {locSubdistrictDistrict}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 leading-tight mt-0.5">
                      {locStateCountry}
                    </p>
                  </div>
                </div>
              );
            })()}

              <button
                onClick={onRefresh}
                disabled={loading}
                title="Refresh live data"
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="mt-8 flex items-baseline gap-4">
              <span className="text-5xl font-black tracking-tight">
                {weather?.current.temperature ?? 32}°C
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {weather?.current.conditionIcon || '🌤️'}
                  </span>
                  <span className="text-sm font-semibold text-slate-200">
                    {translateCondition(weather?.current.conditionText || 'Partly Cloudy')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t.weather.feelsLike} {weather?.current.feelsLike ?? 35}°C
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-slate-700/60">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="flex items-center justify-center text-sky-400 mb-1">
                  <Droplets className="h-3.5 w-3.5" />
                </div>
                <div className="text-xs font-bold">{weather?.current.humidity ?? 78}%</div>
                <div className="text-[10px] text-slate-400">{t.weather.humidity}</div>
              </div>

              <div>
                <div className="flex items-center justify-center text-cyan-400 mb-1">
                  <Wind className="h-3.5 w-3.5" />
                </div>
                <div className="text-xs font-bold">{weather?.current.windSpeed ?? 12} km/h</div>
                <div className="text-[10px] text-slate-400">{t.weather.wind}</div>
              </div>

              <div>
                <div className="flex items-center justify-center text-indigo-300 mb-1">
                  <Gauge className="h-3.5 w-3.5" />
                </div>
                <div className="text-xs font-bold">{weather?.current.pressure ?? 1002} hPa</div>
                <div className="text-[10px] text-slate-400">{t.weather.pressure}</div>
              </div>

              <div>
                <div className="flex items-center justify-center text-slate-300 mb-1">
                  <Eye className="h-3.5 w-3.5" />
                </div>
                <div className="text-xs font-bold">{weather?.current.visibility ?? 6} km</div>
                <div className="text-[10px] text-slate-400">{t.weather.visibility}</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between items-center">
              <span>{t.dashboard.updatedAt}: {dateFormatted}, {timeFormatted}</span>
              <span className="text-sky-400">{t.dashboard.realtimeProvider}</span>
            </div>
          </div>
        </div>

        {/* 2. Today's Forecast Card */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight">
              {t.dashboard.forecastTitle}
            </h2>

            {/* Hourly ribbon */}
            <div className="mt-4 grid grid-cols-5 gap-2 py-3 border-b border-slate-100">
              {(weather?.hourly24h && weather.hourly24h.length >= 5
                ? weather.hourly24h.slice(0, 5)
                : [
                    { hourLabel: '11 AM', icon: '🌤️', temperature: 33 },
                    { hourLabel: '2 PM', icon: '☀️', temperature: 34 },
                    { hourLabel: '5 PM', icon: '🌦️', temperature: 31 },
                    { hourLabel: '8 PM', icon: '☁️', temperature: 28 },
                    { hourLabel: '11 PM', icon: '☁️', temperature: 27 },
                  ]
              ).map((slot: any, idx: number) => (
                <div key={idx} className="flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] font-medium text-slate-400">{slot.hourLabel}</span>
                  <span className="text-lg my-1">{slot.conditionIcon || slot.icon || '🌤️'}</span>
                  <span className="text-xs font-bold text-slate-800">{slot.temperature}°</span>
                </div>
              ))}
            </div>

            {/* 5-Day Daily Forecast rows */}
            <div className="mt-3 space-y-2.5">
              {(weather?.daily && weather.daily.length > 0
                ? weather.daily
                : [
                    { formattedDate: 'Wed, 16 Jul', conditionIcon: '🌧️', tempMin: 26, tempMax: 34 },
                    { formattedDate: 'Thu, 17 Jul', conditionIcon: '🌤️', tempMin: 27, tempMax: 35 },
                    { formattedDate: 'Fri, 18 Jul', conditionIcon: '☀️', tempMin: 27, tempMax: 36 },
                    { formattedDate: 'Sat, 19 Jul', conditionIcon: '🌦️', tempMin: 26, tempMax: 32 },
                    { formattedDate: 'Sun, 20 Jul', conditionIcon: '☁️', tempMin: 26, tempMax: 33 },
                  ]
              ).map((d: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1">
                  <span className="font-medium text-slate-600 w-24">{d.formattedDate}</span>
                  <span className="text-base">{d.conditionIcon || '🌤️'}</span>
                  <div className="flex items-center gap-1.5 text-right w-16 justify-end">
                    <span className="text-slate-400">{d.tempMin}°</span>
                    <span className="font-bold text-slate-800">{d.tempMax}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Active Alerts Card */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <span>🚨</span> {t.alerts.activeAlerts}
              </h2>
              <button
                onClick={onNavigateToAlerts || (() => onOpenChat('What weather alerts or warnings are active right now?'))}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                {t.common.viewMore}
              </button>
            </div>

            {/* Severity summary counter if counts available */}
            {summaryCounts && summaryCounts.totalActive > 0 && (
              <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <span className="text-rose-600">🔴 {summaryCounts.redCount} {t.dashboard.severe}</span>
                <span className="text-slate-300">•</span>
                <span className="text-orange-600">🟠 {summaryCounts.orangeCount} {t.dashboard.alertsCount}</span>
                <span className="text-slate-300">•</span>
                <span className="text-amber-600">🟡 {summaryCounts.yellowCount} {t.dashboard.watchesCount}</span>
              </div>
            )}

            <div className="mt-3 space-y-3">
              {alerts && alerts.length > 0 ? (
                alerts.slice(0, 2).map((alert, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl p-3.5 border transition-transform hover:scale-[1.01] ${
                      alert.severity === 'RED'
                        ? 'bg-rose-50/70 border-rose-200/60'
                        : alert.severity === 'ORANGE'
                        ? 'bg-orange-50/70 border-orange-200/60'
                        : 'bg-amber-50/70 border-amber-200/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                        <span className="text-sm">
                          {alert.severity === 'RED' ? '🌧️' : alert.severity === 'ORANGE' ? '⚡' : '🌡️'}
                        </span>
                        <span>{alert.event}</span>
                      </div>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          alert.severity === 'RED'
                            ? 'bg-rose-600 text-white'
                            : alert.severity === 'ORANGE'
                            ? 'bg-orange-500 text-white'
                            : 'bg-amber-400 text-amber-950'
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-700 mt-1">
                      {alert.location}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed line-clamp-2">
                      {alert.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200/60 p-4 text-center">
                  <div className="text-xl mb-1">🟢</div>
                  <div className="text-xs font-bold text-emerald-900">{t.alerts.noAlerts}</div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {t.alerts.normalAtmosphereMsg}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>{t.dashboard.imdBulletin}</span>
            <button
              onClick={() => onOpenChat('Explain the active weather alerts in detail')}
              className="text-blue-600 hover:underline font-medium"
            >
              {t.nav.askWeatherGPT}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Live Map & Ask WeatherGPT Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Weather Map (Live) - 7 Cols */}
        <div className="lg:col-span-7 rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <MapPin className="h-4 w-4 text-rose-500" />
              {t.weather.radarLive}
            </h2>

            <button
              onClick={() => onOpenChat('What does the radar and satellite map show for India right now?')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              {t.dashboard.analyzeWithAi}
            </button>
          </div>

          <WeatherMap
            mode="compact"
            currentLocation={
              weather?.location || {
                name: 'New Delhi',
                country: 'India',
                latitude: 28.6214,
                longitude: 77.2148,
              }
            }
            activeLayer={mapTab}
            onLayerChange={setMapTab}
            onOpenChat={onOpenChat}
            onLocationChange={onLocationChange}
            heightClass="h-72"
          />
        </div>

        {/* Right: Ask WeatherGPT Widget - 5 Cols */}
        <div className="lg:col-span-5 rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <span className="text-lg">🤖</span>
                {t.nav.askWeatherGPT}
              </h2>
              <button
                onClick={() => onOpenChat()}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
              >
                <span>{t.dashboard.fullChat}</span>
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Conversational bubble preview matching screenshot */}
            <div className="rounded-2xl bg-[#f0f4f9] p-4 text-slate-700 border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <span>{t.dashboard.greetingPreview}</span>
                <span className="text-base">🤖</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.dashboard.introPreview}
              </p>
            </div>

            {/* Quick Suggestions */}
            <div className="mt-4 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {t.dashboard.suggestedQuestions}
              </span>
              <div className="space-y-1.5">
                {sampleQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => onOpenChat(q.text)}
                    className="w-full text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/70 hover:border-blue-200 text-xs text-slate-700 hover:text-blue-600 transition-all font-medium flex items-center justify-between group"
                  >
                    <span>{q.emoji} {q.text}</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Input Form */}
          <form onSubmit={handleMiniSubmit} className="mt-5 relative flex items-center">
            <input
              type="text"
              value={miniInput}
              onChange={(e) => setMiniInput(e.target.value)}
              placeholder={t.dashboard.askAnything}
              className="w-full text-xs px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!miniInput.trim()}
              className="absolute right-1.5 p-1.5 rounded-lg bg-[#1d68f5] hover:bg-blue-600 disabled:opacity-40 text-white transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
