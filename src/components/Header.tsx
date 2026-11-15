import React from 'react';
import { LogOut, Printer } from 'lucide-react';

export interface NavTab {
  id: string;
  label: string;
}

interface HeaderProps {
  mode: 'portal' | 'student' | 'teacher' | 'lesson-plan';
  activeTab: string;
  onSelectTab: (tab: string) => void;
  navTabs: NavTab[];
  userLabel: string;
  onSwitchUser: () => void;
  onPrint?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  activeTab,
  onSelectTab,
  navTabs,
  userLabel,
  onSwitchUser,
  onPrint,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#090E1A]/95 backdrop-blur-md border-b border-slate-800/90 no-print">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab(navTabs[0]?.id || 'portal')}
          className="text-base md:text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer hover:text-cyan-300 transition-colors"
        >
          مختبر الحلقات المتداخلة
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        {navTabs.length > 0 && (
          <nav className="hidden lg:flex items-center gap-6 overflow-x-auto no-scrollbar">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  className={`py-1.5 text-sm font-semibold whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                    isActive
                      ? 'text-cyan-300 border-cyan-400'
                      : 'text-slate-300 border-transparent hover:text-white hover:border-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        )}

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {mode === 'teacher' && onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة</span>
            </button>
          )}
          <button
            type="button"
            onClick={onSwitchUser}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="max-w-[160px] truncate">{userLabel}</span>
          </button>
        </div>
      </div>

      {/* Responsive secondary mobile/tablet tab row only below lg */}
      {navTabs.length > 0 && (
        <div className="lg:hidden border-t border-slate-800/80 px-4 py-2 overflow-x-auto no-scrollbar flex items-center gap-2">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-900 text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
