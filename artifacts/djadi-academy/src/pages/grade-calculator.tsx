import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle2, XCircle, Trophy } from "lucide-react";

// ── BAC target: 07 June 2027, 08:00 AM (Algeria = UTC+1) ──────────────────
const BAC_DATE = new Date("2027-06-07T08:00:00+01:00");

// ── Branch definitions with official DZ BAC coefficients ─────────────────
interface Subject {
  nameAr: string;
  defaultCoeff: number;
}

interface Branch {
  id: string;
  nameAr: string;
  nameFr: string;
  subjects: Subject[];
}

const BRANCHES: Branch[] = [
  {
    id: "sciences-exp",
    nameAr: "علوم تجريبية",
    nameFr: "Sciences Expérimentales",
    subjects: [
      { nameAr: "اللغة العربية وآدابها", defaultCoeff: 3 },
      { nameAr: "الرياضيات", defaultCoeff: 4 },
      { nameAr: "الفيزياء والكيمياء", defaultCoeff: 6 },
      { nameAr: "علوم الطبيعة والحياة", defaultCoeff: 6 },
      { nameAr: "اللغة الفرنسية", defaultCoeff: 2 },
      { nameAr: "اللغة الإنجليزية", defaultCoeff: 2 },
      { nameAr: "التاريخ والجغرافيا", defaultCoeff: 2 },
      { nameAr: "الفلسفة", defaultCoeff: 2 },
      { nameAr: "التربية الإسلامية", defaultCoeff: 1 },
      { nameAr: "التربية البدنية والرياضية", defaultCoeff: 1 },
    ],
  },
  {
    id: "math",
    nameAr: "رياضيات",
    nameFr: "Mathématiques",
    subjects: [
      { nameAr: "اللغة العربية وآدابها", defaultCoeff: 3 },
      { nameAr: "الرياضيات", defaultCoeff: 7 },
      { nameAr: "الفيزياء والكيمياء", defaultCoeff: 7 },
      { nameAr: "علوم الطبيعة والحياة", defaultCoeff: 2 },
      { nameAr: "اللغة الفرنسية", defaultCoeff: 2 },
      { nameAr: "اللغة الإنجليزية", defaultCoeff: 2 },
      { nameAr: "التاريخ والجغرافيا", defaultCoeff: 1 },
      { nameAr: "الفلسفة", defaultCoeff: 2 },
      { nameAr: "التربية الإسلامية", defaultCoeff: 1 },
      { nameAr: "التربية البدنية والرياضية", defaultCoeff: 1 },
    ],
  },
  {
    id: "tech-math",
    nameAr: "تقني رياضي",
    nameFr: "Technique Mathématique",
    subjects: [
      { nameAr: "اللغة العربية وآدابها", defaultCoeff: 3 },
      { nameAr: "الرياضيات", defaultCoeff: 6 },
      { nameAr: "الفيزياء والكيمياء", defaultCoeff: 4 },
      { nameAr: "التكنولوجيا", defaultCoeff: 8 },
      { nameAr: "اللغة الفرنسية", defaultCoeff: 2 },
      { nameAr: "اللغة الإنجليزية", defaultCoeff: 2 },
      { nameAr: "التاريخ والجغرافيا", defaultCoeff: 1 },
      { nameAr: "الفلسفة", defaultCoeff: 2 },
      { nameAr: "التربية الإسلامية", defaultCoeff: 1 },
      { nameAr: "التربية البدنية والرياضية", defaultCoeff: 1 },
    ],
  },
  {
    id: "gestion",
    nameAr: "تسيير واقتصاد",
    nameFr: "Gestion et Économie",
    subjects: [
      { nameAr: "اللغة العربية وآدابها", defaultCoeff: 3 },
      { nameAr: "الرياضيات", defaultCoeff: 4 },
      { nameAr: "اقتصاد وإدارة المؤسسات", defaultCoeff: 6 },
      { nameAr: "المحاسبة والمالية", defaultCoeff: 5 },
      { nameAr: "القانون", defaultCoeff: 3 },
      { nameAr: "اللغة الفرنسية", defaultCoeff: 2 },
      { nameAr: "اللغة الإنجليزية", defaultCoeff: 2 },
      { nameAr: "التاريخ والجغرافيا", defaultCoeff: 1 },
      { nameAr: "الفلسفة", defaultCoeff: 1 },
      { nameAr: "التربية الإسلامية", defaultCoeff: 1 },
      { nameAr: "التربية البدنية والرياضية", defaultCoeff: 1 },
    ],
  },
  {
    id: "lettres-philo",
    nameAr: "آداب وفلسفة",
    nameFr: "Lettres et Philosophie",
    subjects: [
      { nameAr: "اللغة العربية وآدابها", defaultCoeff: 5 },
      { nameAr: "الفلسفة", defaultCoeff: 6 },
      { nameAr: "التاريخ والجغرافيا", defaultCoeff: 5 },
      { nameAr: "الرياضيات", defaultCoeff: 2 },
      { nameAr: "اللغة الفرنسية", defaultCoeff: 3 },
      { nameAr: "اللغة الإنجليزية", defaultCoeff: 2 },
      { nameAr: "التربية الإسلامية", defaultCoeff: 2 },
      { nameAr: "التربية البدنية والرياضية", defaultCoeff: 1 },
    ],
  },
  {
    id: "lettres-langues",
    nameAr: "لغات أجنبية",
    nameFr: "Lettres et Langues Étrangères",
    subjects: [
      { nameAr: "اللغة العربية وآدابها", defaultCoeff: 4 },
      { nameAr: "اللغة الفرنسية", defaultCoeff: 5 },
      { nameAr: "اللغة الإنجليزية", defaultCoeff: 5 },
      { nameAr: "اللغة الأجنبية الثالثة", defaultCoeff: 4 },
      { nameAr: "التاريخ والجغرافيا", defaultCoeff: 3 },
      { nameAr: "الفلسفة", defaultCoeff: 2 },
      { nameAr: "التربية الإسلامية", defaultCoeff: 2 },
      { nameAr: "التربية البدنية والرياضية", defaultCoeff: 1 },
    ],
  },
];

