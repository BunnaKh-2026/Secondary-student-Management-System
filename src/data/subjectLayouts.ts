// Cambodian Standard Curriculum Subjects, Max Scores, and Coefficients Layouts
// Based on official MOEYS standards for Grade 7 to 12 (Science & Social tracks)

export interface SubjectLayoutItem {
  id: string;
  name: string;
  standards: {
    [key: string]: {
      isActive: boolean;
      maxScore: number;
    };
  };
}

export const STANDARD_SUBJECTS_LAYOUT: SubjectLayoutItem[] = [
  {
    id: 's1',
    name: 'សរសេរតាមអាន',
    standards: {
      G7: { isActive: true, maxScore: 40 },
      G8: { isActive: true, maxScore: 40 },
      G9: { isActive: true, maxScore: 40 },
      G10: { isActive: false, maxScore: 0 },
      G11_SC: { isActive: false, maxScore: 0 },
      G11_SS: { isActive: false, maxScore: 0 },
      G12_SC: { isActive: false, maxScore: 0 },
      G12_SS: { isActive: false, maxScore: 0 },
    }
  },
  {
    id: 's2',
    name: 'តែងសេចក្តី',
    standards: {
      G7: { isActive: true, maxScore: 60 },
      G8: { isActive: true, maxScore: 60 },
      G9: { isActive: true, maxScore: 60 },
      G10: { isActive: false, maxScore: 0 },
      G11_SC: { isActive: false, maxScore: 0 },
      G11_SS: { isActive: false, maxScore: 0 },
      G12_SC: { isActive: false, maxScore: 0 },
      G12_SS: { isActive: false, maxScore: 0 },
    }
  },
  {
    id: 's3',
    name: 'ល្បឿនអំណាន',
    standards: {
      G7: { isActive: false, maxScore: 100 },
      G8: { isActive: false, maxScore: 100 },
      G9: { isActive: false, maxScore: 100 },
      G10: { isActive: false, maxScore: 0 },
      G11_SC: { isActive: false, maxScore: 0 },
      G11_SS: { isActive: false, maxScore: 0 },
      G12_SC: { isActive: false, maxScore: 0 },
      G12_SS: { isActive: false, maxScore: 0 },
    }
  },
  {
    id: 's4',
    name: 'ភាសាខ្មែរ',
    standards: {
      G7: { isActive: false, maxScore: 100 },
      G8: { isActive: false, maxScore: 100 },
      G9: { isActive: false, maxScore: 100 },
      G10: { isActive: true, maxScore: 100 },
      G11_SC: { isActive: false, maxScore: 0 },
      G11_SS: { isActive: false, maxScore: 0 },
      G12_SC: { isActive: false, maxScore: 0 },
      G12_SS: { isActive: false, maxScore: 0 },
    }
  },
  {
    id: 's5',
    name: 'អក្សរសាស្ត្រខ្មែរ',
    standards: {
      G7: { isActive: false, maxScore: 0 },
      G8: { isActive: false, maxScore: 0 },
      G9: { isActive: false, maxScore: 0 },
      G10: { isActive: false, maxScore: 0 },
      G11_SC: { isActive: true, maxScore: 75 },
      G11_SS: { isActive: true, maxScore: 125 },
      G12_SC: { isActive: true, maxScore: 75 },
      G12_SS: { isActive: true, maxScore: 125 },
    }
  },
  {
    id: 's6',
    name: 'គណិតវិទ្យា',
    standards: {
      G7: { isActive: true, maxScore: 100 },
      G8: { isActive: true, maxScore: 100 },
      G9: { isActive: true, maxScore: 100 },
      G10: { isActive: true, maxScore: 100 },
      G11_SC: { isActive: true, maxScore: 125 },
      G11_SS: { isActive: true, maxScore: 75 },
      G12_SC: { isActive: true, maxScore: 125 },
      G12_SS: { isActive: true, maxScore: 75 },
    }
  },
  {
    id: 's7',
    name: 'រូបវិទ្យា',
    standards: {
      G7: { isActive: true, maxScore: 50 },
      G8: { isActive: true, maxScore: 50 },
      G9: { isActive: true, maxScore: 50 },
      G10: { isActive: true, maxScore: 50 },
      G11_SC: { isActive: true, maxScore: 75 },
      G11_SS: { isActive: true, maxScore: 50 },
      G12_SC: { isActive: true, maxScore: 75 },
      G12_SS: { isActive: true, maxScore: 50 },
    }
  },
  {
    id: 's8',
    name: 'គីមីវិទ្យា',
    standards: {
      G7: { isActive: true, maxScore: 50 },
      G8: { isActive: true, maxScore: 50 },
      G9: { isActive: true, maxScore: 50 },
      G10: { isActive: true, maxScore: 50 },
      G11_SC: { isActive: true, maxScore: 75 },
      G11_SS: { isActive: true, maxScore: 50 },
      G12_SC: { isActive: true, maxScore: 75 },
      G12_SS: { isActive: true, maxScore: 50 },
    }
  },
  {
    id: 's9',
    name: 'ជីវវិទ្យា',
    standards: {
      G7: { isActive: true, maxScore: 50 },
      G8: { isActive: true, maxScore: 50 },
      G9: { isActive: true, maxScore: 50 },
      G10: { isActive: true, maxScore: 50 },
      G11_SC: { isActive: true, maxScore: 75 },
      G11_SS: { isActive: true, maxScore: 50 },
      G12_SC: { isActive: true, maxScore: 75 },
      G12_SS: { isActive: true, maxScore: 50 },
    }
  },
  {
    id: 's10',
    name: 'ផែនដីវិទ្យា',
    standards: {
      G7: { isActive: true, maxScore: 50 },
      G8: { isActive: true, maxScore: 50 },
      G9: { isActive: true, maxScore: 50 },
      G10: { isActive: true, maxScore: 50 },
      G11_SC: { isActive: true, maxScore: 50 },
      G11_SS: { isActive: true, maxScore: 50 },
      G12_SC: { isActive: true, maxScore: 50 },
      G12_SS: { isActive: true, maxScore: 50 },
    }
  },
  {
    id: 's11',
    name: 'ប្រវត្តិវិទ្យា',
    standards: {
      G7: { isActive: true, maxScore: 50 },
      G8: { isActive: true, maxScore: 50 },
      G9: { isActive: true, maxScore: 50 },
      G10: { isActive: true, maxScore: 50 },
      G11_SC: { isActive: true, maxScore: 50 },
      G11_SS: { isActive: true, maxScore: 75 },
      G12_SC: { isActive: true, maxScore: 50 },
      G12_SS: { isActive: true, maxScore: 75 },
    }
  },
  {
    id: 's12',
    name: 'ភូមិវិទ្យា',
    standards: {
      G7: { isActive: true, maxScore: 50 },
      G8: { isActive: true, maxScore: 50 },
      G9: { isActive: true, maxScore: 50 },
      G10: { isActive: true, maxScore: 50 },
      G11_SC: { isActive: true, maxScore: 50 },
      G11_SS: { isActive: true, maxScore: 75 },
      G12_SC: { isActive: true, maxScore: 50 },
      G12_SS: { isActive: true, maxScore: 75 },
    }
  },
  {
    id: 's13',
    name: 'ពលរដ្ឋវិជ្ជា',
    standards: {
      G7: { isActive: true, maxScore: 50 },
      G8: { isActive: true, maxScore: 50 },
      G9: { isActive: true, maxScore: 50 },
      G10: { isActive: true, maxScore: 50 },
      G11_SC: { isActive: true, maxScore: 50 },
      G11_SS: { isActive: true, maxScore: 75 },
      G12_SC: { isActive: true, maxScore: 50 },
      G12_SS: { isActive: true, maxScore: 75 },
    }
  },
  {
    id: 's14',
    name: 'គេហវិទ្យា',
    standards: {
      G7: { isActive: true, maxScore: 50 },
      G8: { isActive: true, maxScore: 50 },
      G9: { isActive: true, maxScore: 50 },
      G10: { isActive: true, maxScore: 50 },
      G11_SC: { isActive: false, maxScore: 0 },
      G11_SS: { isActive: false, maxScore: 0 },
      G12_SC: { isActive: false, maxScore: 0 },
      G12_SS: { isActive: false, maxScore: 0 },
    }
  },
  {
    id: 's15',
    name: 'សេដ្ឋកិច្ចវិទ្យា',
    standards: {
      G7: { isActive: false, maxScore: 0 },
      G8: { isActive: false, maxScore: 0 },
      G9: { isActive: false, maxScore: 0 },
      G10: { isActive: false, maxScore: 0 },
      G11_SC: { isActive: true, maxScore: 50 },
      G11_SS: { isActive: true, maxScore: 50 },
      G12_SC: { isActive: true, maxScore: 50 },
      G12_SS: { isActive: true, maxScore: 50 },
    }
  },
  {
    id: 's16',
    name: 'អង់គ្លេស',
    standards: {
      G7: { isActive: true, maxScore: 50 },
      G8: { isActive: true, maxScore: 50 },
      G9: { isActive: true, maxScore: 50 },
      G10: { isActive: true, maxScore: 50 },
      G11_SC: { isActive: true, maxScore: 50 },
      G11_SS: { isActive: true, maxScore: 50 },
      G12_SC: { isActive: true, maxScore: 50 },
      G12_SS: { isActive: true, maxScore: 50 },
    }
  },
  {
    id: 's17',
    name: 'បារាំង',
    standards: {
      G7: { isActive: false, maxScore: 50 },
      G8: { isActive: false, maxScore: 50 },
      G9: { isActive: false, maxScore: 50 },
      G10: { isActive: false, maxScore: 50 },
      G11_SC: { isActive: false, maxScore: 50 },
      G11_SS: { isActive: false, maxScore: 50 },
      G12_SC: { isActive: false, maxScore: 50 },
      G12_SS: { isActive: false, maxScore: 50 },
    }
  },
  {
    id: 's18',
    name: 'អប់រំសុខភាព',
    standards: {
      G7: { isActive: false, maxScore: 50 },
      G8: { isActive: false, maxScore: 50 },
      G9: { isActive: false, maxScore: 50 },
      G10: { isActive: false, maxScore: 50 },
      G11_SC: { isActive: false, maxScore: 50 },
      G11_SS: { isActive: false, maxScore: 50 },
      G12_SC: { isActive: false, maxScore: 50 },
      G12_SS: { isActive: false, maxScore: 50 },
    }
  },
  {
    id: 's19',
    name: 'អប់រំកាយ-កីឡា',
    standards: {
      G7: { isActive: true, maxScore: 50 },
      G8: { isActive: true, maxScore: 50 },
      G9: { isActive: true, maxScore: 50 },
      G10: { isActive: true, maxScore: 50 },
      G11_SC: { isActive: true, maxScore: 50 },
      G11_SS: { isActive: true, maxScore: 50 },
      G12_SC: { isActive: true, maxScore: 50 },
      G12_SS: { isActive: true, maxScore: 50 },
    }
  },
  {
    id: 's20',
    name: 'កសិកម្ម',
    standards: {
      G7: { isActive: false, maxScore: 50 },
      G8: { isActive: false, maxScore: 50 },
      G9: { isActive: false, maxScore: 50 },
      G10: { isActive: false, maxScore: 50 },
      G11_SC: { isActive: false, maxScore: 50 },
      G11_SS: { isActive: false, maxScore: 50 },
      G12_SC: { isActive: false, maxScore: 50 },
      G12_SS: { isActive: false, maxScore: 50 },
    }
  },
  {
    id: 's21',
    name: 'អប់រំសិល្បៈ',
    standards: {
      G7: { isActive: false, maxScore: 50 },
      G8: { isActive: false, maxScore: 50 },
      G9: { isActive: false, maxScore: 50 },
      G10: { isActive: false, maxScore: 50 },
      G11_SC: { isActive: false, maxScore: 50 },
      G11_SS: { isActive: false, maxScore: 50 },
      G12_SC: { isActive: false, maxScore: 50 },
      G12_SS: { isActive: false, maxScore: 50 },
    }
  },
  {
    id: 's22',
    name: 'បច្ចេកវិទ្យាព័ត៌មាន',
    standards: {
      G7: { isActive: false, maxScore: 50 },
      G8: { isActive: false, maxScore: 50 },
      G9: { isActive: false, maxScore: 50 },
      G10: { isActive: false, maxScore: 50 },
      G11_SC: { isActive: false, maxScore: 50 },
      G11_SS: { isActive: false, maxScore: 50 },
      G12_SC: { isActive: false, maxScore: 50 },
      G12_SS: { isActive: false, maxScore: 50 },
    }
  },
  {
    id: 's23',
    name: 'អប់រំពុទ្ធសាសនា',
    standards: {
      G7: { isActive: true, maxScore: 50 },
      G8: { isActive: true, maxScore: 50 },
      G9: { isActive: true, maxScore: 50 },
      G10: { isActive: true, maxScore: 50 },
      G11_SC: { isActive: true, maxScore: 50 },
      G11_SS: { isActive: true, maxScore: 50 },
      G12_SC: { isActive: true, maxScore: 50 },
      G12_SS: { isActive: true, maxScore: 50 },
    }
  },
  {
    id: 's24',
    name: 'អប់រំបំណិនជីវិត',
    standards: {
      G7: { isActive: false, maxScore: 50 },
      G8: { isActive: false, maxScore: 50 },
      G9: { isActive: false, maxScore: 50 },
      G10: { isActive: false, maxScore: 50 },
      G11_SC: { isActive: false, maxScore: 50 },
      G11_SS: { isActive: false, maxScore: 50 },
      G12_SC: { isActive: false, maxScore: 50 },
      G12_SS: { isActive: false, maxScore: 50 },
    }
  },
  {
    id: 's25',
    name: 'បណ្ណាល័យ',
    standards: {
      G7: { isActive: true, maxScore: 50 },
      G8: { isActive: true, maxScore: 50 },
      G9: { isActive: true, maxScore: 50 },
      G10: { isActive: true, maxScore: 50 },
      G11_SC: { isActive: true, maxScore: 50 },
      G11_SS: { isActive: true, maxScore: 50 },
      G12_SC: { isActive: true, maxScore: 50 },
      G12_SS: { isActive: true, maxScore: 50 },
    }
  }
];

