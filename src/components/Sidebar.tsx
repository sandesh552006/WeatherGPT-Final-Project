'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  MessageSquareCode,
  SunMedium,
  MapPin,
  Compass,
  AlertTriangle,
  History,
  Briefcase,
  Globe,
  ChevronDown,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/lib/i18n/types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { language, setLanguage, t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMobileLangMenu, setShowMobileLangMenu] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const mobileLangMenuRef = useRef<HTMLDivElement>(null);

  // Restore collapsed state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('weathergpt_sidebar_collapsed');
      if (saved === 'true') {
        setIsCollapsed(true);
      }
    } catch {}
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('weathergpt_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
      if (mobileLangMenuRef.current && !mobileLangMenuRef.current.contains(e.target as Node)) {
        setShowMobileLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const navItems = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'ask-weathergpt', label: t.nav.askWeatherGPT, icon: Sparkles, badge: 'AI' },
    { id: 'forecast', label: t.nav.forecast, icon: SunMedium },
    { id: 'maps', label: t.nav.maps, icon: Compass },
    { id: 'alerts', label: t.nav.alerts, icon: AlertTriangle },
    { id: 'climate', label: t.nav.climate, icon: History },
    { id: 'sectoral', label: t.nav.sectoral, icon: Briefcase },
  ];

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <>
      {/* Desktop Persistent Sidebar (Hidden on mobile < md) */}
      <aside
        className={`${
          isCollapsed ? 'w-[72px]' : 'w-64'
        } hidden md:flex flex-shrink-0 bg-[#0b192c] text-slate-300 flex-col justify-between h-screen border-r border-slate-800/80 select-none transition-all duration-300 ease-in-out relative z-30`}
      >
      {/* Top Brand Logo & Toggle Header */}
      <div className={isCollapsed ? 'p-3 pt-5' : 'p-5'}>
        {isCollapsed ? (
          // Collapsed Top: Centered Logo & Expand Button
          <div className="flex flex-col items-center gap-2.5">
            <div className="group relative">
              <img
                src="/weathergpt-logo.jpg"
                alt="WeatherGPT Logo"
                className="h-10 w-10 object-contain rounded-xl shadow-md shadow-blue-500/20 cursor-pointer transition-transform hover:scale-105"
                onClick={toggleCollapse}
              />
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700/60">
                WeatherGPT
              </div>
            </div>
            <button
              type="button"
              onClick={toggleCollapse}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          // Expanded Top: Logo + Title + Subtitle + Collapse Button
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/weathergpt-logo.jpg"
                alt="WeatherGPT Logo"
                className="h-10 w-10 object-contain rounded-xl shadow-md shadow-blue-500/20 flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-base font-bold text-white tracking-tight truncate">
                  WeatherGPT
                </h1>
                <p className="text-[11px] text-slate-400 font-normal truncate">
                  {t.nav.companionSubtitle || 'Your Weather Companion'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleCollapse}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors flex-shrink-0 ml-1"
              title="Collapse Sidebar"
              aria-label="Collapse Sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className={`mt-8 space-y-1.5 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (isCollapsed) {
              return (
                <div key={item.id} className="relative group w-full flex justify-center">
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all duration-200 relative ${
                      isActive
                        ? 'bg-[#1d68f5] text-white shadow-lg shadow-blue-600/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                    }`}
                    aria-label={item.label}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {item.badge && !isActive && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-[#0b192c]" />
                    )}
                  </button>

                  {/* Floating Tooltip */}
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700/60">
                    {item.label}
                    {item.badge && (
                      <span className="ml-1.5 text-[9px] bg-blue-500/30 text-blue-300 font-semibold px-1 py-0.2 rounded">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#1d68f5] text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && !isActive && (
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Section */}
      <div className={isCollapsed ? 'p-3 pb-5 border-t border-slate-800/80' : 'p-5 border-t border-slate-800/80 space-y-4'}>
        {/* Language Selector */}
        {isCollapsed ? (
          // Collapsed Language: Globe Icon with popover to the right
          <div className="relative flex justify-center" ref={langMenuRef}>
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors shadow-sm group relative"
              aria-label="Change Language"
            >
              <Globe className="h-4 w-4 text-blue-400" />
              {/* Tooltip */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700/60">
                {currentLangObj.nativeName} ({currentLangObj.label})
              </div>
            </button>

            {/* Floating Language Popover when collapsed */}
            {showLangMenu && (
              <div className="fixed left-[76px] bottom-6 w-60 max-h-72 overflow-y-auto bg-[#0e1e36] border border-slate-700/80 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[10px] uppercase font-semibold text-slate-400 px-2.5 py-1">
                  {t.common.language}
                </div>
                <div className="space-y-0.5">
                  {SUPPORTED_LANGUAGES.map((opt) => {
                    const isSelected = language === opt.code;
                    return (
                      <button
                        key={opt.code}
                        onClick={() => {
                          setLanguage(opt.code);
                          setShowLangMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-[#1d68f5] text-white'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex-shrink-0">{opt.flag}</span>
                          <span className="truncate">{opt.nativeName}</span>
                          <span className={`text-[11px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                            ({opt.label})
                          </span>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Expanded Language: Full width selector
          <div className="relative" ref={langMenuRef}>
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:bg-slate-800/60 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Globe className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                <span className="font-medium text-slate-200 truncate">{currentLangObj.nativeName}</span>
                <span className="text-[10px] text-slate-400 truncate">({currentLangObj.label})</span>
              </div>
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                  showLangMenu ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Language Menu Dropdown */}
            {showLangMenu && (
              <div className="absolute bottom-full mb-2 left-0 right-0 max-h-72 overflow-y-auto bg-[#0e1e36] border border-slate-700/80 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[10px] uppercase font-semibold text-slate-400 px-2.5 py-1">
                  {t.common.language}
                </div>
                <div className="space-y-0.5">
                  {SUPPORTED_LANGUAGES.map((opt) => {
                    const isSelected = language === opt.code;
                    return (
                      <button
                        key={opt.code}
                        onClick={() => {
                          setLanguage(opt.code);
                          setShowLangMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-[#1d68f5] text-white'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex-shrink-0">{opt.flag}</span>
                          <span className="truncate">{opt.nativeName}</span>
                          <span className={`text-[11px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                            ({opt.label})
                          </span>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Official IMD Branding Footer */}
        {isCollapsed ? (
          <div className="relative group flex justify-center pt-3">
            <div className="h-6 w-6 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-[9px] font-bold text-sky-400 cursor-default">
              IMD
            </div>
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 text-slate-300 text-[11px] rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700/60 text-left">
              <p className="font-semibold text-white">{t.nav.imd || 'India Meteorological Department'}</p>
              <p className="text-[10px] text-slate-400">{t.nav.moes || 'Ministry of Earth Sciences'} • {t.nav.govIndia || 'Govt of India'}</p>
            </div>
          </div>
        ) : (
          <div className="pt-2 text-center">
            <p className="text-[10px] text-slate-400 leading-tight">
              {t.nav.imd}
            </p>
            <p className="text-[9px] text-slate-500 leading-tight mt-0.5">
              {t.nav.moes}
            </p>
            <p className="text-[9px] text-slate-500 leading-tight">
              {t.nav.govIndia}
            </p>
            <p className="text-[11px] font-semibold text-[#38bdf8] mt-2 tracking-wide">
              Weather for a Safer Tomorrow
            </p>
          </div>
        )}
      </div>
    </aside>

    {/* Mobile Slide-Over Drawer (Only on screens < md) */}
    {isOpenMobile && (
      <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
        {/* Backdrop overlay */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          onClick={onCloseMobile}
          aria-hidden="true"
        />

        {/* Drawer Panel */}
        <aside
          className="relative w-72 max-w-[85vw] h-full bg-[#0b192c] text-slate-300 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-250 border-r border-slate-800/80 select-none overflow-y-auto"
        >
          {/* Top Brand Logo & Close Button */}
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src="/weathergpt-logo.jpg"
                  alt="WeatherGPT Logo"
                  className="h-10 w-10 object-contain rounded-xl shadow-md shadow-blue-500/20 flex-shrink-0"
                />
                <div className="min-w-0">
                  <h1 className="text-base font-bold text-white tracking-tight truncate">
                    WeatherGPT
                  </h1>
                  <p className="text-[11px] text-slate-400 font-normal truncate">
                    {t.nav.companionSubtitle || 'Your Weather Companion'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors flex-shrink-0 ml-1"
                title="Close Navigation"
                aria-label="Close Navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="mt-8 space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      onCloseMobile?.();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#1d68f5] text-white shadow-lg shadow-blue-600/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && !isActive && (
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Footer Section for Mobile Drawer */}
          <div className="p-5 border-t border-slate-800/80 space-y-4">
            {/* Language Selector */}
            <div className="relative" ref={mobileLangMenuRef}>
              <button
                type="button"
                onClick={() => setShowMobileLangMenu(!showMobileLangMenu)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:bg-slate-800/60 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Globe className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                  <span className="font-medium text-slate-200 truncate">{currentLangObj.nativeName}</span>
                  <span className="text-[10px] text-slate-400 truncate">({currentLangObj.label})</span>
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                    showMobileLangMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Mobile Language Dropdown */}
              {showMobileLangMenu && (
                <div className="absolute bottom-full mb-2 left-0 right-0 max-h-60 overflow-y-auto bg-[#0e1e36] border border-slate-700/80 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[10px] uppercase font-semibold text-slate-400 px-2.5 py-1">
                    {t.common.language}
                  </div>
                  <div className="space-y-0.5">
                    {SUPPORTED_LANGUAGES.map((opt) => {
                      const isSelected = language === opt.code;
                      return (
                        <button
                          key={opt.code}
                          onClick={() => {
                            setLanguage(opt.code);
                            setShowMobileLangMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-[#1d68f5] text-white'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="flex-shrink-0">{opt.flag}</span>
                            <span className="truncate">{opt.nativeName}</span>
                            <span className={`text-[11px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                              ({opt.label})
                            </span>
                          </div>
                          {isSelected && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* IMD Footer */}
            <div className="pt-2 text-center">
              <p className="text-[10px] text-slate-400 leading-tight">
                {t.nav.imd}
              </p>
              <p className="text-[9px] text-slate-500 leading-tight mt-0.5">
                {t.nav.moes}
              </p>
              <p className="text-[9px] text-slate-500 leading-tight">
                {t.nav.govIndia}
              </p>
              <p className="text-[11px] font-semibold text-[#38bdf8] mt-2 tracking-wide">
                Weather for a Safer Tomorrow
              </p>
            </div>
          </div>
        </aside>
      </div>
    )}
  </>
  );
};
