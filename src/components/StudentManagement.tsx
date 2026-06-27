import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  GraduationCap, UserPlus, School, Search, Trash2, Edit2, Pencil,
  Printer, Plus, X, ArrowRight, Table, Phone, MapPin, Calendar, CheckCircle,
  AlertTriangle, IdCard, Save, GripVertical, RotateCcw, XCircle, User, Camera,
  ArrowUpDown
} from 'lucide-react';
import { Student, Classroom, SchoolInfo } from '../types';
import { 
  getProvincesList, 
  getDistrictsForProvince, 
  getCommunesForDistrict, 
  getVillagesForCommune 
} from '../data/locationData';
import { 
  STANDARD_SUBJECTS_LAYOUT, 
  getSubjectCategoryKey, 
  getDefaultSubjectsForClass, 
  getStandardSubjectsForCategory, 
  getClassroomsForCategory,
  SubjectLayoutItem
} from '../data/subjectLayouts';

export const DEFAULT_SUBJECTS = [
  { id: '1', name: 'ភាសាខ្មែរ', coefficient: 2, isActive: true },
  { id: '2', name: 'គណិតវិទ្យា', coefficient: 2, isActive: true },
  { id: '3', name: 'រូបវិទ្យា', coefficient: 1.5, isActive: true },
  { id: '4', name: 'គីមីវិទ្យា', coefficient: 1.5, isActive: true },
  { id: '5', name: 'ជីវវិទ្យា', coefficient: 1, isActive: true },
  { id: '6', name: 'ប្រវត្តិវិទ្យា', coefficient: 1, isActive: true },
  { id: '7', name: 'ភូមិវិទ្យា', coefficient: 1, isActive: true },
  { id: '8', name: 'សីលធម៌-ពលរដ្ឋ', coefficient: 1, isActive: true },
  { id: '9', name: 'ភាសាបរទេស (អង់គ្លេស)', coefficient: 1, isActive: true },
  { id: '10', name: 'ព័ត៌មានវិទ្យា', coefficient: 1, isActive: true },
];

const toArabicClassname = (name: string): string => {
  if (!name) return '';
  let clean = name.replace(/^(ថ្នាក់ទី|ថ្នាក់)\s*/g, '').trim();
  const khmerToArabic: { [key: string]: string } = {
    '០': '0', '១': '1', '២': '2', '៣': '3', '៤': '4',
    '៥': '5', '៦': '6', '៧': '7', '៨': '8', '៩': '9'
  };
  let replaced = '';
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (khmerToArabic[char] !== undefined) {
      replaced += khmerToArabic[char];
    } else {
      replaced += char;
    }
  }
  return replaced
    .replace(/អា/gi, 'A')
    .replace(/ប៊ី/gi, 'B')
    .replace(/ស៊ី/gi, 'C')
    .replace(/ឌី/gi, 'D')
    .replace(/អេ/gi, 'A')
    .replace(/បេ/gi, 'B')
    .replace(/សេ/gi, 'C')
    .replace(/ដេ/gi, 'D')
    .replace(/\s+/g, '');
};

const toArabicClassnameWithPrefix = (name: string): string => {
  if (!name) return '';
  const prefix = name.startsWith('ថ្នាក់ទី') ? 'ថ្នាក់ទី ' : name.startsWith('ថ្នាក់') ? 'ថ្នាក់ ' : '';
  const clean = name.replace(/^(ថ្នាក់ទី|ថ្នាក់)\s*/g, '').trim();
  const khmerToArabic: { [key: string]: string } = {
    '០': '0', '១': '1', '២': '2', '៣': '3', '៤': '4',
    '៥': '5', '៦': '6', '៧': '7', '៨': '8', '៩': '9'
  };
  let replaced = '';
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (khmerToArabic[char] !== undefined) {
      replaced += khmerToArabic[char];
    } else {
      replaced += char;
    }
  }
  return prefix + replaced
    .replace(/អា/gi, 'A')
    .replace(/ប៊ី/gi, 'B')
    .replace(/ស៊ី/gi, 'C')
    .replace(/ឌី/gi, 'D')
    .replace(/អេ/gi, 'A')
    .replace(/បេ/gi, 'B')
    .replace(/សេ/gi, 'C')
    .replace(/ដេ/gi, 'D')
    .replace(/\s+/g, '');
};

interface StudentManagementProps {
  students: Student[];
  classrooms: Classroom[];
  schoolInfo: SchoolInfo;
  onUpdateStudents: (list: Student[]) => void;
  onUpdateClassrooms: (list: Classroom[]) => void;
  onSelectClassroom: (classId: string) => void;
  activeSubTab?: 'classes_list' | 'classes' | 'students' | 'coefficients' | 'months';
}

const COMMON_KHMER_NAME_REPLACEMENTS: { [key: string]: string } = {
  'សុខ': 'SOK',
  'វិបុល': 'VIBOL',
  'ចាន់': 'CHAN',
  'ស្រីនី': 'SREYNY',
  'លី': 'LY',
  'ម៉េងហួរ': 'MENGHOUR',
  'សេង': 'SENG',
  'ធារី': 'THEARY',
  'រស់': 'ROS',
  'សំណាង': 'SAMNANG',
  'អ៊ន': 'ORN',
  'វត្តី': 'WATTEY',
  'ឃុន': 'KHUN',
  'រិទ្ធី': 'RITHY',
  'តាក': 'TAK',
  'សៀវម៉ី': 'SIEVMEY',
  'ជា': 'CHEA',
  'សុភ័ក្ត្រ': 'SOPHEAKTRA',
  'ម៉ៅ': 'MAO',
  'គីមហុង': 'KIMHONG',
  'នួន': 'NOUN',
  'ស្រីរ័ត្ន': 'SREYRATH',
  'សួន': 'SOUN',
  'វាសនា': 'VEASNA',
  'ញ៉ែម': 'NHEM',
  'សុជាតា': 'SOCHEATA',
  'ផានិត': 'PHANIT',
  'រតនា': 'ROTHANA',
  'លាង': 'LEANG',
  'ធីតា': 'THIDA',
  'វង្ស': 'VONG',
  'ដារ៉ា': 'DARA',
  'មាស': 'MEAS',
  'សុខហេង': 'SOKHENG',
  'ហេង': 'HENG',
  'ម៉ូនីកា': 'MONIKA',
  'គឹម': 'KIM',
  'ចាន់ដារ៉ា': 'CHANDARA',
  'តែម': 'TEM',
  'ស្រីនាថ': 'SREYNEATH',
  'ឃឿន': 'KHOEUN',
  'ចាន់ឌី': 'CHANDY',
  'សួង': 'SUONG',
  'សលីណា': 'SOLINA',
  'ឡុង': 'LONG',
  'រិទ្ធ': 'RITH',
  'ស្រីពេជ្រ': 'SREYPECH',
  'បុណ្ណា': 'BUNNA',
  'ផៃ': 'PHAI',
  'ផាន់': 'PHAN',
  'សែន': 'SEN',
  'សាក់': 'SAK',
  'ណា': 'NA',
  'មុនី': 'MUNY',
  'កុសល': 'KOSAL',
  'គន្ធា': 'KUNTHEA',
  'ចន្ថា': 'CHANTHA',
  'វណ្ណា': 'VANNA',
  'ម៉ាប់': 'MAB',
  'ខៀវ': 'KHIEV',
  'ផា': 'PHA',
  'លីម': 'LIM',
  'ហួត': 'HUOT',
  'ធំ': 'THOM',
  'ពៅ': 'POV',
  'នី': 'NY',
  'ស្រី': 'SREY',
  'ពេជ្រ': 'PECH',
  'ប៊ុន': 'BUN',
  'ប៊ុណ្ណា': 'BUNNA',
  'ណារិន': 'NARIN',
  'វណ្ណី': 'VANNY',
  'រស្មី': 'RAKSMEY',
  'ពិសិដ្ឋ': 'PISETH',
  'ផល្លា': 'PHALLA',
  'តារា': 'DARA',
  'វាសនា​': 'VEASNA',
  'សុផា': 'SOPHA',
  'សុភ័ក្រ': 'SOPHEAK',
  'ណារ៉ុង': 'NARONG',
  'លីដា': 'LYDA',
  'សំណាប': 'SAMNAB',
  'វិច្ឆិកា': 'VUTHY',
  'វុទ្ធី': 'VUTHY',
  // Reference Image Specific Examples
  'ចិន្តា': 'CHENDA',
  'ខន្តី': 'KHANTEY',
  'សឿន': 'SOEURN',
  'ព្រះ': 'PREAH',
  'សុចាន់': 'SOCHANN',
  'សុភី': 'SOPHY',
  'សម្បត្តិ': 'SAMBATH',
  'សារ៉ាត់': 'SARATH',
  'សារិទ្ធ': 'SARITH',
  'សុផាន': 'SOPHAN',
  'សុផាន់': 'SOPHANN',
  'ភៃ': 'PHAI',
  'សោភា': 'SOPHEA',
  'រចនា': 'RACHANA',
  'ពិសី': 'PISEY'
};

const calculateAge = (dobString: string): string => {
  if (!dobString) return '';
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? String(age) : '';
};

const transliterateKhmerToLatin = (khText: string): string => {
  if (!khText) return '';
  
  const A_SERIES = new Set(['ក', 'ខ', 'ច', 'ឆ', 'ដ', 'ឋ', 'ណ', 'ត', 'ថ', 'ប', 'ផ', 'ស', 'ហ', 'ឡ', 'អ']);
  const O_SERIES = new Set(['គ', 'ឃ', 'ង', 'ជ', 'ឈ', 'ញ', 'ឌ', 'ឍ', 'ទ', 'ធ', 'ន', 'ព', 'ភ', 'ម', 'យ', 'រ', 'ល', 'វ']);

  const CONSONANT_MAP: { [key: string]: string } = {
    'ក': 'K', 'ខ': 'KH', 'គ': 'K', 'ឃ': 'KH', 'ង': 'NG',
    'ច': 'CH', 'ឆ': 'CHH', 'ជ': 'CH', 'ឈ': 'CHH', 'ញ': 'NH',
    'ដ': 'D', 'ឋ': 'TH', 'ឌ': 'D', 'ឍ': 'TH', 'ណ': 'N',
    'ត': 'T', 'ថ': 'TH', 'ទ': 'T', 'ធ': 'TH', 'ន': 'N',
    'ប': 'B', 'ផ': 'PH', 'ព': 'P', 'ភ': 'PH', 'ម': 'M',
    'យ': 'Y', 'រ': 'R', 'ល': 'L', 'វ': 'V', 'ស': 'S',
    'ហ': 'H', 'ឡ': 'L', 'អ': 'A'
  };

  const VOWELS_MAP: { [key: string]: { A: string; O: string } } = {
    'ា': { A: 'A', O: 'EA' },
    'ិ': { A: 'E', O: 'I' },
    'ី': { A: 'EY', O: 'Y' },
    'ឹ': { A: 'OE', O: 'UE' },
    'ឺ': { A: 'EU', O: 'U' },
    'ុ': { A: 'O', O: 'U' },
    'ូ': { A: 'OU', O: 'OU' },
    'ួ': { A: 'UO', O: 'UO' },
    'ើ': { A: 'AOE', O: 'OEUR' },
    'ឿ': { A: 'OEUR', O: 'OEUR' },
    'ៀ': { A: 'IE', O: 'IE' },
    'េ': { A: 'E', O: 'E' },
    'ែ': { A: 'AE', O: 'E' },
    'ៃ': { A: 'AI', O: 'AY' },
    'ោ': { A: 'OR', O: 'EOU' },
    'ៅ': { A: 'AO', O: 'OUV' },
    'ំ': { A: 'AM', O: 'OUM' },
    'ះ': { A: 'AH', O: 'EAH' },
    'ៈ': { A: 'A', O: 'EA' },
    'ាំ': { A: 'AM', O: 'OAM' },
    'ុំ': { A: 'OM', O: 'UM' },
    'ិះ': { A: 'OS', O: 'OUS' },
    'ុះ': { A: 'UH', O: 'UH' },
    'េះ': { A: 'EH', O: 'IS' },
    'ោះ': { A: 'OH', O: 'UOS' }
  };

  const words = khText.trim().split(/\s+/);
  const mappedWords = words.map(word => {
    if (COMMON_KHMER_NAME_REPLACEMENTS[word]) {
      return COMMON_KHMER_NAME_REPLACEMENTS[word];
    }
    
    let result = '';
    const containsBantak = word.includes('់');
    let currentSeries: 'A' | 'O' = 'A';

    for (let i = 0; i < word.length; i++) {
      const char = word[i];

      // Check subscript
      if (char === '្') {
        if (i + 1 < word.length) {
          const nextChar = word[i + 1];
          const mappedSub = CONSONANT_MAP[nextChar];
          if (mappedSub) {
            result += mappedSub;
          }
          i++; // skip next char
        }
        continue;
      }

      // Check base consonant
      if (CONSONANT_MAP[char] !== undefined) {
        let series: 'A' | 'O' = O_SERIES.has(char) ? 'O' : 'A';

        // Look ahead for shifters ៉ or ៊
        for (let j = 1; j <= 2; j++) {
          if (i + j < word.length) {
            const nextC = word[i + j];
            if (nextC === '៉') {
              series = 'A';
            } else if (nextC === '៊') {
              series = 'O';
            }
          }
        }

        currentSeries = series;
        result += CONSONANT_MAP[char];
        continue;
      }

      // Check composite vowels
      if (char === 'ា' && i + 1 < word.length && word[i + 1] === 'ំ') {
        const vMap = VOWELS_MAP['ាំ'];
        result += currentSeries === 'A' ? vMap.A : vMap.O;
        i++;
        continue;
      }
      if (char === 'ុ' && i + 1 < word.length && word[i + 1] === 'ំ') {
        const vMap = VOWELS_MAP['ុំ'];
        result += currentSeries === 'A' ? vMap.A : vMap.O;
        i++;
        continue;
      }

      // Check standard vowels
      if (VOWELS_MAP[char] !== undefined) {
        const vMap = VOWELS_MAP[char];
        result += currentSeries === 'A' ? vMap.A : vMap.O;
        continue;
      }

      // Santhak ័
      if (char === '័') {
        result += 'A';
        continue;
      }
    }

    // Apply Bantak rule (if ends with consonant, duplicate the last letter)
    if (containsBantak && result.length > 0) {
      const lastChar = result[result.length - 1];
      const vowelsSet = new Set(['A', 'E', 'I', 'O', 'U', 'Y']);
      if (!vowelsSet.has(lastChar)) {
        result += lastChar;
      }
    }

    // Apply ends-with-T rule (T -> TH)
    if (result.endsWith('T')) {
      result += 'H';
    }

    return result;
  });
  
  return mappedWords.join(' ').toUpperCase().replace(/\s+/g, ' ').trim();
};

