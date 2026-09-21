import React from 'react';
import { formatAED } from '../utils/formatters';
import { buildWhatsAppReminderUrl } from '../utils/whatsapp';
import { MessageCircle, Receipt, CheckCircle, Clock, AlertTriangle, Edit3, Coins } from 'lucide-react';

export function UnitCard({ 
  unit, 
  property, 
  currentMonth, 
  onCollect, 
  onViewVoucher, 
  onEditUnit 
}) {
  const isPaid = unit.status === 'paid';
  const isPartial = unit.status === 'partial' || (unit.paidAmount > 0 && unit.pendingBalance > 0);
  const isOverdue = unit.status === 'overdue';

  const pendingAmount = unit.pendingBalance !== undefined ? unit.pendingBalance : (isPaid ? 0 : unit.monthlyRate);
  const paidAmount = unit.paidAmount || 0;

  const handleWhatsAppReminder = (e) => {
    e.stopPropagation();
    const url = buildWhatsAppReminderUrl(unit, property, currentMonth);
    window.open(url, '_blank');
  };

  const getStatusBadge = () => {
    if (isPaid) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100/80 text-emerald-800">
          <CheckCircle className="w-3 h-3" />
          Paid
        </span>
      );
    }
    if (isPartial) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-200/80">
          <Coins className="w-3 h-3 text-amber-700" />
          Partial: {formatAED(pendingAmount)} Due
        </span>
      );
    }
    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">
          <AlertTriangle className="w-3 h-3" />
          Overdue
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
        <Clock className="w-3 h-3" />
        Due
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
      {/* Top row: Unit No + Tenant + Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          {/* Unit # Pill */}
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/70 flex flex-col items-center justify-center shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">Unit</span>
            <span className="text-sm font-extrabold text-slate-900 leading-tight">{unit.unitNumber}</span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                {unit.tenantName}
              </h3>
              <button 
                onClick={() => onEditUnit(unit)}
                className="text-slate-400 hover:text-slate-600 p-0.5 transition-colors"
                title="Edit Unit"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
            
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              {unit.type} • +{unit.phone}
            </p>
            {unit.tasdeeqNo && (
              <p className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
                Tasdeeq: {unit.tasdeeqNo}
              </p>
            )}
          </div>
        </div>

        {/* Right column: Amount & Status */}
        <div className="text-right">
          <div className="text-sm font-bold text-slate-900">
            {formatAED(unit.monthlyRate)}
          </div>
          <div className="mt-1 flex justify-end">
            {getStatusBadge()}
          </div>
          {isPartial && (
            <div className="text-[10px] font-mono mt-1 text-slate-500">
              Paid: <span className="text-emerald-700 font-semibold">{formatAED(paidAmount)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
        {/* WhatsApp Manual Reminder */}
        <button
          onClick={handleWhatsAppReminder}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:scale-97 text-emerald-800 text-xs font-bold transition-all border border-emerald-200/60"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>WhatsApp</span>
        </button>

        {/* Action Button: If fully paid -> View Voucher. If partial -> Collect Balance & Voucher. If unpaid -> Collect */}
        {isPaid ? (
          <button
            onClick={() => onViewVoucher(unit)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-97 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Receipt className="w-3.5 h-3.5 text-teal-300" />
            <span>Voucher</span>
          </button>
        ) : isPartial ? (
          <div className="flex-1 flex items-center gap-1.5">
            <button
              onClick={() => onCollect(unit)}
              className="flex-1 flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-97 text-white text-xs font-bold transition-all shadow-xs shadow-teal-600/20"
              title="Collect remaining balance"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Collect Bal</span>
            </button>
            <button
              onClick={() => onViewVoucher(unit)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-97 text-slate-700 text-xs font-bold transition-all"
              title="View partial voucher"
            >
              <Receipt className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onCollect(unit)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-97 text-white text-xs font-bold transition-all shadow-xs shadow-teal-600/20"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Collect</span>
          </button>
        )}
      </div>
    </div>
  );
}
