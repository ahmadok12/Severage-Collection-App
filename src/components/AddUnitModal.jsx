import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

const UNIT_TYPES = ['Studio', '1 BHK', '2 BHK', '3 BHK', 'Shop', 'Office'];

export function AddUnitModal({ isOpen, onClose, onSave, editingUnit = null }) {
  if (!isOpen) return null;

  const [unitNumber, setUnitNumber] = useState('');
  const [type, setType] = useState('1 BHK');
  const [tenantName, setTenantName] = useState('');
  const [phone, setPhone] = useState('');
  const [monthlyRate, setMonthlyRate] = useState(150);
  const [tasdeeqNo, setTasdeeqNo] = useState('');
  const [aspclSubmeter, setAspclSubmeter] = useState('');

  useEffect(() => {
    if (editingUnit) {
      setUnitNumber(editingUnit.unitNumber || '');
      setType(editingUnit.type || '1 BHK');
      setTenantName(editingUnit.tenantName || '');
      setPhone(editingUnit.phone || '');
      setMonthlyRate(editingUnit.monthlyRate || 150);
      setTasdeeqNo(editingUnit.tasdeeqNo || '');
      setAspclSubmeter(editingUnit.aspclSubmeter || '');
    } else {
      setUnitNumber('');
      setType('1 BHK');
      setTenantName('');
      setPhone('');
      setMonthlyRate(150);
      setTasdeeqNo('');
      setAspclSubmeter('');
    }
  }, [editingUnit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const unitData = {
      id: editingUnit ? editingUnit.id : `unit-${unitNumber}-${Date.now()}`,
      unitNumber: unitNumber.trim(),
      type,
      tenantName: tenantName.trim(),
      phone: phone.trim(),
      monthlyRate: Number(monthlyRate) || 0,
      tasdeeqNo: tasdeeqNo.trim(),
      aspclSubmeter: aspclSubmeter.trim() || `ASPCL-MTR-${unitNumber}`,
      status: editingUnit ? editingUnit.status : 'pending',
      lastPaidDate: editingUnit ? editingUnit.lastPaidDate : null,
      lastVoucherId: editingUnit ? editingUnit.lastVoucherId : null,
    };
    onSave(unitData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4">
      <div 
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
              {editingUnit ? 'Edit Unit' : 'New Unit'}
            </span>
            <h2 className="text-base font-bold text-slate-900">
              {editingUnit ? `Unit ${editingUnit.unitNumber}` : 'Add Tenancy Details'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
          {/* Unit # and Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Flat / Unit #
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 104"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              >
                {UNIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Tenant Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Tenant Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Tariq Al-Mansoor"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* Tenant Mobile (WhatsApp) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              WhatsApp Mobile (+971)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 0501234567 or 971501234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* Monthly Rate & Tasdeeq */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Monthly Fee (AED)
              </label>
              <input
                type="number"
                required
                value={monthlyRate}
                onChange={(e) => setMonthlyRate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Tasdeeq Contract #
              </label>
              <input
                type="text"
                placeholder="AJM-TSD-..."
                value={tasdeeqNo}
                onChange={(e) => setTasdeeqNo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 pb-safe">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-teal-600/20 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{editingUnit ? 'Save Changes' : 'Create Unit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