// ── Countdown hook ────────────────────────────────────────────────────────
function useCountdown(target: Date) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    const totalSec = Math.floor(diff / 1000);
    return {
      days: Math.floor(totalSec / 86400),
      weeks: Math.floor(totalSec / 604800),
      hours: Math.floor((totalSec % 86400) / 3600),
      minutes: Math.floor((totalSec % 3600) / 60),
      seconds: totalSec % 60,
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

// ── Row state ─────────────────────────────────────────────────────────────
interface Row {
  nameAr: string;
  coeff: number;
  grade: string; // free text, parsed to float
}

function initRows(branch: Branch): Row[] {
  return branch.subjects.map((s) => ({
    nameAr: s.nameAr,
    coeff: s.defaultCoeff,
    grade: "",
  }));
}

// ── Countdown unit card ───────────────────────────────────────────────────
function CountUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/15 backdrop-blur rounded-xl px-3 py-2 min-w-[52px] text-center">
        <span className="text-2xl sm:text-3xl font-extrabold tabular-nums leading-none">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-white/70 text-[10px] mt-1 font-medium">{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
export default function GradeCalculator() {
  const countdown = useCountdown(BAC_DATE);
  const [branchId, setBranchId] = useState<string>(BRANCHES[0].id);
  const [rows, setRows] = useState<Row[]>(() => initRows(BRANCHES[0]));
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const branch = BRANCHES.find((b) => b.id === branchId)!;

  const switchBranch = (id: string) => {
    setBranchId(id);
    setRows(initRows(BRANCHES.find((b) => b.id === id)!));
    setDropdownOpen(false);
  };

  const setCoeff = (i: number, delta: number) =>
    setRows((prev) =>
      prev.map((r, idx) =>
        idx === i ? { ...r, coeff: Math.max(0, r.coeff + delta) } : r
      )
    );

  const setGrade = (i: number, val: string) =>
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, grade: val } : r))
    );

  // Calculate average
  const result = (() => {
    let wSum = 0,
      cSum = 0;
    for (const r of rows) {
      const g = parseFloat(r.grade);
      if (!isNaN(g) && r.coeff > 0) {
        wSum += g * r.coeff;
        cSum += r.coeff;
      }
    }
    if (cSum === 0) return null;
    return parseFloat((wSum / cSum).toFixed(2));
  })();

  const pass = result !== null && result >= 10;
  const filledCount = rows.filter((r) => r.grade !== "").length;

  return (
    <div className="space-y-4 animate-in fade-in duration-500" dir="rtl">

      {/* ── Countdown Banner ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-l from-emerald-700 to-primary rounded-2xl p-4 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-300 shrink-0" />
            <div>
              <p className="font-extrabold text-base leading-tight">عداد البكالوريا 2027</p>
              <p className="text-white/60 text-xs" dir="ltr">07 Jun 2027 — 08:00 AM</p>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <CountUnit value={countdown.weeks} label="أسبوع" />
            <CountUnit value={countdown.days % 7} label="يوم" />
            <CountUnit value={countdown.hours} label="ساعة" />
            <CountUnit value={countdown.minutes} label="دقيقة" />
            <CountUnit value={countdown.seconds} label="ثانية" />
          </div>
        </div>
      </div>

      {/* ── Main Grid: selector + table + result ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">

        {/* Left: Branch + Subjects ─────────────────────────────────── */}
        <div className="space-y-3">

          {/* Branch Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between text-right font-bold hover:border-primary/50 transition-colors shadow-sm"
            >
              <span className="text-base">{branch.nameAr}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground" dir="ltr">{branch.nameFr}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </div>
            </button>
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 left-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden"
                >
                  {BRANCHES.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => switchBranch(b.id)}
                      className={`w-full px-4 py-3 text-right flex items-center justify-between hover:bg-muted transition-colors ${b.id === branchId ? "bg-primary/10 text-primary font-bold" : ""}`}
                    >
                      <span className="font-semibold">{b.nameAr}</span>
                      <span className="text-xs text-muted-foreground" dir="ltr">{b.nameFr}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Subjects Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-[1fr_auto_88px] sm:grid-cols-[1fr_auto_112px] gap-x-2 px-3 py-2 bg-muted border-b text-xs font-bold text-muted-foreground">
              <span>المادة</span>
              <span className="text-center w-20 sm:w-24">المعامل</span>
              <span className="text-center">العلامة / 20</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border">
              {rows.map((row, i) => (
                <div
                  key={row.nameAr}
                  className="grid grid-cols-[1fr_auto_88px] sm:grid-cols-[1fr_auto_112px] gap-x-2 px-3 py-2 items-center"
                >
                  {/* Subject name */}
                  <span className="text-sm font-medium leading-tight">{row.nameAr}</span>

                  {/* Coefficient +/- */}
                  <div className="flex items-center gap-1 w-20 sm:w-24 justify-center">
                    <button
                      onClick={() => setCoeff(i, -1)}
                      className="w-7 h-7 rounded-lg bg-muted hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-600 font-bold text-base transition-colors flex items-center justify-center leading-none"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-bold tabular-nums select-none">
                      {row.coeff}
                    </span>
                    <button
                      onClick={() => setCoeff(i, +1)}
                      className="w-7 h-7 rounded-lg bg-muted hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-muted-foreground hover:text-emerald-600 font-bold text-base transition-colors flex items-center justify-center leading-none"
                    >
                      +
                    </button>
                  </div>

                  {/* Grade input */}
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.25"
                    placeholder="—"
                    value={row.grade}
                    onChange={(e) => setGrade(i, e.target.value)}
                    className="w-full h-8 rounded-lg border border-border bg-background text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors tabular-nums"
                    dir="ltr"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Result Card ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Average Result */}
          <div
            className={`rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-3 border-2 transition-all shadow-sm min-h-[200px] ${
              result === null
                ? "bg-card border-border"
                : pass
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400"
                : "bg-red-50 dark:bg-red-900/20 border-red-400"
            }`}
          >
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              المعدل الإجمالي
            </p>

            {result !== null ? (
              <>
                <p
                  className={`text-6xl font-extrabold tabular-nums ${
                    pass ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {result.toFixed(2)}
                </p>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${
                  pass
                    ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                    : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                }`}>
                  {pass ? (
                    <><CheckCircle2 className="w-4 h-4" /> ناجح ✅</>
                  ) : (
                    <><XCircle className="w-4 h-4" /> راسب ❌</>
                  )}
                </div>
              </>
            ) : (
              <p className="text-5xl font-extrabold text-muted-foreground/40">—</p>
            )}

            <p className="text-xs text-muted-foreground">
              {filledCount} / {rows.length} مادة مُدخلة
            </p>
          </div>

          {/* Progress per subject */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-2 shadow-sm">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              تفصيل العلامات
            </p>
            {rows.map((r) => {
              const g = parseFloat(r.grade);
              const valid = !isNaN(g);
              const pct = valid ? Math.min(100, (g / 20) * 100) : 0;
              return (
                <div key={r.nameAr} className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground truncate max-w-[60%]">{r.nameAr}</span>
                    <span className={`text-xs font-bold tabular-nums ${valid ? (g >= 10 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500") : "text-muted-foreground"}`}>
                      {valid ? `${g}/20` : "—"}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        !valid ? "w-0" : g >= 10 ? "bg-emerald-500" : "bg-red-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Formula note */}
          <div className="bg-muted rounded-xl px-4 py-3 text-xs text-muted-foreground space-y-1" dir="ltr">
            <p className="font-bold text-center text-foreground/60 mb-1">Formula</p>
            <p className="text-center font-mono">Σ(grade × coeff) ÷ Σ(coeff)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
