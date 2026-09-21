import { DEFAULT_PROPERTY, DEFAULT_UNITS, DEFAULT_VOUCHERS } from '../data/mockData';

const KEYS = {
  PROPERTY: 'ajm_sewerage_property_v1',
  UNITS: 'ajm_sewerage_units_v1',
  VOUCHERS: 'ajm_sewerage_vouchers_v1',
  CURRENT_MONTH: 'ajm_sewerage_month_v1'
};

export const getStoredProperty = () => {
  try {
    const raw = localStorage.getItem(KEYS.PROPERTY);
    if (!raw) return DEFAULT_PROPERTY;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROPERTY, ...parsed };
  } catch {
    return DEFAULT_PROPERTY;
  }
};

export const saveStoredProperty = (data) => {
  try {
    localStorage.setItem(KEYS.PROPERTY, JSON.stringify(data));
  } catch (err) {
    console.error('Storage error:', err);
  }
};

export const getStoredUnits = () => {
  try {
    const raw = localStorage.getItem(KEYS.UNITS);
    if (!raw) return DEFAULT_UNITS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_UNITS;

    // Defensive normalization to prevent undefined property crashes
    return parsed.map((u, index) => {
      const rate = Number(u.monthlyRate) || 150;
      const isPaid = u.status === 'paid';
      const paid = u.paidAmount !== undefined ? Number(u.paidAmount) : (isPaid ? rate : 0);
      const pending = u.pendingBalance !== undefined ? Number(u.pendingBalance) : Math.max(0, rate - paid);
      const status = pending <= 0 ? 'paid' : (paid > 0 ? 'partial' : (u.status === 'overdue' ? 'overdue' : 'pending'));

      return {
        ...u,
        id: u.id || `unit-id-${index}`,
        unitNumber: String(u.unitNumber || (100 + index)),
        tenantName: String(u.tenantName || 'Tenant'),
        phone: String(u.phone || '971500000000'),
        type: u.type || '1 BHK',
        monthlyRate: rate,
        paidAmount: paid,
        pendingBalance: pending,
        status: status,
        lastPaidDate: u.lastPaidDate || null,
        lastVoucherId: u.lastVoucherId || null,
      };
    });
  } catch {
    return DEFAULT_UNITS;
  }
};

export const saveStoredUnits = (units) => {
  try {
    localStorage.setItem(KEYS.UNITS, JSON.stringify(units));
  } catch (err) {
    console.error('Storage error:', err);
  }
};

export const getStoredVouchers = () => {
  try {
    const raw = localStorage.getItem(KEYS.VOUCHERS);
    if (!raw) return DEFAULT_VOUCHERS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_VOUCHERS;

    return parsed.map((v) => ({
      ...v,
      id: String(v.id || 'VCH-000'),
      unitNumber: String(v.unitNumber || ''),
      tenantName: String(v.tenantName || 'Tenant'),
      totalAmount: Number(v.totalAmount) || 0,
      balanceRemaining: Number(v.balanceRemaining) || 0,
      paymentMethod: v.paymentMethod || 'Cash',
      paidDate: v.paidDate || new Date().toISOString().slice(0, 10),
    }));
  } catch {
    return DEFAULT_VOUCHERS;
  }
};

export const saveStoredVouchers = (vouchers) => {
  try {
    localStorage.setItem(KEYS.VOUCHERS, JSON.stringify(vouchers));
  } catch (err) {
    console.error('Storage error:', err);
  }
};

export const exportAllData = () => {
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    property: getStoredProperty(),
    units: getStoredUnits(),
    vouchers: getStoredVouchers(),
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ajman-sewerage-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importAllData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (data.property) saveStoredProperty(data.property);
    if (Array.isArray(data.units)) saveStoredUnits(data.units);
    if (Array.isArray(data.vouchers)) saveStoredVouchers(data.vouchers);
    return true;
  } catch (err) {
    console.error('Import failed', err);
    return false;
  }
};

export const resetAllData = () => {
  localStorage.removeItem(KEYS.PROPERTY);
  localStorage.removeItem(KEYS.UNITS);
  localStorage.removeItem(KEYS.VOUCHERS);
  return {
    property: DEFAULT_PROPERTY,
    units: DEFAULT_UNITS,
    vouchers: DEFAULT_VOUCHERS
  };
};