export function getSubjectCategoryKey(grade: string, classType?: string): string {
  const typeStr = classType || '';
  const isSoc = typeStr.includes('សង្គម') || typeStr.includes('SS');

  if (grade === '៧') return 'G7';
  if (grade === '៨') return 'G8';
  if (grade === '៩') return 'G9';
  if (grade === '១០') return 'G10';
  if (grade === '១១') {
    return isSoc ? 'G11_SS' : 'G11_SC';
  }
  if (grade === '១២') {
    return isSoc ? 'G12_SS' : 'G12_SC';
  }
  return 'G7';
}

export function isSubjectExcludedForCategory(catId: string, subjectName: string, subjectId: string): boolean {
  const name = subjectName || '';
  const id = subjectId || '';
  const cleanName = name.replace(/\s/g, '');

  if (catId === 'G7' || catId === 'G8' || catId === 'G9' || catId === 'G10') {
    // Exclude: អក្សរសាស្ត្រខ្មែរ, សេដ្ឋកិច្ចវិទ្យា, ល្បឿនអំណាន, អប់រំបំណិនជីវិត
    if (id === 's5' || id === 's15' || id === 's3' || id === 's24') return true;
    if (cleanName === 'អក្សរសាស្ត្រខ្មែរ' || cleanName === 'សេដ្ឋកិច្ចវិទ្យា' || cleanName === 'ល្បឿនអំណាន' || cleanName === 'អប់រំបំណិនជីវិត') return true;
  }

  if (catId === 'G11_SC' || catId === 'G11_SS' || catId === 'G12_SC' || catId === 'G12_SS') {
    // Exclude: សរសេរតាមអាន, តែងសេចក្ដី/តែងសេចក្តី, ល្បឿនអំណាន, ភាសាខ្មែរ, គេហវិទ្យា, អប់រំបំណិនជីវិត
    if (id === 's1' || id === 's2' || id === 's3' || id === 's4' || id === 's14' || id === 's24') return true;
    if (
      cleanName === 'សរសេរតាមអាន' || 
      cleanName === 'តែងសេចក្តី' || 
      cleanName === 'តែងសេចក្ដី' || 
      cleanName === 'ល្បឿនអំណាន' || 
      cleanName === 'ភាសាខ្មែរ' || 
      cleanName === 'គេហវិទ្យា' || 
      cleanName === 'អប់រំបំណិនជីវិត'
    ) return true;
  }

  return false;
}

