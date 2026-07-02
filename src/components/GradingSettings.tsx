import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, AlertCircle, CheckCircle2, Award, Info } from 'lucide-react';

interface GradeSettingItem {
  grade: string;
  minScore: string;
  maxScore: string;
}

interface GradingConfig {
  english6: GradeSettingItem[];
  khmer6: GradeSettingItem[];
  khmer4: GradeSettingItem[];
}

const DEFAULT_GRADING_CONFIG: GradingConfig = {
  english6: [
    { grade: 'A', minScore: '45', maxScore: '50' },
    { grade: 'B', minScore: '40', maxScore: '44.99' },
    { grade: 'C', minScore: '35', maxScore: '39.99' },
    { grade: 'D', minScore: '30', maxScore: '34.99' },
    { grade: 'E', minScore: '25', maxScore: '29.99' },
    { grade: 'F', minScore: '0', maxScore: '24.99' },
  ],
  khmer6: [
    { grade: 'ល្អប្រសើរ', minScore: '45', maxScore: '50' },
    { grade: 'ល្អណាស់', minScore: '40', maxScore: '44.99' },
    { grade: 'ល្អ', minScore: '35', maxScore: '39.99' },
    { grade: 'ល្អបង្គួរ', minScore: '30', maxScore: '34.99' },
    { grade: 'មធ្យម', minScore: '25', maxScore: '29.99' },
    { grade: 'ខ្សោយ', minScore: '0', maxScore: '24.99' },
  ],
  khmer4: [
    { grade: 'ល្អ', minScore: '40', maxScore: '50' },
    { grade: 'ល្អបង្គួរ', minScore: '32.5', maxScore: '39.99' },
    { grade: 'មធ្យម', minScore: '25', maxScore: '32.49' },
    { grade: 'ខ្សោយ', minScore: '0', maxScore: '24.99' },
  ]
};

