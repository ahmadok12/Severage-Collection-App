import React, { useState, useRef } from 'react';
import { formatAED, formatDate } from '../utils/formatters';
import { 
  BarChart3, 
  FileSpreadsheet, 
  Printer, 
  Download, 
  MessageCircle, 
  Building2, 
  ChevronRight, 
  User, 
  Coins, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { buildWhatsAppStatementUrl } from '../utils/whatsapp';

export function ReportsView({ units, vouchers, property, currentMonth }) {
  const [selectedUnitId, setSelectedUnitId] = useState(units[0]?.id || '');
  const [activeSubTab, setActiveSubTab] = useState('detailed'); // 'detailed' | 'summary'
  const [downloading, setDownloading] = useState(false);
  const statementRef = useRef(null);

  // Compute property-wide recovery metrics
  const totalBilledDebit = units.reduce((acc, u) => acc + (Number(u.monthlyRate) || 0), 0);
  const totalRecoveredCredit = units.reduce((acc, u) => acc + (Number(u.paidAmount) || 0), 0);
  const totalNetBalance = units.reduce((acc, u) => {
    const pend = u.pendingBalance !== undefined ? Number(u.pendingBalance) : Math.max(0, u.monthlyRate - (u.paidAmount || 0));
    return acc + pend;
  }, 0);
  const recoveryRate = totalBilledDebit > 0 ? Math.round((totalRecoveredCredit / totalBilledDebit) * 100) : 0;

  // Selected Unit Data
  const selectedUnit = units.find(u => u.id === selectedUnitId) || units[0];

  // Build Chronological Debit / Credit Ledger for the selected unit
  const buildUnitStatement = (unit) => {
    if (!unit) return { rows: [], totalDebit: 0, totalCredit: 0, netBalance: 0 };

    const rows = [];
    let runningBalance = 0;

    // 1. Initial Monthly Billing Charge (Debit)
    const billAmount = Number(unit.monthlyRate) || 0;
    runningBalance += billAmount;
    rows.push({
      date: '2026-09-01',
      description: `Monthly Sewerage Charge (${currentMonth})`,
      refNo: `INV-${unit.unitNumber}-0926`,
      debit: billAmount,
      credit: 0,
      balance: runningBalance,
      type: 'charge'
    });

    // 2. Payments (Credits) from vouchers
    const unitVouchers = vouchers
      .filter(v => v.unitId === unit.id || v.unitNumber === unit.unitNumber)
      .sort((a, b) => new Date(a.paidDate) - new Date(b.paidDate));

    if (unitVouchers.length > 0) {
      unitVouchers.forEach((v) => {
        const payAmount = Number(v.totalAmount) || 0;
        runningBalance = Math.max(0, runningBalance - payAmount);
        rows.push({
          date: v.paidDate || '2026-09-02',
          description: `Payment Received (${v.paymentMethod}) - ${v.reference || 'Settlement'}`,
          refNo: v.id,
          debit: 0,
          credit: payAmount,
          balance: runningBalance,
          type: 'payment'
        });
      });
    } else if (unit.paidAmount > 0) {
      // If paid amount exists but voucher not explicitly in array
      const payAmount = Number(unit.paidAmount);
      runningBalance = Math.max(0, runningBalance - payAmount);
      rows.push({
        date: unit.lastPaidDate || '2026-09-03',
        description: `Payment Received - Direct Settlement`,
        refNo: unit.lastVoucherId || `VCH-${unit.unitNumber}-01`,
        debit: 0,
        credit: payAmount,
        balance: runningBalance,
        type: 'payment'
      });
    }

    const totalDebit = billAmount;
    const totalCredit = unit.paidAmount || (totalDebit - runningBalance);
    const netBalance = unit.pendingBalance !== undefined ? unit.pendingBalance : runningBalance;

    return { rows, totalDebit, totalCredit, netBalance };
  };

  const statement = buildUnitStatement(selectedUnit);

  // Download statement as PNG image
  const handleDownloadStatement = async () => {
    if (!statementRef.current) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(statementRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Statement-Unit-${selectedUnit?.unitNumber}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setDownloading(false);
    }
  };

  // Print statement
  const handlePrint = () => {
    window.print();
  };

  // WhatsApp share statement
  const handleShareWhatsApp = () => {
    if (!selectedUnit) return;
    const url = buildWhatsAppStatementUrl(selectedUnit, statement, property);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900">Tenant Recovery Statement</h2>
        <p className="text-xs text-slate-500">
          Accounting statement of recovery in Debit (Dr), Credit (Cr), & Balance style
        </p>
      </div>

      {/* KPI Recovery Metrics (Executive Summary) */}
      <div className="grid grid-cols-3 gap-2">
        {/* Total Invoiced (Debit) */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Billed (Dr)
          </span>
          <div className="text-sm font-extrabold text-slate-900 mt-1">
            {formatAED(totalBilledDebit)}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Total Invoiced</span>
        </div>

        {/* Total Recovered (Credit) */}
        <div className="bg-emerald-50/70 rounded-2xl p-3 border border-emerald-100 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
            Recovered (Cr)
          </span>
          <div className="text-sm font-extrabold text-emerald-950 mt-1">
            {formatAED(totalRecoveredCredit)}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold">{recoveryRate}% Recovered</span>
        </div>

        {/* Outstanding Balance (Pending) */}
        <div className="bg-amber-50/70 rounded-2xl p-3 border border-amber-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
            Pending Bal
          </span>
          <div className="text-sm font-extrabold text-amber-950 mt-1">
            {formatAED(totalNetBalance)}
          </div>
          <span className="text-[10px] text-amber-700 font-medium">Net Recovery Due</span>
        </div>
      </div>

      {/* Sub-Tabs: Individual Statement vs All Tenants Summary */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/50 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('detailed')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
            activeSubTab === 'detailed'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tenant Ledger (Dr/Cr)
        </button>
        <button
          onClick={() => setActiveSubTab('summary')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
            activeSubTab === 'summary'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Tenants Summary
        </button>
      </div>

      {/* VIEW 1: DETAILED TENANT LEDGER STATEMENT */}
      {activeSubTab === 'detailed' && selectedUnit && (
        <div className="space-y-3">
          {/* Tenant Selector */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Select Tenant / Flat:
            </label>
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {units.map((u) => {
                const pend = u.pendingBalance !== undefined ? u.pendingBalance : (u.status === 'paid' ? 0 : u.monthlyRate);
                return (
                  <option key={u.id} value={u.id}>
                    Unit {u.unitNumber} - {u.tenantName} ({pend > 0 ? `Due: ${formatAED(pend)}` : 'Cleared'})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Statement Actions Bar */}
          <div className="flex items-center justify-between gap-2 bg-slate-100/80 p-2 rounded-xl">
            <span className="text-[11px] font-bold text-slate-700 px-1">
              Unit {selectedUnit.unitNumber} Statement
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                title="Send Statement via WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={handlePrint}
                className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs"
                title="Print Statement"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDownloadStatement}
                disabled={downloading}
                className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs"
                title="Download PNG"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Printable / Renderable Statement of Account Document */}
          <div ref={statementRef} id="printable-voucher" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5">
            {/* Statement Official Header */}
            <div className="border-b border-slate-200 pb-3 mb-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-extrabold text-teal-800 uppercase tracking-wider">
                    {property?.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {property?.city} • ASPCL Master: {property?.aspclAccount}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                    Recovery Ledger
                  </span>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                    As of: {new Date().toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>

              {/* Tenant info chip */}
              <div className="mt-3 p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs border border-slate-100">
                <div>
                  <span className="font-extrabold text-slate-900">Unit {selectedUnit.unitNumber}</span>
                  <span className="text-slate-500"> • {selectedUnit.tenantName}</span>
                </div>
                <div className="text-right font-mono text-[11px] text-slate-600">
                  +{selectedUnit.phone}
                </div>
              </div>
            </div>

            {/* Debit, Credit, and Balance Statement Table */}
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                    <th className="py-2 px-1">Date</th>
                    <th className="py-2 px-1">Description / Ref</th>
                    <th className="py-2 px-1 text-right text-slate-700">Debit (Dr)</th>
                    <th className="py-2 px-1 text-right text-emerald-700">Credit (Cr)</th>
                    <th className="py-2 px-1 text-right text-slate-900">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {statement.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-1 text-slate-500 whitespace-nowrap">
                        {formatDate(row.date)}
                      </td>
                      <td className="py-2.5 px-1 font-sans">
                        <div className="font-semibold text-slate-800 leading-tight">
                          {row.description}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {row.refNo}
                        </div>
                      </td>
                      <td className="py-2.5 px-1 text-right text-slate-700 font-medium">
                        {row.debit > 0 ? formatAED(row.debit) : '—'}
                      </td>
                      <td className="py-2.5 px-1 text-right text-emerald-700 font-semibold">
                        {row.credit > 0 ? formatAED(row.credit) : '—'}
                      </td>
                      <td className="py-2.5 px-1 text-right font-bold text-slate-900">
                        {formatAED(row.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300 font-bold text-xs bg-slate-50/60">
                    <td colSpan={2} className="py-2.5 px-1 uppercase font-sans text-slate-700">
                      Total Ledger Recovery:
                    </td>
                    <td className="py-2.5 px-1 text-right font-mono text-slate-800">
                      {formatAED(statement.totalDebit)}
                    </td>
                    <td className="py-2.5 px-1 text-right font-mono text-emerald-700">
                      {formatAED(statement.totalCredit)}
                    </td>
                    <td className="py-2.5 px-1 text-right font-mono text-amber-900 font-extrabold text-sm">
                      {formatAED(statement.netBalance)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Ending Balance Box */}
            <div className="mt-4 p-3 rounded-xl border flex items-center justify-between text-xs bg-slate-50 border-slate-200">
              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                  Net Outstanding Balance
                </span>
                <span className={`font-semibold text-[11px] ${statement.netBalance > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
                  {statement.netBalance > 0 ? 'Payment Recovery Pending' : 'Account Fully Settled & Cleared ✓'}
                </span>
              </div>
              <div className="text-right font-mono">
                <span className="text-base font-extrabold text-slate-900">
                  {formatAED(statement.netBalance)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ALL TENANTS RECOVERY SUMMARY TABLE */}
      {activeSubTab === 'summary' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Tenancy Portfolio Recovery</span>
            <span className="text-[11px] text-slate-400 font-mono">{units.length} Units</span>
          </div>

          <div className="divide-y divide-slate-100">
            {units.map((u) => {
              const pending = u.pendingBalance !== undefined ? u.pendingBalance : (u.status === 'paid' ? 0 : u.monthlyRate);
              const paid = u.paidAmount || 0;
              const rate = Number(u.monthlyRate) || 0;
              const isSettled = pending <= 0;
              const isPartial = paid > 0 && pending > 0;

              return (
                <div
                  key={u.id}
                  onClick={() => {
                    setSelectedUnitId(u.id);
                    setActiveSubTab('detailed');
                  }}
                  className="p-3.5 hover:bg-slate-50/80 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-extrabold text-slate-900 shrink-0">
                      {u.unitNumber}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {u.tenantName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Dr: {formatAED(rate)} • Cr: {formatAED(paid)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <div className={`text-xs font-bold font-mono ${isSettled ? 'text-emerald-700' : 'text-amber-800'}`}>
                        Bal: {formatAED(pending)}
                      </div>
                      <div className="text-[10px] font-semibold mt-0.5">
                        {isSettled ? (
                          <span className="text-emerald-700">Settled ✓</span>
                        ) : isPartial ? (
                          <span className="text-amber-700">Partial</span>
                        ) : (
                          <span className="text-rose-700">Unpaid</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
