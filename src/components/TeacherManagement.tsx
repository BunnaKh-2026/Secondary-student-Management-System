import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, UserPlus, Trash2, Edit2, Calendar, FileText, CheckCircle, 
  XSquare, Clock, MapPin, Phone, Printer, Plus, X, Search, XCircle, BookOpen, GripVertical,
  Eye, ArrowUpDown, Camera, FileSpreadsheet, FileDown, FileUp, AlertTriangle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Teacher, TeacherAttendance, SchoolInfo, Classroom } from '../types';
import { STANDARD_SUBJECTS_LAYOUT } from '../data/subjectLayouts';
import { transliterateKhmerToLatin } from './StudentManagement';

// Helper to map Khmer digits and letters in class names to standard Arabic equivalents (e.g., ៧អា -> 7A, ថ្នាក់ទី ៧A -> 7A)
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

const formatToDDMMYYYY = (dateStr: string): string => {
  if (!dateStr) return '-';
  const clean = dateStr.trim();
  
  // Try matching standard YYYY-MM-DD
  const matchIso = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (matchIso) {
    return `${matchIso[3]}-${matchIso[2]}-${matchIso[1]}`;
  }
  
  // If it matches DD-MM-YYYY or DD/MM/YYYY, return with hyphens
  const matchDmy = clean.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (matchDmy) {
    return `${matchDmy[1]}-${matchDmy[2]}-${matchDmy[3]}`;
  }
  
  // Try fallback parsing via native Date
  const d = new Date(clean);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
  
  return dateStr;
};

const SUBJECT_TO_CODE: { [name: string]: string } = {
  'សរសេរតាមអាន': 'Di',
  'តែងសេចក្តី': 'Wr',
  'ល្បឿនអំណាន': 'Rs',
  'ភាសាខ្មែរ': 'K',
  'អក្សរសាស្ត្រខ្មែរ': 'K',
  'គណិតវិទ្យា': 'M',
  'រូបវិទ្យា': 'P',
  'គីមីវិទ្យា': 'C',
  'ជីវវិទ្យា': 'B',
  'ផែនដីវិទ្យា': 'Es',
  'ប្រវត្តិវិទ្យា': 'H',
  'ភូមិវិទ្យា': 'G',
  'ពលរដ្ឋវិជ្ជា': 'Mc',
  'គេហវិទ្យា': 'He',
  'សេដ្ឋកិច្ចវិទ្យា': 'Ec',
  'អង់គ្លេស': 'E',
  'បារាំង': 'F',
  'អប់រំសុខភាព': 'Hc',
  'អប់រំកាយ និងកីឡា': 'Ed',
  'អប់រំកាយ-កីឡា': 'Ed',
  'កសិកម្ម': 'Ag',
  'គំនូរ-ចម្រៀង': 'Ar',
  'អប់រំសិល្បៈ': 'Ar',
  'ព័ត៌មានវិទ្យា': 'IT',
  'បច្ចេកវិទ្យាព័ត៌មាន': 'IT',
  'អប់រំពុទ្ធសាសនា': 'Be',
  'អប់រំបំណិនជីវិត': 'S',
  'បណ្ណាល័យ': 'Li'
};

const CODE_TO_SUBJECT: { [code: string]: string } = {
  'Di': 'សរសេរតាមអាន',
  'Wr': 'តែងសេចក្តី',
  'Rs': 'ល្បឿនអំណាន',
  'K': 'ភាសាខ្មែរ',
  'M': 'គណិតវិទ្យា',
  'P': 'រូបវិទ្យា',
  'C': 'គីមីវិទ្យា',
  'B': 'ជីវវិទ្យា',
  'Es': 'ផែនដីវិទ្យា',
  'H': 'ប្រវត្តិវិទ្យា',
  'G': 'ភូមិវិទ្យា',
  'Mc': 'ពលរដ្ឋវិជ្ជា',
  'He': 'គេហវិទ្យា',
  'Ec': 'សេដ្ឋកិច្ចវិទ្យា',
  'E': 'អង់គ្លេស',
  'F': 'បារាំង',
  'Hc': 'អប់រំសុខភាព',
  'Ed': 'អប់រំកាយ-កីឡា',
  'Ag': 'កសិកម្ម',
  'Ar': 'អប់រំសិល្បៈ',
  'IT': 'បច្ចេកវិទ្យាព័ត៌មាន',
  'Be': 'អប់រំពុទ្ធសាសនា',
  'S': 'អប់រំបំណិនជីវិត',
  'Li': 'បណ្ណាល័យ'
};

// Helper to parse "M(7A, 7B); Di(7A)" into [{ subject: "គណិតវិទ្យា", classes: ["7A", "7B"] }]
const parseTeachingSubjects = (str: string): { subject: string; classes: string[] }[] => {
  if (!str) return [];
  const results: { subject: string; classes: string[] }[] = [];
  const parts = str.split(';');
  parts.forEach(part => {
    const trimmed = part.trim();
    if (!trimmed) return;
    const match = trimmed.match(/^([^(]+)(?:\(([^)]+)\))?$/);
    if (match) {
      const subjectCodeOrName = match[1].trim();
      const subject = CODE_TO_SUBJECT[subjectCodeOrName] || subjectCodeOrName;
      const classesStr = match[2] || '';
      const classes = classesStr.split(',').map(c => toArabicClassname(c.trim())).filter(Boolean);
      results.push({ subject, classes });
    } else {
      const subject = CODE_TO_SUBJECT[trimmed] || trimmed;
      results.push({ subject, classes: [] });
    }
  });
  return results;
};

// Helper to format [{ subject: "គណិតវិទ្យា", classes: ["7A", "7B"] }] into "M(7A, 7B); Di(7A)"
const formatTeachingSubjects = (selections: { subject: string; classes: string[] }[]): string => {
  return selections
    .map(sel => {
      const code = SUBJECT_TO_CODE[sel.subject] || sel.subject;
      const cleanClasses = sel.classes.map(toArabicClassname);
      if (cleanClasses.length > 0) {
        return `${code}(${cleanClasses.join(', ')})`;
      }
      return code;
    })
    .join('; ');
};

interface TeacherManagementProps {
  teachers: Teacher[];
  teacherAttendance: TeacherAttendance[];
  schoolInfo: SchoolInfo;
  onUpdateTeachers: (list: Teacher[]) => void;
  onUpdateAttendance: (list: TeacherAttendance[]) => void;
  activeSubTab?: 'list' | 'roles' | 'attendance';
  classrooms?: Classroom[];
}