export default function GradingSettings() {
  const [config, setConfig] = useState<GradingConfig>(() => {
    try {
      const saved = localStorage.getItem('secondary_school_grading_config_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check if it's the old 10-point scale config, if so, upgrade to the 50-point scale config
        if (parsed.english6 && parsed.english6[0] && parseFloat(parsed.english6[0].maxScore) <= 10.00) {
          return DEFAULT_GRADING_CONFIG;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load grading config', e);
    }
    return DEFAULT_GRADING_CONFIG;
  });

  const [activeScale, setActiveScale] = useState<'english6' | 'khmer6' | 'khmer4'>(() => {
    const saved = localStorage.getItem('active_grading_scale_v1');
    if (saved === 'english6' || saved === 'khmer6' || saved === 'khmer4') {
      return saved;
    }
    return 'english6';
  });

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleInputChange = (
    table: 'english6' | 'khmer6' | 'khmer4',
    index: number,
    field: 'minScore' | 'maxScore',
    value: string
  ) => {
    setConfig(prev => {
      const updatedTable = [...prev[table]];
      updatedTable[index] = {
        ...updatedTable[index],
        [field]: value
      };
      return {
        ...prev,
        [table]: updatedTable
      };
    });
  };

  // Auto-save whenever config or activeScale changes
  useEffect(() => {
    try {
      let hasError = false;
      for (const tableKey of ['english6', 'khmer6', 'khmer4'] as const) {
        for (const item of config[tableKey]) {
          const min = parseFloat(item.minScore);
          const max = parseFloat(item.maxScore);
          if (isNaN(min) || isNaN(max) || min > max) {
            hasError = true;
            break;
          }
        }
        if (hasError) break;
      }

      if (!hasError) {
        localStorage.setItem('secondary_school_grading_config_v1', JSON.stringify(config));
        localStorage.setItem('active_grading_scale_v1', activeScale);
        
        // Dispatch custom event to notify other components of update
        window.dispatchEvent(new Event('grading_config_updated'));
      }
    } catch (e) {
      console.error('Failed to auto-save grading config', e);
    }
  }, [config, activeScale]);

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmReset = () => {
    try {
      const freshDefault = JSON.parse(JSON.stringify(DEFAULT_GRADING_CONFIG));
      setConfig(freshDefault);
      localStorage.setItem('secondary_school_grading_config_v1', JSON.stringify(freshDefault));
      setNotification({
        type: 'success',
        message: 'បានស្ដារចន្លោះពិន្ទុដើមរួចរាល់!'
      });
      setShowResetConfirm(false);
    } catch (e) {
      console.error('Failed to reset config', e);
    }
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="space-y-6" id="grading-settings-panel">
      {/* Notifications - Outside or inside but absolute */}
      {notification && (
        <div 
          className={`p-4 rounded-xl flex items-center gap-3 border transition-all animate-fade-in ${
            notification.type === 'success' 
              ? 'bg-emerald-50 border-emerald-150 text-emerald-800' 
              : 'bg-rose-50 border-rose-150 text-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="text-xs font-bold" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>
            {notification.message}
          </span>
        </div>
      )}

      {/* Unified Main Card containing Header, Active Scale Selection and Tables */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Top Header Row (Integrated with the panel background) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 animate-fade-in" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>
                កំណត់ប្រភេទនិទ្ទេស
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-white border border-rose-500 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}
            >
              <RotateCcw className="w-4 h-4 text-rose-600 shrink-0" />
              ស្ដារចន្លោះពិន្ទុដើម
            </button>
          </div>
        </div>

        {/* Global Active Grading Scale Selector Panel */}
        <div className="bg-slate-50 border-b border-slate-200 p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                ជ្រើសរើសប្រភេទនិទ្ទេសសម្រាប់ប្រើប្រាស់ក្នុងប្រព័ន្ធ៖
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'english6', label: 'និទ្ទេស ៦ (អង់គ្លេស)' },
                { id: 'khmer6', label: 'និទ្ទេស ៦ (ភាសាខ្មែរ)' },
                { id: 'khmer4', label: 'និទ្ទេស ៤ (ភាសាខ្មែរ)' },
              ].map(scale => (
                <button
                  key={scale.id}
                  type="button"
                  onClick={() => setActiveScale(scale.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                    activeScale === scale.id
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${activeScale === scale.id ? 'bg-white' : 'bg-slate-300'}`} />
                  {scale.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Grid Tables matching strictly the layout of Excel mock image */}
        <div className="p-6">
          <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Table 1: និទ្ទេស ៦ (អង់គ្លេស) */}
            <div className={`border rounded-xl shadow-xs overflow-hidden transition-all ${activeScale === 'english6' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200'}`}>
              <div className={`border-b px-4 py-3 text-center font-bold ${activeScale === 'english6' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                <h3 className="text-xs font-bold flex items-center justify-center gap-2" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>
                  និទ្ទេស ៦ (អង់គ្លេស)
                  {activeScale === 'english6' && <span className="bg-white text-emerald-700 text-[9px] px-1.5 py-0.5 rounded-full font-extrabold">សកម្ម</span>}
                </h3>
              </div>
              <div className="overflow-x-auto bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-emerald-700 text-white font-bold">
                      <th rowSpan={2} className="px-3 py-3 text-center font-bold border border-emerald-800 align-middle w-1/3" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>
                        និទ្ទេស
                      </th>
                      <th colSpan={2} className="px-3 py-1.5 text-center font-bold border border-emerald-800" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>
                        ចន្លោះពិន្ទុ
                      </th>
                    </tr>
                    <tr className="bg-emerald-600 text-white text-[10px]">
                      <th className="px-2 py-1.5 text-center font-bold border border-emerald-700 w-1/3" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>ពិន្ទុទាប</th>
                      <th className="px-2 py-1.5 text-center font-bold border border-emerald-700 w-1/3" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>ពិន្ទុខ្ពស់</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {config.english6.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2.5 text-center font-bold text-slate-700 border border-slate-200 bg-slate-50/50">
                          {item.grade}
                        </td>
                        <td className="px-2 py-2 border border-slate-200">
                          <input
                            type="text"
                            value={item.minScore}
                            onChange={(e) => handleInputChange('english6', idx, 'minScore', e.target.value)}
                            className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-bold text-slate-700 bg-slate-50 hover:bg-white focus:bg-white transition-all"
                          />
                        </td>
                        <td className="px-2 py-2 border border-slate-200">
                          <input
                            type="text"
                            value={item.maxScore}
                            onChange={(e) => handleInputChange('english6', idx, 'maxScore', e.target.value)}
                            className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-bold text-slate-700 bg-slate-50 hover:bg-white focus:bg-white transition-all"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: និទ្ទេស ៦ (ភាសាខ្មែរ) */}
            <div className={`border rounded-xl shadow-xs overflow-hidden transition-all ${activeScale === 'khmer6' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200'}`}>
              <div className={`border-b px-4 py-3 text-center font-bold ${activeScale === 'khmer6' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                <h3 className="text-xs font-bold flex items-center justify-center gap-2" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>
                  និទ្ទេស ៦ (ភាសាខ្មែរ)
                  {activeScale === 'khmer6' && <span className="bg-white text-emerald-700 text-[9px] px-1.5 py-0.5 rounded-full font-extrabold">សកម្ម</span>}
                </h3>
              </div>
              <div className="overflow-x-auto bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-emerald-700 text-white font-bold">
                      <th rowSpan={2} className="px-3 py-3 text-center font-bold border border-emerald-800 align-middle w-1/3" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>
                        និទ្ទេស
                      </th>
                      <th colSpan={2} className="px-3 py-1.5 text-center font-bold border border-emerald-800" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>
                        ចន្លោះពិន្ទុ
                      </th>
                    </tr>
                    <tr className="bg-emerald-600 text-white text-[10px]">
                      <th className="px-2 py-1.5 text-center font-bold border border-emerald-700 w-1/3" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>ពិន្ទុទាប</th>
                      <th className="px-2 py-1.5 text-center font-bold border border-emerald-700 w-1/3" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>ពិន្ទុខ្ពស់</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {config.khmer6.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2.5 text-center font-bold text-slate-700 border border-slate-200 bg-slate-50/50" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>
                          {item.grade}
                        </td>
                        <td className="px-2 py-2 border border-slate-200">
                          <input
                            type="text"
                            value={item.minScore}
                            onChange={(e) => handleInputChange('khmer6', idx, 'minScore', e.target.value)}
                            className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-bold text-slate-700 bg-slate-50 hover:bg-white focus:bg-white transition-all"
                          />
                        </td>
                        <td className="px-2 py-2 border border-slate-200">
                          <input
                            type="text"
                            value={item.maxScore}
                            onChange={(e) => handleInputChange('khmer6', idx, 'maxScore', e.target.value)}
                            className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-bold text-slate-700 bg-slate-50 hover:bg-white focus:bg-white transition-all"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 3: និទ្ទេស ៤ (ភាសាខ្មែរ) */}
            <div className={`border rounded-xl shadow-xs overflow-hidden transition-all ${activeScale === 'khmer4' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200'}`}>
              <div className={`border-b px-4 py-3 text-center font-bold ${activeScale === 'khmer4' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                <h3 className="text-xs font-bold flex items-center justify-center gap-2" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>
                  និទ្ទេស ៤ (ភាសាខ្មែរ)
                  {activeScale === 'khmer4' && <span className="bg-white text-emerald-700 text-[9px] px-1.5 py-0.5 rounded-full font-extrabold">សកម្ម</span>}
                </h3>
              </div>
              <div className="overflow-x-auto bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-emerald-700 text-white font-bold">
                      <th rowSpan={2} className="px-3 py-3 text-center font-bold border border-emerald-800 align-middle w-1/3" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>
                        និទ្ទេស
                      </th>
                      <th colSpan={2} className="px-3 py-1.5 text-center font-bold border border-emerald-800" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>
                        ចន្លោះពិន្ទុ
                      </th>
                    </tr>
                    <tr className="bg-emerald-600 text-white text-[10px]">
                      <th className="px-2 py-1.5 text-center font-bold border border-emerald-700 w-1/3" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>ពិន្ទុទាប</th>
                      <th className="px-2 py-1.5 text-center font-bold border border-emerald-700 w-1/3" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>ពិន្ទុខ្ពស់</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {config.khmer4.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2.5 text-center font-bold text-slate-700 border border-slate-200 bg-slate-50/50" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>
                          {item.grade}
                        </td>
                        <td className="px-2 py-2 border border-slate-200">
                          <input
                            type="text"
                            value={item.minScore}
                            onChange={(e) => handleInputChange('khmer4', idx, 'minScore', e.target.value)}
                            className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-bold text-slate-700 bg-slate-50 hover:bg-white focus:bg-white transition-all"
                          />
                        </td>
                        <td className="px-2 py-2 border border-slate-200">
                          <input
                            type="text"
                            value={item.maxScore}
                            onChange={(e) => handleInputChange('khmer4', idx, 'maxScore', e.target.value)}
                            className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-bold text-slate-700 bg-slate-50 hover:bg-white focus:bg-white transition-all"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </form>
        </div>

      </div>

      {/* Custom Confirmation Modal for Restoring Default ranges */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-scale-up">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-base font-bold text-slate-800" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>
                  ស្ដារចន្លោះពិន្ទុដើម
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>
                  តើអ្នកពិតជាចង់ស្ដារចន្លោះពិន្ទុទៅជាតម្លៃលំនាំដើមវិញមែនទេ? ការផ្លាស់ប្តូរដែលអ្នកបានកែសម្រួលទាំងអស់នឹងត្រូវជំនួសដោយតម្លៃដើមវិញ។
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}
              >
                យល់ព្រមស្ដារ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

