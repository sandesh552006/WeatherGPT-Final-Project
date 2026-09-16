'use client';

import React from 'react';
import { WeatherData, GeoLocation } from '@/lib/types';
import { SunMedium, Compass, AlertTriangle, History, Briefcase, MapPin } from 'lucide-react';
import { WeatherForecastView } from './WeatherForecastView';
import { WeatherMapView } from './WeatherMapView';
import { AlertsWarningsView } from './AlertsWarningsView';
import { ClimateHistoricalView } from './ClimateHistoricalView';
import { SectoralAdvisoryView } from './sectoral/SectoralAdvisoryView';
import { WeatherAlert } from '@/lib/alertTypes';
import { SectorId } from '@/lib/sectoral/types';

interface OtherViewProps {
  viewId: string;
  weather: WeatherData | null;
  onOpenChat: (q?: string) => void;
  currentLocation?: GeoLocation;
  loading?: boolean;
  onRefresh?: () => void;
  onLocationChange?: (loc: GeoLocation) => void;
  alerts?: WeatherAlert[];
  targetSector?: SectorId;
}

export const OtherView: React.FC<OtherViewProps> = ({
  viewId,
  weather,
  onOpenChat,
  currentLocation,
  loading = false,
  onRefresh,
  onLocationChange,
  alerts = [],
  targetSector,
}) => {
  const loc = currentLocation || weather?.location || {
    name: 'New Delhi',
    country: 'India',
    latitude: 28.6214,
    longitude: 77.2148,
  };
  const locName = loc.name;

  if (viewId === 'forecast') {
    return (
      <WeatherForecastView
        weather={weather}
        loading={loading}
        onRefresh={onRefresh}
        onOpenChat={onOpenChat}
        currentLocation={loc}
      />
    );
  }

  if (viewId === 'maps') {
    return (
      <WeatherMapView
        currentLocation={loc}
        onOpenChat={onOpenChat}
        onLocationChange={onLocationChange}
      />
    );
  }

  if (viewId === 'alerts') {
    return (
      <AlertsWarningsView
        currentLocation={loc}
        onOpenChat={onOpenChat}
        onLocationChange={onLocationChange}
      />
    );
  }

  if (viewId === 'climate') {
    return (
      <ClimateHistoricalView
        currentLocation={loc}
        onOpenChat={onOpenChat}
        onLocationChange={onLocationChange}
      />
    );
  }

  if (viewId === 'sectoral') {
    return (
      <SectoralAdvisoryView
        weather={weather}
        alerts={alerts}
        currentLocation={loc}
        onOpenChat={onOpenChat}
        onRefresh={onRefresh}
        loading={loading}
        initialSector={targetSector}
      />
    );
  }

  // Fallback for Unknown Views
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 capitalize flex items-center gap-2">
          {viewId === 'climate' ? <History className="h-6 w-6 text-indigo-500" /> : <Briefcase className="h-6 w-6 text-emerald-500" />}
          {viewId === 'climate' ? 'Climate & Historical' : 'Sectoral Advisory'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {viewId === 'climate'
            ? 'Long-term climate averages, monsoon trends, and historical anomaly tracking.'
            : 'Customized weather advisories for Agriculture, Aviation, Energy, and Disaster Management.'}
        </p>
      </div>

      <div className="rounded-3xl bg-white p-8 border border-slate-200/80 shadow-sm text-center py-16">
        <div className="max-w-md mx-auto space-y-3">
          <div className="text-4xl">🌤️</div>
          <h3 className="text-base font-bold text-slate-800">
            {viewId === 'climate' ? 'Climate Intelligence Insights' : 'Sectoral Advisory Insights'}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            You can ask WeatherGPT conversational questions about agriculture, sowing windows, rain predictions, or historical temperatures.
          </p>
          <button
            onClick={() => onOpenChat(`Give me agricultural weather advice for ${locName}`)}
            className="mt-2 px-4 py-2 rounded-xl bg-[#1d68f5] text-white text-xs font-semibold hover:bg-blue-600"
          >
            Ask WeatherGPT
          </button>
        </div>
      </div>
    </div>
  );
};
