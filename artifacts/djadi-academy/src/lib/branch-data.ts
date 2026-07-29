import {
  FlaskConical,
  BookText,
  Microscope,
  Calculator,
  Cog,
  TrendingUp,
  Feather,
  Languages,
  BookOpen,
  Atom,
  Leaf,
  Globe,
  Globe2,
  Map,
  Brain,
  Star,
  Cpu,
  Receipt,
  Scale,
  Mountain,
  type LucideIcon,
} from "lucide-react";

export type GradeId = "premiere" | "deuxieme" | "troisieme";
export type ThirdLanguage = "german" | "spanish" | "italian";

export interface SubjectDef {
  id: string;
  nameAr: string;
  nameFr: string;
  icon: LucideIcon;
  color: string;
  /** Only true for the placeholder card in آداب ولغات أجنبية */
  isThirdLanguagePlaceholder?: boolean;
}

export interface BranchDef {
  id: string;
  nameAr: string;
  nameFr: string;
  icon: LucideIcon;
  color: string;
  grades: GradeId[];
  subjects: SubjectDef[];
}

// ─── Shared subject definitions ────────────────────────────────────────────

const S_ARABIC: SubjectDef = {
  id: "arabic",
  nameAr: "اللغة العربية",
  nameFr: "Langue Arabe",
  icon: BookOpen,
  color: "#16a34a",
};

const S_ARABIC_LIT: SubjectDef = {
  id: "arabic-lit",
  nameAr: "الأدب العربي",
  nameFr: "Littérature Arabe",
  icon: BookOpen,
  color: "#16a34a",
};

const S_MATH: SubjectDef = {
  id: "math",
  nameAr: "الرياضيات",
  nameFr: "Mathématiques",
  icon: Calculator,
  color: "#2563eb",
};

const S_PHYSICS: SubjectDef = {
  id: "physics",
  nameAr: "العلوم الفيزيائية",
  nameFr: "Sciences Physiques",
  icon: Atom,
  color: "#7c3aed",
};

const S_BIOLOGY: SubjectDef = {
  id: "biology",
  nameAr: "العلوم الطبيعية والحياة",
  nameFr: "Sciences de la Nature et de la Vie",
  icon: Leaf,
  color: "#059669",
};

const S_BIOLOGY_SIMPLE: SubjectDef = {
  id: "biology-simple",
  nameAr: "العلوم الطبيعية",
  nameFr: "Sciences Naturelles",
  icon: Leaf,
  color: "#059669",
};

const S_FRENCH: SubjectDef = {
  id: "french",
  nameAr: "اللغة الفرنسية",
  nameFr: "Langue Française",
  icon: Globe,
  color: "#4f46e5",
};

const S_ENGLISH: SubjectDef = {
  id: "english",
  nameAr: "اللغة الإنجليزية",
  nameFr: "Langue Anglaise",
  icon: Globe2,
  color: "#0284c7",
};

const S_HISTORY: SubjectDef = {
  id: "history",
  nameAr: "التاريخ والجغرافيا",
  nameFr: "Histoire et Géographie",
  icon: Map,
  color: "#b45309",
};

const S_PHILOSOPHY: SubjectDef = {
  id: "philosophy",
  nameAr: "الفلسفة",
  nameFr: "Philosophie",
  icon: Brain,
  color: "#db2777",
};

const S_ISLAMIC: SubjectDef = {
  id: "islamic",
  nameAr: "العلوم الإسلامية",
  nameFr: "Sciences Islamiques",
  icon: Star,
  color: "#0d9488",
};

const S_AMAZIGH: SubjectDef = {
  id: "amazigh",
  nameAr: "اللغة الأمازيغية",
  nameFr: "Langue Amazighe",
  icon: Mountain,
  color: "#ea580c",
};

const S_TECH: SubjectDef = {
  id: "tech",
  nameAr: "التكنولوجيا",
  nameFr: "Technologie",
  icon: Cpu,
  color: "#0891b2",
};

const S_ECONOMICS: SubjectDef = {
  id: "economics",
  nameAr: "الاقتصاد والمانجمنت",
  nameFr: "Économie et Management",
  icon: TrendingUp,
  color: "#7c3aed",
};

const S_ACCOUNTING: SubjectDef = {
  id: "accounting",
  nameAr: "المحاسبة والمالية",
  nameFr: "Comptabilité et Finance",
  icon: Receipt,
  color: "#ca8a04",
};

const S_LAW: SubjectDef = {
  id: "law",
  nameAr: "القانون",
  nameFr: "Droit",
  icon: Scale,
  color: "#b91c1c",
};

const S_THIRD_LANG_PLACEHOLDER: SubjectDef = {
  id: "third-language",
  nameAr: "اللغة الأجنبية الثالثة",
  nameFr: "3ème Langue Étrangère",
  icon: Languages,
  color: "#be185d",
  isThirdLanguagePlaceholder: true,
};

// Third language resolved subjects
export const THIRD_LANGUAGE_SUBJECTS: Record<ThirdLanguage, SubjectDef> = {
  german: {
    id: "german",
    nameAr: "الألمانية",
    nameFr: "Langue Allemande",
    icon: Languages,
    color: "#be185d",
  },
  spanish: {
    id: "spanish",
    nameAr: "الإسبانية",
    nameFr: "Langue Espagnole",
    icon: Languages,
    color: "#be185d",
  },
  italian: {
    id: "italian",
    nameAr: "الإيطالية",
    nameFr: "Langue Italienne",
    icon: Languages,
    color: "#be185d",
  },
};

