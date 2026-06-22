import { SchoolInfo, Teacher, Classroom, Student, StudentScore, StudentAttendance, TeacherAttendance, HomeTeacherTask, PreStartConfig } from '../types';

export const DEFAULT_SCHOOL_INFO: SchoolInfo = {
  schoolType: '',
  schoolName: '',
  schoolCode: '',
  province: '',
  district: '',
  commune: '',
  village: '',
  directorName: '',
  directorGender: '',
};

export const DEFAULT_TEACHERS: Teacher[] = [
  {
    id: 'TCH-001',
    idNumber: 'TCH-001',
    name: 'ឈឹម វណ្ណដា',
    gender: 'ស្រី',
    dob: '1985-05-12',
    phone: '012 233 445',
    subject: 'គណិតវិទ្យា',
    role: 'គ្រូបង្រៀន / គ្រូបន្ទុកថ្នាក់',
    responsibilities: ['ន្ទុកថ្នាក់ទី ៩អា (9A)', 'ប្រធានក្រុមបច្ចេកទេសគណិតវិទ្យា'],
  },
  {
    id: 'TCH-002',
    idNumber: 'TCH-002',
    name: 'ស៊ន សុខគង់',
    gender: 'ប្រុស',
    dob: '1981-10-22',
    phone: '098 765 432',
    subject: 'ភាសាខ្មែរ',
    role: 'គ្រូឧទ្ទេសភាសាខ្មែរ',
    responsibilities: ['គ្រប់គ្រងបណ្ណាល័យសាលា', 'ដឹកនាំក្លឹបសិក្សាអក្សរសិល្ប៍'],
  },
  {
    id: 'TCH-003',
    idNumber: 'TCH-003',
    name: 'កែវ ចន្ថា',
    gender: 'ស្រី',
    dob: '1990-02-15',
    phone: '016 778 899',
    subject: 'រូបវិទ្យា',
    role: 'គ្រូបង្រៀន',
    responsibilities: ['ជំនួយការការិយាល័យសិក្សា', 'ទទួលបន្ទុកសម្ភារពិសោធន៍'],
  },
  {
    id: 'TCH-004',
    idNumber: 'TCH-004',
    name: 'ឡាយ សុភ័ក្រ',
    gender: 'ប្រុស',
    dob: '1993-08-04',
    phone: '085 556 677',
    subject: 'ព័ត៌មានវិទ្យា',
    role: 'គ្រូបង្រៀនបច្ចេកវិទ្យា',
    responsibilities: ['គ្រប់គ្រងបន្ទប់កុំព្យូទ័រ', 'គ្រប់គ្រងទិន្នន័យសាលា'],
  }
];

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

export const DEFAULT_CLASSROOMS: Classroom[] = [
  { id: 'CLS-001', name: 'ថ្នាក់ទី ៧អា (7A)', grade: '៧', studentCount: 8 },
  { id: 'CLS-002', name: 'ថ្នាក់ទី ៩អា (9A)', grade: '៩', studentCount: 8 },
  { id: 'CLS-003', name: 'ថ្នាក់ទី ១២អា (12A)', grade: '១២', studentCount: 8 },
];

export const DEFAULT_PRESTART_CONFIGS: { [classroomId: string]: PreStartConfig } = {
  'CLS-001': {
    classroomId: 'CLS-001',
    homeTeacherName: 'កែវ ចន្ថា',
    academicYear: '២០២៥-២០២៦',
    semester1Months: ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា'],
    semester2Months: ['មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា'],
    activeMonthsForAverage: ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា'],
    subjects: DEFAULT_SUBJECTS,
  },
  'CLS-002': {
    classroomId: 'CLS-002',
    homeTeacherName: 'ឈឹម វណ្ណដា',
    academicYear: '២០២៥-២០២៦',
    semester1Months: ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា'],
    semester2Months: ['មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា'],
    activeMonthsForAverage: ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា'],
    subjects: DEFAULT_SUBJECTS,
  },
  'CLS-003': {
    classroomId: 'CLS-003',
    homeTeacherName: 'ស៊ន សុខគង់',
    academicYear: '២០២៥-២០២៦',
    semester1Months: ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា'],
    semester2Months: ['មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា'],
    activeMonthsForAverage: ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា'],
    subjects: DEFAULT_SUBJECTS,
  },
};

