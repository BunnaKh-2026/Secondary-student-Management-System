import provincesJson from '../../public/data/provinces.json';
import districtsJson from '../../public/data/districts.json';
import communesJson from '../../public/data/communes.json';
import villagesJson from '../../public/data/villages.json';

export interface RawProvince {
  code: string;
  name_kh: string;
  name_en: string;
}

export interface RawDistrict {
  code: string;
  province_code: string;
  name_kh: string;
  name_en: string;
  type?: string;
}

export interface RawCommune {
  code: string;
  district_code: string;
  name_kh: string;
  name_en: string;
  type?: string;
}

export interface RawVillage {
  code: string;
  commune_code: string;
  name_kh: string;
  name_en: string;
  type?: string;
}

export const CAMBODIAN_PROVINCES: RawProvince[] = provincesJson as RawProvince[];
export const CAMBODIAN_DISTRICTS: RawDistrict[] = districtsJson as RawDistrict[];
export const CAMBODIAN_COMMUNES: RawCommune[] = communesJson as RawCommune[];
export const CAMBODIAN_VILLAGES: RawVillage[] = villagesJson as RawVillage[];

export const getProvincesList = (): string[] => {
  const sorted = [...CAMBODIAN_PROVINCES].sort((a, b) => {
    const codeA = a.code || '';
    const codeB = b.code || '';
    return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
  });
  return sorted.map(p => p.name_kh);
};

export const getDistrictsForProvince = (provinceName: string): string[] => {
  if (!provinceName) return [];
  const pObj = CAMBODIAN_PROVINCES.find(p => p.name_kh === provinceName || p.name_en === provinceName);
  if (pObj) {
    const filtered = CAMBODIAN_DISTRICTS.filter(d => d.province_code === pObj.code);
    const sorted = filtered.sort((a, b) => (a.code || '').localeCompare(b.code || '', undefined, { numeric: true, sensitivity: 'base' }));
    return sorted.map(d => {
      const prefix = d.type ? d.type.trim() : 'ស្រុក';
      return `${prefix}${d.name_kh.trim()}`;
    });
  }
  return [];
};

export const normalizeName = (name: string): string => {
  if (!name) return '';
  const clean = name.replace(/\s+/g, '');
  return clean.replace(/^(ស្រុក|ក្រុង|ខណ្ឌ|ឃុំ|សង្កាត់|ភូមិ)/, '');
};

export const getCommunesForDistrict = (provinceName: string, districtName: string): string[] => {
  if (!provinceName || !districtName) return [];
  const pObj = CAMBODIAN_PROVINCES.find(p => p.name_kh === provinceName || p.name_en === provinceName);
  if (pObj) {
    const dObj = CAMBODIAN_DISTRICTS.find(d => {
      if (d.province_code !== pObj.code) return false;
      return normalizeName(d.name_kh) === normalizeName(districtName) || d.name_en === districtName;
    });
    if (dObj) {
      const filtered = CAMBODIAN_COMMUNES.filter(c => c.district_code === dObj.code);
      const sorted = filtered.sort((a, b) => (a.code || '').localeCompare(b.code || '', undefined, { numeric: true, sensitivity: 'base' }));
      return sorted.map(c => {
        const prefix = c.type ? c.type.trim() : 'ឃុំ';
        return `${prefix}${c.name_kh.trim()}`;
      });
    }
  }
  return [];
};

export const getVillagesForCommune = (provinceName: string, districtName: string, communeName: string): string[] => {
  if (!provinceName || !districtName || !communeName) return [];
  const pObj = CAMBODIAN_PROVINCES.find(p => p.name_kh === provinceName || p.name_en === provinceName);
  if (pObj) {
    const dObj = CAMBODIAN_DISTRICTS.find(d => {
      if (d.province_code !== pObj.code) return false;
      return normalizeName(d.name_kh) === normalizeName(districtName) || d.name_en === districtName;
    });
    if (dObj) {
      const cObj = CAMBODIAN_COMMUNES.find(c => {
        if (c.district_code !== dObj.code) return false;
        return normalizeName(c.name_kh) === normalizeName(communeName) || c.name_en === communeName;
      });
      if (cObj) {
        const filtered = CAMBODIAN_VILLAGES.filter(v => v.commune_code === cObj.code);
        const sorted = filtered.sort((a, b) => (a.code || '').localeCompare(b.code || '', undefined, { numeric: true, sensitivity: 'base' }));
        return sorted.map(v => {
          const prefix = v.type ? v.type.trim() : 'ភូមិ';
          return `${prefix}${v.name_kh.trim()}`;
        });
      }
    }
  }
  return [];
};
