import React, { useState, useEffect, useMemo } from 'react';
import { School, CheckCircle, Hash } from 'lucide-react';
import { SchoolInfo } from '../types';

interface SchoolSettingsProps {
  schoolInfo: SchoolInfo;
  onSave: (info: SchoolInfo) => void;
}

// Common Cambodian provinces/cities list for smart suggestions
const CAMBODIAN_PROVINCES = [
  'ភ្នំពេញ', 'ព្រះសីហនុ', 'សៀមរាប', 'បាត់ដំបង', 'កំពង់ចាម', 'កំពង់ធំ', 'កំពង់ឆ្នាំង', 'កំពង់ស្ពឺ', 'កណ្ដាល',
  'តាកែវ', 'កំពត', 'កែប', 'ប៉ៃលិន', 'បន្ទាយមានជ័យ', 'ព្រះវិហារ', 'ស្ទឹងត្រែង', 'ក្រចេះ', 'មណ្ឌលគិរី',
  'រតនគិរី', 'ឧត្ដរមានជ័យ', 'ពោធិ៍សាត់', 'កោះកុង', 'ព្រៃវែង', 'ស្វាយរៀង', 'ត្បូងឃ្មុំ'
];

interface LocationInfo {
  districts: string[];
  communes: Record<string, string[]>;
  villages: Record<string, string[]>;
}

const LOCATION_DATA: Record<string, LocationInfo> = {
  'ភ្នំពេញ': {
    districts: ['ចំការមន', 'ដូនពេញ', '៧មករា', 'ទួលគោក', 'សែនសុខ', 'មានជ័យ', 'ឫស្សីកែវ', 'ច្បារអំពៅ', 'ពោធិ៍សែនជ័យ'],
    communes: {
      'ចំការមន': ['ទន្លេបាសាក់', 'បឹងកងកងទី១', 'បឹងត្របែក', 'ផ្សារដើមថ្កូវ'],
      'ដូនពេញ': ['ផ្សារថ្មីទី១', 'ផ្សារថ្មីទី២', 'ផ្សារថ្មីទី៣', 'ចតុមុខ', 'ស្រះចក'],
      '៧មករា': ['អូឫស្សីទី១', 'អូឫស្សីទី២', 'វាលវង់', 'មនោរម្យ'],
      'ទួលគោក': ['ផ្សារដេប៉ូទី១', 'ផ្សារដេប៉ូទី២', 'ទឹកល្អក់ទី១', 'ទឹកល្អក់ទី២', 'បឹងកក់ទី១'],
      'សែនសុខ': ['ភ្នំពេញថ្មី', 'ទឹកថ្លា', 'ឃ្មួញ', 'អូរបែកក្អម']
    },
    villages: {
      'ទន្លេបាសាក់': ['ភូមិ១', 'ភូមិ២', 'ភូមិ៣', 'ភូមិ៤', 'ភូមិ៥'],
      'បឹងកងកងទី១': ['ភូមិ១', 'ភូមិ២', 'ភូមិ៣'],
      'ផ្សារថ្មីទី១': ['ភូមិ១', 'ភូមិ២'],
      'ភ្នំពេញថ្មី': ['ភូមិទ្រុងមាន់', 'ភូមិចុងថ្នល់', 'ភូមិពោងពាយ'],
      'ទឹកថ្លា': ['ភូមិចុងថ្នល់ខាងកើត', 'ភូមិចុងថ្នល់ខាងលិច', 'ភូមិផ្សារទឹកថ្លា']
    }
  },
  'ព្រះសីហនុ': {
    districts: ['ព្រះសីហនុ', 'ស្ទឹងហាវ', 'ព្រៃនប់', 'កំពង់សិលា'],
    communes: {
      'ព្រះសីហនុ': ['សង្កាត់លេខ១', 'សង្កាត់លេខ២', 'សង្កាត់លេខ៣', 'សង្កាត់លេខ៤'],
      'ស្ទឹងហាវ': ['កំពេញ', 'ទំនប់រលក', 'អូរត្រេះ'],
      'ព្រៃនប់': ['វាលរេញ', 'ទឹកល្អក់', 'ទួលទទឹង', 'ព្រៃនប់']
    },
    villages: {
      'សង្កាត់លេខ៤': ['ភូមិ១', 'ភូមិ២', 'ភូមិ៣', 'ភូមិ៤', 'ភូមិ៥'],
      'សង្កាត់លេខ៣': ['ភូមិ១', 'ភូមិ២', 'ភូមិ៣'],
      'សង្កាត់លេខ២': ['ភូមិ១', 'ភូមិ២', 'ភូមិ៣'],
      'សង្កាត់លេខ១': ['ភូមិ១', 'ភូមិ២', 'ភូមិ៣'],
      'វាលរេញ': ['ភូមិវាលរេញ', 'ភូមិត្រពាំងធំ', 'ភូមិបឹងជំនីប']
    }
  },
  'សៀមរាប': {
    districts: ['សៀមរាប', 'ប្រាសាទបាគង', 'ស្រីស្នំ', 'អង្គរធំ', 'អង្គរជុំ', 'ពួក', 'សូទ្រនិគម'],
    communes: {
      'សៀមរាប': ['ស្លក្រាម', 'ស្វាយដង្គំ', 'គោកចក', 'សាលាកំរើក', 'ជ្រាវ'],
      'ប្រាសាទបាគង': ['បាគង', 'បល្ល័ង្ក', 'រកា'],
      'ពួក': ['ពួក', 'កែវពណ៌', 'ល្វា']
    },
    villages: {
      'ស្លក្រាម': ['ភូមិមណ្ឌល១', 'ភូមិស្លក្រាម', 'ភូមិវត្តបូព៌', 'ភូមិទ្រាំង'],
      'ស្វាយដង្គំ': ['ភូមិស្វាយដង្គំ', 'ភូមិសាលាកន្សែង', 'ភូមិវត្ដស្វាយ'],
      'គោកចក': ['ភូមិវាល', 'ភូមិទក្សិណត្បូង', 'ភូមិគោកត្នោត']
    }
  },
  'បាត់ដំបង': {
    districts: ['បាត់ដំបង', 'សង្កែ', 'បាណន់', 'ឯកភ្នំ', 'រតនមណ្ឌល', 'មោងឫស្សី', 'ថ្មគោល'],
    communes: {
      'បាត់ដំបង': ['ស្វាយប៉ោ', 'វត្តគរ', 'ព្រែកព្រះស្ដេច', 'រតនៈ', 'ចំការសំរោង'],
      'សង្កែ': ['កំពង់ព្រះ', 'កំពង់ពិល', 'រាំងកែសី'],
      'បាណន់': ['កន្ទឺ២', 'ភ្នំសំពៅ', 'ស្នឹង']
    },
    villages: {
      'ស្វាយប៉ោ': ['ភូមិព្រែកមហាទេព', 'ភូមិកំពង់ក្របី', 'ភូមិស្វាយប៉ោ'],
      'វត្តគរ': ['ភូមិវត្តគរ', 'ភូមិដូនទាវ', 'ភូមិពាក់ស្បែក'],
      'ព្រែកព្រះស្ដេច': ['ភូមិព្រែកព្រះស្ដេច', 'ភូមិចំការឫស្សី']
    }
  }
};