export const DEFAULT_STUDENTS: Student[] = [
  // Class 7A Students
  { id: 'STD-101', classroomId: 'CLS-001', studentIdCard: 'STD-701', rollNumber: '១', nameKhmer: 'សុខ វិបុល', nameLatin: 'SOK VIBOL', gender: 'ប្រុស', dob: '2013-04-10', pob: 'ព្រះសីហនុ', parentPhone: '012 888 777' },
  { id: 'STD-102', classroomId: 'CLS-001', studentIdCard: 'STD-702', rollNumber: '២', nameKhmer: 'ចាន់ ស្រីនី', nameLatin: 'CHAN SREYNY', gender: 'ស្រី', dob: '2013-11-20', pob: 'ភ្នំពេញ', parentPhone: '098 123 456' },
  { id: 'STD-103', classroomId: 'CLS-001', studentIdCard: 'STD-703', rollNumber: '៣0', nameKhmer: 'លី ម៉េងហួរ', nameLatin: 'LY MENGHOUR', gender: 'ប្រុស', dob: '2013-01-15', pob: 'កំពង់ចាម', parentPhone: '015 444 555' },
  { id: 'STD-104', classroomId: 'CLS-001', studentIdCard: 'STD-704', rollNumber: '៤', nameKhmer: 'សេង ធារី', nameLatin: 'SENG THEARY', gender: 'ស្រី', dob: '2013-09-08', pob: 'ព្រះសីហនុ', parentPhone: '088 777 999' },
  { id: 'STD-105', classroomId: 'CLS-001', studentIdCard: 'STD-705', rollNumber: '៥', nameKhmer: 'រស់ សំណាង', nameLatin: 'ROS SAMNANG', gender: 'ប្រុស', dob: '2013-06-30', pob: 'កណ្ដាល', parentPhone: '097 555 111' },
  { id: 'STD-106', classroomId: 'CLS-001', studentIdCard: 'STD-706', rollNumber: '៦', nameKhmer: 'អ៊ន វត្តី', nameLatin: 'ORN WATTEY', gender: 'ស្រី', dob: '2013-02-14', pob: 'សៀមរាប', parentPhone: '012 333 999' },
  { id: 'STD-107', classroomId: 'CLS-001', studentIdCard: 'STD-707', rollNumber: '៧', nameKhmer: 'ឃុន រិទ្ធី', nameLatin: 'KHUN RITHY', gender: 'ប្រុស', dob: '2013-08-18', pob: 'បាត់ដំបង', parentPhone: '016 999 000' },
  { id: 'STD-108', classroomId: 'CLS-001', studentIdCard: 'STD-708', rollNumber: '៨', nameKhmer: 'តាក សៀវម៉ី', nameLatin: 'TAK SIEVMEY', gender: 'ស្រី', dob: '2013-12-01', pob: 'កំពត', parentPhone: '085 222 333' },

  // Class 9A Students
  { id: 'STD-201', classroomId: 'CLS-002', studentIdCard: 'STD-901', rollNumber: '១', nameKhmer: 'ជា សុភ័ក្ត្រ', nameLatin: 'CHEA SOPHEAKTRA', gender: 'ប្រុស', dob: '2011-03-04', pob: 'ព្រះសីហនុ', parentPhone: '098 777 666' },
  { id: 'STD-202', classroomId: 'CLS-002', studentIdCard: 'STD-902', rollNumber: '២', nameKhmer: 'ម៉ៅ គីមហុង', nameLatin: 'MAO KIMHONG', gender: 'ប្រុស', dob: '2011-05-18', pob: 'កណ្ដាល', parentPhone: '012 445 667' },
  { id: 'STD-203', classroomId: 'CLS-002', studentIdCard: 'STD-903', rollNumber: '៣', nameKhmer: 'នួន ស្រីរ័ត្ន', nameLatin: 'NOUN SREYRATH', gender: 'ស្រី', dob: '2011-08-25', pob: 'ភ្នំពេញ', parentPhone: '097 888 999' },
  { id: 'STD-204', classroomId: 'CLS-002', studentIdCard: 'STD-904', rollNumber: '៤', nameKhmer: 'សួន វាសនា', nameLatin: 'SOUN VEASNA', gender: 'ប្រុស', dob: '2011-02-12', pob: 'កំពង់ស្ពឺ', parentPhone: '015 678 123' },
  { id: 'STD-205', classroomId: 'CLS-002', studentIdCard: 'STD-905', rollNumber: '៥', nameKhmer: 'ញ៉ែម សុជាតា', nameLatin: 'NHEM SOCHEATA', gender: 'ស្រី', dob: '2011-10-10', pob: 'ព្រះសីហនុ', parentPhone: '096 111 222' },
  { id: 'STD-206', classroomId: 'CLS-002', studentIdCard: 'STD-906', rollNumber: '៦', nameKhmer: 'ផានិត រតនា', nameLatin: 'PHANIT ROTHANA', gender: 'ប្រុស', dob: '2011-12-14', pob: 'តាកែវ', parentPhone: '088 123 987' },
  { id: 'STD-207', classroomId: 'CLS-002', studentIdCard: 'STD-907', rollNumber: '៧', nameKhmer: 'លាង ធីតា', nameLatin: 'LEANG THIDA', gender: 'ស្រី', dob: '2011-01-05', pob: 'កោះកុង', parentPhone: '011 222 555' },
  { id: 'STD-208', classroomId: 'CLS-002', studentIdCard: 'STD-908', rollNumber: '៨', nameKhmer: 'វង្ស ដារ៉ា', nameLatin: 'VONG DARA', gender: 'ប្រុស', dob: '2011-07-22', pob: 'ព្រះសីហនុ', parentPhone: '085 444 888' },

  // Class 12A Students
  { id: 'STD-301', classroomId: 'CLS-003', studentIdCard: 'STD-1201', rollNumber: '១', nameKhmer: 'មាស សុខហេង', nameLatin: 'MEAS SOKHENG', gender: 'ប្រុស', dob: '2008-01-12', pob: 'កំពង់ធំ', parentPhone: '015 555 444' },
  { id: 'STD-302', classroomId: 'CLS-003', studentIdCard: 'STD-1202', rollNumber: '២', nameKhmer: 'ហេង ម៉ូនីកា', nameLatin: 'HENG MONIKA', gender: 'ស្រី', dob: '2008-09-03', pob: 'ព្រះសីហនុ', parentPhone: '097 123 321' },
  { id: 'STD-303', classroomId: 'CLS-003', studentIdCard: 'STD-1203', rollNumber: '៣', nameKhmer: 'គឹម ចាន់ដារ៉ា', nameLatin: 'KIM CHANDARA', gender: 'ប្រុស', dob: '2008-04-20', pob: 'កំពង់ឆ្នាំង', parentPhone: '098 777 333' },
  { id: 'STD-304', classroomId: 'CLS-003', studentIdCard: 'STD-1204', rollNumber: '៤', nameKhmer: 'តែម ស្រីនាថ', nameLatin: 'TEM SREYNEATH', gender: 'ស្រី', dob: '2008-06-15', pob: 'ស្វាយរៀង', parentPhone: '012 999 888' },
  { id: 'STD-305', classroomId: 'CLS-003', studentIdCard: 'STD-1205', rollNumber: '៥', nameKhmer: 'ឃឿន ចាន់ឌី', nameLatin: 'KHOEUN CHANDY', gender: 'ប្រុស', dob: '2008-10-31', pob: 'ព្រៃវែង', parentPhone: '088 543 210' },
  { id: 'STD-306', classroomId: 'CLS-003', studentIdCard: 'STD-1206', rollNumber: '៦', nameKhmer: 'សួង សលីណា', nameLatin: 'SUONG SOLINA', gender: 'ស្រី', dob: '2008-11-11', pob: 'ព្រះសីហនុ', parentPhone: '011 556 677' },
  { id: 'STD-307', classroomId: 'CLS-003', studentIdCard: 'STD-1207', rollNumber: '៧', nameKhmer: 'ឡុង វាសនា', nameLatin: 'LONG VEASNA', gender: 'ប្រុស', dob: '2008-02-28', pob: 'ពោធិ៍សាត់', parentPhone: '016 333 444' },
  { id: 'STD-308', classroomId: 'CLS-003', studentIdCard: 'STD-1208', rollNumber: '៨', nameKhmer: 'រិទ្ធ ស្រីពេជ្រ', nameLatin: 'RITH SREYPECH', gender: 'ស្រី', dob: '2008-07-19', pob: 'ព្រះសីហនុ', parentPhone: '096 888 111' },
];

