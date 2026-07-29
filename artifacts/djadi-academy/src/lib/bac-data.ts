// Baccalaureate exam data structure
// Admin adds exam URLs; structure is year → branch → subjectId → url

export interface BacExam {
  year: number;
  branchId: string;
  subjectId: string;
  url: string; // iframe-embeddable URL added by admin
}

export interface BacBranch {
  id: string;
  nameAr: string;
  subjects: BacSubject[];
}

export interface BacSubject {
  id: string;
  nameAr: string;
}

export const BAC_YEARS: number[] = Array.from(
  { length: 2026 - 2008 + 1 },
  (_, i) => 2026 - i
);

export const BAC_BRANCHES: BacBranch[] = [
  {
    id: "sciences-exp",
    nameAr: "علوم تجريبية",
    subjects: [
      { id: "math", nameAr: "الرياضيات" },
      { id: "physics", nameAr: "الفيزياء والكيمياء" },
      { id: "biology", nameAr: "علوم الطبيعة والحياة" },
      { id: "arabic", nameAr: "اللغة العربية وآدابها" },
      { id: "french", nameAr: "اللغة الفرنسية" },
      { id: "english", nameAr: "اللغة الإنجليزية" },
      { id: "history", nameAr: "التاريخ والجغرافيا" },
      { id: "philosophy", nameAr: "الفلسفة" },
      { id: "islamic", nameAr: "التربية الإسلامية" },
    ],
  },
  {
    id: "math",
    nameAr: "رياضيات",
    subjects: [
      { id: "math", nameAr: "الرياضيات" },
      { id: "physics", nameAr: "الفيزياء والكيمياء" },
      { id: "biology", nameAr: "علوم الطبيعة والحياة" },
      { id: "arabic", nameAr: "اللغة العربية وآدابها" },
      { id: "french", nameAr: "اللغة الفرنسية" },
      { id: "english", nameAr: "اللغة الإنجليزية" },
      { id: "history", nameAr: "التاريخ والجغرافيا" },
      { id: "philosophy", nameAr: "الفلسفة" },
    ],
  },
  {
    id: "tech-math",
    nameAr: "تقني رياضي",
    subjects: [
      { id: "math", nameAr: "الرياضيات" },
      { id: "physics", nameAr: "الفيزياء والكيمياء" },
      { id: "tech", nameAr: "التكنولوجيا" },
      { id: "arabic", nameAr: "اللغة العربية وآدابها" },
      { id: "french", nameAr: "اللغة الفرنسية" },
      { id: "english", nameAr: "اللغة الإنجليزية" },
      { id: "history", nameAr: "التاريخ والجغرافيا" },
      { id: "philosophy", nameAr: "الفلسفة" },
    ],
  },
  {
    id: "gestion",
    nameAr: "تسيير واقتصاد",
    subjects: [
      { id: "economics", nameAr: "اقتصاد وإدارة المؤسسات" },
      { id: "accounting", nameAr: "المحاسبة والمالية" },
      { id: "law", nameAr: "القانون" },
      { id: "math", nameAr: "الرياضيات" },
      { id: "arabic", nameAr: "اللغة العربية وآدابها" },
      { id: "french", nameAr: "اللغة الفرنسية" },
      { id: "history", nameAr: "التاريخ والجغرافيا" },
      { id: "philosophy", nameAr: "الفلسفة" },
    ],
  },
  {
    id: "lettres-philo",
    nameAr: "آداب وفلسفة",
    subjects: [
      { id: "arabic", nameAr: "اللغة العربية وآدابها" },
      { id: "philosophy", nameAr: "الفلسفة" },
      { id: "history", nameAr: "التاريخ والجغرافيا" },
      { id: "math", nameAr: "الرياضيات" },
      { id: "french", nameAr: "اللغة الفرنسية" },
      { id: "english", nameAr: "اللغة الإنجليزية" },
      { id: "islamic", nameAr: "التربية الإسلامية" },
    ],
  },
  {
    id: "lettres-langues",
    nameAr: "لغات أجنبية",
    subjects: [
      { id: "arabic", nameAr: "اللغة العربية وآدابها" },
      { id: "french", nameAr: "اللغة الفرنسية" },
      { id: "english", nameAr: "اللغة الإنجليزية" },
      { id: "history", nameAr: "التاريخ والجغرافيا" },
      { id: "philosophy", nameAr: "الفلسفة" },
      { id: "islamic", nameAr: "التربية الإسلامية" },
    ],
  },
];

// Admin-managed exam links stored in localStorage
const STORAGE_KEY = "djadi_bac_exams";

export function getBacExams(): BacExam[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as BacExam[];
  } catch {}
  return [];
}

export function getBacExamUrl(
  year: number,
  branchId: string,
  subjectId: string
): string | undefined {
  const exams = getBacExams();
  return exams.find(
    (e) =>
      e.year === year && e.branchId === branchId && e.subjectId === subjectId
  )?.url;
}