const getDistrictsForProvince = (prov: string): string[] => {
  if (LOCATION_DATA[prov]) {
    return [...LOCATION_DATA[prov].districts].map(d => {
      if (prov === 'ភ្នំពេញ') return `ខណ្ឌ${d}`;
      if (prov === 'ព្រះសីហនុ' && d === 'ព្រះសីហនុ') return `ក្រុង${d}`;
      if (prov === 'សៀមរាប' && d === 'សៀមរាប') return `ក្រុង${d}`;
      if (prov === 'បាត់ដំបង' && d === 'បាត់ដំបង') return `ក្រុង${d}`;
      return `ស្រុក${d}`;
    });
  }
  return [`ក្រុង${prov}`, `ស្រុកទី១`, `ស្រុកទី២`, `ស្រុកទី៣`].filter(Boolean);
};

const getCommunesForDistrict = (prov: string, dist: string): string[] => {
  if (LOCATION_DATA[prov] && LOCATION_DATA[prov].communes[dist]) {
    return [...LOCATION_DATA[prov].communes[dist]].map(c => {
      const isSangkat = prov === 'ភ្នំពេញ' || dist.startsWith('ក្រុង') || dist.includes('ព្រះសីហនុ') || dist.includes('សៀមរាប') || dist.includes('បាត់ដំបង');
      return isSangkat ? `សង្កាត់${c}` : `ឃុំ${c}`;
    });
  }
  return [`សង្កាត់${dist}`, `ឃុំទី១`, `ឃុំទី២`, `ឃុំទី៣`].filter(Boolean);
};