export const DEFAULT_STUDENT_SCORES: StudentScore[] = [
  // Class 9A Students - Pre-fill S1 Month entries (e.g. November ('វិច្ឆិកា'), December ('ធ្នូ'))
  // Student STD-201
  {
    id: 'SC-101',
    studentId: 'STD-201',
    classroomId: 'CLS-002',
    month: 'វិច្ឆិកា',
    scores: { '1': 42, '2': 45, '3': 40, '4': 38, '5': 42, '6': 45, '7': 39, '8': 44, '9': 41, '10': 48 }
  },
  {
    id: 'SC-102',
    studentId: 'STD-201',
    classroomId: 'CLS-002',
    month: 'ធ្នូ',
    scores: { '1': 45, '2': 48, '3': 42, '4': 41, '5': 43, '6': 46, '7': 42, '8': 45, '9': 44, '10': 49 }
  },
  // Student STD-202
  {
    id: 'SC-103',
    studentId: 'STD-202',
    classroomId: 'CLS-002',
    month: 'វិច្ឆិកា',
    scores: { '1': 35, '2': 38, '3': 34, '4': 30, '5': 36, '6': 40, '7': 35, '8': 38, '9': 32, '10': 40 }
  },
  {
    id: 'SC-104',
    studentId: 'STD-202',
    classroomId: 'CLS-002',
    month: 'ធ្នូ',
    scores: { '1': 38, '2': 40, '3': 37, '4': 35, '5': 39, '6': 42, '7': 38, '8': 40, '9': 35, '10': 42 }
  },
  // Student STD-203
  {
    id: 'SC-105',
    studentId: 'STD-203',
    classroomId: 'CLS-002',
    month: 'វិច្ឆិកា',
    scores: { '1': 48, '2': 49, '3': 46, '4': 47, '5': 45, '6': 48, '7': 47, '8': 49, '9': 46, '10': 49 }
  },
  {
    id: 'SC-106',
    studentId: 'STD-203',
    classroomId: 'CLS-002',
    month: 'ធ្នូ',
    scores: { '1': 49, '2': 50, '3': 48, '4': 49, '5': 47, '6': 49, '7': 49, '8': 50, '9': 48, '10': 50 }
  },
  // Student STD-204
  {
    id: 'SC-107',
    studentId: 'STD-204',
    classroomId: 'CLS-002',
    month: 'វិច្ឆិកា',
    scores: { '1': 30, '2': 32, '3': 28, '4': 25, '5': 31, '6': 35, '7': 30, '8': 32, '9': 28, '10': 35 }
  },
  // Other Class 9A students (let's pre-populate STD-205, 206, 207, 208 for November too so the results table is interesting!)
  { id: 'SC-108', studentId: 'STD-205', classroomId: 'CLS-002', month: 'វិច្ឆិកា', scores: { '1': 41, '2': 39, '3': 42, '4': 40, '5': 38, '6': 42, '7': 39, '8': 44, '9': 41, '10': 45 } },
  { id: 'SC-109', studentId: 'STD-206', classroomId: 'CLS-002', month: 'វិច្ឆិកា', scores: { '1': 32, '2': 35, '3': 30, '4': 28, '5': 34, '6': 36, '7': 32, '8': 35, '9': 30, '10': 38 } },
  { id: 'SC-110', studentId: 'STD-207', classroomId: 'CLS-002', month: 'វិច្ឆិកា', scores: { '1': 44, '2': 42, '3': 45, '4': 43, '5': 40, '6': 45, '7': 41, '8': 46, '9': 43, '10': 47 } },
  { id: 'SC-111', studentId: 'STD-208', classroomId: 'CLS-002', month: 'វិច្ឆិកា', scores: { '1': 37, '2': 36, '3': 35, '4': 34, '5': 38, '6': 39, '7': 36, '8': 37, '9': 35, '10': 41 } },

  // Let's copy some for December too so we can see differences
  { id: 'SC-112', studentId: 'STD-204', classroomId: 'CLS-002', month: 'ធ្នូ', scores: { '1': 32, '2': 34, '3': 30, '4': 28, '5': 33, '6': 37, '7': 32, '8': 34, '9': 30, '10': 37 } },
  { id: 'SC-113', studentId: 'STD-205', classroomId: 'CLS-002', month: 'ធ្នូ', scores: { '1': 43, '2': 41, '3': 44, '4': 42, '5': 40, '6': 44, '7': 41, '8': 46, '9': 43, '10': 47 } },
  { id: 'SC-114', studentId: 'STD-206', classroomId: 'CLS-002', month: 'ធ្នូ', scores: { '1': 35, '2': 38, '3': 32, '4': 30, '5': 36, '6': 38, '7': 34, '8': 37, '9': 32, '10': 40 } },
  { id: 'SC-115', studentId: 'STD-207', classroomId: 'CLS-002', month: 'ធ្នូ', scores: { '1': 46, '2': 44, '3': 47, '4': 45, '5': 42, '6': 47, '7': 43, '8': 48, '9': 45, '10': 49 } },
  { id: 'SC-116', studentId: 'STD-208', classroomId: 'CLS-002', month: 'ធ្នូ', scores: { '1': 39, '2': 38, '3': 37, '4': 36, '5': 40, '6': 41, '7': 38, '8': 39, '9': 37, '10': 43 } },
];

