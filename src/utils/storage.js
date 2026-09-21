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
    return raw ? JSON.parse(raw) : DEFAULT_PROPERTY;
  } catch {
    return DEFAULT_PROPERTY;
  }
};

export const saveStoredProperty = (data) => {
  localStorage.setItem(KEYS.PROPERTY, JSON.stringify(data));
};

export const getStoredUnits = () => {
  try {
    const raw = localStorage.getItem(KEYS.UNITS);
    return raw ? JSON.parse(raw) : DEFAULT_UNITS;
  } catch {
    return DEFAULT_UNITS;
  }
};

export const saveStoredUnits = (units) => {
  localStorage.setItem(KEYS.UNITS, JSON.stringify(units));
};

export const getStoredVouchers = () => {
  try {
    const raw = localStorage.getItem(KEYS.VOUCHERS);
    return raw ? JSON.parse(raw) : DEFAULT_VOUCHERS;
  } catch {
    return DEFAULT_VOUCHERS;
  }
};

export const saveStoredVouchers = (vouchers) => {
  localStorage.setItem(KEYS.VOUCHERS, JSON.stringify(vouchers));
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
