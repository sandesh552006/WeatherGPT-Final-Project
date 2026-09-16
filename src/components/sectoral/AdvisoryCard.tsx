'use client';

import React, { useState } from 'react';
import {
  Droplets,
  ShieldAlert,
  Wrench,
  Sun,
  Wind,
  Eye,
  Plane,
  Anchor,
  HeartPulse,
  Building2,
  Truck,
  Zap,
  HelpCircle,
  Clock,
  Gauge,
  CloudRain,
  ChevronRight,
  Info,
} from 'lucide-react';
import { OperationalRecommendation } from '@/lib/sectoral/types';

interface AdvisoryCardProps {
  recommendation: OperationalRecommendation;
  onWhyClick: (rec: OperationalRecommendation) => void;
}

export const AdvisoryCard: React.FC<AdvisoryCardProps> = ({
  recommendation,
  onWhyClick,
}) => {
  const getCardIcon = (id: string) => {
    if (id.includes('irrigation')) return <Droplets className="h-4 w-4 text-blue-500" />;
    if (id.includes('pest')) return <ShieldAlert className="h-4 w-4 text-amber-500" />;
    if (id.includes('tillage')) return <Wrench className="h-4 w-4 text-teal-600" />;
    if (id.includes('harvest') || id.includes('rain')) return <CloudRain className="h-4 w-4 text-rose-500" />;
    if (id.includes('crosswind') || id.includes('wind')) return <Wind className="h-4 w-4 text-cyan-600" />;
    if (id.includes('visibility') || id.includes('fog')) return <Eye className="h-4 w-4 text-slate-500" />;
    if (id.includes('heat') || id.includes('cooling')) return <Sun className="h-4 w-4 text-amber-500" />;
    if (id.includes('solar')) return <Zap className="h-4 w-4 text-amber-500" />;
    return <Clock className="h-4 w-4 text-blue-500" />;
  };

  return (
    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all duration-150">
      <div>
        {/* Header Row: Icon + Title + Badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-200/70">
              {getCardIcon(recommendation.id)}
            </div>
            <h4 className="text-xs md:text-sm font-bold text-slate-900 tracking-tight">
              {recommendation.title}
            </h4>
          </div>

          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${recommendation.badgeColor}`}
          >
            {recommendation.badge}
          </span>
        </div>

        {/* Advisory Description */}
        <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
          {recommendation.description}
        </p>
      </div>

      {/* Sub-metric Row & Why Trigger */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
          <span className="text-slate-400">{recommendation.subMetricLabel}:</span>
          <span className="font-bold text-slate-800">{recommendation.subMetricValue}</span>
        </div>

        <button
          onClick={() => onWhyClick(recommendation)}
          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5"
        >
          <span>Why?</span>
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