export const DEFAULT_STUDENT_ATTENDANCE: StudentAttendance[] = [
  // Class 9A Attendance
  { id: 'SA-101', studentId: 'STD-201', classroomId: 'CLS-002', date: '2026-06-01', month: 'វិច្ឆិកា', semester: 'ឆមាសទី១', status: 'វត្តមាន' },
  { id: 'SA-102', studentId: 'STD-202', classroomId: 'CLS-002', date: '2026-06-01', month: 'វិច្ឆិកា', semester: 'ឆមាសទី១', status: 'អវត្តមានមានច្បាប់', notes: 'ឈឺក្បាល' },
  { id: 'SA-103', studentId: 'STD-203', classroomId: 'CLS-002', date: '2026-06-01', month: 'វិច្ឆិកា', semester: 'ឆមាសទី១', status: 'វត្តមាន' },
  { id: 'SA-104', studentId: 'STD-204', classroomId: 'CLS-002', date: '2026-06-01', month: 'វិច្ឆិកា', semester: 'ឆមាសទី១', status: 'អវត្តមានគ្មានច្បាប់' },
  { id: 'SA-105', studentId: 'STD-205', classroomId: 'CLS-002', date: '2026-06-01', month: 'វិច្ឆិកា', semester: 'ឆមាសទី១', status: 'វត្តមាន' },
  { id: 'SA-106', studentId: 'STD-206', classroomId: 'CLS-002', date: '2026-06-01', month: 'វិច្ឆិកា', semester: 'ឆមាសទី១', status: 'វត្តមាន' },
  { id: 'SA-107', studentId: 'STD-207', classroomId: 'CLS-002', date: '2026-06-01', month: 'វិច្ឆិកា', semester: 'ឆមាសទី១', status: 'វត្តមាន' },
  { id: 'SA-108', studentId: 'STD-208', classroomId: 'CLS-002', date: '2026-06-01', month: 'វិច្ឆិកា', semester: 'ឆមាសទី១', status: 'វត្តមាន' },

  { id: 'SA-109', studentId: 'STD-201', classroomId: 'CLS-002', date: '2026-06-02', month: 'វិច្ឆិកា', semester: 'ឆមាសទី១', status: 'វត្តមាន' },
  { id: 'SA-110', studentId: 'STD-202', classroomId: 'CLS-002', date: '2026-06-02', month: 'វិច្ឆិកា', semester: 'ឆមាសទី១', status: 'វត្តមាន' },
  { id: 'SA-111', studentId: 'STD-203', classroomId: 'CLS-002', date: '2026-06-02', month: 'វិច្ឆិកា', semester: 'ឆមាសទី១', status: 'វត្តមាន' },
  { id: 'SA-112', studentId: 'STD-204', classroomId: 'CLS-002', date: '2026-06-02', month: 'វិច្ឆិកា', semester: 'ឆមាសទី១', status: 'វត្តមាន' },
];

