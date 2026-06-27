import React, { useState, useEffect, useMemo } from 'react';
import { School, CheckCircle, Hash, Trash2 } from 'lucide-react';
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
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [schoolAddressManual, setSchoolAddressManual] = useState(false);

  const provincesList = useMemo(() => {
    return getProvincesList();
  }, []);

  useEffect(() => {
    setFormData({ ...schoolInfo });
    const isCustom = schoolInfo.province ? !provincesList.includes(schoolInfo.province) : false;
    setSchoolAddressManual(isCustom);
  }, [schoolInfo, provincesList]);

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

  const handleConfirmDelete = () => {
    const emptyInfo: SchoolInfo = {
      schoolType: '',
      schoolName: '',
      schoolCode: '',
      province: '',
      district: '',
      commune: '',
      village: '',
      directorName: '',
      directorGender: 'ប្រុស',
      madeAt: '',
      studentAgeLimitDate: '',
      teacherAgeLimitDate: '',
      teacherServiceLimitDate: '',
    };
    setFormData(emptyInfo);
    onSave(emptyInfo);
    setIsConfirmDeleteOpen(false);
  };

  return (
    <div id="school-settings-section" className="w-full max-w-7xl mx-auto space-y-6 md:max-w-none">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {/* Card Header integrated with the form block */}
        <div className="border-b border-slate-100 p-6 flex flex-wrap gap-4 items-center justify-between">
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">ព័ត៌មានសាលារៀន</h1>
          <button
            type="button"
            onClick={() => setIsConfirmDeleteOpen(true)}
            className="px-4 py-2 bg-white hover:bg-rose-50 border border-rose-300 text-rose-600 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5"
            id="delete-school-info-btn"
          >
            <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
            លុបទិន្នន័យ
          </button>
        </div>

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

            {/* ធ្វើនៅ */}
            <div className="space-y-2 col-span-1 md:col-span-3">
              <label htmlFor="made-at-input" className="block text-sm font-bold text-slate-700">ធ្វើនៅ</label>
              <input
                id="made-at-input"
                type="text"
                value={formData.madeAt || ''}
                onChange={e => handleChange('madeAt', e.target.value)}
                placeholder="អនុវិ.បាលិលេយ្យ"
                className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>

            {/* គិតអាយុសិស្សត្រឹម */}
            <div className="space-y-2 col-span-1 md:col-span-3">
              <label htmlFor="student-age-limit-date-input" className="block text-sm font-bold text-slate-700">គិតអាយុសិស្សត្រឹម</label>
              <input
                id="student-age-limit-date-input"
                type="date"
                value={formData.studentAgeLimitDate || ''}
                onChange={e => handleChange('studentAgeLimitDate', e.target.value)}
                className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>

            {/* គិតអាយុគ្រូត្រឹម */}
            <div className="space-y-2 col-span-1 md:col-span-3">
              <label htmlFor="teacher-age-limit-date-input" className="block text-sm font-bold text-slate-700">គិតអាយុគ្រូត្រឹម</label>
              <input
                id="teacher-age-limit-date-input"
                type="date"
                value={formData.teacherAgeLimitDate || ''}
                onChange={e => handleChange('teacherAgeLimitDate', e.target.value)}
                className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>

            {/* គិតឆ្នាំបម្រើការគ្រូត្រឹម */}
            <div className="space-y-2 col-span-1 md:col-span-3">
              <label htmlFor="teacher-service-limit-date-input" className="block text-sm font-bold text-slate-700">គិតឆ្នាំបម្រើការគ្រូត្រឹម</label>
              <input
                id="teacher-service-limit-date-input"
                type="date"
                value={formData.teacherServiceLimitDate || ''}
                onChange={e => handleChange('teacherServiceLimitDate', e.target.value)}
                className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Location details */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div 
                className="text-sm font-bold text-slate-700" 
                style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}
              >
                អាសយដ្ឋានសាលារៀន
              </div>
              <button
                type="button"
                onClick={() => setSchoolAddressManual(!schoolAddressManual)}
                className="text-[10px] font-bold text-teal-600 hover:text-teal-700 underline cursor-pointer"
              >
                {schoolAddressManual ? 'ជ្រើសរើសពីបញ្ជី' : 'សរសេរដោយផ្ទាល់'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Province Dropdown/Input menu */}
              <div className="space-y-1.5">
                <label htmlFor="province-select" className="text-xs font-bold text-slate-500">រាជធានី / ខេត្ត</label>
                {schoolAddressManual ? (
                  <input
                    type="text"
                    value={formData.province || ''}
                    onChange={e => handleChange('province', e.target.value)}
                    placeholder="បញ្ចូលខេត្ត/ក្រុង"
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                ) : (
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
                )}
              </div>

              {/* District Dropdown/Input menu */}
              <div className="space-y-1.5">
                <label htmlFor="district-select" className="text-xs font-bold text-slate-500">ស្រុក / ក្រុង / ខណ្ឌ</label>
                {schoolAddressManual ? (
                  <input
                    type="text"
                    value={formData.district || ''}
                    onChange={e => handleChange('district', e.target.value)}
                    placeholder="បញ្ចូលស្រុក/ក្រុង/ខណ្ឌ"
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                ) : (
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
                )}
              </div>

              {/* Commune Dropdown/Input menu */}
              <div className="space-y-1.5">
                <label htmlFor="commune-select" className="text-xs font-bold text-slate-500">ឃុំ / សង្កាត់</label>
                {schoolAddressManual ? (
                  <input
                    type="text"
                    value={formData.commune || ''}
                    onChange={e => handleChange('commune', e.target.value)}
                    placeholder="បញ្ចូលឃុំ/សង្កាត់"
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                ) : (
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
                )}
              </div>

              {/* Village Dropdown/Input menu */}
              <div className="space-y-1.5">
                <label htmlFor="village-select" className="text-xs font-bold text-slate-500">ភូមិ</label>
                {schoolAddressManual ? (
                  <input
                    type="text"
                    value={formData.village || ''}
                    onChange={e => handleChange('village', e.target.value)}
                    placeholder="បញ្ចូលភូមិ"
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                ) : (
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">បញ្ជាក់ការលុបទិន្នន័យ</h3>
            </div>
            
            <p className="text-slate-600 text-xs leading-relaxed font-semibold">
              តើអ្នកពិតជាចង់លុបទិន្នន័យព័ត៌មានសាលារៀននេះមែនទេ? រាល់ព័ត៌មានដែលបានកំណត់ទាំងអស់នឹងត្រូវលុបសម្អាតឡើងវិញ។
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition duration-150 cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition duration-150 cursor-pointer"
              >
                យល់ព្រមលុប
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