export function isSubjectExcludedForGrade(grade: string, subjectName: string, subjectId: string): boolean {
  const g = grade || '';
  const name = subjectName || '';
  const id = subjectId || '';
  const cleanName = name.replace(/\s/g, '');

  if (g === '៧' || g === '៨' || g === '៩' || g === '១០') {
    // Exclude: អក្សរសាស្ត្រខ្មែរ, សេដ្ឋកិច្ចវិទ្យា, ល្បឿនអំណាន, អប់រំបំណិនជីវិត
    if (id === 's5' || id === 's15' || id === 's3' || id === 's24') return true;
    if (cleanName === 'អក្សរសាស្ត្រខ្មែរ' || cleanName === 'សេដ្ឋកិច្ចវិទ្យា' || cleanName === 'ល្បឿនអំណាន' || cleanName === 'អប់រំបំណិនជីវិត') return true;
  }

  if (g === '១១' || g === '១២') {
    // Exclude: សរសេរតាមអាន, តែងសេចក្ដី/តែងសេចក្តី, ល្បឿនអំណាន, ភាសាខ្មែរ, គេហវិទ្យា, អប់រំបំណិនជីវិត
    if (id === 's1' || id === 's2' || id === 's3' || id === 's4' || id === 's14' || id === 's24') return true;
    if (
      cleanName === 'សរសេរតាមអាន' || 
      cleanName === 'តែងសេចក្តី' || 
      cleanName === 'តែងសេចក្ដី' || 
      cleanName === 'ល្បឿនអំណាន' || 
      cleanName === 'ភាសាខ្មែរ' || 
      cleanName === 'គេហវិទ្យា' || 
      cleanName === 'អប់រំបំណិនជីវិត'
    ) return true;
  }

  return false;
}

