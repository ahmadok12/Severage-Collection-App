import React, { useState } from 'react';
import { formatAED, formatDate } from '../utils/formatters';
import { Search, Receipt, Download, MessageCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { buildWhatsAppVoucherUrl } from '../utils/whatsapp';

export function VoucherHistory({ vouchers, property, onSelectVoucher }) {
  const [search, setSearch] = useState('');

  const filtered = vouchers.filter(v => {
    const q = search.toLowerCase();
    return (
      v.unitNumber.toLowerCase().includes(q) ||
      v.tenantName.toLowerCase().includes(q) ||
      v.id.toLowerCase().includes(q) ||
      (v.paymentMethod && v.paymentMethod.toLowerCase().includes(q))
    );
  });

  const totalCollectedHistory = vouchers.reduce((acc, v) => acc + (Number(v.totalAmount) || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Voucher Archive</h2>
          <p className="text-xs text-slate-500 font-mono">
            {vouchers.length} issued • {formatAED(totalCollectedHistory)}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search by flat, tenant, or voucher #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
          <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-500">No vouchers found</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Collect payments to generate vouchers</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((voucher) => {
            return (
              <div
                key={voucher.id}
                onClick={() => onSelectVoucher(voucher)}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs hover:border-slate-300 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 text-teal-800">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900">Unit {voucher.unitNumber}</span>
                      <span className="text-[10px] font-mono text-slate-400 truncate">{voucher.id}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate mt-0.5">
                      {voucher.tenantName} • <span className="text-slate-400">{voucher.paymentMethod}</span>
                    </p>
                    <p className="text-[10px] text-teal-700 font-medium">
                      {voucher.month} • {formatDate(voucher.paidDate)}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-slate-900 font-mono">
                    {formatAED(voucher.totalAmount)}
                  </div>
                  <div className="mt-1.5 flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = buildWhatsAppVoucherUrl(voucher, property);
                        window.open(url, '_blank');
                      }}
                      className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                      title="Send on WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectVoucher(voucher);
                      }}
                      className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                      title="View & Download"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
