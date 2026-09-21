import React from 'react';
import { formatShortAED } from '../utils/formatters';
import { CheckCircle2, AlertCircle, Coins } from 'lucide-react';

export function MetricsOverview({ units, activeFilter, setActiveFilter }) {
  const totalDue = units.reduce((acc, u) => acc + (Number(u.monthlyRate) || 0), 0);
  
  const totalCollected = units.reduce((acc, u) => acc + (Number(u.paidAmount) || 0), 0);
  const totalPending = units.reduce((acc, u) => {
    const pend = u.pendingBalance !== undefined ? Number(u.pendingBalance) : (u.status === 'paid' ? 0 : Number(u.monthlyRate) || 0);
    return acc + pend;
  }, 0);

  const paidUnits = units.filter(u => {
    const pend = u.pendingBalance !== undefined ? u.pendingBalance : (u.status === 'paid' ? 0 : u.monthlyRate);
    return pend <= 0;
  });

  const unpaidUnits = units.filter(u => {
    const pend = u.pendingBalance !== undefined ? u.pendingBalance : (u.status === 'paid' ? 0 : u.monthlyRate);
    return pend > 0;
  });

  const partialUnits = units.filter(u => (u.paidAmount || 0) > 0 && (u.pendingBalance || 0) > 0);
  
  const percentCollected = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* 3 Minimal KPI Badges */}
      <div className="grid grid-cols-3 gap-2">
        {/* Total Billed */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Billed
          </div>
          <div className="mt-1">
            <div className="text-base font-bold text-slate-900 leading-tight">
              {formatShortAED(totalDue)}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              {units.length} flats
            </div>
          </div>
        </div>

        {/* Collected */}
        <div className="bg-emerald-50/60 rounded-2xl p-3 border border-emerald-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
              Collected
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-1">
            <div className="text-base font-bold text-emerald-950 leading-tight">
              {formatShortAED(totalCollected)}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold">
              {percentCollected}% ({paidUnits.length})
            </div>
          </div>
        </div>

        {/* Pending / Overdue */}
        <div className="bg-amber-50/70 rounded-2xl p-3 border border-amber-200/70 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
              Due
            </span>
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-1">
            <div className="text-base font-bold text-amber-950 leading-tight">
              {formatShortAED(totalPending)}
            </div>
            <div className="text-[10px] text-amber-700 font-medium">
              {unpaidUnits.length} flats {partialUnits.length > 0 && `(${partialUnits.length} partial)`}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentCollected}%` }}
        />
      </div>

      {/* Filter Tabs (Minimal Pills) */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/50 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setActiveFilter('all')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
            activeFilter === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({units.length})
        </button>
        <button
          onClick={() => setActiveFilter('unpaid')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
            activeFilter === 'unpaid'
              ? 'bg-white text-amber-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Due ({unpaidUnits.length})
        </button>
        <button
          onClick={() => setActiveFilter('paid')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
            activeFilter === 'paid'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Paid ({paidUnits.length})
        </button>
      </div>
    </div>
  );
}