export const DEFAULT_TEACHER_ATTENDANCE: TeacherAttendance[] = [
  { id: 'TA-001', teacherId: 'TCH-001', date: '2026-06-17', status: 'វត្តមាន' },
  { id: 'TA-002', teacherId: 'TCH-002', date: '2026-06-17', status: 'វត្តមាន' },
  { id: 'TA-003', teacherId: 'TCH-003', date: '2026-06-17', status: 'ច្បាប់', reason: 'ប្រជុំនៅមន្ទីរអប់រំ' },
  { id: 'TA-004', teacherId: 'TCH-004', date: '2026-06-17', status: 'វត្តមាន' },
];

export const DEFAULT_HT_TASKS: HomeTeacherTask[] = [
  { id: 'TSK-101', classroomId: 'CLS-002', title: 'បំពេញបញ្ជីចំណាត់ថ្នាក់ខែវិច្ឆិកា', deadline: '2026-06-25', isCompleted: true },
  { id: 'TSK-102', classroomId: 'CLS-002', title: 'រៀបចំបញ្ជីរាយនាមសិស្សប្រលងឆមាសទី១', deadline: '2026-07-01', isCompleted: false, notes: 'ត្រូវផ្ទៀងផ្ទាត់អក្ខរាវិរុទ្ធឈ្មោះឡាតាំង' },
  { id: 'TSK-103', classroomId: 'CLS-002', title: 'ប្រជុំជាមួយអាណាព្យាបាលសិស្សខ្សោយ', deadline: '2026-06-30', isCompleted: false },
  { id: 'TSK-104', classroomId: 'CLS-001', title: 'បោះពុម្ពប័ណ្ណសម្គាល់ខ្លួនសិស្សទាំងអស់', deadline: '2026-06-20', isCompleted: false },
];