export default function TeacherManagement({
  teachers,
  teacherAttendance,
  schoolInfo,
  onUpdateTeachers,
  onUpdateAttendance,
  activeSubTab = 'list',
  classrooms = [],
}: TeacherManagementProps) {
   // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sorting state
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  // View detail state
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);

  const handleSortName = () => {
    if (sortOrder === null) {
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder(null);
    }
  };

  // Click outside listener for sort dropdown
  useEffect(() => {
    function handleClickOutsideSort(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutsideSort);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSort);
    };
  }, []);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    };
  }, []);

  // Import/Export dropdown state
  const [showImportExportDropdown, setShowImportExportDropdown] = useState(false);
  const importExportDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Click outside listener for import/export dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (importExportDropdownRef.current && !importExportDropdownRef.current.contains(event.target as Node)) {
        setShowImportExportDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getKhmerDateTimeString = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year}_${hours}:${minutes}:${seconds}`;
  };

  const parseImportDate = (val: any): string => {
    if (!val) return '';
    if (val instanceof Date) {
      const year = val.getFullYear();
      const month = String(val.getMonth() + 1).padStart(2, '0');
      const day = String(val.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    let str = String(val).trim();
    if (!str) return '';

    if (str.includes('T')) {
      const parts = str.split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(parts)) {
        return parts;
      }
    }

    // Handle Excel numeric date serials if imported as number
    if (/^\d{5}(\.\d+)?$/.test(str)) {
      try {
        const dateObj = XLSX.SSF.parse_date_code(Number(str));
        const year = dateObj.y;
        const month = String(dateObj.m).padStart(2, '0');
        const day = String(dateObj.d).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch (e) {
        // fallback
      }
    }

    // Standard ISO YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }

    // DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
    const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, '0');
      const month = dmyMatch[2].padStart(2, '0');
      const year = dmyMatch[3];
      return `${year}-${month}-${day}`;
    }

    // YYYY/MM/DD or YYYY.MM.DD
    const ymdMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (ymdMatch) {
      const year = ymdMatch[1];
      const month = ymdMatch[2].padStart(2, '0');
      const day = ymdMatch[3].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // Try parsing as generic date if possible
    const parsedTimestamp = Date.parse(str);
    if (!isNaN(parsedTimestamp)) {
      const d = new Date(parsedTimestamp);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return str;
  };

  const formatImportPhone = (val: any): string => {
    if (!val) return '';
    let str = String(val).trim();
    if (!str) return '';
    
    // Remove any spaces, hyphens, or brackets commonly used in phone numbers
    str = str.replace(/[\s\-\(\)]/g, '');
    
    if (/^\d+$/.test(str)) {
      if (str.startsWith('855')) {
        str = '0' + str.slice(3);
      } else if (!str.startsWith('0') && (str.length === 8 || str.length === 9)) {
        str = '0' + str;
      }
    }
    return str;
  };

  const cleanClassroomValue = (val: string): string => {
    if (!val) return '';
    return val.replace(/^ថ្នាក់ទី\s*/, '').trim();
  };

  const formatImportIdNumber = (val: any, index: number): string => {
    if (!val) {
      const base = String(Date.now() + index);
      return base.slice(-10).padStart(10, '0');
    }
    const str = String(val).trim();
    if (!str) {
      const base = String(Date.now() + index);
      return base.slice(-10).padStart(10, '0');
    }
    if (/^\d+$/.test(str)) {
      return str.padStart(10, '0');
    }
    return str;
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "ល.រ",
      "អត្តលេខមន្ត្រី",
      "គោត្តនាម-នាម",
      "ឈ្មោះឡាតាំង",
      "ភេទ",
      "ថ្ងៃខែឆ្នាំកំណើត",
      "តួនាទី",
      "ក្របខណ្ឌ",
      "កាំប្រាក់",
      "ឯកទេស",
      "មុខវិជ្ជាបង្រៀន",
      "បន្ទុកថ្នាក់",
      "ជនជាតិភាគតិច",
      "កម្រិតវប្បធម៌",
      "ថ្ងៃចូលបង្រើការងារ",
      "លេខទូរសព្ទ"
    ];
    
    const sampleData = [
      {
        "ល.រ": 1,
        "អត្តលេខមន្ត្រី": 1900100036,
        "គោត្តនាម-នាម": "ផៃ ប៊ុនណា",
        "ឈ្មោះឡាតាំង": "PHAI BUNNA",
        "ភេទ": "ប្រុស",
        "ថ្ងៃខែឆ្នាំកំណើត": "05-04-1990",
        "តួនាទី": "គ្រូបង្រៀន",
        "ក្របខណ្ឌ": "ម.ទុតិយភូមិ",
        "កាំប្រាក់": "ក.២.៣",
        "ឯកទេស": "គណិតវិទ្យា",
        "មុខវិជ្ជាបង្រៀន": "គណិតវិទ្យា, រូបវិទ្យា",
        "បន្ទុកថ្នាក់": "7A",
        "ជនជាតិភាគតិច": "ទេ",
        "កម្រិតវប្បធម៌": "បរិញ្ញាបត្រជាន់ខ្ពស់",
        "ថ្ងៃចូលបង្រើការងារ": "01-10-2012",
        "លេខទូរសព្ទ": 95539373
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "គំរូឯកសារគ្រូ");

    const dtStr = getKhmerDateTimeString();
    XLSX.writeFile(workbook, `គំរូឯកសារគ្រូបង្រៀន_${dtStr}.xlsx`);
    showToast("បានទាញយកគំរូឯកសារជោគជ័យ!", "success");
  };

  const handleExportTeachers = () => {
    if (teachers.length === 0) {
      showToast("មិនមានទិន្នន័យគ្រូបង្រៀនសម្រាប់នាំចេញទេ!", "error");
      return;
    }

    const exportData = teachers.map((t, idx) => {
      let idNum = (t.idNumber || '').trim();
      if (/^\d+$/.test(idNum)) {
        idNum = idNum.padStart(10, '0');
      }
      return {
        "ល.រ": idx + 1,
        "អត្តលេខមន្ត្រី": idNum,
        "គោត្តនាម-នាម": t.name,
        "ឈ្មោះឡាតាំង": t.nameLatin || "",
        "ភេទ": t.gender,
        "ថ្ងៃខែឆ្នាំកំណើត": formatToDDMMYYYY(t.dob),
        "តួនាទី": t.role || "គ្រូបង្រៀន",
        "ក្របខណ្ឌ": t.framework || "",
        "កាំប្រាក់": t.salaryRank || "",
        "ឯកទេស": t.subject,
        "មុខវិជ្ជាបង្រៀន": t.teachingSubjects || "",
        "បន្ទុកថ្នាក់": cleanClassroomValue(t.classCharge),
        "ជនជាតិភាគតិច": t.ethnicity || "ទេ",
        "កម្រិតវប្បធម៌": t.educationLevel || "",
        "ថ្ងៃចូលបង្រើការងារ": formatToDDMMYYYY(t.joinDate),
        "លេខទូរសព្ទ": t.phone || ""
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "បញ្ជីឈ្មោះគ្រូ");

    const dtStr = getKhmerDateTimeString();
    XLSX.writeFile(workbook, `បញ្ជីឈ្មោះគ្រូបង្រៀន_${dtStr}.xlsx`);
    showToast("បាននាំចេញទិន្នន័យគ្រូបង្រៀនជោគជ័យ!", "success");
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json<any>(worksheet);

        if (rawData.length === 0) {
          showToast("ឯកសារដែលបានជ្រើសរើសមិនមានទិន្នន័យទេ!", "error");
          return;
        }

        const importedTeachers: Teacher[] = [];
        let errorCount = 0;

        rawData.forEach((row: any, index: number) => {
          const idNumberRaw = row["អត្តលេខមន្ត្រី"] || row["ID_NUMBER"] || row["idNumber"];
          const idNumber = formatImportIdNumber(idNumberRaw, index);
          const name = String(row["គោត្តនាម-នាម"] || row["ឈ្មោះ"] || row["NAME"] || row["name"] || "").trim();
          
          if (!name) {
            errorCount++;
            return;
          }

          const nameLatin = String(row["ឈ្មោះឡាតាំង"] || row["NAME_LATIN"] || row["nameLatin"] || "").trim();
          
          let genderRaw = String(row["ភេទ"] || row["ភេទ (ប្រុស/ស្រី)"] || row["GENDER"] || row["gender"] || "").trim();
          let gender: 'ប្រុស' | 'ស្រី' = 'ប្រុស';
          if (genderRaw) {
            const trimmedL = genderRaw.toLowerCase();
            if (trimmedL === 'ស្រី' || trimmedL === 'ស' || trimmedL === 'female' || trimmedL === 'f') {
              gender = 'ស្រី';
            } else if (trimmedL === 'ប្រុស' || trimmedL === 'ប' || trimmedL === 'male' || trimmedL === 'm') {
              gender = 'ប្រុស';
            }
          }

          const dobRaw = row["ថ្ងៃខែឆ្នាំកំណើត"] || row["ថ្ងៃខែឆ្នាំកំណើត (YYYY-MM-DD)"] || row["DOB"] || row["dob"];
          const dob = parseImportDate(dobRaw);

          const phoneRaw = row["លេខទូរសព្ទ"] || row["លេខទូរស័ព្ទ"] || row["PHONE"] || row["phone"];
          const phone = formatImportPhone(phoneRaw);
          const subject = String(row["ឯកទេស"] || row["ឯកទេស / មុខវិជ្ជាចម្បង"] || row["SUBJECT"] || row["subject"] || "").trim();
          const role = String(row["តួនាទី"] || row["ROLE"] || row["role"] || "គ្រូបង្រៀន").trim();

          const responsibilities: string[] = [];

          const salaryRank = String(row["កាំប្រាក់"] || row["SALARY_RANK"] || row["salaryRank"] || "").trim();
          const framework = String(row["ក្របខណ្ឌ"] || row["ក្របខ័ណ្ឌ"] || row["FRAMEWORK"] || row["framework"] || "").trim();
          const teachingSubjects = String(row["មុខវិជ្ជាបង្រៀន"] || row["TEACHING_SUBJECTS"] || row["teachingSubjects"] || "").trim();
          
          const classChargeRaw = String(row["បន្ទុកថ្នាក់"] || row["CLASS_CHARGE"] || row["classCharge"] || "").trim();
          const classCharge = cleanClassroomValue(classChargeRaw);
          
          let ethnicity = String(row["ជនជាតិភាគតិច"] || row["ជន.ភាគតិច"] || row["ETHNICITY"] || row["ethnicity"] || "").trim();
          if (!ethnicity) ethnicity = "ទេ";

          const educationLevel = String(row["កម្រិតវប្បធម៌"] || row["EDUCATION_LEVEL"] || row["educationLevel"] || "").trim();
          
          const joinDateRaw = row["ថ្ងៃចូលបង្រើការងារ"] || row["ថ្ងៃចូលធ្វើការ"] || row["ថ្ងៃចូលបម្រើការងារ"] || row["JOIN_DATE"] || row["joinDate"];
          const joinDate = parseImportDate(joinDateRaw);

          const newTeacher: Teacher = {
            id: `TCH-IMPORT-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
            idNumber,
            name,
            nameLatin: nameLatin || transliterateKhmerToLatin(name),
            gender: gender as 'ប្រុស' | 'ស្រី',
            dob,
            phone,
            subject: subject || "គ្រូបង្រៀន",
            role: role || "គ្រូបង្រៀន",
            responsibilities,
            salaryRank,
            framework,
            teachingSubjects,
            classCharge,
            ethnicity,
            educationLevel,
            joinDate,
            photoUrl: ""
          };

          importedTeachers.push(newTeacher);
        });

        if (importedTeachers.length > 0) {
          const mergedTeachers = [...teachers];
          let addedNew = 0;
          let updatedOld = 0;

          importedTeachers.forEach(impT => {
            const duplicateIndex = mergedTeachers.findIndex(t => t.idNumber && t.idNumber === impT.idNumber);
            if (duplicateIndex !== -1) {
              mergedTeachers[duplicateIndex] = {
                ...mergedTeachers[duplicateIndex],
                ...impT,
                id: mergedTeachers[duplicateIndex].id
              };
              updatedOld++;
            } else {
              mergedTeachers.push(impT);
              addedNew++;
            }
          });

          onUpdateTeachers(mergedTeachers);
          showToast(`បាននាំចូលជោគជ័យ៖ បញ្ចូលថ្មី ${addedNew} នាក់ និងធ្វើបច្ចុប្បន្នភាព ${updatedOld} នាក់។`, 'success');
        } else {
          showToast(`មិនមានទិន្នន័យគ្រូបង្រៀនត្រឹមត្រូវសម្រាប់នាំចូលទេ!`, 'error');
        }

      } catch (err) {
        console.error(err);
        showToast("មានបញ្ហាក្នុងការអានឯកសារ Excel! សូមពិនិត្យទម្រង់ទិន្នន័យឡើងវិញ។", "error");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Drag and drop states for teachers list
  const [draggingTeacherId, setDraggingTeacherId] = useState<string | null>(null);
  const [dragOverTeacherId, setDragOverTeacherId] = useState<string | null>(null);

  // Modal / Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [duplicateIdError, setDuplicateIdError] = useState<string | null>(null);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [hasManuallyEditedLatin, setHasManuallyEditedLatin] = useState(false);
  const [formData, setFormData] = useState<Omit<Teacher, 'id'>>({
    idNumber: '',
    name: '',
    nameLatin: '',
    gender: 'ប្រុស',
    dob: '',
    phone: '',
    subject: '',
    role: '',
    responsibilities: [],
    salaryRank: '',
    framework: '',
    teachingSubjects: '',
    classCharge: '',
    ethnicity: 'ទេ',
    educationLevel: '',
    joinDate: '',
    yearsOfService: 0,
    photoUrl: '',
  });

  // Role details input helper
  const [newResp, setNewResp] = useState('');

  // Subject and Class popup states
  const [isSubjectClassModalOpen, setIsSubjectClassModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [customSubjectName, setCustomSubjectName] = useState('');
  const [selectedClassesForSubject, setSelectedClassesForSubject] = useState<string[]>([]);
  const [addedSubjectsList, setAddedSubjectsList] = useState<{ subject: string; classes: string[] }[]>([]);
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const classDropdownRef = useRef<HTMLDivElement>(null);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (classDropdownRef.current && !classDropdownRef.current.contains(event.target as Node)) {
        setIsClassDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [classDropdownRef]);

  // Get all unique subject names, sorted in the custom sequence requested by the user
  const availableSubjects = React.useMemo(() => {
    const SUBJECT_ORDER = [
      "សរសេរតាមអាន",
      "តែងសេចក្ដី",
      "ល្បឿនអំណាន",
      "ភាសាខ្មែរ",
      "អក្សរសាស្ត្រខ្មែរ",
      "គណិតវិទ្យា",
      "រូបវិទ្យា",
      "គីមីវិទ្យា",
      "ជីវវិទ្យា",
      "ផែនដីវិទ្យា",
      "ប្រវត្តិវិទ្យា",
      "ភូមិវិទ្យា",
      "ពលរដ្ឋវិជ្ជា",
      "គេហវិទ្យា",
      "សេដ្ឋកិច្ចវិទ្យា",
      "អង់គ្លេស",
      "បារាំង",
      "អប់រំសុខភាព",
      "អប់រំកាយ-កីឡា",
      "កសិកម្ម",
      "អប់រំសិល្បៈ",
      "បច្ចេកវិទ្យាព័ត៌មាន",
      "អប់រំពុទ្ធសាសនា",
      "អប់រំបំណិនជីវិត",
      "បណ្ណាល័យ"
    ];

    const getSubjectIndex = (name: string): number => {
      const clean = name.trim();
      if (clean === 'តែងសេចក្តី' || clean === 'តែងសេចក្ដី') {
        return 1;
      }
      return SUBJECT_ORDER.indexOf(clean);
    };

    const subjectsSet = new Set<string>();
    STANDARD_SUBJECTS_LAYOUT.forEach(sub => {
      if (sub.name) subjectsSet.add(sub.name);
    });
    classrooms.forEach(cls => {
      if (cls.preStartConfig?.subjects) {
        cls.preStartConfig.subjects.forEach(sub => {
          if (sub.name) subjectsSet.add(sub.name);
        });
      }
    });

    const list = Array.from(subjectsSet);
    return list.sort((a, b) => {
      const idxA = getSubjectIndex(a);
      const idxB = getSubjectIndex(b);
      if (idxA !== -1 && idxB !== -1) {
        return idxA - idxB;
      }
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b, 'km');
    });
  }, [classrooms]);

  const handleOpenSubjectClassModal = () => {
    const parsed = parseTeachingSubjects(formData.teachingSubjects || '');
    setAddedSubjectsList(parsed);
    setSelectedSubject('');
    setCustomSubjectName('');
    setSelectedClassesForSubject([]);
    setIsSubjectClassModalOpen(true);
  };

  const handleAddSubjectClassPair = () => {
    const subj = selectedSubject === 'other' ? customSubjectName.trim() : selectedSubject;
    if (!subj) return;

    // Check if we already have this subject
    const existingIndex = addedSubjectsList.findIndex(s => s.subject.toLowerCase() === subj.toLowerCase());
    
    if (existingIndex > -1) {
      // Merge selected classes, avoiding duplicates
      const updatedList = [...addedSubjectsList];
      const mergedClasses = Array.from(new Set([...updatedList[existingIndex].classes, ...selectedClassesForSubject]));
      updatedList[existingIndex] = {
        subject: subj,
        classes: mergedClasses
      };
      setAddedSubjectsList(updatedList);
    } else {
      setAddedSubjectsList([...addedSubjectsList, { subject: subj, classes: [...selectedClassesForSubject] }]);
    }

    // Reset inputs
    setSelectedSubject('');
    setCustomSubjectName('');
    setSelectedClassesForSubject([]);
  };

  const handleRemoveSubjectClassPair = (index: number) => {
    setAddedSubjectsList(addedSubjectsList.filter((_, idx) => idx !== index));
  };

  const handleSaveSubjectClassSelections = () => {
    const formattedStr = formatTeachingSubjects(addedSubjectsList);
    setFormData(prev => ({ ...prev, teachingSubjects: formattedStr }));
    setIsSubjectClassModalOpen(false);
  };

  // Attendance date picker
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedAttDate, setSelectedAttDate] = useState(todayStr);

  // Active Teacher for Print ID Card
  const [selectedPrintTeacher, setSelectedPrintTeacher] = useState<Teacher | null>(null);

  // Delete configuration
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);

  // QR Code generator references
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

  const generateQRCode = (canvas: HTMLCanvasElement | null, text: string) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = 120;
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#0f172a'; // slate dark

    // Draw position detection anchors (outer and inner squares)
    const drawAnchor = (dx: number, dy: number) => {
      ctx.fillRect(dx, dy, 28, 28);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(dx + 4, dy + 4, 20, 20);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(dx + 8, dy + 8, 12, 12);
    };

    drawAnchor(4, 4);
    drawAnchor(size - 32, 4);
    drawAnchor(4, size - 32);

    // Mini bottom-right alignment square
    ctx.fillRect(size - 20, size - 20, 10, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(size - 18, size - 18, 6, 6);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(size - 16, size - 16, 2, 2);

    // Hash code generation
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    const random = () => {
      const x = Math.sin(hash++) * 10000;
      return x - Math.floor(x);
    };

    // Draw variable pixel patterns
    for (let x = 8; x < size - 8; x += 4) {
      for (let y = 8; y < size - 8; y += 4) {
        if (
          (x < 35 && y < 35) ||
          (x > size - 37 && y < 35) ||
          (x < 35 && y > size - 37)
        ) {
          continue; // Skip finder patterns
        }
        if (random() > 0.42) {
          ctx.fillRect(x, y, 4, 4);
        }
      }
    }
  };

  useEffect(() => {
    // Redraw QR code when active printing card is set
    if (selectedPrintTeacher) {
      const targetId = `qr-${selectedPrintTeacher.id}`;
      // Allow DOM to render then generate
      setTimeout(() => {
        generateQRCode(canvasRefs.current[targetId], `SCHOOL-TEACHER-AUTH-ID:${selectedPrintTeacher.idNumber}`);
      }, 100);
    }
  }, [selectedPrintTeacher, isBadgeModalOpen]);

  const calculateYearsOfService = (dateStr: string): number => {
    if (!dateStr) return 0;
    const joinDateObj = new Date(dateStr);
    const today = schoolInfo.teacherServiceLimitDate ? new Date(schoolInfo.teacherServiceLimitDate) : new Date();
    if (isNaN(joinDateObj.getTime())) return 0;
    
    let diffYears = today.getFullYear() - joinDateObj.getFullYear();
    const monthDiff = today.getMonth() - joinDateObj.getMonth();
    const dayDiff = today.getDate() - joinDateObj.getDate();
    
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      diffYears--;
    }
    return Math.max(0, diffYears);
  };

  const calculateTeacherAge = (dobStr: string): string => {
    if (!dobStr) return '';
    const birthDate = new Date(dobStr);
    if (isNaN(birthDate.getTime())) return '';
    const today = schoolInfo.teacherAgeLimitDate ? new Date(schoolInfo.teacherAgeLimitDate) : new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? String(age) : '';
  };

  const handleJoinDateChange = (dateVal: string) => {
    const yrs = calculateYearsOfService(dateVal);
    setFormData(prev => ({
      ...prev,
      joinDate: dateVal,
      yearsOfService: yrs,
    }));
  };

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setHasManuallyEditedLatin(false);
    setFormData({
      idNumber: '',
      name: '',
      nameLatin: '',
      gender: 'ប្រុស',
      dob: '',
      phone: '',
      subject: '',
      role: '',
      responsibilities: [],
      salaryRank: '',
      framework: '',
      teachingSubjects: '',
      classCharge: '',
      ethnicity: 'ទេ',
      educationLevel: '',
      joinDate: '',
      yearsOfService: 0,
      photoUrl: '',
    });
    setNewResp('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setHasManuallyEditedLatin(!!t.nameLatin);
    setFormData({
      idNumber: t.idNumber || '',
      name: t.name || '',
      nameLatin: t.nameLatin || '',
      gender: t.gender || 'ប្រុស',
      dob: t.dob || '',
      phone: t.phone || '',
      subject: t.subject || '',
      role: t.role || '',
      responsibilities: t.responsibilities || [],
      salaryRank: t.salaryRank || '',
      framework: t.framework || '',
      teachingSubjects: t.teachingSubjects || '',
      classCharge: t.classCharge || '',
      ethnicity: t.ethnicity || 'ទេ',
      educationLevel: t.educationLevel || '',
      joinDate: t.joinDate || '',
      yearsOfService: t.yearsOfService !== undefined ? t.yearsOfService : (t.joinDate ? calculateYearsOfService(t.joinDate) : 0),
      photoUrl: t.photoUrl || '',
    });
    setNewResp('');
    setIsFormOpen(true);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalIdNumber = (formData.idNumber || '').trim();
    if (!finalIdNumber) {
      finalIdNumber = String(Date.now()).slice(-10).padStart(10, '0');
    } else if (/^\d+$/.test(finalIdNumber)) {
      finalIdNumber = finalIdNumber.padStart(10, '0');
    }

    // Check unique idNumber constraint (absolutely mandatory)
    const isDuplicate = teachers.some(t => 
      t.idNumber && t.idNumber.trim().toLowerCase() === finalIdNumber.toLowerCase() && 
      (!editingTeacher || t.id !== editingTeacher.id)
    );
    if (isDuplicate) {
      setDuplicateIdError(`អត្តលេខមន្ត្រី "${finalIdNumber}" នេះមានរួចហើយ! សូមបញ្ចូលអត្តលេខផ្សេងដែលមិនជាន់គ្នា។`);
      return;
    }

    const finalData = {
      ...formData,
      idNumber: finalIdNumber
    };

    if (editingTeacher) {
      // Update
      const updated = teachers.map(t => t.id === editingTeacher.id ? { ...t, ...finalData } : t);
      onUpdateTeachers(updated);
      showToast(`បានកែសម្រួលព័ត៌មានគ្រូបង្រៀនឈ្មោះ "${formData.name}" ដោយជោគជ័យ។`);
    } else {
      // Create new
      const newTch: Teacher = {
        id: `TCH-${Date.now()}`,
        ...finalData,
      };
      onUpdateTeachers([...teachers, newTch]);
      showToast(`បានចុះឈ្មោះគ្រូបង្រៀនថ្មីឈ្មោះ "${formData.name}" ទទួលបានជោគជ័យ!`);
    }
    setIsFormOpen(false);
  };

  const handleDeleteTeacher = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const confirmDeleteTeacher = () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    onUpdateTeachers(teachers.filter(t => t.id !== id));
    if (selectedPrintTeacher?.id === id) setSelectedPrintTeacher(null);
    setDeleteTarget(null);
  };

  const confirmDeleteAllTeachers = () => {
    onUpdateTeachers([]);
    setSelectedPrintTeacher(null);
    setIsDeleteAllOpen(false);
  };

  const addResponsibility = () => {
    if (newResp.trim()) {
      setFormData({
        ...formData,
        responsibilities: [...formData.responsibilities, newResp.trim()],
      });
      setNewResp('');
    }
  };

  const removeResponsibility = (idx: number) => {
    setFormData({
      ...formData,
      responsibilities: formData.responsibilities.filter((_, i) => i !== idx),
    });
  };

  // List filter
  const baseFilteredTeachers = teachers.filter(t => 
    t.name.includes(searchTerm) || 
    t.idNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject.includes(searchTerm) ||
    t.role.includes(searchTerm)
  );

  const filteredTeachers = (() => {
    if (sortOrder === 'asc') {
      return [...baseFilteredTeachers].sort((a, b) => a.name.localeCompare(b.name, 'km'));
    } else if (sortOrder === 'desc') {
      return [...baseFilteredTeachers].sort((a, b) => b.name.localeCompare(a.name, 'km'));
    }
    return baseFilteredTeachers;
  })();

  // Drag and drop event handlers for teachers list
  const handleTeacherDragStart = (e: React.DragEvent, id: string) => {
    const target = e.target as HTMLElement;
    if (target.closest('input') || target.closest('button') || target.closest('select')) {
      e.preventDefault();
      return;
    }
    setDraggingTeacherId(id);
  };

  const handleTeacherDragOver = (e: React.DragEvent, id: string) => {
    if (draggingTeacherId && draggingTeacherId !== id) {
      e.preventDefault();
      if (dragOverTeacherId !== id) {
        setDragOverTeacherId(id);
      }
    }
  };

  const handleTeacherDropRow = (targetId: string) => {
    if (!draggingTeacherId || draggingTeacherId === targetId) return;

    const sourceIndex = teachers.findIndex(t => t.id === draggingTeacherId);
    const targetIndex = teachers.findIndex(t => t.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const updated = [...teachers];
    const [movedItem] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    onUpdateTeachers(updated);

    setDraggingTeacherId(null);
    setDragOverTeacherId(null);
  };

  const handleTeacherDragEnd = () => {
    setDraggingTeacherId(null);
    setDragOverTeacherId(null);
  };

  // Attendance management helpers
  const handleMarkAttendance = (teacherId: string, status: 'វត្តមាន' | 'ច្បាប់' | 'អវត្តមាន', reason?: string) => {
    const existingIdx = teacherAttendance.findIndex(a => a.teacherId === teacherId && a.date === selectedAttDate);
    const updated = [...teacherAttendance];

    if (existingIdx > -1) {
      updated[existingIdx] = {
        ...updated[existingIdx],
        status,
        reason: reason || '',
      };
    } else {
      updated.push({
        id: `ATT-${Date.now()}-${teacherId}`,
        teacherId,
        date: selectedAttDate,
        status,
        reason: reason || '',
      });
    }
    onUpdateAttendance(updated);
  };

  const handlePrintTrigger = () => {
    window.print();
  };

  // Dynamic header details based on sub-tab
  const getHeaderDetails = () => {
    switch (activeSubTab) {
      case 'roles':
        return {
          title: 'តួនាទី និងភារកិច្ចគ្រូបង្រៀន',
          desc: 'គ្រប់គ្រងការចាត់ចែងតួនាទី និងភារកិច្ចទទួលខុសត្រូវបន្ថែមរបស់បុគ្គលិកគ្រូ',
        };
      case 'attendance':
        return {
          title: 'វត្តមានបុគ្គលិក-គ្រូបង្រៀន',
          desc: 'កត់ត្រា និងតាមដានវត្តមានបុគ្គលិក-គ្រូបង្រៀនប្រចាំថ្ងៃ',
        };
      case 'list':
      default:
        return {
          title: 'ព័ត៌មានគ្រូបង្រៀន',
          desc: 'គ្រប់គ្រងព័ត៌មានគ្រូ ប័ណ្ណសម្គាល់ខ្លួន និងការចុះឈ្មោះគ្រូថ្មី',
        };
    }
  };

  const header = getHeaderDetails();

  return (
    <div id="school-teachers-section" className={`space-y-6 ${activeSubTab === 'list' ? 'flex-1 flex flex-col overflow-hidden h-full min-h-0' : ''}`}>
      {/* Tab Header Selector */}
      {activeSubTab !== 'list' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-800 font-sans">{header.title}</h1>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold">{header.desc}</p>
          </div>
        </div>
      )}

      {/* ៣.១-៣.២ SUBTAB: TEACHERS LIST & IDENTITY BADGES */}
      {activeSubTab === 'list' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-5 flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Integrated Header Container */}
          <div className="border-b border-slate-100 pb-4 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between w-full">
            <h1 className="text-lg font-bold text-slate-800 tracking-tight text-left self-start shrink-0">ព័ត៌មានគ្រូបង្រៀន</h1>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
              {/* Search input placed directly on the left of action buttons */}
              <div className="relative w-full sm:w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="ស្វែងរកគ្រូ"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="block w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportExcel}
                  accept=".xlsx, .xls"
                  className="hidden"
                />

                <div className="relative animate-none" ref={importExportDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowImportExportDropdown(!showImportExportDropdown)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-white border border-emerald-600 hover:bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                    នាំទិន្នន័យ
                  </button>

                  {showImportExportDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-150 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      <button
                        type="button"
                        onClick={() => {
                          handleDownloadTemplate();
                          setShowImportExportDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <FileDown className="w-4 h-4 text-slate-500 shrink-0" />
                        គំរូឯកសារ
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          fileInputRef.current?.click();
                          setShowImportExportDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <FileUp className="w-4 h-4 text-slate-500 shrink-0" />
                        នាំទិន្នន័យចូល
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleExportTeachers();
                          setShowImportExportDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-slate-500 shrink-0" />
                        នាំទិន្នន័យចេញ
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="flex-1 sm:flex-none px-4 py-2 bg-white border border-purple-600 hover:bg-purple-50 text-purple-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-purple-600 shrink-0" />
                  ចុះឈ្មោះគ្រូថ្មី
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (teachers.length === 0) {
                      showToast('មិនមានទិន្នន័យគ្រូបង្រៀននៅក្នុងប្រព័ន្ធសម្រាប់លុបទេ!', 'error');
                    } else {
                      setIsDeleteAllOpen(true);
                    }
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 bg-white border border-red-600 hover:bg-red-50 text-red-600 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-red-600 shrink-0" />
                  លុបទិន្នន័យ
                </button>
              </div>
            </div>
          </div>

          {/* List Table - Integrated under the same white container */}
          <div className="border border-slate-100 rounded-xl shadow-xs flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0">
              <table className="w-full text-left border-collapse table-auto whitespace-nowrap relative">
                <thead className="sticky top-0 z-10 bg-emerald-700 text-white shadow-xs">
                  <tr className="bg-emerald-700 text-white font-bold text-xs uppercase whitespace-nowrap" id="teachers-list-th-row">
                    <th className="px-3 py-3 text-center w-12 whitespace-nowrap">ល.រ</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">អត្តលេខមន្ត្រី</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap select-none">
                      <div className="flex items-center justify-center gap-2">
                        <span>គោត្តនាម-នាម</span>
                        <div className="relative inline-block" ref={sortDropdownRef}>
                          <button
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                            className="p-1 rounded-md hover:bg-emerald-800 hover:text-white transition-colors cursor-pointer focus:outline-none flex items-center justify-center bg-emerald-700/50"
                            title="ជម្រើសតម្រៀបទិន្នន័យ"
                          >
                            <ArrowUpDown className={`w-3.5 h-3.5 ${sortOrder ? 'text-white' : 'text-emerald-300'}`} />
                          </button>
                          
                          {showSortDropdown && (
                            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50 text-slate-700 text-left normal-case font-normal">
                              <button
                                onClick={() => {
                                  setSortOrder('asc');
                                  setShowSortDropdown(false);
                                }}
                                className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-[11px] font-semibold cursor-pointer ${sortOrder === 'asc' ? 'text-emerald-600 bg-emerald-50/50 font-bold' : ''}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${sortOrder === 'asc' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                តម្រៀបតាម ក-ខ
                              </button>
                              <button
                                onClick={() => {
                                  setSortOrder('desc');
                                  setShowSortDropdown(false);
                                }}
                                className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-[11px] font-semibold cursor-pointer ${sortOrder === 'desc' ? 'text-emerald-600 bg-emerald-50/50 font-bold' : ''}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${sortOrder === 'desc' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                តម្រៀបតាម ខ-ក
                              </button>
                              {sortOrder && (
                                <button
                                  onClick={() => {
                                    setSortOrder(null);
                                    setShowSortDropdown(false);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-rose-50 flex items-center gap-2 text-[11px] font-semibold cursor-pointer text-rose-600 border-t border-slate-100"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                  លុបការតម្រៀប
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">ឈ្មោះឡាតាំង</th>
                    <th className="px-3 py-3 text-center whitespace-nowrap">ភេទ</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">ថ្ងៃខែឆ្នាំកំណើត</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">អាយុ</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">តួនាទី</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">ក្របខ័ណ្ឌ</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">កាំប្រាក់</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">ឯកទេស</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">មុខវិជ្ជាបង្រៀន</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">បន្ទុកថ្នាក់</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">ជន.ភាគតិច</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">កម្រិតវប្បធម៌</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">ថ្ងៃចូលធ្វើការ</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">លេខទូរស័ព្ទ</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={18} className="px-4 py-12 text-center text-slate-400 text-xs font-medium whitespace-nowrap">
                        គ្មានសំណុំទិន្នន័យគ្រូបង្រៀនត្រូវបានរកឃើញទេ។
                      </td>
                    </tr>
                  ) : (
                    filteredTeachers.map((t, idx) => (
                      <tr 
                        key={t.id} 
                        draggable={true}
                        onDragStart={(e) => handleTeacherDragStart(e, t.id)}
                        onDragOver={(e) => handleTeacherDragOver(e, t.id)}
                        onDrop={() => handleTeacherDropRow(t.id)}
                        onDragEnd={handleTeacherDragEnd}
                        className={`border-b border-emerald-600 transition-colors text-xs text-slate-700 font-medium group/row whitespace-nowrap
                          ${draggingTeacherId === t.id ? 'opacity-40 bg-emerald-50/20' : ''}
                          ${dragOverTeacherId === t.id ? 'bg-emerald-50/40 border-y-2 border-emerald-200' : 'hover:bg-slate-50/50'}
                        `}
                      >
                        <td className="px-3 py-3 text-center font-bold text-slate-400 whitespace-nowrap select-none">
                          <div className="flex items-center justify-center gap-1.5">
                            <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover/row:text-emerald-600 hover:text-emerald-700 transition-colors cursor-grab active:cursor-grabbing shrink-0" />
                            <span>{idx + 1}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold text-teal-600 text-center bg-slate-50/30 whitespace-nowrap">
                          {t.idNumber}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {t.photoUrl ? (
                              <img 
                                src={t.photoUrl} 
                                alt="រូបថតគ្រូ" 
                                className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] text-white font-bold shrink-0 shadow-xs ${
                                t.gender === 'ប្រុស' ? 'bg-sky-500' : 'bg-pink-500'
                              }`}>
                                {t.gender === 'ប្រុស' ? 'ប្រ' : 'ស្រ'}
                              </div>
                            )}
                            <span>{t.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-600 font-mono text-center uppercase whitespace-nowrap">
                          {t.nameLatin || '-'}
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <span className={t.gender === 'ប្រុស' ? 'text-sky-600 font-bold' : 'text-pink-600 font-bold'}>
                            {t.gender}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-mono whitespace-nowrap">
                          {formatToDDMMYYYY(t.dob)}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-750 font-bold whitespace-nowrap">
                          {calculateTeacherAge(t.dob) ? `${calculateTeacherAge(t.dob)} ឆ្នាំ` : '-'}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600 font-semibold whitespace-nowrap">
                          {t.role || 'គ្រូបង្រៀន'}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600 font-semibold whitespace-nowrap">
                          {t.framework || '-'}
                        </td>
                        <td className="px-4 py-3 text-center font-sans font-medium whitespace-nowrap">
                          {t.salaryRank || '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-semibold whitespace-nowrap">
                          {t.subject}
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">
                          {t.teachingSubjects || '-'}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {t.classCharge ? (
                            <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-amber-50 text-amber-800">
                              {t.classCharge}
                            </span>
                          ) : '-'}
                        </td>
                        <td className={`px-4 py-3 text-center whitespace-nowrap ${
                          t.ethnicity === 'បាទ/ចាស' ? 'text-amber-700 font-bold' : 'text-slate-500 font-medium'
                        }`}>
                          {t.ethnicity || 'ទេ'}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-slate-600 whitespace-nowrap">
                          {t.educationLevel || '-'}
                        </td>
                        <td className="px-4 py-3 text-center font-mono whitespace-nowrap">
                          {formatToDDMMYYYY(t.joinDate)}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-center font-mono whitespace-nowrap">
                          {t.phone || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewingTeacher(t)}
                              title="មើលព័ត៌មានលម្អិត"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(t)}
                              title="កែសម្រួលទិន្នន័យ"
                              className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTeacher(t.id, t.name)}
                              title="លុបទិន្នន័យគ្រូ"
                              className="p-1.5 text-red-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ៣.៣. SUBTAB: TEACHER ROLES & RESPONSIBILITIES */}
      {activeSubTab === 'roles' && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teachers.map(t => (
              <div 
                key={t.id} 
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between gap-4 hover:border-teal-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-slate-800 text-sm">{t.name}</h3>
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded uppercase">
                        {t.idNumber}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-100 px-2 py-0.5 rounded-md">
                      {t.role}
                    </span>
                  </div>

                  <div className="pt-3 space-y-1.5">
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">ភារកិច្ចទទួលខុសត្រូវ</span>
                    {t.responsibilities.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">មិនទាន់បានកំណត់ភារកិច្ចបន្ថែមនៅឡើយទេ...</p>
                    ) : (
                      <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1 font-semibold">
                        {t.responsibilities.map((resp, idx) => (
                          <li key={idx} className="leading-snug">{resp}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100/50">
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    កែប្រែភារកិច្ច
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ៣.៤. SUBTAB: TEACHER ATTENDANCE */}
      {activeSubTab === 'attendance' && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-6">
          {/* Header & Date selector */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">កាលបរិច្ឆេទកត់ត្រាវត្តមាន</span>

            <div className="flex items-center gap-2">
              <label htmlFor="teacher-att-date-input" className="text-xs font-bold text-slate-400">កាលបរិច្ឆេទ៖</label>
              <input
                id="teacher-att-date-input"
                type="date"
                value={selectedAttDate}
                onChange={e => setSelectedAttDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-teal-500"
              />
            </div>
          </div>

          {/* Table logging */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-emerald-700 text-white font-bold text-xs uppercase" id="teacher-attendance-th-row">
                    <th className="px-4 py-3 text-center">អត្តលេខ</th>
                    <th className="px-4 py-3 text-center">ឈ្មោះបុគ្គលិក</th>
                    <th className="px-4 py-3 text-center">មុខវិជ្ជា/តួនាទី</th>
                    <th className="px-4 py-3 text-center">ស្ថានភាពវត្តមាន</th>
                    <th className="px-4 py-3 text-center">ចំណាំ/មូលហេតុ</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-xs font-semibold">
                        មិនទាន់មានទិន្នន័យគ្រូបង្រៀននៅក្នុងប្រព័ន្ធឡើយ។
                      </td>
                    </tr>
                  ) : (
                    teachers.map(t => {
                      const att = teacherAttendance.find(a => a.teacherId === t.id && a.date === selectedAttDate);
                      return (
                        <tr 
                          key={t.id} 
                          className="border-b border-emerald-600 hover:bg-slate-50/50 transition-colors text-xs text-slate-700 font-medium"
                        >
                          <td className="px-4 py-3 font-mono text-center font-semibold text-teal-600 bg-slate-50/30">{t.idNumber}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            {t.photoUrl ? (
                              <img 
                                src={t.photoUrl} 
                                alt="រូបថតគ្រូ" 
                                className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] text-white font-bold shrink-0 shadow-xs ${
                                t.gender === 'ប្រុស' ? 'bg-sky-500' : 'bg-pink-500'
                              }`}>
                                {t.gender === 'ប្រុស' ? 'ប្រ' : 'ស្រ'}
                              </div>
                            )}
                            <span>{t.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-semibold">{t.role} ({t.subject})</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center items-center gap-1.5">
                            <button
                              onClick={() => handleMarkAttendance(t.id, 'វត្តមាន')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                att?.status === 'វត្តមាន'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              វត្តមាន (វ)
                            </button>
                            <button
                              onClick={() => handleMarkAttendance(t.id, 'ច្បាប់')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                att?.status === 'ច្បាប់'
                                  ? 'bg-sky-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              ច្បាប់ (ច)
                            </button>
                            <button
                              onClick={() => handleMarkAttendance(t.id, 'អវត្តមាន')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                att?.status === 'អវត្តមាន'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              អវត្តមាន (អ)
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={att?.reason || ''}
                            onChange={e => handleMarkAttendance(t.id, att?.status || 'វត្តមាន', e.target.value)}
                            placeholder="មូលហេតុអវត្តមាន ឬ ស្លាកចំណាំ..."
                            className="w-full px-2 py-1 bg-slate-50/70 border border-slate-100 text-xs rounded-md focus:bg-white focus:border-teal-400 outline-none"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

      {/* FORM MODAL FOR CREATE/EDIT TEACHER */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden border border-slate-100 shadow-xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">
                {editingTeacher ? 'កែសម្រួលព័ត៌មានគ្រូ' : 'ចុះឈ្មោះបុគ្គលិក-គ្រូថ្មី'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <form onSubmit={handleSaveTeacher} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Layout for Teacher Photo and Basic Identifiers */}
                <div className="grid grid-cols-[1fr_130px] gap-4 items-start bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  {/* Left side: Stacked Inputs */}
                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label htmlFor="teacher-code-input" className="text-xs font-bold text-slate-700 block">អត្តលេខមន្ត្រី</label>
                      <input
                        id="teacher-code-input"
                        type="text"
                        value={formData.idNumber}
                        onChange={e => setFormData({ ...formData, idNumber: e.target.value })}
                        placeholder="1900100036"
                        className="w-full px-3 h-[38px] bg-white border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="teacher-name-input" className="text-xs font-bold text-slate-700 block">គោត្តនាម និងនាមខ្លួន <span className="text-rose-500 ml-1">*</span></label>
                      <input
                        id="teacher-name-input"
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => {
                          const val = e.target.value;
                          const updated = { ...formData, name: val };
                          if (!hasManuallyEditedLatin) {
                            updated.nameLatin = transliterateKhmerToLatin(val);
                          }
                          setFormData(updated);
                        }}
                        placeholder="ផៃ ប៊ុនណា"
                        className="w-full px-3 h-[38px] bg-white border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="teacher-latin-name-input" className="text-xs font-bold text-slate-700 block">ឈ្មោះឡាតាំង</label>
                      <div className="relative flex items-center">
                        <input
                          id="teacher-latin-name-input"
                          type="text"
                          value={formData.nameLatin || ''}
                          onChange={e => {
                            setHasManuallyEditedLatin(true);
                            setFormData({ ...formData, nameLatin: e.target.value });
                          }}
                          placeholder="PHAI BUNNA"
                          className="w-full pl-3 pr-14 h-[38px] bg-white border border-slate-200 rounded-xl text-xs outline-none focus:bg-white font-mono uppercase"
                        />
                        {(formData.nameLatin || '') && (
                          <button
                            type="button"
                            onClick={() => {
                              setHasManuallyEditedLatin(true);
                              setFormData({ ...formData, nameLatin: '' });
                            }}
                            className="absolute right-2 px-2 py-1 text-[10px] font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          >
                            ជម្រះ
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side: Portrait Card Photo */}
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] font-bold text-slate-500 mb-1.5 block">រូបថតកាត</span>
                    <div className="relative w-28 h-32 rounded-xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 shadow-xs flex items-center justify-center group shrink-0">
                      {formData.photoUrl ? (
                        <>
                          <img 
                            src={formData.photoUrl} 
                            alt="រូបថតគ្រូ" 
                            className="w-full h-full object-cover object-top"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer transition-all gap-1">
                            <label 
                              htmlFor="teacher-photo-upload" 
                              className="w-full h-full flex flex-col items-center justify-center cursor-pointer gap-1"
                            >
                              <Camera className="w-4 h-4" />
                              <span>ប្តូររូបភាព</span>
                            </label>
                          </div>
                        </>
                      ) : (
                        <label 
                          htmlFor="teacher-photo-upload" 
                          className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 hover:text-teal-600 hover:bg-slate-50/50 cursor-pointer transition-all gap-1.5"
                        >
                          <Camera className="w-5 h-5 text-slate-400" />
                          <span className="text-[9px] font-bold text-slate-500 text-center px-1">បញ្ចូលរូបថត</span>
                        </label>
                      )}
                    </div>
                    <input 
                      id="teacher-photo-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData(prev => ({
                              ...prev,
                              photoUrl: reader.result as string
                            }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {formData.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, photoUrl: '' }))}
                        className="mt-1 text-[9px] text-rose-600 hover:text-rose-750 font-bold hover:underline"
                      >
                        លុបរូបថតចេញ
                      </button>
                    )}
                  </div>
                </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="teacher-gender-select" className="text-xs font-bold text-slate-600">ភេទ <span className="text-rose-500 ml-1">*</span></label>
                  <select
                    id="teacher-gender-select"
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as 'ប្រុស' | 'ស្រី' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white appearance-none cursor-pointer"
                  >
                     <option value="ប្រុស">ប្រុស</option>
                     <option value="ស្រី">ស្រី</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="teacher-dob-input" className="text-xs font-bold text-slate-600">ថ្ងៃខែឆ្នាំកំណើត <span className="text-rose-500 ml-1">*</span></label>
                  <input
                    id="teacher-dob-input"
                    type="date"
                    required
                    value={formData.dob}
                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">អាយុ (គណនាស្វ័យប្រវត្តិ)</label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={calculateTeacherAge(formData.dob) ? `${calculateTeacherAge(formData.dob)} ឆ្នាំ` : '---'}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs outline-none text-slate-500 font-bold"
                  />
                </div>
              </div>

              {/* Added: តួនាទី, ក្របខ័ណ្ឌ, កាំប្រាក់ */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="teacher-role-select" className="text-xs font-bold text-slate-600">តួនាទី</label>
                  <select
                    id="teacher-role-select"
                    value={formData.role || ''}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white appearance-none cursor-pointer ${formData.role ? 'text-slate-800 font-semibold' : 'text-slate-400/90 font-normal'}`}
                  >
                    <option value="" className="text-slate-400">ជ្រើសរើស</option>
                    <option value="នាយក" className="text-slate-800 font-semibold">នាយក</option>
                    <option value="នាយិកា" className="text-slate-800 font-semibold">នាយិកា</option>
                    <option value="នាយករង" className="text-slate-800 font-semibold">នាយករង</option>
                    <option value="នាយិការង" className="text-slate-800 font-semibold">នាយិការង</option>
                    <option value="លេខា" className="text-slate-800 font-semibold">លេខា</option>
                    <option value="គណនេយ្យ" className="text-slate-800 font-semibold">គណនេយ្យ</option>
                    <option value="បណ្ណារក្ស" className="text-slate-800 font-semibold">បណ្ណារក្ស</option>
                    <option value="គ្រូបង្រៀន" className="text-slate-800 font-semibold">គ្រូបង្រៀន</option>
                    <option value="ផ្សេងៗ" className="text-slate-800 font-semibold">ផ្សេងៗ</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="teacher-framework-select" className="text-xs font-bold text-slate-600">ក្របខ័ណ្ឌ</label>
                  <select
                    id="teacher-framework-select"
                    value={formData.framework || ''}
                    onChange={e => setFormData({ ...formData, framework: e.target.value })}
                    className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white appearance-none cursor-pointer ${formData.framework ? 'text-slate-800 font-semibold' : 'text-slate-400/90 font-normal'}`}
                  >
                    <option value="" className="text-slate-400">ជ្រើសរើស</option>
                    <option value="ម.បឋមភូមិ" className="text-slate-800 font-semibold">ម.បឋមភូមិ</option>
                    <option value="ម.ទុតិយភូមិ" className="text-slate-800 font-semibold">ម.ទុតិយភូមិ</option>
                    <option value="បឋមសិក្សា" className="text-slate-800 font-semibold">បឋមសិក្សា</option>
                    <option value="ផ្សេងៗ" className="text-slate-800 font-semibold">ផ្សេងៗ</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="teacher-salaryRank-input" className="text-xs font-bold text-slate-600">កាំប្រាក់</label>
                  <input
                    id="teacher-salaryRank-input"
                    type="text"
                    value={formData.salaryRank || ''}
                    onChange={e => setFormData({ ...formData, salaryRank: e.target.value })}
                    placeholder="ឧ. គ.២"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white text-slate-800 font-semibold placeholder:font-normal placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="teacher-phone-input" className="text-xs font-bold text-slate-600">លេខទូរស័ព្ទ</label>
                  <input
                    id="teacher-phone-input"
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="012 345 678"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="teacher-subject-input" className="text-xs font-bold text-slate-600">ឯកទេស</label>
                  <input
                    id="teacher-subject-input"
                    type="text"
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="គណិតវិទ្យា"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  />
                </div>
              </div>

              {/* Added: មុខវិជ្ជាបង្រៀន, បន្ទុកថ្នាក់, ជនជាតិភាគតិច, កម្រិតវប្បធម៌ */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="teacher-teachingSubjects-input" className="text-xs font-bold text-slate-600">មុខវិជ្ជាបង្រៀន</label>
                  <div className="relative">
                    <input
                      id="teacher-teachingSubjects-input"
                      type="text"
                      readOnly
                      onClick={handleOpenSubjectClassModal}
                      value={formData.teachingSubjects || ''}
                      placeholder="មុខវិជ្ជានិងថ្នាក់"
                      className="w-full pr-10 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white cursor-pointer hover:border-slate-300 transition-colors font-semibold text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleOpenSubjectClassModal}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-teal-600 transition-colors cursor-pointer"
                      title="កំណត់មុខវិជ្ជា និងថ្នាក់បង្រៀន"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="teacher-classCharge-select" className="text-xs font-bold text-slate-600">បន្ទុកថ្នាក់</label>
                  <select
                    id="teacher-classCharge-select"
                    value={formData.classCharge || ''}
                    onChange={e => setFormData({ ...formData, classCharge: e.target.value })}
                    className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white appearance-none cursor-pointer ${formData.classCharge ? 'text-slate-800 font-semibold' : 'text-slate-400/90 font-normal'}`}
                  >
                    <option value="" className="text-slate-400">ជ្រើសរើស</option>
                    {classrooms.length > 0 ? (
                      classrooms.map(c => (
                        <option key={c.id} value={c.name} className="text-slate-800 font-semibold">
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled className="text-slate-400">មិនទាន់មានថ្នាក់រៀនក្នុងប្រព័ន្ធទេ</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="teacher-ethnicity-select" className="text-xs font-bold text-slate-600">ជនជាតិភាគតិច</label>
                  <select
                    id="teacher-ethnicity-select"
                    value={formData.ethnicity || ''}
                    onChange={e => setFormData({ ...formData, ethnicity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white appearance-none cursor-pointer text-slate-800"
                  >
                    <option value="ទេ">ទេ</option>
                    <option value="បាទ/ចាស">បាទ/ចាស</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="teacher-educationLevel-select" className="text-xs font-bold text-slate-600">កម្រិតវប្បធម៌</label>
                  <select
                    id="teacher-educationLevel-select"
                    value={formData.educationLevel || ''}
                    onChange={e => setFormData({ ...formData, educationLevel: e.target.value })}
                    className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white appearance-none cursor-pointer ${formData.educationLevel ? 'text-slate-800 font-semibold' : 'text-slate-400/90 font-normal'}`}
                  >
                    <option value="" className="text-slate-400">ជ្រើសរើស</option>
                    <option value="បណ្ឌិត" className="text-slate-800 font-semibold">បណ្ឌិត</option>
                    <option value="បរិញ្ញាបត្រជាន់ខ្ពស់" className="text-slate-800 font-semibold">បរិញ្ញាបត្រជាន់ខ្ពស់</option>
                    <option value="បរិញ្ញាបត្រ" className="text-slate-800 font-semibold">បរិញ្ញាបត្រ</option>
                    <option value="ទុតិយភូមិ" className="text-slate-800 font-semibold">ទុតិយភូមិ</option>
                    <option value="ផ្សេងៗ" className="text-slate-800 font-semibold">ផ្សេងៗ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="teacher-joinDate-input" className="text-xs font-bold text-slate-600">ថ្ងៃចូលបម្រើការងារ</label>
                  <input
                    id="teacher-joinDate-input"
                    type="date"
                    value={formData.joinDate || ''}
                    onChange={e => handleJoinDateChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="teacher-yearsOfService-input" className="text-xs font-bold text-slate-600">ចំនួនឆ្នាំបម្រើការងារ</label>
                  <input
                    id="teacher-yearsOfService-input"
                    type="text"
                    readOnly
                    value={formData.yearsOfService !== undefined ? `${formData.yearsOfService} ឆ្នាំ` : '0 ឆ្នាំ'}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs outline-none cursor-not-allowed font-semibold text-slate-600"
                  />
                </div>
              </div>

              </div>

              {/* Action buttons (Fixed at bottom) */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-white border border-red-500 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  រក្សាទុក
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BADGE PREVIEW MODAL POPUP */}
      {isBadgeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden border border-slate-100 shadow-xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                ប័ណ្ណសម្គាល់ខ្លួនបុគ្គលិក-គ្រូ
              </h3>
              <button 
                onClick={() => setIsBadgeModalOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col items-center">
              {/* Dropdown to switch teacher inside the modal */}
              <div className="w-full space-y-1">
                <label className="text-xs font-bold text-slate-500 block">ជ្រើសរើសបុគ្គលិក-គ្រូ៖</label>
                <select
                  value={selectedPrintTeacher?.id || ''}
                  onChange={(e) => {
                    const found = teachers.find(t => t.id === e.target.value);
                    if (found) setSelectedPrintTeacher(found);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white outline-none cursor-pointer"
                >
                  <option value="" disabled>--- ជ្រើសរើសគ្រូបង្រៀន ---</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.role})</option>
                  ))}
                </select>
              </div>

              {selectedPrintTeacher ? (
                <>
                  {/* Visual Card component */}
                  <div 
                    id={`teacher-id-card-view-${selectedPrintTeacher.id}`}
                    className="w-[280px] bg-white rounded-2xl shadow-md border-2 border-purple-600 overflow-hidden flex flex-col items-center p-5 space-y-4 relative text-center"
                  >
                    <p className="text-[9px] font-bold text-purple-700 tracking-wider">
                      {schoolInfo.schoolType} {schoolInfo.schoolName}
                    </p>

                    <div className="w-full border-b-2 border-slate-100"></div>

                    <div className="flex flex-col items-center space-y-1">
                      {/* Simulated profile avatar or real photo */}
                      {selectedPrintTeacher.photoUrl ? (
                        <img 
                          src={selectedPrintTeacher.photoUrl} 
                          alt={selectedPrintTeacher.name} 
                          className="w-20 h-20 rounded-full border-2 border-purple-600 object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full border-2 border-purple-600 bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold uppercase">
                          {selectedPrintTeacher.name[0]}
                        </div>
                      )}
                      <h4 className="text-sm font-extrabold text-slate-800 mt-2">
                        {selectedPrintTeacher.name}
                      </h4>
                      <p className="text-[10px] font-bold text-purple-700 uppercase tracking-widest">
                        {selectedPrintTeacher.role} ({selectedPrintTeacher.subject})
                      </p>
                    </div>

                    <div className="w-full bg-slate-50 p-2.5 rounded-lg text-left text-[11px] text-slate-600 font-semibold space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[10px]">អត្តលេខបុគ្គលិក</span>
                        <span className="font-mono text-purple-700">{selectedPrintTeacher.idNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[10px]">ភេទ</span>
                        <span>{selectedPrintTeacher.gender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[10px]">ថ្ងៃខែឆ្នាំកំណើត</span>
                        <span>{formatToDDMMYYYY(selectedPrintTeacher.dob)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[10px]">លេខទូរស័ព្ទ</span>
                        <span>{selectedPrintTeacher.phone}</span>
                      </div>
                    </div>

                    {/* Dynamic canvas QR Code to scan attendance */}
                    <div className="flex flex-col items-center space-y-1">
                      <canvas 
                        ref={el => { canvasRefs.current[`qr-${selectedPrintTeacher.id}`] = el; }}
                        className="w-28 h-28 border border-slate-100 rounded-lg p-1.5"
                        width={120}
                        height={120}
                      />
                      <span className="text-[9px] font-mono font-bold text-slate-400">
                        QR CODE សម្គាល់វត្តមាន
                      </span>
                    </div>

                    <div className="w-full border-t border-dashed border-slate-200 pt-2 text-[10px] text-slate-400 italic">
                      ហត្ថលេខានាយកសាលា និងត្រា
                    </div>
                  </div>

                  {/* Print actions */}
                  <div className="w-full space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={handlePrintTrigger}
                      className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-transform cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      ព្រីនចេញដោយផ្ទាល់ (Print Card)
                    </button>
                    <p className="text-[10px] text-center text-slate-400 uppercase leading-relaxed font-semibold">
                      * កាតនេះបោះពុម្ពទំហំស្ដង់ដារតម្រូវទៅតាមម៉ាស៊ីនព្រីន
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  គ្មានគ្រូត្រូវបានជ្រើសរើសទេ
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Secret Print-Only container to printed Teacher ID beautifully with standard native printing */}
      {selectedPrintTeacher && (
        <div className="hidden print:block absolute inset-0 bg-white p-6 font-sans">
          <div className="w-[320px] bg-white rounded-2xl border-4 border-teal-600 overflow-hidden flex flex-col items-center p-6 space-y-5 text-center mx-auto">
            <h5 className="text-[10px] font-extrabold text-teal-700 uppercase tracking-widest">
              {schoolInfo.schoolType} {schoolInfo.schoolName}
            </h5>
            <div className="w-full border-b-2 border-slate-100"></div>

            <div className="flex flex-col items-center space-y-1">
              {selectedPrintTeacher.photoUrl ? (
                <img 
                  src={selectedPrintTeacher.photoUrl} 
                  alt={selectedPrintTeacher.name} 
                  className="w-24 h-24 rounded-full border-2 border-teal-600 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-2 border-teal-600 bg-teal-100 flex items-center justify-center text-teal-800 text-4xl font-extrabold uppercase">
                  {selectedPrintTeacher.name[0]}
                </div>
              )}
              <h4 className="text-base font-extrabold text-slate-800 mt-2">
                {selectedPrintTeacher.name}
              </h4>
              <p className="text-xs font-bold text-teal-700 uppercase tracking-widest mt-0.5">
                {selectedPrintTeacher.role} ({selectedPrintTeacher.subject})
              </p>
            </div>

            <div className="w-full bg-slate-50 p-3 rounded-lg text-left text-xs text-slate-700 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold text-[10px]">អត្តលេខបុគ្គលិក:</span>
                <span className="font-mono font-bold text-slate-800">{selectedPrintTeacher.idNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold text-[10px]">ភេទ:</span>
                <span className="font-bold text-slate-800">{selectedPrintTeacher.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold text-[10px]">ថ្ងៃខែឆ្នាំកំណើត:</span>
                <span className="font-bold text-slate-800">{formatToDDMMYYYY(selectedPrintTeacher.dob)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold text-[10px]">លេខទូរស័ព្ទ:</span>
                <span className="font-bold text-slate-800">{selectedPrintTeacher.phone}</span>
              </div>
            </div>

            {/* Print canvas placeholder element: drawing high-res simulated QR in black vector */}
            <div className="flex flex-col items-center space-y-1">
              {/* Uses Canvas directly to render in print layout */}
              <canvas 
                ref={el => { if (el) generateQRCode(el, `SCHOOL-TEACHER-AUTH-ID:${selectedPrintTeacher.idNumber}`); }}
                className="w-32 h-32 border border-slate-100 rounded-lg p-1"
                width={120}
                height={120}
              />
              <span className="text-[9px] font-mono font-bold text-slate-400">
                QR CODE សម្គាល់វត្តមាន
              </span>
            </div>

            <div className="w-full border-t border-dashed border-slate-300 pt-3 text-[10px] text-slate-400 italic">
              ហត្ថលេខានាយកសាលា និងត្រា
            </div>
          </div>
        </div>
      )}

      {/* TEACHING SUBJECTS AND CLASSES CONFIGURATION MODAL */}
      {isSubjectClassModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-800 text-sm font-sans">កំណត់មុខវិជ្ជា និងថ្នាក់បង្រៀន</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSubjectClassModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              
              {/* Form to Select Subject & Classes */}
              <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl space-y-3">
                <h4 className="font-extrabold text-slate-700 text-xs">កំណត់មុខវិជ្ជាថ្មី</h4>
                
                {/* 1. Subject Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">ជ្រើសរើសមុខវិជ្ជា</label>
                  <select
                    value={selectedSubject}
                    onChange={e => {
                      setSelectedSubject(e.target.value);
                      if (e.target.value !== 'other') {
                        setCustomSubjectName('');
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-slate-350 text-slate-800 font-semibold"
                  >
                    <option value="" className="text-slate-400">-- ជ្រើសរើសមុខវិជ្ជា --</option>
                    {availableSubjects.map((sub, idx) => (
                      <option key={idx} value={sub} className="text-slate-800 font-semibold">{sub}</option>
                    ))}
                    <option value="other" className="text-slate-800 font-semibold">ផ្សេងទៀត...</option>
                  </select>
                </div>

                {/* Custom Subject Name Input (if Other is selected) */}
                {selectedSubject === 'other' && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">បញ្ចូលឈ្មោះមុខវិជ្ជាផ្ទាល់ខ្លួន</label>
                    <input
                      type="text"
                      value={customSubjectName}
                      onChange={e => setCustomSubjectName(e.target.value)}
                      placeholder="ឧ. គូរគំនូរ"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-slate-350 text-slate-800 font-semibold"
                    />
                  </div>
                )}

                {/* 2. Classes Dropdown Selector (Without any arrow icon) */}
                <div className="space-y-1.5 relative" ref={classDropdownRef}>
                  <label className="text-[11px] font-bold text-slate-500">ជ្រើសរើសថ្នាក់បង្រៀន (ជ្រើសរើសបានច្រើន)</label>
                  {classrooms.length > 0 ? (
                    <div>
                      {/* Trigger button without arrow */}
                      <button
                        type="button"
                        onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-left font-bold text-slate-700 cursor-pointer hover:border-slate-350 focus:border-slate-350 transition-colors flex items-center justify-between"
                      >
                        <span className="truncate">
                          {selectedClassesForSubject.length > 0
                            ? selectedClassesForSubject.map(toArabicClassname).join(', ')
                            : 'ចុចដើម្បីជ្រើសរើសថ្នាក់បង្រៀន...'}
                        </span>
                      </button>

                      {/* Dropdown panel */}
                      {isClassDropdownOpen && (
                        <div className="absolute left-0 right-0 mt-1.5 p-2 bg-white border border-slate-150 rounded-xl shadow-xl z-[150] max-h-48 overflow-y-auto grid grid-cols-3 gap-1.5">
                          {classrooms.map(cls => {
                            const isSelected = selectedClassesForSubject.includes(cls.name);
                            const arabicName = toArabicClassname(cls.name);
                            return (
                              <button
                                key={cls.id}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedClassesForSubject(selectedClassesForSubject.filter(name => name !== cls.name));
                                  } else {
                                    setSelectedClassesForSubject([...selectedClassesForSubject, cls.name]);
                                  }
                                }}
                                className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all text-center cursor-pointer ${
                                  isSelected
                                    ? 'bg-teal-50 border-teal-250 text-teal-700 font-extrabold shadow-3xs'
                                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-100'
                                }`}
                              >
                                {arabicName}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] font-semibold text-rose-500 italic">មិនទាន់មានថ្នាក់រៀនក្នុងប្រព័ន្ធទេ</p>
                  )}
                </div>

                {/* Add Button - CRISP & SOLID */}
                <button
                  type="button"
                  onClick={handleAddSubjectClassPair}
                  disabled={!selectedSubject || (selectedSubject === 'other' && !customSubjectName.trim())}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  បន្ថែមមុខវិជ្ជានេះ
                </button>
              </div>

              {/* Display list of added subjects */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-700 text-xs">បញ្ជីមុខវិជ្ជា និងថ្នាក់បង្រៀនដែលបានកំណត់</h4>
                {addedSubjectsList.length > 0 ? (
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {addedSubjectsList.map((item, idx) => {
                      const code = SUBJECT_TO_CODE[item.subject] || item.subject;
                      const arabicClasses = item.classes.map(toArabicClassname);
                      return (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-extrabold text-teal-700 font-mono text-xs">
                              {code}{arabicClasses.length > 0 ? `(${arabicClasses.join(', ')})` : ''}
                            </span>
                            <span className="font-semibold text-slate-500 text-[10px]">
                              {item.subject}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubjectClassPair(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="លុបមុខវិជ្ជានេះ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-slate-400 italic font-semibold text-xs bg-slate-50/50">
                    មិនទាន់មានមុខវិជ្ជាត្រូវបានកំណត់នៅឡើយទេ
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50 shrink-0">
              <button
                type="button"
                onClick={() => setIsSubjectClassModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleSaveSubjectClassSelections}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm"
              >
                យល់ព្រមរួចរាល់
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SINGLE TEACHER DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden border border-slate-100 shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base font-sans">បញ្ជាក់ការលុបព័ត៌មាន</h3>
            </div>
            <p className="text-slate-600 text-xs font-semibold leading-relaxed">
              តើអ្នកពិតជាចង់លុបទិន្នន័យគ្រូបង្រៀនឈ្មោះ <span className="font-extrabold text-slate-950">"{deleteTarget.name}"</span> មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានឡើយ។
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-705 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={confirmDeleteTeacher}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                យល់ព្រមលុប
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALL TEACHERS DELETE CONFIRMATION MODAL */}
      {isDeleteAllOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden border border-slate-100 shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base font-sans">បញ្ជាក់ការលុបទិន្នន័យទាំងអស់</h3>
            </div>
            <p className="text-slate-600 text-xs font-semibold leading-relaxed">
              តើអ្នកពិតជាចង់លុបទិន្នន័យគ្រូបង្រៀនទាំងអស់មែនទេ? សកម្មភាពនេះនឹងលុបគ្រូទាំងអស់ចេញពីប្រព័ន្ធ ហើយមិនអាចត្រឡប់ក្រោយវិញបានឡើយ។
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteAllOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-705 rounded-xl text-xs font-bold cursor-pointer transition-colors"
               >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={confirmDeleteAllTeachers}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                យល់ព្រមលុបទាំងអស់
              </button>
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

      {/* VIEW TEACHER DETAILS MODAL */}
      {viewingTeacher && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden border border-slate-100 shadow-xl flex flex-col">
            {/* Header */}
            <div className="px-5 py-3.5 bg-emerald-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-xs flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>ព័ត៌មានលម្អិតរបស់គ្រូបង្រៀន</span>
              </h3>
              <button 
                onClick={() => setViewingTeacher(null)}
                className="p-1 hover:bg-emerald-800 rounded-full text-white/80 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Content - meticulously designed to fit completely on desktop and scrollable on mobile */}
            <div className="p-4 space-y-3 overflow-y-auto max-h-[75vh] md:max-h-none md:overflow-visible">
              {/* Top Summary Banner */}
              <div className="flex items-center gap-4 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/60">
                {viewingTeacher.photoUrl ? (
                  <img 
                    src={viewingTeacher.photoUrl} 
                    alt={viewingTeacher.name} 
                    className="w-24 h-30 rounded-lg object-cover object-top border-2 border-emerald-200 shrink-0 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={`w-24 h-30 rounded-lg flex flex-col items-center justify-center text-sm text-white font-bold shrink-0 shadow-sm ${
                    viewingTeacher.gender === 'ប្រុស' ? 'bg-sky-500' : 'bg-pink-500'
                  }`}>
                    <span className="text-xl mb-1">
                      {viewingTeacher.gender === 'ប្រុស' ? 'ប' : 'ស'}
                    </span>
                    <span className="text-[10px] opacity-80">
                      {viewingTeacher.gender || 'គ្រូ'}
                    </span>
                  </div>
                )}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-800">
                    {viewingTeacher.name}
                  </h4>
                  <div className="flex flex-col gap-1.5 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-bold min-w-[75px]">ភេទ៖</span>
                      <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold ${
                        viewingTeacher.gender === 'ប្រុស' ? 'bg-sky-100 text-sky-800' : 'bg-pink-100 text-pink-800'
                      }`}>
                        {viewingTeacher.gender}
                      </span>
                    </div>
                    {viewingTeacher.idNumber && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-bold min-w-[75px]">អត្តលេខមន្ត្រី៖</span>
                        <span className="text-[10px] font-mono font-bold text-teal-600 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                          {viewingTeacher.idNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Info Grid - 1 column on mobile, 2 columns on medium screens and up */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                {/* Left Column: Personal info */}
                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                  <h5 className="font-bold text-emerald-800 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    ព័ត៌មានផ្ទាល់ខ្លួន
                  </h5>
                  <div className="grid grid-cols-3 gap-y-1.5 text-slate-650">
                    <span className="col-span-1 font-bold">ថ្ងៃខែឆ្នាំកំណើត:</span>
                    <span className="col-span-2 text-slate-800 font-semibold">{formatToDDMMYYYY(viewingTeacher.dob)}</span>
                    
                    <span className="col-span-1 font-bold">អាយុ:</span>
                    <span className="col-span-2 text-slate-800 font-semibold">{calculateTeacherAge(viewingTeacher.dob) ? `${calculateTeacherAge(viewingTeacher.dob)} ឆ្នាំ` : '-'}</span>
                    
                    <span className="col-span-1 font-bold">លេខទូរស័ព្ទ:</span>
                    <span className="col-span-2 text-slate-800 font-mono font-semibold">{viewingTeacher.phone || '-'}</span>

                    <span className="col-span-1 font-bold">ជនជាតិភាគតិច:</span>
                    <span className="col-span-2 text-slate-800 font-semibold">{viewingTeacher.ethnicity || 'ទេ'}</span>

                    <span className="col-span-1 font-bold">កម្រិតវប្បធម៌:</span>
                    <span className="col-span-2 text-slate-800 font-semibold">{viewingTeacher.educationLevel || '-'}</span>
                  </div>
                </div>

                {/* Right Column: Work info */}
                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                  <h5 className="font-bold text-emerald-800 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    ព័ត៌មានបម្រើការងារ
                  </h5>
                  <div className="grid grid-cols-3 gap-y-1.5 text-slate-650">
                    <span className="col-span-1 font-bold">ឯកទេស:</span>
                    <span className="col-span-2 text-slate-800 font-semibold">{viewingTeacher.subject}</span>
                    
                    <span className="col-span-1 font-bold">មុខវិជ្ជាបង្រៀន:</span>
                    <span className="col-span-2 text-slate-800 font-semibold">{viewingTeacher.teachingSubjects || '-'}</span>
                    
                    <span className="col-span-1 font-bold">បន្ទុកថ្នាក់:</span>
                    <span className="col-span-2 text-slate-800 font-semibold">
                      {viewingTeacher.classCharge ? toArabicClassnameWithPrefix(viewingTeacher.classCharge) : '-'}
                    </span>

                    <span className="col-span-1 font-bold">ក្របខ័ណ្ឌ:</span>
                    <span className="col-span-2 text-slate-800 font-semibold">{viewingTeacher.framework || '-'}</span>

                    <span className="col-span-1 font-bold">កាំប្រាក់:</span>
                    <span className="col-span-2 text-slate-800 font-sans font-semibold">{viewingTeacher.salaryRank || '-'}</span>

                    <span className="col-span-1 font-bold">ថ្ងៃចូលធ្វើការ:</span>
                    <span className="col-span-2 text-slate-800 font-semibold">{formatToDDMMYYYY(viewingTeacher.joinDate)}</span>

                    <span className="col-span-1 font-bold">ឆ្នាំបម្រើការ:</span>
                    <span className="col-span-2 text-slate-800 font-semibold">{calculateYearsOfService(viewingTeacher.joinDate) ? `${calculateYearsOfService(viewingTeacher.joinDate)} ឆ្នាំ` : '-'}</span>
                  </div>
                </div>
              </div>



              {/* Action Buttons inside footer */}
              <div className="flex justify-end pt-1.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setViewingTeacher(null)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  បិទផ្ទាំង
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ៤.៥. DUPLICATE ID ERROR MODAL */}
      {duplicateIdError && (
        <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-100 shadow-2xl flex flex-col items-center text-center space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center border border-rose-150 shrink-0">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-800 text-sm font-sans">
                កំហុស៖ អត្តលេខស្ទួន
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {duplicateIdError}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDuplicateIdError(null)}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-rose-200 cursor-pointer"
            >
              យល់ព្រម
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
