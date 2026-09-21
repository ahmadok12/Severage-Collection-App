import React from 'react';
import { Home, FileSpreadsheet, Receipt, Settings, Plus } from 'lucide-react';

export function BottomNav({ activeTab, setActiveTab, onOpenAddUnit, voucherCount }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/85 backdrop-blur-lg border-t border-slate-200/80 pb-safe transition-all">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between relative">
        {/* Units / Dashboard Tab */}
        <button
          onClick={() => setActiveTab('units')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'units' ? 'text-teal-700 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Units</span>
        </button>

        {/* Reports / Recovery Statement Tab */}
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'reports' ? 'text-teal-700 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span className="text-[10px]">Reports</span>
        </button>

        {/* Floating Center Button: Quick Add Unit */}
        <div className="relative -top-3">
          <button
            onClick={onOpenAddUnit}
            className="w-11 h-11 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-teal-600/30 transition-all border-2 border-white"
            title="Add Unit"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Vouchers History Tab */}
        <button
          onClick={() => setActiveTab('vouchers')}
          className={`flex flex-col items-center gap-1 relative transition-all ${
            activeTab === 'vouchers' ? 'text-teal-700 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <div className="relative">
            <Receipt className="w-5 h-5" />
            {voucherCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-teal-600 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center leading-tight">
                {voucherCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Vouchers</span>
        </button>

        {/* Settings Tab */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'settings' ? 'text-teal-700 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">Settings</span>
        </button>
      </div>
    </nav>
  );
}
