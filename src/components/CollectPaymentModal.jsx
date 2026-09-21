import React, { useState, useEffect } from 'react';
import { X, Check, Banknote, Building, CreditCard, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatAED, generateVoucherId } from '../utils/formatters';

const PAYMENT_METHODS = [
  { id: 'Cash', label: 'Cash', icon: Banknote },
  { id: 'Bank Transfer', label: 'Transfer', icon: Building },
  { id: 'Cheque', label: 'Cheque', icon: FileText },
  { id: 'Card/Deposit', label: 'Deposit', icon: CreditCard },
];

export function CollectPaymentModal({ 
  unit, 
  property, 
  currentMonth, 
  isOpen, 
  onClose, 
  onSavePayment 
}) {
  if (!isOpen || !unit) return null;

  const totalFee = Number(unit.monthlyRate) || 0;
  const alreadyPaid = Number(unit.paidAmount) || 0;
  const pendingDue = unit.pendingBalance !== undefined ? Number(unit.pendingBalance) : Math.max(0, totalFee - alreadyPaid);

  const [amount, setAmount] = useState(pendingDue > 0 ? pendingDue : totalFee);
  const [method, setMethod] = useState('Cash');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    setAmount(pendingDue > 0 ? pendingDue : totalFee);
  }, [unit, pendingDue, totalFee]);

  const payNow = Number(amount) || 0;
  const newBalanceRemaining = Math.max(0, pendingDue - payNow);
  const isPartial = newBalanceRemaining > 0;
  const isOverpaying = payNow > pendingDue;

  const vatRate = property?.applyVat ? (property?.vatRate || 5) : 0;
  const baseAmount = vatRate > 0 ? (payNow / (1 + vatRate / 100)) : payNow;
  const vatAmount = payNow - baseAmount;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (payNow <= 0) {
      alert('Please enter a payment amount greater than 0');
      return;
    }

    const voucher = {
      id: generateVoucherId(unit.unitNumber),
      unitId: unit.id,
      unitNumber: unit.unitNumber,
      tenantName: unit.tenantName,
      phone: unit.phone,
      month: currentMonth,
      billAmount: totalFee,
      baseAmount: Math.round(baseAmount * 100) / 100,
      vatAmount: Math.round(vatAmount * 100) / 100,
      totalAmount: payNow,
      previousPaid: alreadyPaid,
      cumulativePaid: alreadyPaid + payNow,
      balanceRemaining: newBalanceRemaining,
      isPartial: isPartial,
      paymentMethod: method,
      reference: reference.trim() || `${method} Payment`,
      paidDate: date,
      aspclAccount: unit.aspclSubmeter || property.aspclAccount,
      tasdeeqNo: unit.tasdeeqNo || 'N/A',
      notes: notes.trim() || (isPartial ? `Part payment of ${formatAED(payNow)} (${formatAED(newBalanceRemaining)} remaining)` : 'Full settlement')
    };

    onSavePayment(unit.id, voucher, payNow, newBalanceRemaining);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4">
      <div 
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden animate-in fade-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Record Payment</span>
            <h2 className="text-base font-bold text-slate-900">
              Unit {unit.unitNumber} • {unit.tenantName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Fee & Pending Balance Breakdown Banner */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Total Monthly Charge:</span>
              <span className="font-bold font-mono text-slate-900">{formatAED(totalFee)}</span>
            </div>
            {alreadyPaid > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Already Paid This Month:</span>
                <span className="font-bold font-mono">{formatAED(alreadyPaid)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-900 font-extrabold pt-1 border-t border-slate-200">
              <span>Current Outstanding Due:</span>
              <span className="text-amber-700 font-mono text-sm">{formatAED(pendingDue)}</span>
            </div>
          </div>

          {/* Amount field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-600">
                Amount Collecting Now (AED)
              </label>
              {pendingDue > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(pendingDue)}
                  className="text-[11px] font-bold text-teal-700 hover:underline"
                >
                  Pay Full ({formatAED(pendingDue)})
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-3 pr-14 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                AED
              </span>
            </div>

            {/* Live Status indicator based on entered amount */}
            <div className="mt-2">
              {isPartial ? (
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    Partial Payment: <strong className="font-mono">{formatAED(newBalanceRemaining)}</strong> will remain pending.
                  </span>
                </div>
              ) : isOverpaying ? (
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Full settlement + advance of {formatAED(payNow - pendingDue)}.</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Full Settlement: Balance will be AED 0.00</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((m) => {
                const Icon = m.icon;
                const isSelected = method === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reference & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Reference / Receipt #
              </label>
              <input
                type="text"
                placeholder={method === 'Cash' ? 'e.g. Cash Receipt 01' : 'e.g. Bank Trx # / Cheque #'}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Payment Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Internal Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Balance to be paid on 15th"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-2 pb-safe">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm shadow-teal-600/20 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{isPartial ? 'Save Partial & Issue Voucher' : 'Save & Issue Full Voucher'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