export default function StudentManagement({
  students,
  classrooms,
  schoolInfo,
  onUpdateStudents,
  onUpdateClassrooms,
  onSelectClassroom,
  activeSubTab: activeSubTabProp,
}: StudentManagementProps) {
  // Navigation
  const [activeSubTab, setActiveSubTab] = useState<'classes_list' | 'classes' | 'students' | 'coefficients' | 'months'>(activeSubTabProp || 'students');

  const [localSubjects, setLocalSubjects] = useState<{ [classroomId: string]: any[] }>({});
  const [localMonths, setLocalMonths] = useState<{ [classroomId: string]: string[] }>({});
  const [categorySubjects, setCategorySubjects] = useState<{ [catId: string]: any[] }>({});
  const [successToast, setSuccessToast] = useState<{ message: string, classroomId: string } | null>(null);

  // Drag and Drop state for subject coefficients reordering
  const [draggingInfo, setDraggingInfo] = useState<{ catId: string; index: number } | null>(null);
  const [dragOverInfo, setDragOverInfo] = useState<{ catId: string; index: number } | null>(null);

  // Subject deleting / adding / restoring states
  const [subjectToDelete, setSubjectToDelete] = useState<{ catId: string; subId: string; subName: string } | null>(null);
  const [categoryToRestore, setCategoryToRestore] = useState<{ catId: string; catName: string } | null>(null);
  const [addingSubjectCatId, setAddingSubjectCatId] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectMaxScore, setNewSubjectMaxScore] = useState<number | string>(50);

  // Subject editing states
  const [editingSubjectConfig, setEditingSubjectConfig] = useState<{ catId: string; sub: any } | null>(null);
  const [editSubjectName, setEditSubjectName] = useState('');
  const [editSubjectCode, setEditSubjectCode] = useState('');
  const [editSubjectMaxScore, setEditSubjectMaxScore] = useState<number | string>(50);

  // Toast state for student registration
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const successToastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      if (successToastTimeoutRef.current) {
        clearTimeout(successToastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const subs: { [key: string]: any[] } = {};
    const mons: { [key: string]: string[] } = {};
    
    classrooms.forEach(c => {
      subs[c.id] = c.preStartConfig?.subjects || DEFAULT_SUBJECTS;
      mons[c.id] = c.preStartConfig?.activeMonthsForAverage || ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា'];
    });
    
    setLocalSubjects(subs);
    setLocalMonths(mons);

    // Initialize category subjects for each category active in the school
    const categoriesList = [
      { id: 'G7', name: 'កម្រិតថ្នាក់ទី៧' },
      { id: 'G8', name: 'កម្រិតថ្នាក់ទី៨' },
      { id: 'G9', name: 'កម្រិតថ្នាក់ទី៩' },
      { id: 'G10', name: 'កម្រិតថ្នាក់ទី១០' },
      { id: 'G11_SC', name: 'កម្រិតថ្នាក់ទី១១ (វិទ្យាសាស្ត្រ)' },
      { id: 'G11_SS', name: 'កម្រិតថ្នាក់ទី១១ (សង្គម)' },
      { id: 'G12_SC', name: 'កម្រិតថ្នាក់ទី១២ (វិទ្យាសាស្ត្រ)' },
      { id: 'G12_SS', name: 'កម្រិតថ្នាក់ទី១២ (សង្គម)' }
    ];

    const updatedCategorySubjects: { [catId: string]: any[] } = {};

    categoriesList.forEach(cat => {
      const clsInCat = getClassroomsForCategory(cat.id, classrooms);
      if (clsInCat.length === 0) return;

      // Find any classroom that has subjects configured
      const customizedClass = clsInCat.find(c => c.preStartConfig?.subjects && c.preStartConfig.subjects.length > 0);
      const defaultLayout = getStandardSubjectsForCategory(cat.id);
      const existingSubjects = customizedClass?.preStartConfig?.subjects || [];

      // Merge layouts
      const merged = defaultLayout.map(def => {
        const match = existingSubjects.find(ex => ex.name === def.name || ex.id === def.id);
        if (match) {
          const maxScore = match.maxScore !== undefined ? match.maxScore : (match.coefficient !== undefined ? match.coefficient * 50 : def.maxScore);
          return {
            ...def,
            isActive: match.isActive !== undefined ? match.isActive : def.isActive,
            maxScore,
            coefficient: maxScore / 50,
            code: match.code || def.code || def.id.toUpperCase(),
          };
        }
        return {
          ...def,
          code: def.code || def.id.toUpperCase(),
        };
      });

      // Add any custom subjects from existingSubjects that are not in defaultLayout
      existingSubjects.forEach(ex => {
        const isStandard = defaultLayout.some(def => def.name === ex.name || def.id === ex.id);
        if (!isStandard) {
          const maxScore = ex.maxScore !== undefined ? ex.maxScore : (ex.coefficient !== undefined ? ex.coefficient * 50 : 50);
          merged.push({
            id: ex.id,
            name: ex.name,
            isActive: ex.isActive !== undefined ? ex.isActive : true,
            maxScore,
            coefficient: maxScore / 50,
            code: ex.code || ex.id.toUpperCase(),
          });
        }
      });

      updatedCategorySubjects[cat.id] = merged;
    });

    setCategorySubjects(updatedCategorySubjects);
  }, [classrooms]);

  const handleSaveClassroomConfig = (classId: string, updatedSubjects: any[]) => {
    const updatedClassrooms = classrooms.map(c => {
      if (c.id === classId) {
        const preStartConfig = c.preStartConfig || {
          classroomId: c.id,
          homeTeacherName: '',
          academicYear: '២០២៥-២០២៦',
          semester1Months: ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា'],
          semester2Months: ['មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា'],
          activeMonthsForAverage: ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា'],
          subjects: DEFAULT_SUBJECTS,
        };
        return {
          ...c,
          preStartConfig: {
            ...preStartConfig,
            subjects: updatedSubjects
          }
        };
      }
      return c;
    });
    onUpdateClassrooms(updatedClassrooms);
    setSuccessToast({
      message: 'រក្សាទុកមេគុណរួចរាល់!',
      classroomId: classId
    });
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleCategoryToggleSub = (catId: string, subId: string) => {
    setCategorySubjects(prev => {
      const current = prev[catId] || [];
      const updated = current.map(s => s.id === subId ? { ...s, isActive: !s.isActive } : s);
      autoSaveCategorySubjects(catId, updated);
      return { ...prev, [catId]: updated };
    });
  };

  const autoSaveCategorySubjects = (catId: string, updatedSubs: any[]) => {
    const catClassrooms = getClassroomsForCategory(catId, classrooms);
    const catClassIds = catClassrooms.map(c => c.id);

    const updatedClassrooms = classrooms.map(c => {
      if (catClassIds.includes(c.id)) {
        const preStartConfig = c.preStartConfig || {
          classroomId: c.id,
          homeTeacherName: '',
          academicYear: '២០២៥-២០២៦',
          semester1Months: ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា'],
          semester2Months: ['មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា'],
          activeMonthsForAverage: ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា'],
          subjects: []
        };
        return {
          ...c,
          preStartConfig: {
            ...preStartConfig,
            subjects: updatedSubs
          }
        };
      }
      return c;
    });

    onUpdateClassrooms(updatedClassrooms);

    if (successToastTimeoutRef.current) {
      clearTimeout(successToastTimeoutRef.current);
    }
    setSuccessToast({
      message: `បានរក្សាទុកដោយស្វ័យប្រវត្តិ!`,
      classroomId: catId
    });
    successToastTimeoutRef.current = setTimeout(() => {
      setSuccessToast(null);
    }, 2000);
  };

  const autoSaveCategoryMonths = (catId: string, updatedSem1: string[], updatedSem2: string[]) => {
    const catClassrooms = getClassroomsForCategory(catId, classrooms);
    const catClassIds = catClassrooms.map(c => c.id);

    const updatedClassrooms = classrooms.map(c => {
      if (catClassIds.includes(c.id)) {
        const preStartConfig = c.preStartConfig || {
          classroomId: c.id,
          homeTeacherName: '',
          academicYear: '២០២៥-២០២៦',
          semester1Months: ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា'],
          semester2Months: ['មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា'],
          activeMonthsForAverage: ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា'],
          subjects: []
        };
        return {
          ...c,
          preStartConfig: {
            ...preStartConfig,
            semester1Months: updatedSem1,
            semester2Months: updatedSem2,
            activeMonthsForAverage: [...updatedSem1, ...updatedSem2]
          }
        };
      }
      return c;
    });

    onUpdateClassrooms(updatedClassrooms);

    if (successToastTimeoutRef.current) {
      clearTimeout(successToastTimeoutRef.current);
    }
    setSuccessToast({
      message: `បានរក្សាទុកដោយស្វ័យប្រវត្តិ!`,
      classroomId: catId
    });
    successToastTimeoutRef.current = setTimeout(() => {
      setSuccessToast(null);
    }, 2000);
  };

  const handleCategoryMaxScoreChange = (catId: string, subId: string, val: number) => {
    setCategorySubjects(prev => {
      const current = prev[catId] || [];
      const updated = current.map(s => {
        if (s.id === subId) {
          const maxVal = Math.max(0, val);
          return { 
            ...s, 
            maxScore: maxVal,
            coefficient: maxVal / 50
          };
        }
        return s;
      });
      autoSaveCategorySubjects(catId, updated);
      return { ...prev, [catId]: updated };
    });
  };

  const handleDragEnd = () => {
    setDraggingInfo(null);
    setDragOverInfo(null);
  };

  const handleDropRow = (targetCatId: string, targetIndex: number) => {
    if (!draggingInfo || draggingInfo.catId !== targetCatId) return;
    const sourceIndex = draggingInfo.index;
    if (sourceIndex === targetIndex) return;

    setCategorySubjects(prev => {
      const current = prev[targetCatId] || [];
      const updated = [...current];
      const [movedItem] = updated.splice(sourceIndex, 1);
      updated.splice(targetIndex, 0, movedItem);
      autoSaveCategorySubjects(targetCatId, updated);
      return { ...prev, [targetCatId]: updated };
    });

    setDraggingInfo(null);
    setDragOverInfo(null);
  };

  const handleAddSubject = (catId: string) => {
    if (!newSubjectName.trim()) return;
    const maxScore = parseFloat(newSubjectMaxScore as string) || 0;
    if (maxScore <= 0) return;

    const code = newSubjectCode.trim() || ('SUB_' + Date.now().toString().slice(-4));
    const newSub = {
      id: 'sub_custom_' + Date.now(),
      name: newSubjectName.trim(),
      isActive: true,
      maxScore,
      coefficient: maxScore / 50,
      code: code.toUpperCase()
    };

    setCategorySubjects(prev => {
      const current = prev[catId] || [];
      // Avoid duplicate names if they exist
      if (current.some(s => s.name.toLowerCase() === newSubjectName.trim().toLowerCase())) {
        showToast('ឈ្មោះមុខវិជ្ជាមានរួចហើយ!', 'info');
        return prev;
      }
      const updated = [...current, newSub];
      autoSaveCategorySubjects(catId, updated);
      return {
        ...prev,
        [catId]: updated
      };
    });

    setNewSubjectName('');
    setNewSubjectCode('');
    setNewSubjectMaxScore(50);
    setAddingSubjectCatId(null);
    showToast('បានបន្ថែមមុខវិជ្ជាថ្មី!');
  };

  const handleEditSubject = () => {
    if (!editingSubjectConfig) return;
    const { catId, sub } = editingSubjectConfig;
    if (!editSubjectName.trim()) return;
    const maxScore = parseFloat(editSubjectMaxScore as string) || 0;
    if (maxScore <= 0) return;

    setCategorySubjects(prev => {
      const current = prev[catId] || [];
      const updated = current.map(s => {
        if (s.id === sub.id) {
          return {
            ...s,
            name: editSubjectName.trim(),
            code: (editSubjectCode.trim() || s.code || s.id).toUpperCase(),
            maxScore,
            coefficient: maxScore / 50,
          };
        }
        return s;
      });
      autoSaveCategorySubjects(catId, updated);
      return {
        ...prev,
        [catId]: updated
      };
    });

    setEditingSubjectConfig(null);
    showToast('បានកែសម្រួលមុខវិជ្ជាជោគជ័យ!');
  };

  const handleDeleteSubject = (catId: string, subId: string) => {
    setCategorySubjects(prev => {
      const current = prev[catId] || [];
      const updated = current.filter(s => s.id !== subId);
      autoSaveCategorySubjects(catId, updated);
      return { ...prev, [catId]: updated };
    });
    setSubjectToDelete(null);
    showToast('បានលុបមុខវិជ្ជាពីបញ្ជី!');
  };

  const handleRestoreDefaultSubjects = (catId: string) => {
    const defaultLayout = getStandardSubjectsForCategory(catId);
    setCategorySubjects(prev => {
      autoSaveCategorySubjects(catId, defaultLayout);
      return {
        ...prev,
        [catId]: defaultLayout
      };
    });
    setCategoryToRestore(null);
    showToast('បានស្ដារមុខវិជ្ជាដើមឡើងវិញ!');
  };

  const handleSaveClassroomMonths = (classId: string, updatedMonths: string[]) => {
    const updatedClassrooms = classrooms.map(c => {
      if (c.id === classId) {
        const preStartConfig = c.preStartConfig || {
          classroomId: c.id,
          homeTeacherName: '',
          academicYear: '២០២៥-២០២៦',
          semester1Months: ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា'],
          semester2Months: ['មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា'],
          activeMonthsForAverage: ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា'],
          subjects: DEFAULT_SUBJECTS,
        };
        return {
          ...c,
          preStartConfig: {
            ...preStartConfig,
            activeMonthsForAverage: updatedMonths
          }
        };
      }
      return c;
    });
    onUpdateClassrooms(updatedClassrooms);
    setSuccessToast({
      message: 'រក្សាទុកខែយកពិន្ទុរួចរាល់!',
      classroomId: classId
    });
    setTimeout(() => setSuccessToast(null), 3000);
  };

  useEffect(() => {
    if (activeSubTabProp) {
      setActiveSubTab(activeSubTabProp);
    }
  }, [activeSubTabProp]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Class creation States
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classForm, setClassForm] = useState<Omit<Classroom, 'id'>>({
    name: '',
    grade: '៧',
  });

  // New Class List creation states
  const [newListGrade, setNewListGrade] = useState<'៧' | '៨' | '៩' | '១០' | '១១' | '១២'>('៧');
  const [selectedListGroups, setSelectedListGroups] = useState<string[]>(['A']);
  const [newListType, setNewListType] = useState<string>('ទូទៅ');
  const [customTypeInput, setCustomTypeInput] = useState<string>('');
  const [groupPresets, setGroupPresets] = useState<string[]>(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']);
  const [newCustomGroup, setNewCustomGroup] = useState<string>('');
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const [isCreateClassListModalOpen, setIsCreateClassListModalOpen] = useState(false);

  // Classroom edit & custom delete states
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [editListGrade, setEditListGrade] = useState<'៧' | '៨' | '៩' | '១០' | '១១' | '១២'>('៧');
  const [editListGroup, setEditListGroup] = useState<string>('A');
  const [editListType, setEditListType] = useState<string>('ទូទៅ');
  const [editCustomTypeInput, setEditCustomTypeInput] = useState<string>('');
  const [deletingClassroom, setDeletingClassroom] = useState<{ id: string; name: string } | null>(null);
  const [isDeleteAllConfirmOpen, setIsDeleteAllConfirmOpen] = useState(false);
  const [isDeleteAllStudentsConfirmOpen, setIsDeleteAllStudentsConfirmOpen] = useState(false);

  // Student creation States
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [pobManual, setPobManual] = useState(false);
  const [currentAddressManual, setCurrentAddressManual] = useState(false);
  const [studentForm, setStudentForm] = useState<Omit<Student, 'id'> & { gender: 'ប្រុស' | 'ស្រី' | '' }>({
    classroomId: '',
    studentIdCard: '',
    rollNumber: '',
    nameKhmer: '',
    nameLatin: '',
    gender: '',
    dob: '',
    pob: '',
    pobProvince: '',
    pobDistrict: '',
    pobCommune: '',
    pobVillage: '',
    currentAddressProvince: '',
    currentAddressDistrict: '',
    currentAddressCommune: '',
    currentAddressVillage: '',
    currentAddress: '',
    parentPhone: '',
    parentPhone2: '',
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    motherOccupation: '',
    studentIssue: '',
    indigenousGroup: 'ទេ',
    photoUrl: '',
  });
  const [studentFormError, setStudentFormError] = useState<string | null>(null);

  // Student Drag & Drop states
  const [draggingStudentId, setDraggingStudentId] = useState<string | null>(null);
  const [dragOverStudentId, setDragOverStudentId] = useState<string | null>(null);

  // Student Sort states
  const [studentSortField, setStudentSortField] = useState<'name' | 'classroom' | null>(null);
  const [studentSortDirection, setStudentSortDirection] = useState<'asc' | 'desc'>('asc');

  const provincesList = useMemo(() => {
    return getProvincesList();
  }, []);

  const pobDistrictsList = useMemo(() => {
    return getDistrictsForProvince(studentForm.pobProvince);
  }, [studentForm.pobProvince]);

  const pobCommunesList = useMemo(() => {
    return getCommunesForDistrict(studentForm.pobProvince, studentForm.pobDistrict);
  }, [studentForm.pobProvince, studentForm.pobDistrict]);

  const pobVillagesList = useMemo(() => {
    return getVillagesForCommune(studentForm.pobProvince, studentForm.pobDistrict, studentForm.pobCommune);
  }, [studentForm.pobProvince, studentForm.pobDistrict, studentForm.pobCommune]);

  const currentAddressDistrictsList = useMemo(() => {
    return getDistrictsForProvince(studentForm.currentAddressProvince);
  }, [studentForm.currentAddressProvince]);

  const currentAddressCommunesList = useMemo(() => {
    return getCommunesForDistrict(studentForm.currentAddressProvince, studentForm.currentAddressDistrict);
  }, [studentForm.currentAddressProvince, studentForm.currentAddressDistrict]);

  const currentAddressVillagesList = useMemo(() => {
    return getVillagesForCommune(studentForm.currentAddressProvince, studentForm.currentAddressDistrict, studentForm.currentAddressCommune);
  }, [studentForm.currentAddressProvince, studentForm.currentAddressDistrict, studentForm.currentAddressCommune]);

  const handlePobProvinceChange = (provinceValue: string) => {
    setStudentForm({
      ...studentForm,
      pobProvince: provinceValue,
      pobDistrict: '',
      pobCommune: '',
      pobVillage: ''
    });
  };

  const handlePobDistrictChange = (districtValue: string) => {
    setStudentForm({
      ...studentForm,
      pobDistrict: districtValue,
      pobCommune: '',
      pobVillage: ''
    });
  };

  const handlePobCommuneChange = (communeValue: string) => {
    setStudentForm({
      ...studentForm,
      pobCommune: communeValue,
      pobVillage: ''
    });
  };

  const handleCurrentAddressProvinceChange = (provinceValue: string) => {
    setStudentForm({
      ...studentForm,
      currentAddressProvince: provinceValue,
      currentAddressDistrict: '',
      currentAddressCommune: '',
      currentAddressVillage: ''
    });
  };

  const handleCurrentAddressDistrictChange = (districtValue: string) => {
    setStudentForm({
      ...studentForm,
      currentAddressDistrict: districtValue,
      currentAddressCommune: '',
      currentAddressVillage: ''
    });
  };

  const handleCurrentAddressCommuneChange = (communeValue: string) => {
    setStudentForm({
      ...studentForm,
      currentAddressCommune: communeValue,
      currentAddressVillage: ''
    });
  };
  const [hasManuallyEditedLatin, setHasManuallyEditedLatin] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<{ id: string; name: string } | null>(null);

  // Print Badge
  const [selectedPrintStudent, setSelectedPrintStudent] = useState<Student | null>(null);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);

  // QR canvas refs mapping
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

  // Lock body scroll when create classroom modal is open
  useEffect(() => {
    if (isCreateClassListModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isCreateClassListModalOpen]);

  const generateQRCode = (canvas: HTMLCanvasElement | null, text: string) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = 120;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#1e293b'; // slate dark

    // Position detection anchors
    const drawAnchor = (dx: number, dy: number) => {
      ctx.fillRect(dx, dy, 28, 28);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(dx + 4, dy + 4, 20, 20);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(dx + 8, dy + 8, 12, 12);
    };

    drawAnchor(4, 4);
    drawAnchor(size - 32, 4);
    drawAnchor(4, size - 32);

    // Mini pattern bottom right
    ctx.fillRect(size - 20, size - 20, 10, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(size - 18, size - 18, 6, 6);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(size - 16, size - 16, 2, 2);

    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    const random = () => {
      const x = Math.sin(hash++) * 10000;
      return x - Math.floor(x);
    };

    for (let x = 8; x < size - 8; x += 4) {
      for (let y = 8; y < size - 8; y += 4) {
        if (
          (x < 35 && y < 35) ||
          (x > size - 37 && y < 35) ||
          (x < 35 && y > size - 37)
        ) {
          continue;
        }
        if (random() > 0.45) {
          ctx.fillRect(x, y, 4, 4);
        }
      }
    }
  };

  useEffect(() => {
    if (selectedPrintStudent) {
       const targetId = `qr-std-${selectedPrintStudent.id}`;
       setTimeout(() => {
         generateQRCode(canvasRefs.current[targetId], `SCHOOL-STUDENT-AUTH-ID:${selectedPrintStudent.studentIdCard}`);
       }, 100);
    }
  }, [selectedPrintStudent, isBadgeModalOpen]);

  // Handle Class actions
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.name.trim()) return;

    const newClass: Classroom = {
      id: `CLS-${Date.now()}`,
      name: classForm.name.trim(),
      grade: classForm.grade,
      studentCount: 0,
    };

    onUpdateClassrooms([...classrooms, newClass]);
    // Ensure studentForm has valid classroom ID
    if (!studentForm.classroomId) {
      setStudentForm(prev => ({ ...prev, classroomId: newClass.id }));
    }
    setIsClassModalOpen(false);
    setClassForm({ name: '', grade: '៧' });
  };

  const handleDeleteClass = (id: string, name: string) => {
    setDeletingClassroom({ id, name });
  };

  const toKhmerNum = (num: number) => {
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return String(num).split('').map(char => khmerDigits[parseInt(char)] || char).join('');
  };

  const handleCreateClassFromList = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedListGroups.length === 0) {
      alert('សូមជ្រើសរើស ឬបន្ថែមក្រុមថ្នាក់ជាមុនសិន!');
      return;
    }

    let typeSuffix = '';
    let resolvedType = newListType;

    if (newListType === 'វិទ្យាសាស្ត្រ (SC)') {
      typeSuffix = ' (SC)';
    } else if (newListType === 'សង្គម (SS)') {
      typeSuffix = ' (SS)';
    } else if (newListType === 'ផ្សេង') {
      const customTrimmed = customTypeInput.trim();
      if (!customTrimmed) {
        alert('សូមបញ្ចូលបញ្ជាក់ប្រភេទថ្នាក់ផ្សេងទៀត!');
        return;
      }
      typeSuffix = ` (${customTrimmed})`;
      resolvedType = customTrimmed;
    }

    const newClassroomsToCreate: Classroom[] = [];
    const skippedNames: string[] = [];

    selectedListGroups.forEach((group, index) => {
      const g = group.trim();
      const synthesizedName = `ថ្នាក់ទី ${newListGrade}${g}${typeSuffix}`;

      // Duplicate check
      const isDuplicate = classrooms.some(c => c.name.toLowerCase() === synthesizedName.toLowerCase());
      if (isDuplicate) {
        skippedNames.push(synthesizedName);
      } else {
        newClassroomsToCreate.push({
          id: `CLS-${Date.now()}-${g}-${index}-${Math.random().toString(36).substr(2, 4)}`,
          name: synthesizedName,
          grade: newListGrade,
          classGroup: g,
          classType: resolvedType,
          studentCount: 0,
        });
      }
    });

    if (newClassroomsToCreate.length === 0) {
      if (skippedNames.length > 0) {
        alert(`ថ្នាក់រៀនដែលបានជ្រើសរើស (${skippedNames.join(', ')}) មានរួចហើយ!`);
      }
      return;
    }

    if (skippedNames.length > 0) {
      alert(`ថ្នាក់មួយចំនួនត្រូវបានរំលងដោយសារមានរួចហើយ៖ ${skippedNames.join(', ')}`);
    }

    onUpdateClassrooms([...classrooms, ...newClassroomsToCreate]);
    setCustomTypeInput('');
    setSelectedListGroups(['A']); // reset to 'A' as default
    setIsCreateClassListModalOpen(false);
  };

  // Handle Student actions
  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setStudentFormError(null);
    setHasManuallyEditedLatin(false);
    setPobManual(false);
    setCurrentAddressManual(false);
    setStudentForm({
      classroomId: classrooms[0]?.id || '',
      studentIdCard: '',
      rollNumber: String(students.length + 1),
      nameKhmer: '',
      nameLatin: '',
      gender: '',
      dob: '',
      pob: '',
      pobProvince: '',
      pobDistrict: '',
      pobCommune: '',
      pobVillage: '',
      currentAddressProvince: '',
      currentAddressDistrict: '',
      currentAddressCommune: '',
      currentAddressVillage: '',
      currentAddress: '',
      parentPhone: '',
      parentPhone2: '',
      fatherName: '',
      fatherOccupation: '',
      motherName: '',
      motherOccupation: '',
      studentIssue: '',
      indigenousGroup: 'ទេ',
      photoUrl: '',
    });
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (s: Student) => {
    setEditingStudent(s);
    setStudentFormError(null);
    setHasManuallyEditedLatin(true);
    
    const isPobCustom = s.pobProvince ? !provincesList.includes(s.pobProvince) : false;
    const isAddressCustom = s.currentAddressProvince ? !provincesList.includes(s.currentAddressProvince) : false;
    setPobManual(isPobCustom);
    setCurrentAddressManual(isAddressCustom);

    setStudentForm({
      classroomId: s.classroomId,
      studentIdCard: s.studentIdCard,
      rollNumber: s.rollNumber,
      nameKhmer: s.nameKhmer,
      nameLatin: s.nameLatin,
      gender: s.gender,
      dob: s.dob,
      pob: s.pob || '',
      pobProvince: s.pobProvince || '',
      pobDistrict: s.pobDistrict || '',
      pobCommune: s.pobCommune || '',
      pobVillage: s.pobVillage || '',
      currentAddressProvince: s.currentAddressProvince || '',
      currentAddressDistrict: s.currentAddressDistrict || '',
      currentAddressCommune: s.currentAddressCommune || '',
      currentAddressVillage: s.currentAddressVillage || '',
      currentAddress: s.currentAddress || '',
      parentPhone: s.parentPhone || '',
      parentPhone2: s.parentPhone2 || '',
      fatherName: s.fatherName || '',
      fatherOccupation: s.fatherOccupation || '',
      motherName: s.motherName || '',
      motherOccupation: s.motherOccupation || '',
      studentIssue: s.studentIssue || '',
      indigenousGroup: s.indigenousGroup || '',
      photoUrl: s.photoUrl || '',
    });
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentFormError(null);

    // Validate Required fields manually to double check
    if (!studentForm.studentIdCard.trim() || !studentForm.nameKhmer.trim() || !studentForm.gender || !studentForm.dob || !studentForm.classroomId) {
      setStudentFormError('សូមបំពេញព័ត៌មានដែលចាំបាច់ទាំងអស់ (អត្តលេខ ឈ្មោះខ្មែរ ភេទ ថ្ងៃខែឆ្នាំកំណើត និងថ្នាក់)');
      return;
    }

    // Check unique studentIdCard constraint (absolutely mandatory)
    const isDuplicate = students.some(s => 
      s.studentIdCard.trim().toLowerCase() === studentForm.studentIdCard.trim().toLowerCase() && 
      (!editingStudent || s.id !== editingStudent.id)
    );
    if (isDuplicate) {
      setStudentFormError(`អត្តលេខសិស្ស "${studentForm.studentIdCard}" នេះមានរួចហើយ! សូមបញ្ចូលអត្តលេខផ្សេងដែលមិនជាន់គ្នា។`);
      return;
    }

    // Construct composite Place of Birth string
    const pobParts = [
      studentForm.pobVillage ? `ភូមិ${studentForm.pobVillage.replace(/^ភូមិ/, '')}` : '',
      studentForm.pobCommune ? `ឃុំ/សង្កាត់${studentForm.pobCommune.replace(/^(ឃុំ|សង្កាត់)/, '')}` : '',
      studentForm.pobDistrict ? `ស្រុក/ក្រុង/ខណ្ឌ${studentForm.pobDistrict.replace(/^(ស្រុក|ក្រុង|ខណ្ឌ)/, '')}` : '',
      studentForm.pobProvince ? `ខេត្ត/ក្រុង${studentForm.pobProvince.replace(/^(ខេត្ត|ក្រុង|រាជធានី)/, '')}` : '',
    ].filter(Boolean);
    const combinedPob = pobParts.join(', ') || studentForm.pob || '';

    // Construct composite Current Address string
    const currParts = [
      studentForm.currentAddressVillage ? `ភូមិ${studentForm.currentAddressVillage.replace(/^ភូមិ/, '')}` : '',
      studentForm.currentAddressCommune ? `ឃុំ/សង្កាត់${studentForm.currentAddressCommune.replace(/^(ឃុំ|សង្កាត់)/, '')}` : '',
      studentForm.currentAddressDistrict ? `ស្រុក/ក្រុង/ខណ្ឌ${studentForm.currentAddressDistrict.replace(/^(ស្រុក|ក្រុង|ខណ្ឌ)/, '')}` : '',
      studentForm.currentAddressProvince ? `ខេត្ត/ក្រុង${studentForm.currentAddressProvince.replace(/^(ខេត្ត|ក្រុង|រាជធានី)/, '')}` : '',
    ].filter(Boolean);
    const combinedCurrentAddress = currParts.join(', ') || studentForm.currentAddress || '';

    const finalFormData = {
      ...studentForm,
      pob: combinedPob,
      currentAddress: combinedCurrentAddress,
    };

    if (editingStudent) {
      const updated = students.map(s => s.id === editingStudent.id ? { ...s, ...finalFormData } : s);
      onUpdateStudents(updated);
      showToast(`បានកែសម្រួលព័ត៌មានសិស្សឈ្មោះ "${finalFormData.nameKhmer}" ដោយជោគជ័យ។`);
    } else {
      const newStd: Student = {
        id: `STD-${Date.now()}`,
        ...finalFormData,
      };
      onUpdateStudents([...students, newStd]);
      showToast(`បានចុះឈ្មោះសិស្សថ្មីឈ្មោះ "${finalFormData.nameKhmer}" ទទួលបានជោគជ័យ!`);
    }
    setIsStudentModalOpen(false);
  };

  const handleDeleteStudent = (id: string, name: string) => {
    setDeletingStudent({ id, name });
  };

  // Filter and Sort students
  const filteredStudents = useMemo(() => {
    const filtered = students.filter(s => {
      const matchesSearch = s.nameKhmer.includes(searchTerm) || 
        s.nameLatin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentIdCard.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = classFilter ? s.classroomId === classFilter : true;
      return matchesSearch && matchesClass;
    });

    if (!studentSortField) {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (studentSortField === 'name') {
        comparison = a.nameKhmer.localeCompare(b.nameKhmer, 'km');
      } else if (studentSortField === 'classroom') {
        const clsA = classrooms.find(c => c.id === a.classroomId)?.name || '';
        const clsB = classrooms.find(c => c.id === b.classroomId)?.name || '';
        comparison = clsA.localeCompare(clsB, 'km');
      }
      return studentSortDirection === 'asc' ? comparison : -comparison;
    });
  }, [students, searchTerm, classFilter, studentSortField, studentSortDirection, classrooms]);

  const handleStudentSort = (field: 'name' | 'classroom') => {
    if (studentSortField === field) {
      if (studentSortDirection === 'asc') {
        setStudentSortDirection('desc');
      } else {
        setStudentSortField(null);
      }
    } else {
      setStudentSortField(field);
      setStudentSortDirection('asc');
    }
  };

  // Drag and drop event handlers for students list
  const handleStudentDragStart = (e: React.DragEvent, id: string) => {
    const target = e.target as HTMLElement;
    if (target.closest('input') || target.closest('button') || target.closest('select')) {
      e.preventDefault();
      return;
    }
    setDraggingStudentId(id);
  };

  const handleStudentDragOver = (e: React.DragEvent, id: string) => {
    if (draggingStudentId && draggingStudentId !== id) {
      e.preventDefault();
      if (dragOverStudentId !== id) {
        setDragOverStudentId(id);
      }
    }
  };

  const handleStudentDropRow = (targetId: string) => {
    if (!draggingStudentId || draggingStudentId === targetId) return;

    const sourceIndex = students.findIndex(s => s.id === draggingStudentId);
    const targetIndex = students.findIndex(s => s.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const updated = [...students];
    const [movedItem] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    // Update roll numbers sequentially for all students in the affected classroom(s)
    const classroomIdsToUpdate = Array.from(new Set([movedItem.classroomId, students[targetIndex].classroomId]));
    
    classroomIdsToUpdate.forEach(classId => {
      let count = 1;
      for (let i = 0; i < updated.length; i++) {
        if (updated[i].classroomId === classId) {
          updated[i] = {
            ...updated[i],
            rollNumber: String(count++)
          };
        }
      }
    });

    onUpdateStudents(updated);

    setDraggingStudentId(null);
    setDragOverStudentId(null);
  };

  const handleStudentDragEnd = () => {
    setDraggingStudentId(null);
    setDragOverStudentId(null);
  };

  const handlePrintTrigger = () => {
    window.print();
  };

  // Dynamic header details based on sub-tab
  const getHeaderDetails = () => {
    switch (activeSubTab) {
      case 'classes_list':
        return {
          title: 'បញ្ជីថ្នាក់រៀន',
          desc: 'គ្រប់គ្រងកម្រិតថ្នាក់ ក្រុមថ្នាក់ និងប្រភេទថ្នាក់រៀន',
        };
      case 'classes':
        return {
          title: 'គ្រប់គ្រងថ្នាក់រៀន',
          desc: 'គ្រប់គ្រងពិន្ទុប្រឡង និងវត្តមានសិស្ស តាមថ្នាក់នីមួយៗ',
        };
      case 'coefficients':
        return {
          title: 'មុខវិជ្ជា ពិន្ទុអតិបរមា និងមេគុណ',
          desc: '',
        };
      case 'months':
        return {
          title: 'ខែយកពិន្ទុប្រចាំខែក្នុងឆមាស',
          desc: '',
        };
      case 'students':
      default:
        return {
          title: 'ព័ត៌មានសិស្ស',
          desc: 'គ្រប់គ្រងព័ត៌មានសិស្ស និងប័ណ្ណសម្គាល់សិស្ស',
        };
    }
  };

  const header = getHeaderDetails();

  return (
    <div id="school-students-section" className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Header Panel with White Background "ក្បាលទំព័រ ត្រូវបន្ថែមផ្ទៃសពីខាងក្រោយ" */}
      {activeSubTab !== 'classes_list' && activeSubTab !== 'students' && activeSubTab !== 'coefficients' && activeSubTab !== 'months' && activeSubTab !== 'classes' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <h1 className={`font-medium text-slate-850 tracking-tight ${header.title === 'បញ្ជីថ្នាក់រៀន' ? 'text-lg' : 'text-xl'}`}>{header.title}</h1>
          {header.desc && <p className="text-slate-500 text-xs sm:text-sm font-medium">{header.desc}</p>}
        </div>
      )}

      {/* ៤.០. SUBTAB: CLASSES MANAGEMENT (បញ្ជីថ្នាក់) */}
      {activeSubTab === 'classes_list' && (
        <div className="w-full bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 flex flex-col justify-between animate-fade-in text-slate-750">
          <div className="border-b border-slate-100 pb-4 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">បញ្ជីថ្នាក់រៀន</h1>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-xs font-bold font-sans" id="classroom-list-total">
                សរុប ៖ {classrooms.length} ថ្នាក់
              </span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setIsCreateClassListModalOpen(true)}
                className="px-4 py-2 bg-white border border-purple-600 text-purple-600 hover:bg-purple-50 hover:text-purple-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                id="btn-create-classroom"
              >
                <Plus className="w-4 h-4 text-purple-600" />
                បង្កើតថ្នាក់រៀនថ្មី
              </button>
              <button
                onClick={() => {
                  if (classrooms.length === 0) {
                    showToast('មិនមានទិន្នន័យថ្នាក់នៅក្នុងប្រព័ន្ធសម្រាប់លុបទេ!', 'error');
                  } else {
                    setIsDeleteAllConfirmOpen(true);
                  }
                }}
                className="px-4 py-2 bg-white border border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                id="btn-clear-classrooms"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                លុបទិន្នន័យ
              </button>
            </div>
          </div>

          {/* CLASSROOM LIST DIRECTORY CREATION FORM MODAL */}
          {isCreateClassListModalOpen && createPortal(
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4 overflow-y-auto">
              <div className="relative bg-white rounded-2xl max-w-[420px] w-full overflow-hidden border border-slate-100 shadow-2xl flex flex-col my-8">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <School className="w-5 h-5 text-blue-600" />
                    បង្កើតថ្នាក់រៀនថ្មី
                  </h3>
                  <button 
                    onClick={() => setIsCreateClassListModalOpen(false)}
                    className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateClassFromList} className="p-5 space-y-3.5 max-h-[85vh] overflow-y-auto">
                  {/* កម្រិតថ្នាក់ Select Dropdown */}
                  <div className="space-y-1.5">
                    <label htmlFor="list-grade-select-field" className="text-xs font-bold text-slate-600 block">កម្រិតថ្នាក់</label>
                    <select
                      id="list-grade-select-field"
                      value={newListGrade}
                      onChange={e => setNewListGrade(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white cursor-pointer font-bold"
                    >
                      <option value="៧">ថ្នាក់ទី ៧ (Grade 7)</option>
                      <option value="៨">ថ្នាក់ទី ៨ (Grade 8)</option>
                      <option value="៩">ថ្នាក់ទី ៩ (Grade 9)</option>
                      <option value="១០">ថ្នាក់ទី ១០ (Grade 10)</option>
                      <option value="១១">ថ្នាក់ទី ១១ (Grade 11)</option>
                      <option value="១២">ថ្នាក់ទី ១២ (Grade 12)</option>
                    </select>
                  </div>

                  {/* ក្រុមថ្នាក់ Row of Selection with X buttons to delete options + Add Group Button */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-600 block">ក្រុមថ្នាក់</label>
                      <button
                        type="button"
                        onClick={() => setSelectedListGroups([])}
                        className="text-[11px] text-red-500 hover:text-red-700 hover:underline font-bold transition-all cursor-pointer"
                      >
                        ជម្រះថ្នាក់
                      </button>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 max-h-56 overflow-y-auto p-1.5 border border-slate-100 rounded-xl bg-slate-50/50">
                      {groupPresets.map(group => {
                        const isSelected = selectedListGroups.includes(group);
                        return (
                          <div
                            key={group}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedListGroups(selectedListGroups.filter(g => g !== group));
                              } else {
                                setSelectedListGroups([...selectedListGroups, group]);
                              }
                            }}
                            className={`group flex items-center justify-between pl-2 pr-0.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer w-full ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-350'
                            }`}
                          >
                            <span className="truncate">{group}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setGroupToDelete(group);
                              }}
                              className="w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all bg-red-100/80 hover:bg-red-200 text-red-600 cursor-pointer shrink-0"
                              title="លុបជម្រើសក្រុមនេះ"
                            >
                              <X className="w-2 h-2 stroke-[3]" />
                            </button>
                          </div>
                        );
                      })}
                      {groupPresets.length === 0 && (
                        <span className="text-[10px] text-slate-400 font-bold p-1">មិនទាន់មានជម្រើសក្រុមទេ</span>
                      )}
                    </div>

                    {/* Inline adder tool */}
                    <div className="flex gap-1.5 items-center mt-2.5">
                      <div className="flex-1 min-w-[100px] border border-slate-200 rounded-xl px-2.5 py-1.5 flex items-center bg-slate-50 focus-within:bg-white focus-within:ring-1 focus-within:ring-teal-500 shadow-3xs">
                        <input
                          type="text"
                          placeholder="បញ្ចូលក្រុមថ្មី"
                          value={newCustomGroup}
                          onChange={e => setNewCustomGroup(e.target.value)}
                          className="w-full bg-transparent border-0 outline-none text-xs font-sans font-bold"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = newCustomGroup.trim();
                          if (!trimmed) return;
                          if (groupPresets.map(g => g.toLowerCase()).includes(trimmed.toLowerCase())) {
                            alert('ក្រុមថ្នាក់នេះមានរួចរាល់ហើយ!');
                            return;
                          }
                          setGroupPresets([...groupPresets, trimmed]);
                          setSelectedListGroups([...selectedListGroups, trimmed]);
                          setNewCustomGroup('');
                        }}
                        className="px-2.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-[10.5px] font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                      >
                        + បន្ថែមថ្នាក់
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const defaultPresets = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
                          setGroupPresets(defaultPresets);
                          setSelectedListGroups(['A']);
                        }}
                        className="px-2.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-750 text-[10.5px] font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                      >
                        ស្ដារក្រុមថ្នាក់
                      </button>
                    </div>
                  </div>

                  {/* ប្រភេទថ្នាក់ Select Dropdown */}
                  <div className="space-y-1.5">
                    <label htmlFor="type-select-field" className="text-xs font-bold text-slate-600 block">ប្រភេទថ្នាក់</label>
                    <select
                      id="type-select-field"
                      value={newListType}
                      onChange={e => setNewListType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white cursor-pointer font-bold"
                    >
                      <option value="ទូទៅ">ទូទៅ (General)</option>
                      <option value="វិទ្យាសាស្ត្រ (SC)">វិទ្យាសាស្ត្រ (Science - SC)</option>
                      <option value="សង្គម (SS)">សង្គម (Social - SS)</option>
                      <option value="ផ្សេង">កំណត់ខ្លួនឯង (ផ្សេង...)</option>
                    </select>
                  </div>

                  {/* ប្រភេទថ្នាក់ផ្សេងទៀត (Custom Input) */}
                  {newListType === 'ផ្សេង' && (
                    <div className="space-y-1.5 animate-fade-in">
                      <label htmlFor="custom-class-type-input" className="text-xs font-bold text-slate-600 block">បញ្ជាក់ប្រភេទថ្នាក់ផ្សេងទៀត</label>
                      <input
                        id="custom-class-type-input"
                        type="text"
                        required
                        placeholder="ឧ. បច្ចេកវិទ្យា (IT)"
                        value={customTypeInput}
                        onChange={e => setCustomTypeInput(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-teal-500 font-bold"
                      />
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreateClassListModalOpen(false)}
                      className="px-4 py-2 bg-red-50 border border-red-500 text-red-500 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      បោះបង់
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-50 border border-blue-600 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-blue-600" />
                      {selectedListGroups.length > 0 ? `បង្កើតថ្នាក់ ( ${toKhmerNum(selectedListGroups.length)} ថ្នាក់ )` : 'បង្កើតថ្នាក់'}
                    </button>
                  </div>
                </form>

                {groupToDelete && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-5">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xl max-w-xs w-full text-center space-y-4">
                      <div className="text-red-500 bg-red-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-850 text-sm">តើអ្នកពិតជាចង់លុបក្រុមនេះមែនទេ?</h4>
                        <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                          ការលុបក្រុម "<span className="text-red-600 font-bold font-mono">{groupToDelete}</span>" នឹងលុបជម្រើសនេះចេញពីបញ្ជីបង្កើតថ្នាក់។
                        </p>
                      </div>
                      <div className="flex gap-2 justify-center pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = groupPresets.filter(g => g !== groupToDelete);
                            setGroupPresets(updated);
                            setSelectedListGroups(selectedListGroups.filter(g => g !== groupToDelete));
                            setGroupToDelete(null);
                          }}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                        >
                          យល់ព្រមលុប
                        </button>
                        <button
                          type="button"
                          onClick={() => setGroupToDelete(null)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-705 rounded-xl text-xs font-bold cursor-pointer transition-colors border border-slate-200"
                        >
                          បោះបង់
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>,
            document.body
          )}

          <div className="border border-slate-100 rounded-none overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-left whitespace-nowrap border-collapse">
                <thead>
                  <tr className="bg-emerald-700 text-white text-xs font-semibold tracking-wider border-b border-emerald-800" id="classroom-list-th-row">
                    <th className="py-3 px-4 text-center font-bold">ល.រ</th>
                    <th className="py-3 px-3 font-bold">កម្រិតថ្នាក់</th>
                    <th className="py-3 px-3 text-center font-bold">ក្រុមថ្នាក់</th>
                    <th className="py-3 px-3 font-bold">ប្រភេទថ្នាក់</th>
                    <th className="py-3 px-4 text-center font-bold">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-600 text-xs text-slate-755">
                  {classrooms.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">
                        មិនទាន់មានថ្នាក់រៀននៅឡើយទេ។ សូមបង្កើតថ្នាក់ថ្មី!
                      </td>
                    </tr>
                  ) : (
                    classrooms.map((cls, idx) => {
                      const calculatedGrade = cls.grade;
                      const calculatedGroup = cls.classGroup || (cls.name || '').replace(/[^a-zA-Z]/g, '').trim() || 'A';
                      const calculatedType = cls.classType || ((cls.name || '').includes('(SC)') ? 'វិទ្យាសាស្ត្រ (SC)' : (cls.name || '').includes('(SS)') ? 'សង្គម (SS)' : 'ទូទៅ');
                      return (
                        <tr key={cls.id} className="border-b border-emerald-600 hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-3 font-semibold">ថ្នាក់ទី {calculatedGrade}</td>
                          <td className="py-3 px-3 text-center font-bold text-indigo-650 font-sans">{calculatedGroup}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              calculatedType.includes('(SC)') || calculatedType.includes('វិទ្យាសាស្ត្រ')
                                ? 'bg-amber-50 text-amber-700'
                                : calculatedType.includes('(SS)') || calculatedType.includes('សង្គម')
                                ? 'bg-cyan-50 text-cyan-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {calculatedType}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => {
                                setEditingClassroom(cls);
                                setEditListGrade(calculatedGrade as any);
                                setEditListGroup(calculatedGroup);
                                if (['ទូទៅ', 'វិទ្យាសាស្ត្រ (SC)', 'សង្គម (SS)'].includes(calculatedType)) {
                                  setEditListType(calculatedType);
                                  setEditCustomTypeInput('');
                                } else {
                                  setEditListType('ផ្សេង');
                                  setEditCustomTypeInput(calculatedType);
                                }
                              }}
                              className="p-1 px-1.5 hover:bg-blue-50 text-blue-600 hover:text-blue-800 rounded-lg transition-colors cursor-pointer mr-1.5"
                              title="កែសម្រួលថ្នាក់"
                              type="button"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClass(cls.id, cls.name)}
                              className="p-1 px-1.5 hover:bg-red-50 text-red-600 hover:text-red-800 rounded-lg transition-colors cursor-pointer"
                              title="លុបថ្នាក់"
                              type="button"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>



            {/* EDIT modal portal */}
            {editingClassroom && createPortal(
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4 overflow-y-auto">
                <div className="relative bg-white rounded-2xl max-w-sm w-full overflow-hidden border border-slate-100 shadow-2xl flex flex-col my-8 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Edit2 className="w-5 h-5 text-blue-600" />
                      <h2 className="text-sm font-bold text-slate-800">កែសម្រួលថ្នាក់រៀន</h2>
                    </div>
                    <button
                      onClick={() => setEditingClassroom(null)}
                      className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100 cursor-pointer"
                      type="button"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    
                    let typeSuffix = '';
                    let resolvedType = editListType;

                    if (editListType === 'វិទ្យាសាស្ត្រ (SC)') {
                      typeSuffix = ' (SC)';
                    } else if (editListType === 'សង្គម (SS)') {
                      typeSuffix = ' (SS)';
                    } else if (editListType === 'ផ្សេង') {
                      const customTrimmed = editCustomTypeInput.trim();
                      if (!customTrimmed) {
                        alert('សូមបញ្ចូលប្រភេទថ្នាក់ផ្សេងទៀត!');
                        return;
                      }
                      typeSuffix = ` (${customTrimmed})`;
                      resolvedType = customTrimmed;
                    }

                    const groupTrimmed = editListGroup.trim();
                    if (!groupTrimmed) {
                      alert('សូមបញ្ចូលក្រុមថ្នាក់!');
                      return;
                    }

                    const synthesizedName = `ថ្នាក់ទី ${editListGrade}${groupTrimmed}${typeSuffix}`;

                    const isDuplicate = classrooms.some(c => c.id !== editingClassroom.id && c.name.toLowerCase() === synthesizedName.toLowerCase());
                    if (isDuplicate) {
                      alert(`ថ្នាក់រៀន "${synthesizedName}" មានរួចហើយ!`);
                      return;
                    }

                    const updatedClassrooms = classrooms.map(c => {
                      if (c.id === editingClassroom.id) {
                        return {
                          ...c,
                          name: synthesizedName,
                          grade: editListGrade,
                          classGroup: groupTrimmed,
                          classType: resolvedType,
                        };
                      }
                      return c;
                    });

                    onUpdateClassrooms(updatedClassrooms);
                    setEditingClassroom(null);
                  }} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">កម្រិតថ្នាក់</label>
                      <select
                        value={editListGrade}
                        onChange={e => setEditListGrade(e.target.value as any)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans font-medium hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none"
                      >
                        <option value="៧">ថ្នាក់ទី ៧ (Grade 7)</option>
                        <option value="៨">ថ្នាក់ទី ៨ (Grade 8)</option>
                        <option value="៩">ថ្នាក់ទី ៩ (Grade 9)</option>
                        <option value="១០">ថ្នាក់ទី ១០ (Grade 10)</option>
                        <option value="១១">ថ្នាក់ទី ១១ (Grade 11)</option>
                        <option value="១២">ថ្នាក់ទី ១២ (Grade 12)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">ក្រុមថ្នាក់</label>
                      <input
                        type="text"
                        value={editListGroup}
                        onChange={e => setEditListGroup(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans font-bold hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none"
                        placeholder="បញ្ចូលក្រុមថ្នាក់ (ឧ. A)"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">ប្រភេទថ្នាក់</label>
                      <select
                        value={editListType}
                        onChange={e => setEditListType(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans font-medium hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none"
                      >
                        <option value="ទូទៅ">ទូទៅ (General)</option>
                        <option value="វិទ្យាសាស្រ្ដ (SC)">វិទ្យាសាស្ត្រ (Science)</option>
                        <option value="សង្គម (SS)">សង្គម (Social)</option>
                        <option value="ផ្សេង">ផ្សេងទៀត</option>
                      </select>
                    </div>

                    {editListType === 'ផ្សេង' && (
                      <div className="space-y-1.5 pt-0.5">
                        <label className="text-xs font-bold text-slate-600 block">បញ្ជាក់ប្រភេទថ្នាក់ផ្សេងទៀត</label>
                        <input
                          type="text"
                          value={editCustomTypeInput}
                          onChange={e => setEditCustomTypeInput(e.target.value)}
                          placeholder="ឧ. ភាសាបរទេស"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans font-bold hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none"
                        />
                      </div>
                    )}

                    <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setEditingClassroom(null)}
                        className="px-4 py-2 bg-red-50 border border-red-500 text-red-500 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        បោះបង់
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-blue-50 border border-blue-600 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                      >
                        រក្សាទុក
                      </button>
                    </div>
                  </form>
                </div>
              </div>,
              document.body
            )}

            {/* DELETE custom confirmation modal portal */}
            {deletingClassroom && createPortal(
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
                <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-100 shadow-2xl flex flex-col space-y-4 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">លុបថ្នាក់រៀន</h3>
                      <p className="text-[10px] text-slate-400 font-semibold">លុបថ្នាក់រៀនចេញពីប្រព័ន្ធ</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    តើអ្នកពិតជាចង់លុបថ្នាក់រៀន <span className="font-bold text-slate-850">"{deletingClassroom.name}"</span> នេះមែនទេ? សិស្សនៅក្នុងថ្នាក់នេះ នឹងត្រូវដកចេញពីថ្នាក់ដោយស្វ័យប្រវត្ត។
                  </p>
                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setDeletingClassroom(null)}
                      className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      មិនលុបទេ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const classIdObj = deletingClassroom.id;
                        onUpdateClassrooms(classrooms.filter(c => c.id !== classIdObj));
                        const updatedStudents = students.map(s => {
                          if (s.classroomId === classIdObj) {
                            return { ...s, classroomId: '' };
                          }
                          return s;
                        });
                        onUpdateStudents(updatedStudents);
                        setDeletingClassroom(null);
                      }}
                      className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                    >
                      បាទ/ចាស លុប
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}

            {/* DELETE ALL custom confirmation modal portal */}
            {isDeleteAllConfirmOpen && createPortal(
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4 font-sans">
                <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-100 shadow-2xl flex flex-col space-y-4 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-55 flex items-center justify-center text-red-655 shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">លុបទិន្នន័យថ្នាក់រៀនទាំងអស់</h3>
                      <p className="text-[10px] text-slate-400 font-semibold">លុបទិន្នន័យថ្នាក់រៀនទាំងអស់ចេញពីប្រព័ន្ធ</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                    តើអ្នកពិតជាចង់លុបទិន្នន័យថ្នាក់រៀនទាំងអស់មែនទេ? សិស្សនៅក្នុងថ្នាក់ទាំងអស់ នឹងត្រូវដកចេញពីថ្នាក់ដោយស្វ័យប្រវត្ត។ ទិន្នន័យនេះមិនអាចស្ដារឡើងវិញបានទេ។
                  </p>
                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsDeleteAllConfirmOpen(false)}
                      className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      មិនលុបទេ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateClassrooms([]);
                        const updatedStudents = students.map(s => ({ ...s, classroomId: '' }));
                        onUpdateStudents(updatedStudents);
                        setIsDeleteAllConfirmOpen(false);
                      }}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                    >
                      បាទ/ចាស លុបទាំងអស់
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </div>
      )}

      {/* ៤.២. SUBTAB: CLASSROOMS DIRECTORY */}
      {activeSubTab === 'classes' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6 animate-fade-in text-slate-750">
          {/* Unified Header inside the white container */}
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">{header.title}</h1>
            {header.desc && <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">{header.desc}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {classrooms.map(cls => {
              const classStds = students.filter(s => s.classroomId === cls.id);
              const girlsNum = classStds.filter(s => s.gender === 'ស្រី').length;
              return (
                <div 
                  key={cls.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-teal-300 shadow-xs hover:shadow-md transition-all divide-y divide-slate-100 overflow-hidden"
                >
                  {/* Class Identity Panel */}
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] bg-teal-50 text-teal-800 font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wide whitespace-nowrap">
                        កម្រិតថ្នាក់ទី {toArabicClassname(cls.grade || '')}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-800 truncate whitespace-nowrap">
                      {toArabicClassnameWithPrefix(cls.name)}
                    </h3>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500 pt-0.5">
                      <div className="flex items-center justify-center gap-1 bg-slate-50 px-2 py-1 rounded-md whitespace-nowrap">
                        <span className="text-slate-700">សរុប៖</span>
                        <span className="text-slate-700">{classStds.length} នាក់</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 bg-slate-50 px-2 py-1 rounded-md whitespace-nowrap">
                        <span className="text-slate-700">សិស្សស្រី៖</span>
                        <span className="text-pink-600">{girlsNum} នាក់</span>
                      </div>
                    </div>
                  </div>

                  {/* Class Deep actions trigger (Requirements 4.2 ক & খ) */}
                  <div className="p-3 bg-slate-50/50 flex justify-center items-center">
                    <button
                      onClick={() => onSelectClassroom(cls.id)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                    >
                      ពិន្ទុនិងវត្តមាន
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ៤.៣. SUBTAB: SUBJECT COEFFICIENTS MANAGEMENT */}
      {activeSubTab === 'coefficients' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6 animate-fade-in text-slate-750">
          {/* Unified Header inside the white container */}
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">{header.title}</h1>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {[
              { id: 'G7', name: 'កម្រិតថ្នាក់ទី៧' },
              { id: 'G8', name: 'កម្រិតថ្នាក់ទី៨' },
              { id: 'G9', name: 'កម្រិតថ្នាក់ទី៩' },
              { id: 'G10', name: 'កម្រិតថ្នាក់ទី១០' },
              { id: 'G11_SC', name: 'កម្រិតថ្នាក់ទី១១ (វិទ្យាសាស្ត្រ)' },
              { id: 'G11_SS', name: 'កម្រិតថ្នាក់ទី១១ (សង្គម)' },
              { id: 'G12_SC', name: 'កម្រិតថ្នាក់ទី១២ (វិទ្យាសាស្ត្រ)' },
              { id: 'G12_SS', name: 'កម្រិតថ្នាក់ទី១២ (សង្គម)' }
            ]
              .map(cat => {
                const catClassrooms = getClassroomsForCategory(cat.id, classrooms);
                // ONLY show if classrooms exist for this category
                if (catClassrooms.length === 0) return null;

                const currentSubs = categorySubjects[cat.id] || [];
                const hasToast = successToast?.classroomId === cat.id;

                return (
                  <div key={cat.id} className="bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-xs transition-all overflow-hidden flex flex-col justify-between">
                    <div className="p-5 space-y-4">
                      {/* Header with Category Name & Affected Classes */}
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-base font-extrabold text-slate-800">{cat.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                          <span className="font-extrabold text-slate-700">
                            ថ្នាក់អនុវត្ត ({catClassrooms.length})៖
                          </span>
                          <span className="font-extrabold text-violet-700 bg-violet-100/80 border border-violet-200 px-2 py-0.5 rounded-md shadow-2xs">
                            {catClassrooms.map(c => toArabicClassname(c.name || '')).join(', ')}
                          </span>
                        </div>
                      </div>

                      {/* Table of Subjects (Single layout / under each other, compact length) */}
                      <div className="max-h-[460px] overflow-x-auto overflow-y-auto pr-1 border border-slate-100 rounded-lg shadow-2xs">
                        <table className="w-full min-w-[400px] text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-emerald-700 text-white font-extrabold select-none sticky top-0 z-10 whitespace-nowrap text-center" id="coefficients-list-th-row">
                              <th className="p-2 text-center w-12 border-r border-emerald-800 whitespace-nowrap">ល.រ</th>
                              <th className="p-2 text-center w-24 border-r border-emerald-800 whitespace-nowrap">កូដមុខវិជ្ជា</th>
                              <th className="p-2 text-center w-28 border-r border-emerald-800 whitespace-nowrap">មុខវិជ្ជា</th>
                              <th className="p-2 text-center w-24 border-r border-emerald-800 whitespace-nowrap">ពិន្ទុអតិបរមា</th>
                              <th className="p-2 text-center w-16 border-r border-emerald-800 whitespace-nowrap">មេគុណ</th>
                              <th className="p-2 text-center w-20 text-white whitespace-nowrap">សកម្មភាព</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentSubs.map((s, idx) => {
                              const mx = s.maxScore !== undefined ? s.maxScore : 50;
                              const currentCode = s.code || s.id.toUpperCase();
                              return (
                                <tr 
                                  key={s.id} 
                                  draggable={true}
                                  onDragStart={(e) => {
                                    const target = e.target as HTMLElement;
                                    if (target.closest('input') || target.closest('button')) {
                                      e.preventDefault();
                                      return;
                                    }
                                    setDraggingInfo({ catId: cat.id, index: idx });
                                  }}
                                  onDragOver={(e) => {
                                    if (draggingInfo && draggingInfo.catId === cat.id) {
                                      e.preventDefault();
                                      if (dragOverInfo?.index !== idx) {
                                        setDragOverInfo({ catId: cat.id, index: idx });
                                      }
                                    }
                                  }}
                                  onDrop={() => {
                                    if (draggingInfo && draggingInfo.catId === cat.id) {
                                      handleDropRow(cat.id, idx);
                                    }
                                  }}
                                  onDragEnd={handleDragEnd}
                                  className={`border-b border-emerald-600 transition-all duration-150 group/row whitespace-nowrap
                                    text-slate-800
                                    ${draggingInfo?.catId === cat.id && draggingInfo?.index === idx ? 'opacity-40 bg-violet-50/20' : ''}
                                    ${dragOverInfo?.catId === cat.id && dragOverInfo?.index === idx ? 'bg-violet-50/40 border-y-2 border-violet-200' : 'hover:bg-slate-50/50'}
                                  `}
                                >
                                  {/* Index column with grip handle */}
                                  <td className="p-2 text-center font-bold text-slate-500 font-sans select-none whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1">
                                      <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover/row:text-violet-500 hover:text-violet-600 transition-colors cursor-grab active:cursor-grabbing shrink-0" />
                                      <span>{idx + 1}</span>
                                    </div>
                                  </td>

                                  {/* Subject Code column */}
                                  <td className="p-2 text-center font-bold font-mono text-[11px] text-slate-600 whitespace-nowrap" title={currentCode}>
                                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md font-semibold border border-slate-200/50">
                                      {currentCode}
                                    </span>
                                  </td>

                                  {/* Subject name column */}
                                  <td className="p-2 text-left pl-4 font-bold font-sans whitespace-nowrap" title={s.name}>
                                    <span className="text-slate-800 font-extrabold">
                                      {s.name}
                                    </span>
                                  </td>

                                  {/* Max Score Input column */}
                                  <td className="p-2 text-center whitespace-nowrap">
                                    <div className="inline-flex items-center justify-center bg-white border border-slate-200 rounded-md px-1 py-0.5">
                                      <input
                                        type="number"
                                        min="0"
                                        max="500"
                                        value={mx === 0 ? '' : mx}
                                        onChange={e => handleCategoryMaxScoreChange(cat.id, s.id, parseFloat(e.target.value) || 0)}
                                        className="w-10 text-center font-extrabold text-violet-700 outline-none text-[11px] font-sans"
                                      />
                                    </div>
                                  </td>

                                  {/* Calculated Coefficient column */}
                                  <td className="p-2 text-center whitespace-nowrap">
                                    <span className="text-[10px] font-extrabold bg-violet-50 text-violet-700 border border-violet-100 rounded-md px-1.5 py-0.5 select-none font-sans inline-block whitespace-nowrap">
                                      {`${(mx / 50).toFixed(1).replace(/\.0$/, '')}`}
                                    </span>
                                  </td>

                                  {/* Action column with Edit & Delete */}
                                  <td className="p-2 text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingSubjectConfig({ catId: cat.id, sub: s });
                                          setEditSubjectName(s.name);
                                          setEditSubjectCode(currentCode);
                                          setEditSubjectMaxScore(mx);
                                        }}
                                        className="p-1 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                                        title="កែសម្រួលមុខវិជ្ជា"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setSubjectToDelete({ catId: cat.id, subId: s.id, subName: s.name })}
                                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                        title="លុបមុខវិជ្ជា"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        {hasToast && (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-pulse">
                            <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                            បានរក្សាទុកដោយស្វ័យប្រវត្តិ!
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAddingSubjectCatId(cat.id);
                            setNewSubjectName('');
                            setNewSubjectMaxScore(50);
                          }}
                          className="px-3 py-2 bg-white hover:bg-blue-50/50 text-blue-600 border border-blue-500 rounded-lg text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-blue-600" />
                          បន្ថែមមុខវិជ្ជា
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoryToRestore({ catId: cat.id, catName: cat.name })}
                          className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                          title="ស្ដារមុខវិជ្ជាដើមឡើងវិញ"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                          ស្ដារមុខវិជ្ជាដើម
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
              .filter(Boolean)}
          </div>
        </div>
      )}

      {/* ៤.៤. SUBTAB: SCORING MONTHS CONFIGURATION */}
      {activeSubTab === 'months' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6 animate-fade-in text-slate-755">
          {/* Unified Header inside the white container */}
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">{header.title}</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[
              { id: 'G7', name: 'កម្រិតថ្នាក់ទី៧' },
              { id: 'G8', name: 'កម្រិតថ្នាក់ទី៨' },
              { id: 'G9', name: 'កម្រិតថ្នាក់ទី៩' },
              { id: 'G10', name: 'កម្រិតថ្នាក់ទី១០' },
              { id: 'G11_SC', name: 'កម្រិតថ្នាក់ទី១១ (វិទ្យាសាស្ត្រ)' },
              { id: 'G11_SS', name: 'កម្រិតថ្នាក់ទី១១ (សង្គម)' },
              { id: 'G12_SC', name: 'កម្រិតថ្នាក់ទី១២ (វិទ្យាសាស្ត្រ)' },
              { id: 'G12_SS', name: 'កម្រិតថ្នាក់ទី១២ (សង្គម)' }
            ].map(cat => {
              const catClassrooms = getClassroomsForCategory(cat.id, classrooms);
              if (catClassrooms.length === 0) return null;

              const refClass = catClassrooms[0];
              const sem1 = refClass?.preStartConfig?.semester1Months || ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា'];
              const sem2 = refClass?.preStartConfig?.semester2Months || ['មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា'];

              const sem1Slots = Array.from({ length: 6 }, (_, i) => sem1[i] || '');
              const sem2Slots = Array.from({ length: 6 }, (_, i) => sem2[i] || '');

              const hasToast = successToast?.classroomId === cat.id;

              const khmerMonthsOptions = [
                'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា'
              ];

              const toKhmerNumeral = (num: number): string => {
                const khmerNumerals = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
                return num.toString().split('').map(digit => {
                  const d = parseInt(digit);
                  return isNaN(d) ? digit : khmerNumerals[d];
                }).join('');
              };

              return (
                <div key={cat.id} className="border border-slate-300 rounded-lg overflow-hidden shadow-2xs bg-white relative max-w-[240px] w-full mx-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-emerald-700 border-b border-emerald-800">
                        <th colSpan={2} className="py-2.5 px-3 text-center text-sm text-white" style={{ fontFamily: '"Khmer OS Muol Light", "Moul", serif', fontWeight: 'normal' }}>
                          <div className="flex justify-center items-center gap-2">
                            <span>{cat.name}</span>
                            {hasToast && (
                              <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded font-extrabold animate-pulse">
                                បានរក្សាទុក!
                              </span>
                            )}
                          </div>
                        </th>
                      </tr>
                      <tr className="bg-emerald-600 border-b border-emerald-700 text-xs text-white font-bold">
                        <th className="py-2 px-3 text-center border-r border-emerald-700 w-1/2">
                          ឆមាសទី១
                        </th>
                        <th className="py-2 px-3 text-center w-1/2">
                          ឆមាសទី២
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 6 }).map((_, rowIndex) => {
                        const m1 = sem1Slots[rowIndex];
                        const m2 = sem2Slots[rowIndex];
                        return (
                          <tr key={rowIndex} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50/40 transition-colors">
                            {/* Semester 1 Select */}
                            <td className="p-0 border-r border-slate-300 text-center">
                              <select
                                value={m1}
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  const updatedSem1Slots = [...sem1Slots];
                                  updatedSem1Slots[rowIndex] = newVal;
                                  const updatedSem1 = updatedSem1Slots.filter(m => m !== '');
                                  autoSaveCategoryMonths(cat.id, updatedSem1, sem2);
                                }}
                                className={`w-full py-2 text-center text-xs font-bold bg-transparent border-0 outline-none focus:ring-0 focus:outline-none cursor-pointer appearance-none ${
                                  m1 ? 'text-blue-600' : 'text-red-500'
                                }`}
                              >
                                <option value="" className="text-red-500 font-bold">ជ្រើសរើស</option>
                                {khmerMonthsOptions.map(mon => (
                                  <option key={mon} value={mon} className="text-slate-700 font-bold">{mon}</option>
                                ))}
                              </select>
                            </td>
                            {/* Semester 2 Select */}
                            <td className="p-0 text-center">
                              <select
                                value={m2}
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  const updatedSem2Slots = [...sem2Slots];
                                  updatedSem2Slots[rowIndex] = newVal;
                                  const updatedSem2 = updatedSem2Slots.filter(m => m !== '');
                                  autoSaveCategoryMonths(cat.id, sem1, updatedSem2);
                                }}
                                className={`w-full py-2 text-center text-xs font-bold bg-transparent border-0 outline-none focus:ring-0 focus:outline-none cursor-pointer appearance-none ${
                                  m2 ? 'text-blue-600' : 'text-red-500'
                                }`}
                              >
                                <option value="" className="text-red-500 font-bold">ជ្រើសរើស</option>
                                {khmerMonthsOptions.map(mon => (
                                  <option key={mon} value={mon} className="text-slate-700 font-bold">{mon}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                      {/* Total counts of selected months */}
                      <tr className="bg-slate-100 border-t border-slate-300 text-xs text-slate-700 font-semibold">
                        <td className="py-2.5 px-3 text-center border-r border-slate-300 font-extrabold text-slate-800">
                          {toKhmerNumeral(sem1.length)} ខែ
                        </td>
                        <td className="py-2.5 px-3 text-center font-extrabold text-slate-800">
                          {toKhmerNumeral(sem2.length)} ខែ
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ៤.១. SUBTAB: STUDENT PROFILE CARDS DIRECTORY */}
      {activeSubTab === 'students' && (
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs space-y-5 animate-fade-in text-slate-755 w-full max-w-full overflow-hidden">
          {/* Integrated Header Container */}
          <div className="border-b border-slate-100 pb-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 w-full">
            {/* Title: On desktop (xl and up), this is on the left. On mobile/tablet, it is on its own top row. */}
            <h1 className="text-lg font-bold text-slate-800 tracking-tight text-left self-start shrink-0">ព័ត៌មានសិស្ស</h1>
            
            {/* Controls Container:
                - On mobile portrait (< sm): a vertical column of 2 rows (Row 1: search+filter, Row 2: buttons).
                - On mobile landscape/tablet (sm to xl): all 4 controls are in a single row below the title.
                - On desktop (xl and up): all 4 controls are in a single row on the same line as the title (aligned right). */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between xl:justify-end gap-3 w-full xl:w-auto">
              
              {/* Left Group: Search box and Classroom dropdown filter
                  - On mobile portrait (< sm): they are side-by-side (flex-row) and fit the screen width (w-full).
                  - On larger screens: sm:w-auto, items aligned side-by-side. */}
              <div className="flex flex-row items-center gap-2 w-full sm:w-auto min-w-0">
                {/* Search box - grows on mobile portrait */}
                <div className="relative flex-1 sm:w-44 xl:w-48 sm:shrink-0 min-w-0">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="ស្វែងរកសិស្ស"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="block w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-teal-500 outline-none font-medium"
                  />
                </div>

                {/* Classroom dropdown filter */}
                <div className="flex items-center gap-2 shrink-0 flex-1 sm:flex-initial">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">ថ្នាក់៖</span>
                  <select
                    value={classFilter}
                    onChange={e => setClassFilter(e.target.value)}
                    className="block w-full sm:w-auto px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none cursor-pointer appearance-none text-center font-bold text-slate-700"
                  >
                    <option value="">គ្រប់ថ្នាក់</option>
                    {classrooms.map(c => (
                      <option key={c.id} value={c.id}>{toArabicClassname(c.name)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Group: Action buttons
                  - On mobile portrait (< sm): they are side-by-side (flex-row) below Left Group, and each fits 50% of the screen.
                  - On larger screens: they sit side-by-side next to the Left Group. */}
              <div className="flex flex-row gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={handleOpenAddStudent}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-white border border-purple-600 text-purple-600 hover:bg-purple-50 hover:text-purple-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer whitespace-nowrap animate-pulse-once"
                  id="btn-add-student"
                >
                  <UserPlus className="w-4 h-4 text-purple-600 shrink-0" />
                  បន្ថែមសិស្សថ្មី
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (students.length === 0) {
                      showToast('មិនមានទិន្នន័យសិស្សនៅក្នុងប្រព័ន្ធសម្រាប់លុបទេ!', 'error');
                    } else {
                      setIsDeleteAllStudentsConfirmOpen(true);
                    }
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-white border border-red-500 text-red-600 hover:bg-rose-50 hover:text-red-755 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                  id="btn-clear-all-students"
                >
                  <Trash2 className="w-4 h-4 text-red-600 shrink-0" />
                  លុបទិន្នន័យ
                </button>
              </div>
              
            </div>
          </div>

          {/* Students Table */}
          <div className="border border-slate-200 rounded-none overflow-hidden shadow-xs w-full max-w-full">
            <div className="overflow-x-auto overflow-y-auto max-h-[550px] scrollbar-thin">
              <table className="w-full text-left border-collapse table-auto whitespace-nowrap">
                <thead>
                  <tr className="bg-emerald-700 text-white font-bold text-xs uppercase sticky top-0 z-10" id="students-list-th-row">
                    <th className="px-4 py-3 text-center bg-emerald-700">ល.រ</th>
                    <th className="px-4 py-3 text-center bg-emerald-700">អត្តលេខ</th>
                    <th 
                      onClick={() => handleStudentSort('name')}
                      className="px-4 py-3 bg-emerald-700 cursor-pointer select-none hover:bg-emerald-850 transition-colors"
                      title="ចុចដើម្បីតម្រៀបតាមឈ្មោះ"
                    >
                      <div className="flex items-center gap-1.5 justify-start">
                        <span>គោត្តនាម-នាម</span>
                        <ArrowUpDown className={`w-3.5 h-3.5 transition-opacity shrink-0 ${
                          studentSortField === 'name' ? 'text-white opacity-100' : 'text-emerald-200/60 opacity-60'
                        }`} />
                      </div>
                    </th>
                    <th className="px-3 py-3 text-center bg-emerald-700">ភេទ</th>
                    <th className="px-4 py-3 text-center bg-emerald-700">ថ្ងៃខែឆ្នាំកំណើត</th>
                    <th className="px-4 py-3 text-center bg-emerald-700">អាយុ</th>
                    <th 
                      onClick={() => handleStudentSort('classroom')}
                      className="px-4 py-3 bg-emerald-700 cursor-pointer select-none hover:bg-emerald-850 transition-colors"
                      title="ចុចដើម្បីតម្រៀបតាមថ្នាក់"
                    >
                      <div className="flex items-center gap-1.5 justify-start">
                        <span>ថ្នាក់</span>
                        <ArrowUpDown className={`w-3.5 h-3.5 transition-opacity shrink-0 ${
                          studentSortField === 'classroom' ? 'text-white opacity-100' : 'text-emerald-200/60 opacity-60'
                        }`} />
                      </div>
                    </th>
                    <th className="px-4 py-3 bg-emerald-700">ទីកន្លែងកំណើត</th>
                    <th className="px-4 py-3 bg-emerald-700">ឈ្មោះឪពុក</th>
                    <th className="px-4 py-3 bg-emerald-700">មុខរបរឪពុក</th>
                    <th className="px-4 py-3 bg-emerald-700">ឈ្មោះម្ដាយ</th>
                    <th className="px-4 py-3 bg-emerald-700">មុខរបរម្ដាយ</th>
                    <th className="px-4 py-3 bg-emerald-700">លេខទូរស័ព្ទអាណាព្យាបាល</th>
                    <th className="px-4 py-3 bg-emerald-700">ទីលំនៅបច្ចុប្បន្ន</th>
                    <th className="px-4 py-3 bg-emerald-700">បញ្ហារបស់សិស្ស</th>
                    <th className="px-4 py-3 bg-emerald-700">ជនជាតិដើមភាគតិច</th>
                    <th className="px-4 py-3 text-right bg-emerald-700">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={17} className="px-4 py-12 text-center text-slate-400 text-xs font-semibold">
                        រកមិនឃើញទិន្នន័យសិស្សានុសិស្សត្រូវបានកំណត់ឡើយ។
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s, idx) => {
                      const cls = classrooms.find(c => c.id === s.classroomId);
                      return (
                        <tr 
                          key={s.id} 
                          draggable={true}
                          onDragStart={(e) => handleStudentDragStart(e, s.id)}
                          onDragOver={(e) => handleStudentDragOver(e, s.id)}
                          onDrop={() => handleStudentDropRow(s.id)}
                          onDragEnd={handleStudentDragEnd}
                          className={`border-b border-slate-100 transition-colors text-xs text-slate-700 font-medium group/row whitespace-nowrap
                            ${draggingStudentId === s.id ? 'opacity-40 bg-emerald-50/20' : ''}
                            ${dragOverStudentId === s.id ? 'bg-emerald-50/40 border-y-2 border-emerald-200' : 'hover:bg-slate-50/50'}
                          `}
                        >
                          <td className="px-4 py-3 text-center font-bold text-slate-400 whitespace-nowrap select-none">
                            <div className="flex items-center justify-center gap-1.5">
                              <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover/row:text-emerald-600 hover:text-emerald-700 transition-colors cursor-grab active:cursor-grabbing shrink-0" />
                              <span>{s.rollNumber}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center font-mono font-semibold text-teal-600 bg-slate-50/30">{s.studentIdCard}</td>
                          <td className="px-4 py-3 font-bold text-slate-800">
                            <div className="flex items-center gap-2">
                              {s.photoUrl ? (
                                <img 
                                  src={s.photoUrl} 
                                  alt="រូបថតសិស្ស" 
                                  className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] text-white font-bold shrink-0 shadow-xs ${
                                  s.gender === 'ប្រុស' ? 'bg-sky-500' : 'bg-pink-500'
                                }`}>
                                  {s.gender === 'ប្រុស' ? 'ប្រ' : 'ស្រ'}
                                </div>
                              )}
                              <span>{s.nameKhmer}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`text-xs font-bold ${
                              s.gender === 'ប្រុស' ? 'text-sky-600' : 'text-pink-600'
                            }`}>
                              {s.gender || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-slate-700 font-mono">
                            {s.dob ? s.dob.split('-').reverse().join('-') : '-'}
                          </td>
                          <td className="px-4 py-3 text-center text-slate-750 font-bold">
                            {calculateAge(s.dob) ? `${calculateAge(s.dob)} ឆ្នាំ` : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-slate-600">
                              {cls ? toArabicClassname(cls.name) : '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={s.pob}>
                            {s.pob || '-'}
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-bold">
                            {s.fatherName || '-'}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {s.fatherOccupation || '-'}
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-bold">
                            {s.motherName || '-'}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {s.motherOccupation || '-'}
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-slate-700 font-bold">
                            {s.parentPhone || '-'}
                          </td>
                          <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={s.currentAddress}>
                            {s.currentAddress || '-'}
                          </td>
                          <td className="px-4 py-3 text-amber-700 font-bold">
                            {s.studentIssue || 'គ្មាន'}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-slate-600">
                            {s.indigenousGroup || 'ទេ'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditStudent(s)}
                                title="កែសម្រួលទិន្នន័យផ្ទាល់ខ្លួន"
                                className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(s.id, s.nameKhmer)}
                                title="លុបទិន្នន័យ"
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* DELETE ALL STUDENTS custom confirmation modal portal */}
          {isDeleteAllStudentsConfirmOpen && createPortal(
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4 font-sans text-slate-750">
              <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-100 shadow-2xl flex flex-col space-y-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-55 flex items-center justify-center text-red-655 shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">លុបទិន្នន័យសិស្សទាំងអស់</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">លុបទិន្នន័យសិស្សទាំងអស់ចេញពីប្រព័ន្ធ</p>
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                  តើអ្នកពិតជាចង់លុបទិន្នន័យសិស្សទាំងអស់មែនទេ? រាល់ប្រវត្តិនៃការស្នាក់នៅ វត្តមាន និងពិន្ទុរបស់សិស្សទាំងអស់ នឹងត្រូវលុបចោលដោយស្វ័យប្រវត្ត។ ទិន្នន័យនេះមិនអាចស្ដារឡើងវិញបានទេ។
                </p>
                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDeleteAllStudentsConfirmOpen(false)}
                    className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    មិនលុបទេ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateStudents([]);
                      setIsDeleteAllStudentsConfirmOpen(false);
                    }}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                  >
                    បាទ/ចាស លុបទាំងអស់
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* DELETE SINGLE STUDENT custom confirmation modal portal */}
          {deletingStudent && createPortal(
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4 font-sans text-slate-750">
              <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-100 shadow-2xl flex flex-col space-y-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">លុបទិន្នន័យសិស្ស</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">លុបទិន្នន័យសិស្សម្នាក់ចេញពីប្រព័ន្ធ</p>
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                  តើអ្នកពិតជាចង់លុបទិន្នន័យសិស្សឈ្មោះ <span className="text-red-600 font-bold">"{deletingStudent.name}"</span> មែនទេ? ទិន្នន័យនេះមិនអាចស្ដារឡើងវិញបានទេ។
                </p>
                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeletingStudent(null)}
                    className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    មិនលុបទេ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateStudents(students.filter(s => s.id !== deletingStudent.id));
                      if (selectedPrintStudent?.id === deletingStudent.id) setSelectedPrintStudent(null);
                      setDeletingStudent(null);
                    }}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
                  >
                    បាទ/ចាស លុប
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
      )}

      {/* CLASS CREATION FORM MODAL */}
      {isClassModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden border border-slate-100 shadow-xl flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">កំណត់បន្ថែមថ្នាក់រៀនថ្មី</h3>
              <button 
                onClick={() => setIsClassModalOpen(false)}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">កម្រិតថ្នាក់</label>
                <div className="grid grid-cols-6 gap-1">
                  {(['៧', '៨', '៩', '១០', '១១', '១២'] as const).map(grd => (
                    <button
                      key={grd}
                      type="button"
                      onClick={() => setClassForm({ ...classForm, grade: grd })}
                      className={`py-1.5 rounded-lg text-center text-xs font-bold border ${
                        classForm.grade === grd
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {grd}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="class-name-input" className="text-xs font-bold text-slate-600 block">ឈ្មោះថ្នាក់រៀន</label>
                <input
                  id="class-name-input"
                  type="text"
                  required
                  placeholder="ឧ. ថ្នាក់ទី ៧ក (7A)"
                  value={classForm.name}
                  onChange={e => setClassForm({ ...classForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-teal-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  បង្កើតថ្នាក់
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT CREATION/EDITING FORM MODAL */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden border border-slate-100 shadow-xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingStudent ? 'កែសម្រួលទិន្នន័យសិស្ស' : 'បន្ថែមសិស្សានុសិស្សថ្មី'}
              </h3>
              <button 
                onClick={() => setIsStudentModalOpen(false)}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form scrollable panel */}
            <form onSubmit={handleSaveStudent} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {studentFormError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold font-sans flex items-center gap-2 animate-pulse">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{studentFormError}</span>
                </div>
              )}

              {/* Layout for Student Photo and Basic Identifiers */}
              <div className="grid grid-cols-[1fr_130px] gap-4 items-start bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                {/* Left side: Stacked Inputs */}
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label htmlFor="student-kh-name-input" className="text-xs font-bold text-slate-700 block">គោត្តនាម-នាម <span className="text-red-600 font-extrabold text-sm ml-0.5">*</span></label>
                    <input
                      id="student-kh-name-input"
                      type="text"
                      required
                      value={studentForm.nameKhmer}
                      onChange={e => {
                        const val = e.target.value;
                        const updatedForm = { ...studentForm, nameKhmer: val };
                        if (!hasManuallyEditedLatin) {
                          updatedForm.nameLatin = transliterateKhmerToLatin(val);
                        }
                        setStudentForm(updatedForm);
                      }}
                      placeholder="ឧ. ប៊ុនណា វិសិដ្ឋ"
                      className="w-full px-3 h-[38px] bg-white border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="student-id-input" className="text-xs font-bold text-slate-700 block">អត្តលេខ <span className="text-red-600 font-extrabold text-sm ml-0.5">*</span></label>
                    <input
                      id="student-id-input"
                      type="text"
                      required
                      value={studentForm.studentIdCard}
                      onChange={e => setStudentForm({ ...studentForm, studentIdCard: e.target.value })}
                      placeholder="ឧ. 2016"
                      className="w-full px-3 h-[38px] bg-white border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                    />
                  </div>
                </div>

                {/* Right side: Portrait Card Photo */}
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-bold text-slate-500 mb-1.5 block">រូបថតកាត</span>
                  <div className="relative w-28 h-32 rounded-xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 shadow-xs flex items-center justify-center group shrink-0">
                    {studentForm.photoUrl ? (
                      <>
                        <img 
                          src={studentForm.photoUrl} 
                          alt="រូបថតសិស្ស" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer transition-all gap-1">
                          <label 
                            htmlFor="student-photo-upload" 
                            className="w-full h-full flex flex-col items-center justify-center cursor-pointer gap-1"
                          >
                            <Camera className="w-4 h-4" />
                            <span>ប្តូររូបភាព</span>
                          </label>
                        </div>
                      </>
                    ) : (
                      <label 
                        htmlFor="student-photo-upload" 
                        className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 hover:text-teal-600 hover:bg-slate-50/50 cursor-pointer transition-all gap-1.5"
                      >
                        <Camera className="w-5 h-5 text-slate-400" />
                        <span className="text-[9px] font-bold text-slate-500 text-center px-1">បញ្ចូលរូបថត</span>
                      </label>
                    )}
                  </div>
                  <input 
                    id="student-photo-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setStudentForm(prev => ({
                            ...prev,
                            photoUrl: reader.result as string
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {studentForm.photoUrl && (
                    <button
                      type="button"
                      onClick={() => setStudentForm(prev => ({ ...prev, photoUrl: '' }))}
                      className="mt-1 text-[9px] text-rose-600 hover:text-rose-750 font-bold hover:underline"
                    >
                      លុបរូបថតចេញ
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="student-gender-select" className="text-xs font-bold text-slate-700 block">ភេទ <span className="text-red-600 font-extrabold text-sm ml-0.5">*</span></label>
                  <select
                    id="student-gender-select"
                    required
                    value={studentForm.gender}
                    onChange={e => setStudentForm({ ...studentForm, gender: e.target.value as any })}
                    className={`w-full px-3 h-[38px] bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white cursor-pointer appearance-none ${
                      studentForm.gender === '' ? 'text-slate-400 font-normal' : 'text-slate-700 font-bold'
                    }`}
                  >
                    <option value="" className="text-slate-400 font-normal">ជ្រើសរើស</option>
                    <option value="ប្រុស" className="text-slate-700 font-bold">ប្រុស</option>
                    <option value="ស្រី" className="text-slate-700 font-bold">ស្រី</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="student-dob-input" className="text-xs font-bold text-slate-700 block">ថ្ងៃខែឆ្នាំកំណើត <span className="text-red-600 font-extrabold text-sm ml-0.5">*</span></label>
                  <input
                    id="student-dob-input"
                    type="date"
                    required
                    value={studentForm.dob}
                    onChange={e => setStudentForm({ ...studentForm, dob: e.target.value })}
                    className="w-full px-3 h-[38px] bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">អាយុ (គណនាស្វ័យប្រវត្តិ)</label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={calculateAge(studentForm.dob) ? `${calculateAge(studentForm.dob)} ឆ្នាំ` : '---'}
                    className="w-full px-3 h-[38px] bg-slate-100 border border-slate-200 rounded-xl text-xs outline-none text-slate-500 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="student-cls-select" className="text-xs font-bold text-slate-700 block">រៀបចំចូលថ្នាក់រៀន <span className="text-red-600 font-extrabold text-sm ml-0.5">*</span></label>
                  <select
                    id="student-cls-select"
                    value={studentForm.classroomId}
                    onChange={e => setStudentForm({ ...studentForm, classroomId: e.target.value })}
                    className="w-full px-3 h-[38px] bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white font-bold text-slate-700 appearance-none"
                  >
                    <option value="" disabled>-- សូមជ្រើសរើសថ្នាក់ --</option>
                    {classrooms.map(c => (
                      <option key={c.id} value={c.id}>{toArabicClassname(c.name)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 block">ទីកន្លែងកំណើត</span>
                  <button
                    type="button"
                    onClick={() => setPobManual(!pobManual)}
                    className="text-[10px] font-bold text-teal-600 hover:text-teal-700 underline cursor-pointer"
                  >
                    {pobManual ? 'ជ្រើសរើសពីបញ្ជី' : 'សរសេរដោយផ្ទាល់'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 bg-slate-50/75 p-3.5 rounded-2xl border border-slate-100">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">រាជធានី/ខេត្ត</label>
                    {pobManual ? (
                      <input
                        type="text"
                        value={studentForm.pobProvince || ''}
                        onChange={e => setStudentForm({ ...studentForm, pobProvince: e.target.value })}
                        placeholder="បញ្ចូលខេត្ត/ក្រុង"
                        className="w-full px-3 h-[38px] bg-white border border-slate-200 rounded-lg text-xs outline-none"
                      />
                    ) : (
                      <select
                        value={studentForm.pobProvince || ''}
                        onChange={e => handlePobProvinceChange(e.target.value)}
                        className="w-full px-3 h-[38px] bg-white border border-slate-200 rounded-lg text-xs outline-none cursor-pointer appearance-none"
                      >
                        <option value="">ជ្រើសរើស</option>
                        {(() => {
                          const list = [...provincesList];
                          if (studentForm.pobProvince && !list.includes(studentForm.pobProvince)) {
                            list.unshift(studentForm.pobProvince);
                          }
                          return list.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ));
                        })()}
                      </select>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">ស្រុក/ក្រុង/ខណ្ឌ</label>
                    {pobManual ? (
                      <input
                        type="text"
                        value={studentForm.pobDistrict || ''}
                        onChange={e => setStudentForm({ ...studentForm, pobDistrict: e.target.value })}
                        placeholder="បញ្ចូលស្រុក/ក្រុង/ខណ្ឌ"
                        className="w-full px-3 h-[38px] bg-white border border-slate-200 rounded-lg text-xs outline-none"
                      />
                    ) : (
                      <select
                        value={studentForm.pobDistrict || ''}
                        onChange={e => handlePobDistrictChange(e.target.value)}
                        disabled={!studentForm.pobProvince}
                        className="w-full px-3 h-[38px] bg-white border border-slate-200 rounded-lg text-xs outline-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed appearance-none"
                      >
                        <option value="">ជ្រើសរើស</option>
                        {(() => {
                          const list = [...pobDistrictsList];
                          if (studentForm.pobDistrict && !list.includes(studentForm.pobDistrict)) {
                            list.unshift(studentForm.pobDistrict);
                          }
                          return list.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ));
                        })()}
                      </select>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">ឃុំ/សង្កាត់</label>
                    {pobManual ? (
                      <input
                        type="text"
                        value={studentForm.pobCommune || ''}
                        onChange={e => setStudentForm({ ...studentForm, pobCommune: e.target.value })}
                        placeholder="បញ្ចូលឃុំ/សង្កាត់"
                        className="w-full px-3 h-[38px] bg-white border border-slate-200 rounded-lg text-xs outline-none"
                      />
                    ) : (
                      <select
                        value={studentForm.pobCommune || ''}
                        onChange={e => handlePobCommuneChange(e.target.value)}
                        disabled={!studentForm.pobDistrict}
                        className="w-full px-3 h-[38px] bg-white border border-slate-200 rounded-lg text-xs outline-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed appearance-none"
                      >
                        <option value="">ជ្រើសរើស</option>
                        {(() => {
                          const list = [...pobCommunesList];
                          if (studentForm.pobCommune && !list.includes(studentForm.pobCommune)) {
                            list.unshift(studentForm.pobCommune);
                          }
                          return list.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ));
                        })()}
                      </select>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">ភូមិ</label>
                    {pobManual ? (
                      <input
                        type="text"
                        value={studentForm.pobVillage || ''}
                        onChange={e => setStudentForm({ ...studentForm, pobVillage: e.target.value })}
                        placeholder="បញ្ចូលភូមិ"
                        className="w-full px-3 h-[38px] bg-white border border-slate-200 rounded-lg text-xs outline-none"
                      />
                    ) : (
                      <select
                        value={studentForm.pobVillage || ''}
                        onChange={e => setStudentForm({ ...studentForm, pobVillage: e.target.value })}
                        disabled={!studentForm.pobCommune}
                        className="w-full px-3 h-[38px] bg-white border border-slate-200 rounded-lg text-xs outline-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed appearance-none"
                      >
                        <option value="">ជ្រើសរើស</option>
                        {(() => {
                          const list = [...pobVillagesList];
                          if (studentForm.pobVillage && !list.includes(studentForm.pobVillage)) {
                            list.unshift(studentForm.pobVillage);
                          }
                          return list.map(v => (
                            <option key={v} value={v}>{v}</option>
                          ));
                        })()}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="student-father-name" className="text-xs font-bold text-slate-700 block">ឈ្មោះឪពុក</label>
                  <input
                    id="student-father-name"
                    type="text"
                    value={studentForm.fatherName || ''}
                    onChange={e => setStudentForm({ ...studentForm, fatherName: e.target.value })}
                    placeholder="ឧ. ផៃ ប៊ុនណា"
                    className="w-full px-3 h-[38px] bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="student-father-occupation" className="text-xs font-bold text-slate-700 block">មុខរបរឪពុក</label>
                  <input
                    id="student-father-occupation"
                    type="text"
                    value={studentForm.fatherOccupation || ''}
                    onChange={e => setStudentForm({ ...studentForm, fatherOccupation: e.target.value })}
                    placeholder="ឧ. គ្រូបង្រៀន"
                    className="w-full px-3 h-[38px] bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="student-mother-name" className="text-xs font-bold text-slate-700 block">ឈ្មោះម្ដាយ</label>
                  <input
                    id="student-mother-name"
                    type="text"
                    value={studentForm.motherName || ''}
                    onChange={e => setStudentForm({ ...studentForm, motherName: e.target.value })}
                    placeholder="ឧ. រ៉ង ខន្តី"
                    className="w-full px-3 h-[38px] bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="student-mother-occupation" className="text-xs font-bold text-slate-700 block">មុខរបរម្ដាយ</label>
                  <input
                    id="student-mother-occupation"
                    type="text"
                    value={studentForm.motherOccupation || ''}
                    onChange={e => setStudentForm({ ...studentForm, motherOccupation: e.target.value })}
                    placeholder="ឧ. មេផ្ទះ"
                    className="w-full px-3 h-[38px] bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="student-parent-phone" className="text-xs font-bold text-slate-700 block">លេខទូរស័ព្ទអាណាព្យាបាលខ្សែទី១</label>
                  <input
                    id="student-parent-phone"
                    type="text"
                    value={studentForm.parentPhone}
                    onChange={e => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
                    placeholder="ឧ. 095 539 373"
                    className="w-full px-3 h-[38px] bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="student-parent-phone-2" className="text-xs font-bold text-slate-700 block">លេខទូរស័ព្ទអាណាព្យាបាលខ្សែទី២</label>
                  <input
                    id="student-parent-phone-2"
                    type="text"
                    value={studentForm.parentPhone2 || ''}
                    onChange={e => setStudentForm({ ...studentForm, parentPhone2: e.target.value })}
                    placeholder="ឧ. 088 520 6868"
                    className="w-full px-3 h-[38px] bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 block">ទីលំនៅបច្ចុប្បន្ន</span>
                  <button
                    type="button"
                    onClick={() => setCurrentAddressManual(!currentAddressManual)}
                    className="text-[10px] font-bold text-teal-600 hover:text-teal-700 underline cursor-pointer"
                  >
                    {currentAddressManual ? 'ជ្រើសរើសពីបញ្ជី' : 'សរសេរដោយផ្ទាល់'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 bg-slate-50/75 p-3.5 rounded-2xl border border-slate-100">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">រាជធានី/ខេត្ត</label>
                    {currentAddressManual ? (
                      <input
                        type="text"
                        value={studentForm.currentAddressProvince || ''}
                        onChange={e => setStudentForm({ ...studentForm, currentAddressProvince: e.target.value })}
                        placeholder="បញ្ចូលខេត្ត/ក្រុង"
                        className="w-full px-3 h-[38px] bg-white border border-slate-200 rounded-lg text-xs outline-none"
                      />
                    ) : (
                      <select
                        value={studentForm.currentAddressProvince || ''}
                        onChange={e => handleCurrentAddressProvinceChange(e.target.value)}
                        className="w-full px-3 h-[38px] bg-white border border-slate-200 rounded-lg text-xs outline-none cursor-pointer appearance-none"
                      >
                        <option value="">ជ្រើសរើស</option>
                        {(() => {
                          const list = [...provincesList];
                          if (studentForm.currentAddressProvince && !list.includes(studentForm.currentAddressProvince)) {
                            list.unshift(studentForm.currentAddressProvince);
                          }
                          return list.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ));
                        })()}
                      </select>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">ស្រុក/ក្រុង/ខណ្ឌ</label>
                    {currentAddressManual ? (
                      <input
                        type="text"
                        value={studentForm.currentAddressDistrict || ''}
                        onChange={e => setStudentForm({ ...studentForm, currentAddressDistrict: e.target.value })}
                        placeholder="បញ្ចូលស្រុក/ក្រុង/ខណ្ឌ"
                        className="w-full px-3 h-[38px] bg-white border border-slate-200 rounded-lg text-xs outline-none"
                      />
                    ) : (
                      <select
                        value={studentForm.currentAddressDistrict || ''}
                        onChange={e => handleCurrentAddressDistrictChange(e.target.value)}
                        disabled={!studentForm.currentAddressProvince}
                        className="w-full px-3 h-[38px] bg-white border border-slate-200 rounded-lg text-xs outline-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed appearance-none"
                      >
                        <option value="">ជ្រើសរើស</option>
                        {(() => {
                          const list = [...currentAddressDistrictsList];
                          if (studentForm.currentAddressDistrict && !list.includes(studentForm.currentAddressDistrict)) {
                            list.unshift(studentForm.currentAddressDistrict);
                          }
                          return list.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ));
                        })()}
                      </select>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">ឃុំ/សង្កាត់</label>
                    {currentAddressManual ? (
                      <input
                        type="text"
                        value={studentForm.currentAddressCommune || ''}
                        onChange={e => setStudentForm({ ...studentForm, currentAddressCommune: e.target.value })}
                        placeholder="បញ្ចូលឃុំ/សង្កាត់"
                        className="w-full px-3 h-[38px] bg-white border border-slate-200 rounded-lg text-xs outline-none"
                      />
                    ) : (
                      <select
                        value={studentForm.currentAddressCommune || ''}
                        onChange={e => handleCurrentAddressCommuneChange(e.target.value)}
                        disabled={!studentForm.currentAddressDistrict}
                        className="w-full px-3 h-[38px] bg-white border border-slate-200 rounded-lg text-xs outline-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed appearance-none"
                      >
                        <option value="">ជ្រើសរើស</option>
                        {(() => {
                          const list = [...currentAddressCommunesList];
                          if (studentForm.currentAddressCommune && !list.includes(studentForm.currentAddressCommune)) {
                            list.unshift(studentForm.currentAddressCommune);
                          }
                          return list.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ));
                        })()}
                      </select>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">ភូមិ</label>
                    {currentAddressManual ? (
                      <input
                        type="text"
                        value={studentForm.currentAddressVillage || ''}
                        onChange={e => setStudentForm({ ...studentForm, currentAddressVillage: e.target.value })}
                        placeholder="បញ្ចូលភូមិ"
                        className="w-full px-3 h-[38px] bg-white border border-slate-200 rounded-lg text-xs outline-none"
                      />
                    ) : (
                      <select
                        value={studentForm.currentAddressVillage || ''}
                        onChange={e => setStudentForm({ ...studentForm, currentAddressVillage: e.target.value })}
                        disabled={!studentForm.currentAddressCommune}
                        className="w-full px-3 h-[38px] bg-white border border-slate-200 rounded-lg text-xs outline-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed appearance-none"
                      >
                        <option value="">ជ្រើសរើស</option>
                        {(() => {
                          const list = [...currentAddressVillagesList];
                          if (studentForm.currentAddressVillage && !list.includes(studentForm.currentAddressVillage)) {
                            list.unshift(studentForm.currentAddressVillage);
                          }
                          return list.map(v => (
                            <option key={v} value={v}>{v}</option>
                          ));
                        })()}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="student-issue" className="text-xs font-bold text-slate-700 block">បញ្ហារបស់សិស្ស</label>
                  <select
                    id="student-issue"
                    value={studentForm.studentIssue || ''}
                    onChange={e => setStudentForm({ ...studentForm, studentIssue: e.target.value })}
                    className="w-full px-3 h-[38px] bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white cursor-pointer appearance-none"
                  >
                    <option value="">គ្មាន</option>
                    <option value="ពិបាកក្នុងការធ្វើចលនា">ពិបាកក្នុងការធ្វើចលនា</option>
                    <option value="ពិបាកក្នុងការស្ដាប់">ពិបាកក្នុងការស្ដាប់</option>
                    <option value="ពិបាកក្នុងការនិយាយ">ពិបាកក្នុងការនិយាយ</option>
                    <option value="ពិបាកក្នុងការមើល">ពិបាកក្នុងការមើល</option>
                    <option value="ពិការសរីរាង្គខាងក្នុង">ពិការសរីរាង្គខាងក្នុង</option>
                    <option value="ពិការសតិបញ្ញា">ពិការសតិបញ្ញា</option>
                    <option value="ពិបាកខាងផ្លូវចិត្ត">ពិបាកខាងផ្លូវចិត្ត</option>
                    <option value="ពិការផ្សេងៗ">ពិការផ្សេងៗ</option>
                    <option value="ខ្វះអាហារូបត្ថមធ្ងន់ធ្ងរ">ខ្វះអាហារូបត្ថមធ្ងន់ធ្ងរ</option>
                    <option value="សុខភាព/ជំងឺប្រចាំកាយ">សុខភាព/ជំងឺប្រចាំកាយ</option>
                    <option value="មកពីគ្រួសារផ្លាស់ប្ដូរទីលំនៅ">មកពីគ្រួសារផ្លាស់ប្ដូរទីលំនៅ</option>
                    <option value="កុមារកំព្រា">កុមារកំព្រា</option>
                    <option value="កុមាររងគ្រោះដោយ HIV/AIDS">កុមាររងគ្រោះដោយ HIV/AIDS</option>
                    <option value="កុមាររងអំពើហឹង្សាក្នុងគ្រួសារ">កុមាររងអំពើហឹង្សាក្នុងគ្រួសារ</option>
                    <option value="កុមាររងការកេងប្រវ័ញ្ចពលកម្ម">កុមាររងការកេងប្រវ័ញ្ចពលកម្ម</option>
                    <option value="កុមារដែលមកពីគ្រួសារក្រីក្រ">កុមារដែលមកពីគ្រួសារក្រីក្រ</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="student-indigenous-group" className="text-xs font-bold text-slate-700 block">ជនជាតិដើមភាគតិច</label>
                  <select
                    id="student-indigenous-group"
                    value={studentForm.indigenousGroup || 'ទេ'}
                    onChange={e => setStudentForm({ ...studentForm, indigenousGroup: e.target.value })}
                    className="w-full px-3 h-[38px] bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white cursor-pointer appearance-none font-bold text-slate-700"
                  >
                    <option value="ទេ">ទេ</option>
                    <option value="បាទ/ចាស">បាទ/ចាស</option>
                  </select>
                </div>
              </div>

              </div>

              {/* Action buttons (Fixed at bottom) */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 bg-white border border-red-500 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  រក្សាទុក
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ៤.៣. POPUP MODAL FOR PRINT STUDENT ID CARD */}
      {isBadgeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden border border-slate-100 shadow-xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Printer className="w-4 h-4 text-teal-600" />
                បោះពុម្ពប័ណ្ណសម្គាល់សិស្ស (ID Card)
              </h3>
              <button 
                onClick={() => setIsBadgeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex flex-col items-center gap-6">
              {/* Selector to ease switching students in-place */}
              <div className="w-full space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ជ្រើសរើសសិស្សដើម្បីបោះពុម្ព៖</label>
                <select
                  value={selectedPrintStudent?.id || ''}
                  onChange={e => {
                    const std = students.find(s => s.id === e.target.value);
                    if (std) setSelectedPrintStudent(std);
                  }}
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none font-bold text-slate-700"
                >
                  {filteredStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.rollNumber}. {s.nameKhmer} ({s.studentIdCard})
                    </option>
                  ))}
                </select>
              </div>

              {selectedPrintStudent ? (
                <div className="w-full flex flex-col items-center gap-5">
                  {/* Card mockup preview container */}
                  <div 
                    id={`student-id-card-view-${selectedPrintStudent.id}`}
                    className="w-[240px] bg-white rounded-2xl shadow-md border-2 border-slate-800 overflow-hidden flex flex-col items-center p-4 space-y-5 relative text-center bg-radial from-white to-slate-50"
                  >
                    {/* Header bar banner */}
                    <div className="w-full text-center space-y-0.5">
                      <p className="text-[8px] font-extrabold text-slate-700 tracking-wider">ព្រះរាជាណាចក្រកម្ពុជា</p>
                      <p className="text-[8px] font-extrabold text-teal-750 tracking-widest leading-none uppercase">
                        {schoolInfo.schoolType} {schoolInfo.schoolName}
                      </p>
                    </div>

                    <div className="w-full border-b border-dashed border-slate-200"></div>

                    {/* Student Avatar representation */}
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-16 h-16 rounded-full border border-slate-700 bg-slate-100 flex items-center justify-center text-slate-800 text-2xl font-extrabold uppercase shadow-xs">
                        {selectedPrintStudent.nameKhmer[0]}
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 mt-1">
                        {selectedPrintStudent.nameKhmer}
                      </h4>
                      <p className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                        {selectedPrintStudent.nameLatin}
                      </p>
                    </div>

                    {/* Personal coordinates description */}
                    <div className="w-full bg-slate-50 p-3 rounded-lg text-left text-[10px] text-slate-600 font-semibold space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[9px] font-bold">អត្តលេខសិស្ស៖</span>
                        <span className="font-mono font-bold text-slate-800">{selectedPrintStudent.studentIdCard}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[9px] font-bold">ថ្នាក់រៀន៖</span>
                        <span className="text-slate-800">{classrooms.find(c => c.id === selectedPrintStudent.classroomId)?.name || '---'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[9px] font-bold">ភេទ៖</span>
                        <span className="text-slate-800">{selectedPrintStudent.gender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[9px] font-bold">ថ្ងៃខែឆ្នាំកំណើត៖</span>
                        <span className="text-slate-800">{selectedPrintStudent.dob || '---'}</span>
                      </div>
                    </div>

                    {/* Student canvas QR barcode generation */}
                    <div className="flex flex-col items-center space-y-0.5">
                      <canvas 
                        ref={el => { canvasRefs.current[`qr-std-${selectedPrintStudent.id}`] = el; }}
                        className="w-24 h-24 border border-slate-100 rounded-lg p-1.5"
                        width={120}
                        height={120}
                      />
                      <span className="text-[8px] font-mono text-slate-400">
                        QR code ស្កេនវត្តមាន
                      </span>
                    </div>

                    <div className="w-full border-t border-dashed border-slate-200 pt-1.5 text-[8px] text-slate-400 italic">
                      ប័ណ្ណផ្លូវការសម្រាប់វត្តមានសិស្ស
                    </div>
                  </div>

                  {/* Print triggers */}
                  <div className="w-full space-y-2">
                    <button
                      onClick={handlePrintTrigger}
                      className="w-full py-2 bg-slate-850 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      បោះពុម្ពប័ណ្ណផ្ទាល់ខ្លួន (Print PDF)
                    </button>
                    <p className="text-[9px] text-center text-slate-400 uppercase font-semibold italic leading-relaxed">
                      * គាំទ្រការព្រីនចេញដោយផ្ទាល់លើក្រដាសទំហំ VIP
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2 h-72">
                  <Printer className="w-8 h-8 text-slate-300" />
                  <span>សូមបង្កើត ឬជ្រើសរើសសិស្សដើម្បីបោះពុម្ពប័ណ្ណសម្គាល់ខ្លួន។</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Secret Print-Only markup container for native student ID cards */}
      {selectedPrintStudent && (
        <div className="hidden print:block absolute inset-0 bg-white p-6 font-sans">
          <div className="w-[280px] bg-white rounded-2xl border-4 border-slate-800 overflow-hidden flex flex-col items-center p-5 space-y-4 text-center mx-auto">
            <p className="text-[10px] font-extrabold text-slate-700 uppercase tracking-widest leading-none">
              {schoolInfo.schoolType} {schoolInfo.schoolName}
            </p>
            <div className="w-full border-b-2 border-slate-100"></div>

            <div className="flex flex-col items-center space-y-1">
              <div className="w-20 h-20 rounded-full border-2 border-slate-800 bg-slate-100 flex items-center justify-center text-slate-800 text-3xl font-extrabold uppercase">
                {selectedPrintStudent.nameKhmer[0]}
              </div>
              <h4 className="text-sm font-extrabold text-slate-800 mt-2">
                {selectedPrintStudent.nameKhmer}
              </h4>
              <p className="text-[10px] font-mono font-bold text-slate-500 tracking-wider">
                {selectedPrintStudent.nameLatin}
              </p>
            </div>

            <div className="w-full bg-slate-50 p-2.5 rounded-lg text-left text-xs text-slate-700 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold text-[10px]">អត្តលេខសិស្ស:</span>
                <span className="font-mono font-bold text-slate-800">{selectedPrintStudent.studentIdCard}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold text-[10px]">ថ្នាក់រៀន:</span>
                <span className="font-bold text-slate-800">
                  {classrooms.find(c => c.id === selectedPrintStudent.classroomId)?.name || '---'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold text-[10px]">ភេទ:</span>
                <span className="font-bold text-slate-800">{selectedPrintStudent.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold text-[10px]">ថ្ងៃខែឆ្នាំកំណើត:</span>
                <span className="font-bold text-indigo-750">{selectedPrintStudent.dob || '---'}</span>
              </div>
            </div>

            {/* Black-White QR Rendering */}
            <div className="flex flex-col items-center space-y-1">
              <canvas 
                ref={el => { if (el) generateQRCode(el, `SCHOOL-STUDENT-AUTH-ID:${selectedPrintStudent.studentIdCard}`); }}
                className="w-28 h-28 border border-slate-100 rounded-lg p-1"
                width={120}
                height={120}
              />
              <span className="text-[8px] font-mono text-slate-400">
                QR CODE ស្កេនវត្តមាន
              </span>
            </div>

            <div className="w-full border-t border-dashed border-slate-300 pt-3 text-[10px] text-slate-400 italic">
              ប័ណ្ណផ្លូវការសម្រាប់វត្តមានសិស្ស
            </div>
          </div>
        </div>
      )}
      {/* TOAST NOTIFICATION FEEDBACK */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-[200] flex bg-white border-l-4 ${toast.type === 'error' ? 'border-red-500' : 'border-emerald-500'} shadow-xl rounded-xl p-4 items-center gap-3 max-w-sm border border-slate-100 transition-all duration-300 transform scale-100 animate-in fade-in slide-in-from-bottom-4`}>
          <div className={`p-1.5 ${toast.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'} rounded-full shrink-0`}>
            {toast.type === 'error' ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-slate-800 text-xs font-bold font-sans">
              {toast.type === 'error' ? 'ការជូនដំណឹង' : 'ជោគជ័យ'}
            </p>
            <p className="text-slate-600 text-[11px] font-semibold">{toast.message}</p>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="text-slate-350 hover:text-slate-500 ml-auto focus:outline-none cursor-pointer p-0.5 hover:bg-slate-50 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SUBJECT DELETE CONFIRMATION DIALOG */}
      {subjectToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[250] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-full shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">លុបមុខវិជ្ជា?</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-sans">
                  តើអ្នកពិតជាចង់លុបមុខវិជ្ជា <span className="font-extrabold text-slate-800">«{subjectToDelete.subName}»</span> នេះពីបញ្ជីមែនទេ?
                  <br />
                  <span className="text-emerald-600 text-[10px] font-bold block mt-1.5">
                    *ចំណាំ៖ ការលុបនេះនឹងរក្សាទុកដោយស្វ័យប្រវត្តិ។
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSubjectToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSubject(subjectToDelete.catId, subjectToDelete.subId)}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                យល់ព្រមលុប
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBJECT RESTORE CONFIRMATION DIALOG */}
      {categoryToRestore && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[250] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-full shrink-0">
                <RotateCcw className="w-6 h-6 animate-spin-reverse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">ស្ដារមុខវិជ្ជាដើម?</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-sans">
                  តើអ្នកពិតជាចង់ស្ដារបញ្ជីមុខវិជ្ជាដើមសម្រាប់ <span className="font-extrabold text-slate-800">«{categoryToRestore.catName}»</span> ឡើងវិញមែនទេ? មុខវិជ្ជាដែលបានកែសម្រួល ឬបន្ថែមថ្មីទាំងអស់នៅក្នុងកម្រិតថ្នាក់នេះនឹងត្រូវជំនួសដោយមុខវិជ្ជាស្ដង់ដាររបស់ក្រសួងវិញ។
                  <br />
                  <span className="text-emerald-600 text-[10px] font-bold block mt-1.5">
                    *ចំណាំ៖ ការស្ដារនេះនឹងរក្សាទុកដោយស្វ័យប្រវត្តិ។
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToRestore(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={() => handleRestoreDefaultSubjects(categoryToRestore.catId)}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                យល់ព្រមស្ដារ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SUBJECT DIALOG MODAL */}
      {addingSubjectCatId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[250] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-800">បន្ថែមមុខវិជ្ជាថ្មី</h3>
              </div>
              <button
                type="button"
                onClick={() => setAddingSubjectCatId(null)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Subject Code Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  កូដមុខវិជ្ជា <span className="text-slate-450 font-medium">(ទុកទទេសម្រាប់កំណត់ស្វ័យប្រវត្តិ)</span>
                </label>
                <input
                  type="text"
                  placeholder="ឧ. KH-LANG, MATH,..."
                  value={newSubjectCode}
                  onChange={(e) => setNewSubjectCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-800 bg-white uppercase"
                />
              </div>

              {/* Subject Name Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  ឈ្មោះមុខវិជ្ជា <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. ភូមិវិទ្យា, សរសេរតាមអាន,..."
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-800 bg-white"
                />
              </div>

              {/* Max Score & Coefficient calculation */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    ពិន្ទុអតិបរមា <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    required
                    value={newSubjectMaxScore}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewSubjectMaxScore(val);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    មេគុណស្វ័យប្រវត្ត
                  </label>
                  <div className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-extrabold text-violet-700 select-none">
                    × {((parseFloat(newSubjectMaxScore as string) || 0) / 50).toFixed(1).replace(/\.0$/, '')}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] text-slate-500 leading-relaxed font-semibold">
                ✨ <span className="font-bold text-violet-600">ការគណនាមេគុណ៖</span> ប្រព័ន្ធនឹងគណនាមេគុណដោយស្វ័យប្រវត្តិតាមរូបមន្ត <span className="font-bold">ពិន្ទុអតិបរមា ចែកនឹង ៥០</span>។ (ឧទាហរណ៍៖ ពិន្ទុអតិបរមា ១០០ = មេគុណ ២)
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAddingSubjectCatId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                disabled={!newSubjectName.trim() || (parseFloat(newSubjectMaxScore as string) || 0) <= 0}
                onClick={() => handleAddSubject(addingSubjectCatId)}
                className="px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                បន្ថែម
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SUBJECT DIALOG MODAL */}
      {editingSubjectConfig && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[250] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-teal-50 text-teal-600 rounded-lg shrink-0">
                  <Pencil className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-800">កែសម្រួលមុខវិជ្ជា</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingSubjectConfig(null)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Subject Code Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  កូដមុខវិជ្ជា <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. KH-LANG, MATH,..."
                  value={editSubjectCode}
                  onChange={(e) => setEditSubjectCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-800 bg-white uppercase"
                />
              </div>

              {/* Subject Name Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  ឈ្មោះមុខវិជ្ជា <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. ភូមិវិទ្យា, សរសេរតាមអាន,..."
                  value={editSubjectName}
                  onChange={(e) => setEditSubjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-800 bg-white"
                />
              </div>

              {/* Max Score & Coefficient calculation */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    ពិន្ទុអតិបរមា <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    required
                    value={editSubjectMaxScore}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditSubjectMaxScore(val);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    មេគុណស្វ័យប្រវត្ត
                  </label>
                  <div className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-extrabold text-teal-700 select-none">
                    × {((parseFloat(editSubjectMaxScore as string) || 0) / 50).toFixed(1).replace(/\.0$/, '')}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] text-slate-500 leading-relaxed font-semibold">
                ✨ <span className="font-bold text-teal-600">ការគណនាមេគុណ៖</span> ប្រព័ន្ធនឹងគណនាមេគុណដោយស្វ័យប្រវត្តិតាមរូបមន្ត <span className="font-bold">ពិន្ទុអតិបរមា ចែកនឹង ៥០</span>។
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingSubjectConfig(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                disabled={!editSubjectName.trim() || !editSubjectCode.trim() || (parseFloat(editSubjectMaxScore as string) || 0) <= 0}
                onClick={handleEditSubject}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                រក្សាទុក
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