// ─── Branch definitions ─────────────────────────────────────────────────────

export const BRANCHES: BranchDef[] = [
  // ─── أولى ثانوي ──────────────────────────────────────
  {
    id: "tronc-sciences",
    nameAr: "جذع مشترك علوم",
    nameFr: "Tronc Commun Sciences",
    icon: FlaskConical,
    color: "#2563eb",
    grades: ["premiere"],
    subjects: [
      S_ARABIC,
      S_MATH,
      S_PHYSICS,
      S_BIOLOGY,
      S_FRENCH,
      S_ENGLISH,
      S_HISTORY,
      S_PHILOSOPHY,
      S_ISLAMIC,
      S_AMAZIGH,
    ],
  },
  {
    id: "tronc-lettres",
    nameAr: "جذع مشترك آداب",
    nameFr: "Tronc Commun Lettres",
    icon: BookText,
    color: "#16a34a",
    grades: ["premiere"],
    subjects: [
      S_ARABIC,
      S_MATH,
      S_FRENCH,
      S_ENGLISH,
      S_HISTORY,
      S_PHILOSOPHY,
      S_ISLAMIC,
      S_AMAZIGH,
    ],
  },

  // ─── ثانية وثالثة ثانوي ──────────────────────────────
  {
    id: "sciences-exp",
    nameAr: "علوم تجريبية",
    nameFr: "Sciences Expérimentales",
    icon: Microscope,
    color: "#059669",
    grades: ["deuxieme", "troisieme"],
    subjects: [
      S_BIOLOGY,
      S_PHYSICS,
      S_MATH,
      S_ARABIC,
      S_FRENCH,
      S_ENGLISH,
      S_PHILOSOPHY,
      S_HISTORY,
      S_ISLAMIC,
      S_AMAZIGH,
    ],
  },
  {
    id: "math",
    nameAr: "رياضيات",
    nameFr: "Mathématiques",
    icon: Calculator,
    color: "#2563eb",
    grades: ["deuxieme", "troisieme"],
    subjects: [
      S_BIOLOGY_SIMPLE,
      S_PHYSICS,
      S_MATH,
      S_ARABIC,
      S_FRENCH,
      S_ENGLISH,
      S_PHILOSOPHY,
      S_HISTORY,
      S_ISLAMIC,
      S_AMAZIGH,
    ],
  },
  {
    id: "tech-math",
    nameAr: "تقني رياضي",
    nameFr: "Technique Mathématique",
    icon: Cog,
    color: "#0891b2",
    grades: ["deuxieme", "troisieme"],
    subjects: [
      S_TECH,
      S_PHYSICS,
      S_MATH,
      S_ARABIC,
      S_FRENCH,
      S_ENGLISH,
      S_PHILOSOPHY,
      S_HISTORY,
      S_ISLAMIC,
      S_AMAZIGH,
    ],
  },
  {
    id: "gestion",
    nameAr: "تسيير واقتصاد",
    nameFr: "Gestion et Économie",
    icon: TrendingUp,
    color: "#7c3aed",
    grades: ["deuxieme", "troisieme"],
    subjects: [
      S_ECONOMICS,
      S_MATH,
      S_ACCOUNTING,
      S_LAW,
      S_ARABIC,
      S_FRENCH,
      S_ENGLISH,
      S_HISTORY,
      S_PHILOSOPHY,
      S_ISLAMIC,
      S_AMAZIGH,
    ],
  },
  {
    id: "lettres-philo",
    nameAr: "آداب وفلسفة",
    nameFr: "Lettres et Philosophie",
    icon: Feather,
    color: "#db2777",
    grades: ["deuxieme", "troisieme"],
    subjects: [
      S_ARABIC_LIT,
      S_PHILOSOPHY,
      S_MATH,
      S_HISTORY,
      S_FRENCH,
      S_ENGLISH,
      S_ISLAMIC,
      S_AMAZIGH,
    ],
  },
  {
    id: "lettres-langues",
    nameAr: "آداب ولغات أجنبية",
    nameFr: "Lettres et Langues Étrangères",
    icon: Languages,
    color: "#be185d",
    grades: ["deuxieme", "troisieme"],
    subjects: [
      S_ARABIC_LIT,
      S_PHILOSOPHY,
      S_MATH,
      S_HISTORY,
      S_FRENCH,
      S_ENGLISH,
      S_THIRD_LANG_PLACEHOLDER,
      S_ISLAMIC,
      S_AMAZIGH,
    ],
  },
];

/** Get branches available for a given grade */
export function getBranchesForGrade(grade: GradeId): BranchDef[] {
  return BRANCHES.filter((b) => b.grades.includes(grade));
}

/** Get a branch by id */
export function getBranchById(id: string): BranchDef | undefined {
  return BRANCHES.find((b) => b.id === id);
}

/** Get a subject by id across all subjects */
export function getSubjectById(id: string): SubjectDef | undefined {
  // Check third languages first
  if (id in THIRD_LANGUAGE_SUBJECTS) {
    return THIRD_LANGUAGE_SUBJECTS[id as ThirdLanguage];
  }
  // Search all branch subjects
  for (const branch of BRANCHES) {
    const found = branch.subjects.find((s) => s.id === id);
    if (found && !found.isThirdLanguagePlaceholder) return found;
  }
  return undefined;
}