export function getDefaultSubjectsForClass(grade: string, classType?: string): any[] {
  const catKey = getSubjectCategoryKey(grade, classType);
  return STANDARD_SUBJECTS_LAYOUT
    .filter(subLayout => !isSubjectExcludedForGrade(grade, subLayout.name, subLayout.id))
    .map(subLayout => {
      // If standards define G7, etc.
      const std = subLayout.standards[catKey] || { isActive: false, maxScore: 50 };
      return {
        id: subLayout.id,
        name: subLayout.name,
        isActive: std.isActive,
        maxScore: std.maxScore > 0 ? std.maxScore : 50,
        coefficient: std.maxScore > 0 ? std.maxScore / 50 : 1,
      };
    });
}

export function getClassroomsForCategory(catId: string, classrooms: any[]): any[] {
  return classrooms.filter(c => {
    if (catId === 'G7') return c.grade === '៧';
    if (catId === 'G8') return c.grade === '៨';
    if (catId === 'G9') return c.grade === '៩';
    if (catId === 'G10') return c.grade === '១០';
    
    const typeStr = c.classType || '';
    const isSoc = typeStr.includes('សង្គម') || typeStr.includes('SS');

    if (catId === 'G11_SC') return c.grade === '១១' && !isSoc;
    if (catId === 'G11_SS') return c.grade === '១១' && isSoc;
    if (catId === 'G12_SC') return c.grade === '១២' && !isSoc;
    if (catId === 'G12_SS') return c.grade === '១២' && isSoc;
    return false;
  });
}