// Helper functions for safe LocalStorage Management
export interface SystemState {
  schoolInfo: SchoolInfo;
  teachers: Teacher[];
  classrooms: Classroom[];
  preStartConfigs: { [classroomId: string]: PreStartConfig };
  students: Student[];
  studentScores: StudentScore[];
  studentAttendance: StudentAttendance[];
  teacherAttendance: TeacherAttendance[];
  htTasks: HomeTeacherTask[];
}

const STORAGE_KEY = 'secondary_school_management_state_prod_v6';

export function getSystemState(): SystemState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Let's ensure backup attributes exist
      return {
        schoolInfo: parsed.schoolInfo || DEFAULT_SCHOOL_INFO,
        teachers: parsed.teachers || [],
        classrooms: parsed.classrooms || [],
        preStartConfigs: parsed.preStartConfigs || {},
        students: parsed.students || [],
        studentScores: parsed.studentScores || [],
        studentAttendance: parsed.studentAttendance || [],
        teacherAttendance: parsed.teacherAttendance || [],
        htTasks: parsed.htTasks || [],
      };
    }
  } catch (e) {
    console.error('Failed to read status from localStorage', e);
  }

  // Initialize with empty defaults if none exists
  const defaultState: SystemState = {
    schoolInfo: DEFAULT_SCHOOL_INFO,
    teachers: [],
    classrooms: [],
    preStartConfigs: {},
    students: [],
    studentScores: [],
    studentAttendance: [],
    teacherAttendance: [],
    htTasks: [],
  };
  saveSystemState(defaultState);
  return defaultState;
}

export function saveSystemState(state: SystemState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save status to localStorage', e);
  }
}