const getVillagesForCommune = (prov: string, comm: string): string[] => {
  if (LOCATION_DATA[prov] && LOCATION_DATA[prov].villages[comm]) {
    return [...LOCATION_DATA[prov].villages[comm]].map(v => `ភូមិ${v}`);
  }
  return [`ភូមិ១`, `ភូមិ២`, `ភូមិ៣`, `ភូមិ៤`].filter(Boolean);
};

const normalizeName = (name: string): string => {
  if (!name) return '';
  const clean = name.replace(/\s+/g, '');
  return clean.replace(/^(ស្រុក|ក្រុង|ខណ្ឌ|ឃុំ|សង្កាត់|ភូមិ)/, '');
};

interface RawProvince {
  code: string;
  name_kh: string;
  name_en: string;
}

interface RawDistrict {
  code: string;
  province_code: string;
  name_kh: string;
  name_en: string;
  type?: string;
}

interface RawCommune {
  code: string;
  district_code: string;
  name_kh: string;
  name_en: string;
  type?: string;
}

interface RawVillage {
  code: string;
  commune_code: string;
  name_kh: string;
  name_en: string;
  type?: string;
}

export default function SchoolSettings({ schoolInfo, onSave }: SchoolSettingsProps) {
  const [formData, setFormData] = useState<SchoolInfo>({ ...schoolInfo });
  useEffect(() => {
    setFormData({ ...schoolInfo });
  }, [schoolInfo]);
  const [dbProvinces, setDbProvinces] = useState<RawProvince[]>([]);
  const [dbDistricts, setDbDistricts] = useState<RawDistrict[]>([]);
  const [dbCommunes, setDbCommunes] = useState<RawCommune[]>([]);
  const [dbVillages, setDbVillages] = useState<RawVillage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchJson = async (url: string) => {
      const r = await fetch(url);
      if (!r.ok) {
        throw new Error(`HTTP ${r.status} on ${url}`);
      }
      const text = await r.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response from ${url}`);
      }
    };

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [pRes, dRes, cRes, vRes] = await Promise.all([
          fetchJson('/data/provinces.json'),
          fetchJson('/data/districts.json'),
          fetchJson('/data/communes.json'),
          fetchJson('/data/villages.json'),
        ]);
        if (active) {
          setDbProvinces(Array.isArray(pRes) ? pRes : Object.values(pRes));
          setDbDistricts(Array.isArray(dRes) ? dRes : Object.values(dRes));
          setDbCommunes(Array.isArray(cRes) ? cRes : Object.values(cRes));
          setDbVillages(Array.isArray(vRes) ? vRes : Object.values(vRes));
        }
      } catch (err) {
        console.error('Failed to pre-fetch Cambodian geometry gazetteer, using offline fallbacks:', err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };
    fetchAllData();
    return () => {
      active = false;
    };
  }, []);

  const provincesList = useMemo(() => {
    if (dbProvinces.length > 0) {
      const sorted = [...dbProvinces].sort((a, b) => {
        const codeA = a.code || '';
        const codeB = b.code || '';
        return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
      });
      return sorted.map(p => p.name_kh);
    }
    return CAMBODIAN_PROVINCES;
  }, [dbProvinces]);

  const districtsList = useMemo(() => {
    if (!formData.province) return [];
    if (dbProvinces.length > 0 && dbDistricts.length > 0) {
      const pObj = dbProvinces.find(p => p.name_kh === formData.province || p.name_en === formData.province);
      if (pObj) {
        const filtered = dbDistricts.filter(d => d.province_code === pObj.code);
        const sorted = filtered.sort((a, b) => {
          const codeA = a.code || '';
          const codeB = b.code || '';
          return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
        });
        return sorted.map(d => {
          const prefix = d.type ? d.type.trim() : 'ស្រុក';
          return `${prefix}${d.name_kh.trim()}`;
        });
      }
    }
    return getDistrictsForProvince(formData.province);
  }, [dbProvinces, dbDistricts, formData.province]);

  const communesList = useMemo(() => {
    if (!formData.province || !formData.district) return [];
    if (dbProvinces.length > 0 && dbDistricts.length > 0 && dbCommunes.length > 0) {
      const pObj = dbProvinces.find(p => p.name_kh === formData.province || p.name_en === formData.province);
      if (pObj) {
        const dObj = dbDistricts.find(d => {
          if (d.province_code !== pObj.code) return false;
          const cleanD = normalizeName(d.name_kh);
          const cleanForm = normalizeName(formData.district);
          return cleanD === cleanForm || d.name_en === formData.district;
        });
        if (dObj) {
          const filtered = dbCommunes.filter(c => c.district_code === dObj.code);
          const sorted = filtered.sort((a, b) => {
            const codeA = a.code || '';
            const codeB = b.code || '';
            return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
          });
          return sorted.map(c => {
            const prefix = c.type ? c.type.trim() : 'ឃុំ';
            return `${prefix}${c.name_kh.trim()}`;
          });
        }
      }
    }
    return getCommunesForDistrict(formData.province, formData.district);
  }, [dbProvinces, dbDistricts, dbCommunes, formData.province, formData.district]);

  const villagesList = useMemo(() => {
    if (!formData.province || !formData.district || !formData.commune) return [];
    if (dbProvinces.length > 0 && dbDistricts.length > 0 && dbCommunes.length > 0 && dbVillages.length > 0) {
      const pObj = dbProvinces.find(p => p.name_kh === formData.province || p.name_en === formData.province);
      if (pObj) {
        const dObj = dbDistricts.find(d => {
          if (d.province_code !== pObj.code) return false;
          const cleanD = normalizeName(d.name_kh);
          const cleanForm = normalizeName(formData.district);
          return cleanD === cleanForm || d.name_en === formData.district;
        });
        if (dObj) {
          const cObj = dbCommunes.find(c => {
            if (c.district_code !== dObj.code) return false;
            const cleanC = normalizeName(c.name_kh);
            const cleanForm = normalizeName(formData.commune);
            return cleanC === cleanForm || c.name_en === formData.commune;
          });
          if (cObj) {
            const filtered = dbVillages.filter(v => v.commune_code === cObj.code);
            const sorted = filtered.sort((a, b) => {
              const codeA = a.code || '';
              const codeB = b.code || '';
              return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
            });
            return sorted.map(v => {
              const prefix = v.type ? v.type.trim() : 'ភូមិ';
              return `${prefix}${v.name_kh.trim()}`;
            });
          }
        }
      }
    }
    return getVillagesForCommune(formData.province, formData.commune);
  }, [dbProvinces, dbDistricts, dbCommunes, dbVillages, formData.province, formData.district, formData.commune]);

  const handleChange = <K extends keyof SchoolInfo>(field: K, value: SchoolInfo[K]) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onSave(updated);
  };

  const handleProvinceSelect = (newProvince: string) => {
    const updated: SchoolInfo = {
      ...formData,
      province: newProvince,
      district: '',
      commune: '',
      village: ''
    };
    setFormData(updated);
    onSave(updated);
  };

  const handleDistrictSelect = (newDistrict: string) => {
    const updated: SchoolInfo = {
      ...formData,
      district: newDistrict,
      commune: '',
      village: ''
    };
    setFormData(updated);
    onSave(updated);
  };

  const handleCommuneSelect = (newCommune: string) => {
    const updated: SchoolInfo = {
      ...formData,
      commune: newCommune,
      village: ''
    };
    setFormData(updated);
    onSave(updated);
  };

  return (
    <div id="school-settings-section" className="w-full max-w-7xl mx-auto space-y-6 md:max-w-none">
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-medium text-slate-850 tracking-tight">ព័ត៌មានសាលារៀន</h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">គ្រប់គ្រងព័ត៌មានទូទៅរបស់សាលារៀន</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {/* Form Fields */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* School Name */}
            <div className="space-y-2 col-span-1 md:col-span-4">
              <label htmlFor="school-name-input" className="block text-sm font-bold text-slate-700">ឈ្មោះសាលារៀន</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <School className="w-4 h-4" />
                </div>
                <input
                  id="school-name-input"
                  type="text"
                  required
                  value={formData.schoolName}
                  onChange={e => handleChange('schoolName', e.target.value)}
                  placeholder="ឧ. អនុវិទ្យាល័យ បាលិលេយ្យ"
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            {/* School Code */}
            <div className="space-y-2 col-span-1 md:col-span-3">
              <label htmlFor="school-code-input" className="block text-sm font-bold text-slate-700">លេខកូដសាលា</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  id="school-code-input"
                  type="text"
                  value={formData.schoolCode || ''}
                  onChange={e => handleChange('schoolCode', e.target.value)}
                  placeholder="ឧ. 01100203702"
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            {/* Director Name */}
            <div className="space-y-2 col-span-1 md:col-span-3">
              <label htmlFor="director-name-input" className="block text-sm font-bold text-slate-700">ឈ្មោះនាយក / នាយិកា</label>
              <input
                id="director-name-input"
                type="text"
                required
                value={formData.directorName}
                onChange={e => handleChange('directorName', e.target.value)}
                placeholder="ឧ. ស្មិញ សឿត"
                className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>

            {/* Director Gender Dropdown without arrows */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label htmlFor="director-gender-select" className="block text-sm font-bold text-slate-700">ភេទ</label>
              <div className="relative">
                <select
                  id="director-gender-select"
                  value={formData.directorGender}
                  onChange={e => handleChange('directorGender', e.target.value as 'ប្រុស' | 'ស្រី')}
                  className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none appearance-none cursor-pointer"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                >
                  <option value="ប្រុស">ប្រុស</option>
                  <option value="ស្រី">ស្រី</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Location details */}
          <div className="space-y-4">
            <div 
              className="text-sm font-bold text-slate-700" 
              style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}
            >
              អាសយដ្ឋានសាលារៀន
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Province Dropdown menu */}
              <div className="space-y-1.5">
                <label htmlFor="province-select" className="text-xs font-bold text-slate-500">រាជធានី / ខេត្ត</label>
                <select
                  id="province-select"
                  value={formData.province || ''}
                  onChange={e => handleProvinceSelect(e.target.value)}
                  className={`block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none appearance-none cursor-pointer ${
                    !formData.province ? 'text-slate-400 font-medium' : 'text-slate-800'
                  }`}
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                >
                  <option value="" className="text-slate-400 font-medium">ជ្រើសរើស</option>
                  {provincesList.map(p => (
                    <option key={p} value={p} className="text-slate-800 font-medium">{p}</option>
                  ))}
                </select>
              </div>

              {/* District Dropdown menu */}
              <div className="space-y-1.5">
                <label htmlFor="district-select" className="text-xs font-bold text-slate-500">ស្រុក / ក្រុង / ខណ្ឌ</label>
                <select
                  id="district-select"
                  value={formData.district || ''}
                  onChange={e => handleDistrictSelect(e.target.value)}
                  className={`block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none appearance-none cursor-pointer ${
                    !formData.district ? 'text-slate-400 font-medium' : 'text-slate-800'
                  }`}
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                >
                  <option value="" className="text-slate-400 font-medium">ជ្រើសរើស</option>
                  {(() => {
                    const list = [...districtsList];
                    if (formData.district && !list.includes(formData.district)) {
                      list.unshift(formData.district);
                    }
                    return list.map(d => (
                      <option key={d} value={d} className="text-slate-800 font-medium">{d}</option>
                    ));
                  })()}
                </select>
              </div>

              {/* Commune Dropdown menu */}
              <div className="space-y-1.5">
                <label htmlFor="commune-select" className="text-xs font-bold text-slate-500">ឃុំ / សង្កាត់</label>
                <select
                  id="commune-select"
                  value={formData.commune || ''}
                  onChange={e => handleCommuneSelect(e.target.value)}
                  className={`block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none appearance-none cursor-pointer ${
                    !formData.commune ? 'text-slate-400 font-medium' : 'text-slate-800'
                  }`}
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                >
                  <option value="" className="text-slate-400 font-medium">ជ្រើសរើស</option>
                  {(() => {
                    const list = [...communesList];
                    if (formData.commune && !list.includes(formData.commune)) {
                      list.unshift(formData.commune);
                    }
                    return list.map(c => (
                      <option key={c} value={c} className="text-slate-800 font-medium">{c}</option>
                    ));
                  })()}
                </select>
              </div>

              {/* Village Dropdown menu */}
              <div className="space-y-1.5">
                <label htmlFor="village-select" className="text-xs font-bold text-slate-500">ភូមិ</label>
                <select
                  id="village-select"
                  value={formData.village || ''}
                  onChange={e => handleChange('village', e.target.value)}
                  className={`block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none appearance-none cursor-pointer ${
                    !formData.village ? 'text-slate-400 font-medium' : 'text-slate-800'
                  }`}
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                >
                  <option value="" className="text-slate-400 font-medium">ជ្រើសរើស</option>
                  {(() => {
                    const list = [...villagesList];
                    if (formData.village && !list.includes(formData.village)) {
                      list.unshift(formData.village);
                    }
                    return list.map(v => (
                      <option key={v} value={v} className="text-slate-800 font-medium">{v}</option>
                    ));
                  })()}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
