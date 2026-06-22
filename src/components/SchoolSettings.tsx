import React, { useState, useEffect, useMemo } from 'react';
import { School, CheckCircle, Hash } from 'lucide-react';
import { SchoolInfo } from '../types';
import { 
  getProvincesList, 
  getDistrictsForProvince, 
  getCommunesForDistrict, 
  getVillagesForCommune 
} from '../data/locationData';

interface SchoolSettingsProps {
  schoolInfo: SchoolInfo;
  onSave: (info: SchoolInfo) => void;
}

export default function SchoolSettings({ schoolInfo, onSave }: SchoolSettingsProps) {
  const [formData, setFormData] = useState<SchoolInfo>({ ...schoolInfo });
  useEffect(() => {
    setFormData({ ...schoolInfo });
  }, [schoolInfo]);
  const provincesList = useMemo(() => {
    return getProvincesList();
  }, []);

  const districtsList = useMemo(() => {
    return getDistrictsForProvince(formData.province);
  }, [formData.province]);

  const communesList = useMemo(() => {
    return getCommunesForDistrict(formData.province, formData.district);
  }, [formData.province, formData.district]);

  const villagesList = useMemo(() => {
    return getVillagesForCommune(formData.province, formData.district, formData.commune);
  }, [formData.province, formData.district, formData.commune]);

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
