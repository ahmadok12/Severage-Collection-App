import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MetricsOverview } from './components/MetricsOverview';
import { UnitCard } from './components/UnitCard';
import { CollectPaymentModal } from './components/CollectPaymentModal';
import { VoucherModal } from './components/VoucherModal';
import { AddUnitModal } from './components/AddUnitModal';
import { VoucherHistory } from './components/VoucherHistory';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { BottomNav } from './components/BottomNav';
import { 
  getStoredProperty, 
  saveStoredProperty, 
  getStoredUnits, 
  saveStoredUnits, 
  getStoredVouchers, 
  saveStoredVouchers, 
  resetAllData 
} from './utils/storage';
import { getCurrentBillingMonth, formatAED } from './utils/formatters';
import { Search, Plus, Filter, CheckCircle2 } from 'lucide-react';

export function App() {
  const [property, setProperty] = useState(getStoredProperty);
  const [units, setUnits] = useState(getStoredUnits);
  const [vouchers, setVouchers] = useState(getStoredVouchers);
  
  const [currentMonth, setCurrentMonth] = useState(getCurrentBillingMonth);
  const [monthOffset, setMonthOffset] = useState(0);

  const [activeTab, setActiveTab] = useState('units'); // 'units' | 'reports' | 'vouchers' | 'settings'
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unpaid' | 'paid'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [collectingUnit, setCollectingUnit] = useState(null);
  const [activeVoucher, setActiveVoucher] = useState(null);
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Sync to localStorage
  useEffect(() => {
    saveStoredProperty(property);
  }, [property]);

  useEffect(() => {
    saveStoredUnits(units);
  }, [units]);

  useEffect(() => {
    saveStoredVouchers(vouchers);
  }, [vouchers]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Month Switcher Logic
  const handlePrevMonth = () => {
    const newOffset = monthOffset - 1;
    setMonthOffset(newOffset);
    const d = new Date();
    d.setMonth(d.getMonth() + newOffset);
    setCurrentMonth(d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
  };

  const handleNextMonth = () => {
    const newOffset = monthOffset + 1;
    setMonthOffset(newOffset);
    const d = new Date();
    d.setMonth(d.getMonth() + newOffset);
    setCurrentMonth(d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
  };

  // Reset billing cycle for a new month
  const handleResetMonthCycle = () => {
    if (window.confirm(`Reset billing status for all units for ${currentMonth}? Units will be marked as Due.`)) {
      const updated = units.map(u => ({
        ...u,
        paidAmount: 0,
        pendingBalance: Number(u.monthlyRate) || 0,
        status: 'pending',
        lastVoucherId: null,
      }));
      setUnits(updated);
      showToast(`Billing cycle initiated for ${currentMonth}`);
    }
  };

  // Handle Manual Payment Save (handles partial payments and pending amounts properly)
  const handleSavePayment = (unitId, voucher, payAmount, newPendingBalance) => {
    // 1. Update Unit state
    const updatedUnits = units.map(u => {
      if (u.id === unitId) {
        const newPaid = (Number(u.paidAmount) || 0) + Number(payAmount);
        const newBalance = Math.max(0, Number(newPendingBalance));
        const newStatus = newBalance <= 0 ? 'paid' : 'partial';

        return {
          ...u,
          paidAmount: newPaid,
          pendingBalance: newBalance,
          status: newStatus,
          lastPaidDate: voucher.paidDate,
          lastVoucherId: voucher.id,
        };
      }
      return u;
    });
    setUnits(updatedUnits);

    // 2. Add Voucher to History
    const updatedVouchers = [voucher, ...vouchers];
    setVouchers(updatedVouchers);

    // 3. Close Collect Modal & Open Voucher Preview
    setCollectingUnit(null);
    setActiveVoucher(voucher);

    if (newPendingBalance > 0) {
      showToast(`Partial payment of ${formatAED(payAmount)} recorded! Remaining: ${formatAED(newPendingBalance)}.`);
    } else {
      showToast(`Payment of ${formatAED(payAmount)} recorded! Full settlement achieved.`);
    }
  };

  // View Voucher for a unit
  const handleViewUnitVoucher = (unit) => {
    const found = vouchers.find(v => v.id === unit.lastVoucherId || v.unitId === unit.id);
    if (found) {
      setActiveVoucher(found);
    } else {
      // Fallback voucher if not in history
      const totalAmount = unit.paidAmount || unit.monthlyRate;
      const pending = unit.pendingBalance !== undefined ? unit.pendingBalance : 0;
      const isPartial = pending > 0;

      const fallbackVoucher = {
        id: `VCH-${unit.unitNumber}-LATEST`,
        unitId: unit.id,
        unitNumber: unit.unitNumber,
        tenantName: unit.tenantName,
        phone: unit.phone,
        month: currentMonth,
        billAmount: unit.monthlyRate,
        baseAmount: (totalAmount / 1.05).toFixed(2),
        vatAmount: (totalAmount - (totalAmount / 1.05)).toFixed(2),
        totalAmount: totalAmount,
        balanceRemaining: pending,
        isPartial: isPartial,
        paymentMethod: 'Verified Payment',
        reference: 'Settled',
        paidDate: unit.lastPaidDate || new Date().toISOString().slice(0, 10),
        aspclAccount: unit.aspclSubmeter || property.aspclAccount,
        tasdeeqNo: unit.tasdeeqNo,
        notes: isPartial ? `Partial collection (${formatAED(pending)} pending)` : 'Verified clearance'
      };
      setActiveVoucher(fallbackVoucher);
    }
  };

  // Add or Edit Unit
  const handleSaveUnit = (unitData) => {
    if (editingUnit) {
      setUnits(units.map(u => u.id === editingUnit.id ? {
        ...unitData,
        paidAmount: editingUnit.paidAmount || 0,
        pendingBalance: editingUnit.pendingBalance !== undefined ? editingUnit.pendingBalance : unitData.monthlyRate,
        status: editingUnit.status || 'pending',
      } : u));
      showToast(`Unit ${unitData.unitNumber} updated`);
    } else {
      const newUnit = {
        ...unitData,
        paidAmount: 0,
        pendingBalance: Number(unitData.monthlyRate) || 0,
        status: 'pending'
      };
      setUnits([newUnit, ...units]);
      showToast(`Unit ${unitData.unitNumber} added`);
    }
    setIsAddUnitOpen(false);
    setEditingUnit(null);
  };

  // Reset all to demo
  const handleResetData = () => {
    const fresh = resetAllData();
    setProperty(fresh.property);
    setUnits(fresh.units);
    setVouchers(fresh.vouchers);
    showToast('Reset to demo data complete');
  };

  // Filter units
  const filteredUnits = units.filter(u => {
    const pending = u.pendingBalance !== undefined ? u.pendingBalance : (u.status === 'paid' ? 0 : u.monthlyRate);
    // Tab filter
    if (activeFilter === 'paid' && pending > 0) return false;
    if (activeFilter === 'unpaid' && pending <= 0) return false;
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchUnit = u.unitNumber.toLowerCase().includes(q);
      const matchTenant = u.tenantName.toLowerCase().includes(q);
      const matchPhone = u.phone && u.phone.includes(q);
      if (!matchUnit && !matchTenant && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Top Header */}
      <Header
        property={property}
        currentMonth={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onOpenAddUnit={() => {
          setEditingUnit(null);
          setIsAddUnitOpen(true);
        }}
        onResetMonthCycle={handleResetMonthCycle}
      />

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 pt-4">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="mb-3 px-3 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab 1: Units Dashboard */}
        {activeTab === 'units' && (
          <div className="space-y-4">
            {/* KPI Metrics */}
            <MetricsOverview
              units={units}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            />

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search flat # or tenant name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
              />
            </div>

            {/* Units List */}
            <div className="space-y-2.5">
              {filteredUnits.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-500">No units match criteria</p>
                </div>
              ) : (
                filteredUnits.map((unit) => (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    property={property}
                    currentMonth={currentMonth}
                    onCollect={(u) => setCollectingUnit(u)}
                    onViewVoucher={handleViewUnitVoucher}
                    onEditUnit={(u) => {
                      setEditingUnit(u);
                      setIsAddUnitOpen(true);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Reports / Tenant Recovery Statement */}
        {activeTab === 'reports' && (
          <ReportsView
            units={units}
            vouchers={vouchers}
            property={property}
            currentMonth={currentMonth}
          />
        )}

        {/* Tab 3: Vouchers Archive */}
        {activeTab === 'vouchers' && (
          <VoucherHistory
            vouchers={vouchers}
            property={property}
            onSelectVoucher={(v) => setActiveVoucher(v)}
          />
        )}

        {/* Tab 4: Settings */}
        {activeTab === 'settings' && (
          <SettingsView
            property={property}
            onUpdateProperty={(updated) => {
              setProperty(updated);
              showToast('Property settings saved');
            }}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Bottom Translucent Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddUnit={() => {
          setEditingUnit(null);
          setIsAddUnitOpen(true);
        }}
        voucherCount={vouchers.length}
      />

      {/* Collect Payment Modal */}
      {collectingUnit && (
        <CollectPaymentModal
          unit={collectingUnit}
          property={property}
          currentMonth={currentMonth}
          isOpen={Boolean(collectingUnit)}
          onClose={() => setCollectingUnit(null)}
          onSavePayment={handleSavePayment}
        />
      )}

      {/* Digital Voucher Modal */}
      {activeVoucher && (
        <VoucherModal
          voucher={activeVoucher}
          property={property}
          isOpen={Boolean(activeVoucher)}
          onClose={() => setActiveVoucher(null)}
        />
      )}

      {/* Add / Edit Unit Modal */}
      {isAddUnitOpen && (
        <AddUnitModal
          isOpen={isAddUnitOpen}
          onClose={() => {
            setIsAddUnitOpen(false);
            setEditingUnit(null);
          }}
          onSave={handleSaveUnit}
          editingUnit={editingUnit}
        />
      )}
    </div>
  );
}

export default App;