const SUBJECT_CODES_MAP: { [id: string]: string } = {
  s1: 'Di',  // សរសេរតាមអាន
  s2: 'Wr',  // តែងសេចក្តី
  s3: 'Rs',  // ល្បឿនអំណាន
  s4: 'K',   // ភាសាខ្មែរ
  s5: 'K',   // អក្សរសាស្ត្រខ្មែរ
  s6: 'M',   // គណិតវិទ្យា
  s7: 'P',   // រូបវិទ្យា
  s8: 'C',   // គីមីវិទ្យា
  s9: 'B',   // ជីវវិទ្យា
  s10: 'Es', // ផែនដីវិទ្យា
  s11: 'H',  // ប្រវត្តិវិទ្យា
  s12: 'G',  // ភូមិវិទ្យា
  s13: 'Mc', // ពលរដ្ឋវិជ្ជា
  s14: 'He', // គេហវិទ្យា
  s15: 'Ec', // សេដ្ឋកិច្ចវិទ្យា
  s16: 'E',  // អង់គ្លេស
  s17: 'F',  // បារាំង
  s18: 'Hc', // អប់រំសុខភាព
  s19: 'Ed', // អប់រំកាយ-កីឡា
  s20: 'Ag', // កសិកម្ម
  s21: 'Ar', // អប់រំសិល្បៈ
  s22: 'IT', // បច្ចេកវិទ្យាព័ត៌មាន
  s23: 'Be', // អប់រំពុទ្ធសាសនា
  s24: 'S',  // អប់រំបំណិនជីវិត
  s25: 'Li', // បណ្ណាល័យ
};

export function getStandardSubjectsForCategory(catId: string): any[] {
  return STANDARD_SUBJECTS_LAYOUT
    .filter(subLayout => !isSubjectExcludedForCategory(catId, subLayout.name, subLayout.id))
    .map(subLayout => {
      const std = subLayout.standards[catId] || { isActive: false, maxScore: 50 };
      return {
        id: subLayout.id,
        name: subLayout.name,
        isActive: std.isActive,
        maxScore: std.maxScore > 0 ? std.maxScore : 50,
        coefficient: std.maxScore > 0 ? std.maxScore / 50 : 1,
        code: SUBJECT_CODES_MAP[subLayout.id] || subLayout.id.toUpperCase(),
      };
    });
}
