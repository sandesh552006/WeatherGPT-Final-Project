'use client';

import React from 'react';
import {
  Sprout,
  Plane,
  Anchor,
  ShieldAlert,
  HeartPulse,
  Building2,
  Truck,
  Zap,
  Radio,
} from 'lucide-react';
import { SectorId } from '@/lib/sectoral/types';
import { SECTOR_CATALOG } from '@/lib/sectoral/rules';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface SectorSelectorProps {
  selectedSector: SectorId;
  onSelectSector: (id: SectorId) => void;
  locationName: string;
}

export const SectorSelector: React.FC<SectorSelectorProps> = ({
  selectedSector,
  onSelectSector,
  locationName,
}) => {
  const { t } = useTranslation();
  const getIcon = (iconName: string, isActive: boolean) => {
    const className = `h-5 w-5 ${isActive ? 'text-blue-600' : 'text-slate-600'}`;
    switch (iconName) {
      case 'Sprout':
        return <Sprout className={className} />;
      case 'Plane':
        return <Plane className={className} />;
      case 'Anchor':
        return <Anchor className={className} />;
      case 'ShieldAlert':
        return <ShieldAlert className={className} />;
      case 'HeartPulse':
        return <HeartPulse className={className} />;
      case 'Building2':
        return <Building2 className={className} />;
      case 'Truck':
        return <Truck className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      default:
        return <Sprout className={className} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Section matching Image 1 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span>{t.sectoral.domainsTitle}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {t.sectoral.chooseSector}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl font-medium">
            {t.sectoral.chooseSectorDesc.replace('{location}', locationName)}
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[11px] text-slate-400 font-medium">
            Active Model: Agro-Met WRF-NCMRWF & IMD Guidelines
          </span>
        </div>
      </div>

      {/* 8-Card Grid (2 rows x 4 columns on desktop) matching Image 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SECTOR_CATALOG.map((sec) => {
          const isActive = selectedSector === sec.id;

          return (
            <button
              key={sec.id}
              onClick={() => onSelectSector(sec.id)}
              className={`text-left p-5 rounded-3xl border transition-all duration-200 relative flex flex-col justify-between h-44 group ${
                isActive
                  ? 'bg-white border-blue-500 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
                  : 'bg-white hover:bg-slate-50/80 border-slate-200/80 shadow-sm hover:border-slate-300'
              }`}
            >
              {/* Top Row: Icon + Tag */}
              <div className="flex items-start justify-between w-full">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-colors ${
                    isActive ? 'bg-blue-50 border border-blue-200' : 'bg-slate-100 border border-slate-200'
                  }`}
                >
                  {getIcon(sec.iconName, isActive)}
                </div>

                {isActive ? (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Active
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {sec.tag}
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div className="my-auto pt-2">
                <h3
                  className={`text-sm font-bold tracking-tight ${
                    isActive ? 'text-slate-900 font-extrabold' : 'text-slate-800'
                  }`}
                >
                  {(t.sectoral as Record<string, string>)[sec.id] || sec.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {sec.description}
                </p>
              </div>

              {/* Bottom Action */}
              <div className="pt-2 border-t border-slate-100 w-full flex items-center justify-between">
                <span
                  className={`text-xs font-semibold flex items-center gap-1 transition-colors ${
                    isActive ? 'text-blue-600 font-bold' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                >
                  <span>{t.common.viewMore}</span>
                  <span>&gt;</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
