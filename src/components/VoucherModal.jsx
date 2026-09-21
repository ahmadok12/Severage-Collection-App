import React, { useRef, useState } from 'react';
import { X, Download, Printer, Share2, CheckCircle2, Building, ShieldCheck, MessageCircle, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { formatAED, formatDate } from '../utils/formatters';
import { buildWhatsAppVoucherUrl } from '../utils/whatsapp';

export function VoucherModal({ voucher, property, isOpen, onClose }) {
  if (!isOpen || !voucher) return null;

  const voucherRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const isPartial = Boolean(voucher.isPartial || (voucher.balanceRemaining && voucher.balanceRemaining > 0));
  const remaining = Number(voucher.balanceRemaining) || 0;

  // Handle Download PNG
  const handleDownloadImage = async () => {
    if (!voucherRef.current) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(voucherRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Voucher-${voucher.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setDownloading(false);
    }
  };

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

  // Handle WhatsApp share
  const handleWhatsAppShare = () => {
    const url = buildWhatsAppVoucherUrl(voucher, property);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Action Toolbar Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-700">Digital Payment Voucher</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg hover:bg-slate-200/80 text-slate-600 transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadImage}
              disabled={downloading}
              className="p-1.5 rounded-lg hover:bg-slate-200/80 text-slate-600 transition-colors"
              title="Download PNG"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Printable / Renderable Voucher Body */}
        <div className="p-5" ref={voucherRef} id="printable-voucher">
          <div className="border border-slate-200 rounded-2xl p-5 bg-white relative overflow-hidden">
            {/* Top decorative stripe */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${
              isPartial 
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600'
                : 'bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-700'
            }`} />

            {/* Header / Authority Info */}
            <div className="flex items-start justify-between gap-3 border-b border-dashed border-slate-200 pb-3.5 mb-3.5">
              <div>
                <div className="flex items-center gap-1.5 text-teal-700">
                  <Building className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">{property?.name}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Ajman, UAE • ASPCL: <span className="font-mono font-semibold">{voucher.aspclAccount || property?.aspclAccount}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400">VOUCHER #</div>
                <div className="text-xs font-mono font-bold text-slate-900">{voucher.id}</div>
              </div>
            </div>

            {/* Title & Status Badge */}
            <div className="text-center my-2">
              <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide border ${
                isPartial 
                  ? 'bg-amber-50 text-amber-900 border-amber-200' 
                  : 'bg-teal-50 text-teal-900 border-teal-100'
              }`}>
                {isPartial ? 'Sewerage Fee — Partial Payment Voucher' : 'Sewerage Fee Payment Voucher'}
              </span>
            </div>

            {/* Details Grid */}
            <div className="bg-slate-50/80 rounded-xl p-3 space-y-2 border border-slate-100 text-xs my-3.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Unit Number:</span>
                <span className="font-bold text-slate-900 font-mono">Flat {voucher.unitNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tenant Name:</span>
                <span className="font-semibold text-slate-900">{voucher.tenantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billing Month:</span>
                <span className="font-bold text-teal-800">{voucher.month}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Date:</span>
                <span className="font-mono text-slate-800">{formatDate(voucher.paidDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-semibold text-slate-800">{voucher.paymentMethod}</span>
              </div>
              {voucher.reference && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Reference / Trx:</span>
                  <span className="font-mono text-slate-700 text-[11px]">{voucher.reference}</span>
                </div>
              )}
              {voucher.tasdeeqNo && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Tasdeeq Lease #:</span>
                  <span className="font-mono text-slate-600 text-[11px]">{voucher.tasdeeqNo}</span>
                </div>
              )}
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-1.5 text-xs border-t border-dashed border-slate-200 pt-3">
              {voucher.billAmount && (
                <div className="flex justify-between text-slate-500">
                  <span>Total Bill Amount:</span>
                  <span className="font-mono font-medium">{formatAED(voucher.billAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Base Charge (settled now):</span>
                <span className="font-mono">{formatAED(voucher.baseAmount || voucher.totalAmount)}</span>
              </div>
              {voucher.vatAmount > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>UAE VAT (5%):</span>
                  <span className="font-mono">{formatAED(voucher.vatAmount)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Amount Paid Now:</span>
                <span className="text-teal-700 font-mono">{formatAED(voucher.totalAmount)}</span>
              </div>

              {/* Remaining Balance indicator */}
              <div className="flex justify-between text-xs font-bold pt-1">
                <span className={isPartial ? 'text-amber-800' : 'text-slate-500'}>
                  {isPartial ? 'Remaining Balance Due:' : 'Balance Outstanding:'}
                </span>
                <span className={`font-mono ${isPartial ? 'text-amber-800 font-extrabold text-sm' : 'text-emerald-700'}`}>
                  {formatAED(remaining)}
                </span>
              </div>
            </div>

            {/* Verified Stamp */}
            <div className="mt-4 flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Digitally Verified & Logged</span>
              </div>

              {/* Official Stamp */}
              {isPartial ? (
                <div className="border-2 border-amber-600 text-amber-700 px-2.5 py-1 rounded-lg text-center rotate-[-3deg] opacity-95">
                  <div className="text-[9px] font-black tracking-widest uppercase leading-none">SEWERAGE AJMAN</div>
                  <div className="text-[10px] font-black uppercase tracking-wider leading-tight flex items-center justify-center gap-0.5">
                    <AlertCircle className="w-3 h-3" /> PARTIAL PAID
                  </div>
                  <div className="text-[8px] font-mono leading-none">{voucher.paidDate}</div>
                </div>
              ) : (
                <div className="border-2 border-emerald-600 text-emerald-700 px-2.5 py-1 rounded-lg text-center rotate-[-4deg] opacity-90">
                  <div className="text-[9px] font-black tracking-widest uppercase leading-none">SEWERAGE AJMAN</div>
                  <div className="text-[11px] font-black uppercase tracking-wider leading-tight flex items-center justify-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> PAID IN FULL
                  </div>
                  <div className="text-[8px] font-mono leading-none">{voucher.paidDate}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom CTA Action Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={handleWhatsAppShare}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-97 text-white text-xs font-bold transition-all shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send to Tenant</span>
          </button>

          <button
            onClick={handleDownloadImage}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-97 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Saving...' : 'Save Voucher'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
