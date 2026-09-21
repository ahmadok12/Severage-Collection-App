import React from 'react';
import { Building2, ChevronLeft, ChevronRight, Calendar, Plus, RefreshCw } from 'lucide-react';

export function Header({ 
  property, 
  currentMonth, 
  onPrevMonth, 
  onNextMonth, 
  onOpenAddUnit,
  onResetMonthCycle 
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 pt-safe transition-all">
      <div className="max-w-md mx-auto px-4 py-3">
        {/* Top line: Property info & ASPCL Badge */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-teal-600/20">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-slate-900 truncate leading-tight">
                {property.name}
              </h1>
              <p className="text-[11px] font-mono text-teal-700 font-medium truncate">
                {property.aspclAccount} • {property.city}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAddUnit}
            className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-sm transition-all shrink-0"
            title="Add Unit"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Unit</span>
          </button>
        </div>

        {/* Month Navigation & Cycle Reset */}
        <div className="flex items-center justify-between bg-slate-100/90 p-1 rounded-xl">
          <button
            onClick={onPrevMonth}
            className="p-1.5 rounded-lg hover:bg-white active:scale-90 text-slate-600 hover:text-slate-900 transition-all"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>{currentMonth}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onResetMonthCycle}
              className="p-1.5 rounded-lg hover:bg-white active:scale-90 text-slate-500 hover:text-teal-700 transition-all"
              title="Reset billing status for this month"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onNextMonth}
              className="p-1.5 rounded-lg hover:bg-white active:scale-90 text-slate-600 hover:text-slate-900 transition-all"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
