import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  GraduationCap, UserPlus, School, Search, Trash2, Edit2, 
  Printer, Plus, X, ArrowRight, Table, Phone, MapPin, Calendar, CheckCircle,
  AlertTriangle, IdCard, Save
} from 'lucide-react';
import { Student, Classroom, SchoolInfo } from '../types';
import { 
  getProvincesList, 
  getDistrictsForProvince, 
  getCommunesForDistrict, 
  getVillagesForCommune 
} from '../data/locationData';

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
  const [successToast, setSuccessToast] = useState<{ message: string, classroomId: string } | null>(null);

  // Toast state for student registration
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
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
  const [studentForm, setStudentForm] = useState<Omit<Student, 'id'>>({
    classroomId: '',
    studentIdCard: '',
    rollNumber: '',
    nameKhmer: '',
    nameLatin: '',
    gender: 'ប្រុស',
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
  });
  const [studentFormError, setStudentFormError] = useState<string | null>(null);

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
    setStudentForm({
      classroomId: classrooms[0]?.id || '',
      studentIdCard: `STD-${String(students.length + 1).padStart(3, '0')}`,
      rollNumber: String(students.length + 1),
      nameKhmer: '',
      nameLatin: '',
      gender: 'ប្រុស',
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
    });
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (s: Student) => {
    setEditingStudent(s);
    setStudentFormError(null);
    setHasManuallyEditedLatin(true);
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
    });
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentFormError(null);

    // Validate Required fields manually to double check
    if (!studentForm.studentIdCard.trim() || !studentForm.nameKhmer.trim() || !studentForm.dob || !studentForm.classroomId) {
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

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.nameKhmer.includes(searchTerm) || 
      s.nameLatin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentIdCard.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter ? s.classroomId === classFilter : true;
    return matchesSearch && matchesClass;
  });

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
          title: 'មេគុណតាមថ្នាក់',
          desc: 'កំណត់ និងគ្រប់គ្រងមេគុណមុខវិជ្ជាតាមថ្នាក់នីមួយៗសម្រាប់គណនាមធ្យមភាគពិន្ទុ',
        };
      case 'months':
        return {
          title: 'ខែយកពិន្ទុ',
          desc: 'ប្ដូរ ឬជ្រើសរើសខែទាំងឡាយណាដែលត្រូវយកមកគណនាមធ្យមភាគពិន្ទុសម្រាប់ថ្នាក់នីមួយៗ',
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
    <div id="school-students-section" className="space-y-6">
      {/* Header Panel with White Background "ក្បាលទំព័រ ត្រូវបន្ថែមផ្ទៃសពីខាងក្រោយ" */}
      {activeSubTab !== 'classes_list' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <h1 className={`font-medium text-slate-850 tracking-tight ${header.title === 'បញ្ជីថ្នាក់រៀន' ? 'text-lg' : 'text-xl'}`}>{header.title}</h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">{header.desc}</p>
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
                onClick={() => setIsDeleteAllConfirmOpen(true)}
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
                      const calculatedGroup = cls.classGroup || cls.name.replace(/[^a-zA-Z]/g, '').trim() || 'A';
                      const calculatedType = cls.classType || (cls.name.includes('(SC)') ? 'វិទ្យាសាស្ត្រ (SC)' : cls.name.includes('(SS)') ? 'សង្គម (SS)' : 'ទូទៅ');
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {classrooms.map(cls => {
              const classStds = students.filter(s => s.classroomId === cls.id);
              const girlsNum = classStds.filter(s => s.gender === 'ស្រី').length;
              return (
                <div 
                  key={cls.id}
                  className="bg-white rounded-2xl border border-slate-100 hover:border-teal-300 shadow-xs hover:shadow-md transition-all divide-y divide-slate-100 overflow-hidden"
                >
                  {/* Class Identity Panel */}
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] bg-teal-50 text-teal-800 font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wide">
                        កម្រិតថ្នាក់៖ ទី {cls.grade}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-800">
                      {cls.name}
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
                      គ្រប់គ្រងពិន្ទុ និងវត្តមានសិស្ស
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
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms.map(cls => {
              const currentSubs = localSubjects[cls.id] || cls.preStartConfig?.subjects || DEFAULT_SUBJECTS;
              const hasToast = successToast?.classroomId === cls.id && successToast?.message.includes('មេគុណ');

              const handleToggleSub = (subId: string) => {
                const updated = currentSubs.map(s => s.id === subId ? { ...s, isActive: !s.isActive } : s);
                setLocalSubjects(prev => ({ ...prev, [cls.id]: updated }));
              };

              const handleValChange = (subId: string, val: number) => {
                const updated = currentSubs.map(s => s.id === subId ? { ...s, coefficient: val } : s);
                setLocalSubjects(prev => ({ ...prev, [cls.id]: updated }));
              };

              return (
                <div key={cls.id} className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] bg-purple-50 text-purple-700 font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wide">
                          កម្រិតថ្នាក់៖ ទី {cls.grade}
                        </span>
                        <h3 className="text-lg font-extrabold text-slate-800 mt-1">{cls.name}</h3>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        គ្រូ៖ {cls.preStartConfig?.homeTeacherName || 'មិនទាន់កំណត់'}
                      </span>
                    </div>

                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {currentSubs.map(s => (
                        <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-50 bg-slate-50/20 text-xs">
                          <label className="flex items-center gap-2 cursor-pointer font-bold select-none text-slate-700">
                            <input
                              type="checkbox"
                              checked={s.isActive}
                              onChange={() => handleToggleSub(s.id)}
                              className="w-4 h-4 text-teal-600 border-slate-200 focus:ring-teal-500 rounded cursor-pointer"
                            />
                            <span className={s.isActive ? 'text-slate-800' : 'text-slate-400 line-through'}>
                              {s.name}
                            </span>
                          </label>

                          {s.isActive && (
                            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1">
                              <span className="text-[9px] font-bold text-slate-400">មេគុណ:</span>
                              <input
                                type="number"
                                step="0.5"
                                min="1"
                                max="4"
                                value={s.coefficient}
                                onChange={e => handleValChange(s.id, parseFloat(e.target.value) || 1)}
                                className="w-10 text-center font-extrabold text-teal-600 outline-none text-xs"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {hasToast && (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-pulse">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          បានរក្សាទុក!
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleSaveClassroomConfig(cls.id, currentSubs)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      រក្សាទុក
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ៤.៤. SUBTAB: SCORING MONTHS CONFIGURATION */}
      {activeSubTab === 'months' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms.map(cls => {
              const currentMons = localMonths[cls.id] || cls.preStartConfig?.activeMonthsForAverage || ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា'];
              const hasToast = successToast?.classroomId === cls.id && successToast?.message.includes('ខែ');

              const semester1Months = cls.preStartConfig?.semester1Months || ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា'];
              const semester2Months = cls.preStartConfig?.semester2Months || ['មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា'];
              const allPossibleMonths = [...semester1Months, ...semester2Months];

              const handleToggleMonth = (mName: string) => {
                let updated: string[];
                if (currentMons.includes(mName)) {
                  updated = currentMons.filter(m => m !== mName);
                } else {
                  updated = [...currentMons, mName];
                }
                setLocalMonths(prev => ({ ...prev, [cls.id]: updated }));
              };

              return (
                <div key={cls.id} className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] bg-teal-50 text-teal-700 font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wide">
                          កម្រិតថ្នាក់៖ ទី {cls.grade}
                        </span>
                        <h3 className="text-lg font-extrabold text-slate-800 mt-1">{cls.name}</h3>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        គ្រូ៖ {cls.preStartConfig?.homeTeacherName || 'មិនទាន់កំណត់'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-500">ជ្រើសរើសខែដើម្បីយកពិន្ទុមកបូកបញ្ចូលមធ្យមពិន្ទុ៖</label>
                      <div className="grid grid-cols-2 gap-2">
                        {allPossibleMonths.map(mon => {
                          const isSelected = currentMons.includes(mon);
                          return (
                            <button
                              key={mon}
                              type="button"
                              onClick={() => handleToggleMonth(mon)}
                              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer select-none truncate ${
                                isSelected
                                  ? 'bg-teal-600 border-teal-600 text-white shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                              }`}
                            >
                              {mon} {isSelected ? '✓' : ''}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {hasToast && (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-pulse">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          បានរក្សាទុក!
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleSaveClassroomMonths(cls.id, currentMons)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      រក្សាទុក
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ៤.១. SUBTAB: STUDENT PROFILE CARDS DIRECTORY */}
      {activeSubTab === 'students' && (
        <div className="space-y-4 animate-fade-in">
          {/* Search & Class filter */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* Added left-most button */}
            <div className="w-full md:w-auto flex flex-wrap items-center gap-2">
              <button
                onClick={handleOpenAddStudent}
                className="w-full sm:w-auto px-4 py-2 bg-white border border-purple-600 text-purple-600 hover:bg-purple-50 hover:text-purple-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer whitespace-nowrap animate-pulse-once"
                id="btn-add-student"
              >
                <UserPlus className="w-4 h-4 text-purple-600" />
                បន្ថែមសិស្សថ្មី
              </button>
              <button
                onClick={() => setIsDeleteAllStudentsConfirmOpen(true)}
                className="w-full sm:w-auto px-4 py-2 bg-white border border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                id="btn-clear-all-students"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                លុបទិន្នន័យ
              </button>
            </div>

            {/* Middle search and select */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:flex-1 justify-center">
              <div className="relative w-full md:max-w-xs">
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

              <div className="flex items-center gap-2 w-auto">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">ថ្នាក់៖</span>
                <select
                  value={classFilter}
                  onChange={e => setClassFilter(e.target.value)}
                  className="block w-auto px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none cursor-pointer appearance-none text-center font-bold text-slate-700"
                >
                  <option value="">គ្រប់ថ្នាក់</option>
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right-most print button */}
            <div className="w-full md:w-auto">
              <button
                onClick={() => {
                  if (!selectedPrintStudent && students.length > 0) {
                    setSelectedPrintStudent(students[0]);
                  }
                  setIsBadgeModalOpen(true);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-white border border-blue-600 hover:bg-blue-50 text-blue-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <IdCard className="w-4 h-4 text-blue-600" />
                ប័ណ្ណសម្គាល់ខ្លួន
              </button>
            </div>

          </div>

          {/* Students Table */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-emerald-700 text-white font-bold text-xs uppercase" id="students-list-th-row">
                    <th className="px-4 py-3 text-center">ល.រ</th>
                    <th className="px-4 py-3 text-center">អត្តលេខសិស្ស</th>
                    <th className="px-4 py-3">ឈ្មោះខ្មែរ</th>
                    <th className="px-4 py-3">ឈ្មោះឡាតាំង</th>
                    <th className="px-3 py-3 text-center">ភេទ</th>
                    <th className="px-4 py-3">ថ្នាក់</th>
                    <th className="px-4 py-3 text-right">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-xs font-semibold">
                        រកមិនឃើញទិន្នន័យសិស្សានុសិស្សត្រូវបានកំណត់ឡើយ។
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(s => {
                      const cls = classrooms.find(c => c.id === s.classroomId);
                      return (
                        <tr 
                          key={s.id} 
                          className="border-b border-emerald-600 hover:bg-slate-50/50 transition-colors text-xs text-slate-700 font-medium"
                        >
                          <td className="px-4 py-3 text-center font-mono font-bold text-slate-400">{s.rollNumber}</td>
                          <td className="px-4 py-3 text-center font-mono font-semibold text-teal-600 bg-slate-50/30">{s.studentIdCard}</td>
                          <td className="px-4 py-3 font-bold text-slate-800">{s.nameKhmer}</td>
                          <td className="px-4 py-3 uppercase text-slate-500 font-mono font-bold">{s.nameLatin}</td>
                          <td className="px-3 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                              s.gender === 'ប្រុស' ? 'bg-sky-50 text-sky-700' : 'bg-pink-50 text-pink-700'
                            }`}>
                              {s.gender}
                            </span>
                          </td>
                          <td className="px-4 py-3"><span className="font-bold text-slate-600">{cls?.name || '---'}</span></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedPrintStudent(s);
                                  setIsBadgeModalOpen(true);
                                }}
                                title="បោះពុម្ពប័ណ្ណសម្គាល់ខ្លួនសិស្ស"
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
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
            <form onSubmit={handleSaveStudent} className="flex-1 overflow-y-auto p-6 space-y-4">
              {studentFormError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold font-sans flex items-center gap-2 animate-pulse">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{studentFormError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="student-roll-input" className="text-xs font-bold text-slate-700 block">លេខរៀង</label>
                  <input
                    id="student-roll-input"
                    type="text"
                    value={studentForm.rollNumber}
                    onChange={e => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                    placeholder="ឧ. ១"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
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
                    placeholder="ឧ. STD-701"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="student-kh-name-input" className="text-xs font-bold text-slate-700 block">ឈ្មោះខ្មែរ <span className="text-red-600 font-extrabold text-sm ml-0.5">*</span></label>
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
                    placeholder="ឧ. សុខ វាសនា"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="student-en-name-input" className="text-xs font-bold text-slate-700 block">ឈ្មោះឡាតាំង</label>
                  <input
                    id="student-en-name-input"
                    type="text"
                    value={studentForm.nameLatin}
                    onChange={e => {
                      setHasManuallyEditedLatin(true);
                      setStudentForm({ ...studentForm, nameLatin: e.target.value });
                    }}
                    placeholder="ឧ. SOK VEASNA"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white uppercase font-sans font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">ភេទ <span className="text-red-600 font-extrabold text-sm ml-0.5">*</span></label>
                  <div className="flex gap-4 pt-1.5">
                    {(['ប្រុស', 'ស្រី'] as const).map(g => (
                      <label key={g} className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
                        <input
                          type="radio"
                          name="studentGender"
                          checked={studentForm.gender === g}
                          onChange={() => setStudentForm({ ...studentForm, gender: g })}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        <span>{g}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="student-dob-input" className="text-xs font-bold text-slate-700 block">ថ្ងៃខែឆ្នាំកំណើត <span className="text-red-600 font-extrabold text-sm ml-0.5">*</span></label>
                  <input
                    id="student-dob-input"
                    type="date"
                    required
                    value={studentForm.dob}
                    onChange={e => setStudentForm({ ...studentForm, dob: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="student-cls-select" className="text-xs font-bold text-slate-700 block">រៀបចំចូលថ្នាក់រៀន <span className="text-red-600 font-extrabold text-sm ml-0.5">*</span></label>
                  <select
                    id="student-cls-select"
                    value={studentForm.classroomId}
                    onChange={e => setStudentForm({ ...studentForm, classroomId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white font-bold text-slate-700"
                  >
                    <option value="" disabled>-- សូមជ្រើសរើសថ្នាក់ --</option>
                    {classrooms.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="student-parent-phone" className="text-xs font-bold text-slate-700 block">លេខទូរស័ព្ទអាណាព្យាបាល</label>
                  <input
                    id="student-parent-phone"
                    type="text"
                    value={studentForm.parentPhone}
                    onChange={e => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
                    placeholder="ឧ. 012 888 999"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-700 block">ទីកន្លែងកំណើត</span>
                <div className="grid grid-cols-2 gap-2 bg-slate-50/75 p-3.5 rounded-2xl border border-slate-100">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">រាជធានី/ខេត្ត</label>
                    <select
                      value={studentForm.pobProvince || ''}
                      onChange={e => handlePobProvinceChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none cursor-pointer"
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
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">ស្រុក/ក្រុង/ខណ្ឌ</label>
                    <select
                      value={studentForm.pobDistrict || ''}
                      onChange={e => handlePobDistrictChange(e.target.value)}
                      disabled={!studentForm.pobProvince}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
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
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">ឃុំ/សង្កាត់</label>
                    <select
                      value={studentForm.pobCommune || ''}
                      onChange={e => handlePobCommuneChange(e.target.value)}
                      disabled={!studentForm.pobDistrict}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
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
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">ភូមិ</label>
                    <select
                      value={studentForm.pobVillage || ''}
                      onChange={e => setStudentForm({ ...studentForm, pobVillage: e.target.value })}
                      disabled={!studentForm.pobCommune}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
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
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-700 block">ទីលំនៅបច្ចុប្បន្ន</span>
                <div className="grid grid-cols-2 gap-2 bg-slate-50/75 p-3.5 rounded-2xl border border-slate-100">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">រាជធានី/ខេត្ត</label>
                    <select
                      value={studentForm.currentAddressProvince || ''}
                      onChange={e => handleCurrentAddressProvinceChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none cursor-pointer"
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
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">ស្រុក/ក្រុង/ខណ្ឌ</label>
                    <select
                      value={studentForm.currentAddressDistrict || ''}
                      onChange={e => handleCurrentAddressDistrictChange(e.target.value)}
                      disabled={!studentForm.currentAddressProvince}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
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
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">ឃុំ/សង្កាត់</label>
                    <select
                      value={studentForm.currentAddressCommune || ''}
                      onChange={e => handleCurrentAddressCommuneChange(e.target.value)}
                      disabled={!studentForm.currentAddressDistrict}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
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
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">ភូមិ</label>
                    <select
                      value={studentForm.currentAddressVillage || ''}
                      onChange={e => setStudentForm({ ...studentForm, currentAddressVillage: e.target.value })}
                      disabled={!studentForm.currentAddressCommune}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
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
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
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
                <Printer className="w-4 h-4 text-teal-650" />
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
        <div className="fixed bottom-5 right-5 z-[200] flex bg-white border-l-4 border-emerald-500 shadow-xl rounded-xl p-4 items-center gap-3 max-w-sm border border-slate-100 transition-all duration-300 transform scale-100 animate-in fade-in slide-in-from-bottom-4">
          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-full shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-800 text-xs font-bold font-sans">ជោគជ័យ</p>
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
    </div>
  );
}
