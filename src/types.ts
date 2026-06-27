export interface SchoolInfo {
  schoolType: 'អនុវិទ្យាល័យ' | 'វិទ្យាល័យ' | 'ផ្សេងៗ' | '';
  schoolName: string;
  schoolCode?: string;
  province: string;
  district: string;
  commune: string;
  village?: string;
  directorName: string;
  directorGender: 'ប្រុស' | 'ស្រី' | '';
  madeAt?: string;
  studentAgeLimitDate?: string;
  teacherAgeLimitDate?: string;
  teacherServiceLimitDate?: string;
}

export interface Teacher {
  id: string; // ID uniquely identifying teacher
  idNumber: string; // Staff ID, e.g. TCH-001
  name: string;
  gender: 'ប្រុស' | 'ស្រី';
  dob: string; // Date of birth
  phone: string;
  subject: string; // Teach main subject
  role: string; // Position/Role
  responsibilities: string[]; // Specific duties
  photoUrl?: string; // Optional custom avatar
  salaryRank?: string; // កាំប្រាក់
  framework?: string; // ក្របខ័ណ្ឌ
  teachingSubjects?: string; // មុខវិជ្ជាបង្រៀន
  classCharge?: string; // បន្ទុកថ្នាក់
  ethnicity?: string; // ជនជាតិភាគតិច
  educationLevel?: string; // កម្រិតវប្បធម៌
  joinDate?: string; // ថ្ងៃចូលបម្រើការងារ
  yearsOfService?: number; // ចំនួនឆ្នាំបម្រើការងារ
}

export interface TeacherAttendance {
  id: string;
  teacherId: string;
  date: string; // YYYY-MM-DD
  status: 'វត្តមាន' | 'ច្បាប់' | 'អវត្តមាន'; // Present, Leave with permission, Absent
  reason?: string;
}

export interface SubjectConfig {
  id: string;
  name: string;
  coefficient: number;
  isActive: boolean;
  code?: string;
  maxScore?: number;
}

export interface PreStartConfig {
  classroomId: string;
  homeTeacherName: string;
  academicYear: string;
  semester1Months: string[]; // Months order for Sem 1, e.g. ["វិច្ឆិកា", "ធ្នូ", "មករា", "កុម្ភៈ", "មីនា"]
  semester2Months: string[]; // Months order for Sem 2, e.g. ["មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា"]
  activeMonthsForAverage: string[]; // Which months' scores determine the semester average, e.g. ["វិច្ឆិកា", "ធ្នូ", "មករា", "កុម្ភៈ", "មីនា"]
  subjects: SubjectConfig[];
}

export interface Student {
  id: string;
  classroomId: string;
  studentIdCard: string; // Student ID code e.g. STD-001
  rollNumber: string; // លេខរៀងក្នុងបញ្ជី (Roll Number)
  nameKhmer: string;
  nameLatin: string;
  gender: 'ប្រុស' | 'ស្រី';
  dob: string;
  pob: string; // Place of birth
  parentPhone: string;
  parentPhone2?: string;
  photoUrl?: string;
  // Sub-fields for Place of Birth (divided into 4 parts)
  pobProvince?: string;
  pobDistrict?: string;
  pobCommune?: string;
  pobVillage?: string;
  // Sub-fields for Current Address (divided into 4 parts)
  currentAddressProvince?: string;
  currentAddressDistrict?: string;
  currentAddressCommune?: string;
  currentAddressVillage?: string;
  currentAddress?: string;
  fatherName?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherOccupation?: string;
  studentIssue?: string;
  indigenousGroup?: string;
}

export interface StudentScore {
  id: string; // id
  studentId: string;
  classroomId: string; // Redundancy for easy query
  month: string; // Khmer Month name, or 'ឆមាសទី១' or 'ឆមាសទី២'
  scores: { [subjectId: string]: number }; // Subject ID -> score value (e.g. out of 50 or 100)
  totalScores?: number;
  average?: number;
  rank?: number;
  isPassed?: boolean;
}

export interface StudentAttendance {
  id: string;
  studentId: string;
  classroomId: string;
  date: string; // YYYY-MM-DD or Month string if accumulated
  month: string; // e.g. "វិច្ឆិកា"
  semester: 'ឆមាសទី១' | 'ឆមាសទី២';
  status: 'វត្តមាន' | 'អវត្តមានគ្មានច្បាប់' | 'អវត្តមានមានច្បាប់'; // Present, Absent without leave (អ'), Absent with leave (ច)
  notes?: string;
}

export interface Classroom {
  id: string;
  name: string; // e.g. "ថ្នាក់ទី ៧ អា (7A)"
  grade: '៧' | '៨' | '៩' | '១០' | '១១' | '១២';
  studentCount?: number;
  preStartConfig?: PreStartConfig;
  classGroup?: string;
  classType?: string;
}

export interface HomeTeacherTask {
  id: string;
  classroomId: string;
  title: string;
  deadline: string;
  isCompleted: boolean;
  notes?: string;
}
