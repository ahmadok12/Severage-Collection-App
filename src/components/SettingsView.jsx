import React, { useState } from 'react';
import { Building2, MessageSquare, Download, Upload, RotateCcw, Check, ShieldCheck } from 'lucide-react';
import { exportAllData, importAllData, resetAllData } from '../utils/storage';

export function SettingsView({ property, onUpdateProperty, onResetData }) {
  const [formData, setFormData] = useState(property);
  const [savedStatus, setSavedStatus] = useState(false);
  const [importStatus, setImportStatus] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateProperty(formData);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const success = importAllData(content);
        if (success) {
          setImportStatus('Backup restored successfully!');
          window.location.reload();
        } else {
          setImportStatus('Failed to restore file. Invalid JSON format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 pb-12">
      <div>
        <h2 className="text-base font-bold text-slate-900">Settings & Property Setup</h2>
        <p className="text-xs text-slate-500">Configure Ajman Sewerage (ASPCL) details and WhatsApp reminders</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Property & ASPCL Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>Property & ASPCL Master Profile</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Building / Property Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                ASPCL Master Account #
              </label>
              <input
                type="text"
                value={formData.aspclAccount}
                onChange={(e) => handleChange('aspclAccount', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-teal-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                City / Location
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Bank Account / IBAN for Tenant Transfers
            </label>
            <input
              type="text"
              value={formData.bankDetails}
              onChange={(e) => handleChange('bankDetails', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-xs font-bold text-slate-800">5% UAE VAT Inclusion</span>
              <p className="text-[10px] text-slate-400">Calculate 5% VAT breakdown on payment vouchers</p>
            </div>
            <input
              type="checkbox"
              checked={formData.applyVat}
              onChange={(e) => handleChange('applyVat', e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
            />
          </div>
        </div>

        {/* WhatsApp Reminder Template Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp Reminder Text Template</span>
          </div>

          <p className="text-[10px] text-slate-500">
            Tags you can use: <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800 font-mono">&#123;tenant&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800 font-mono">&#123;unit&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800 font-mono">&#123;month&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800 font-mono">&#123;amount&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800 font-mono">&#123;bank&#125;</code>
          </p>

          <textarea
            rows={4}
            value={formData.whatsappTemplate}
            onChange={(e) => handleChange('whatsappTemplate', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Save CTA */}
        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
        >
          {savedStatus ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Settings Saved!</span>
            </>
          ) : (
            <span>Save Configuration</span>
          )}
        </button>
      </form>

      {/* Data Backup & Restore */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3 mt-4">
        <span className="text-xs font-bold text-slate-900 block">Backup & Data Management</span>
        <p className="text-[11px] text-slate-500">
          All data is saved securely on this device. You can download a backup JSON file or transfer it to another phone/computer.
        </p>

        {importStatus && (
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-900 text-xs font-medium">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={exportAllData}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-97 text-slate-800 text-xs font-bold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>

          <label className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-97 text-slate-800 text-xs font-bold transition-all cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Restore Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={() => {
            if (window.confirm('Reset all units and vouchers back to default demo data?')) {
              onResetData();
            }
          }}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Demo Data</span>
        </button>
      </div>

      {/* App Version Info */}
      <div className="text-center pt-2">
        <p className="text-[10px] text-slate-400 font-mono">
          Ajman Sewerage Pay PWA • v1.0.0 • Offline Ready
        </p>
      </div>
    </div>
  );
}
