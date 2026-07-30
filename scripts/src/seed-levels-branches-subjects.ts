/**
 * Seed script: populates levels, branches, and subjects from the original
 * hardcoded branch-data.ts so the DB matches what students previously saw.
 *
 * Run: pnpm tsx scripts/seed-levels-branches-subjects.ts
 */
import { db, levelsTable, branchesTable, subjectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🌱 Seeding levels, branches, and subjects…");

  // ── 1. Levels ───────────────────────────────────────────────────────────
  const levelDefs = [
    { nameAr: "السنة الأولى ثانوي", nameFr: "1ère Secondaire", code: "premiere", sortOrder: 1 },
    { nameAr: "السنة الثانية ثانوي", nameFr: "2ème Secondaire", code: "deuxieme", sortOrder: 2 },
    { nameAr: "السنة الثالثة ثانوي (BAC)", nameFr: "3ème Secondaire (BAC)", code: "troisieme", sortOrder: 3 },
  ];

  const levels: Record<string, number> = {};
  for (const lv of levelDefs) {
    const existing = await db.select().from(levelsTable).where(eq(levelsTable.code, lv.code));
    if (existing.length > 0) {
      levels[lv.code] = existing[0].id;
      console.log(`  ✓ Level "${lv.code}" already exists (id=${existing[0].id})`);
    } else {
      const [row] = await db.insert(levelsTable).values(lv).returning();
      levels[lv.code] = row.id;
      console.log(`  ✨ Created level "${lv.code}" (id=${row.id})`);
    }
  }

  // ── 2. Branches ─────────────────────────────────────────────────────────
  const branchDefs = [
    // Première ثانوي
    {
      code: "tronc-sciences",
      nameAr: "جذع مشترك علوم",
      nameFr: "Tronc Commun Sciences",
      levelCodes: ["premiere"],
      sortOrder: 1,
    },
    {
      code: "tronc-lettres",
      nameAr: "جذع مشترك آداب",
      nameFr: "Tronc Commun Lettres",
      levelCodes: ["premiere"],
      sortOrder: 2,
    },
    // Deuxième & Troisième ثانوي
    {
      code: "sciences-exp",
      nameAr: "علوم تجريبية",
      nameFr: "Sciences Expérimentales",
      levelCodes: ["deuxieme", "troisieme"],
      sortOrder: 3,
    },
    {
      code: "math",
      nameAr: "رياضيات",
      nameFr: "Mathématiques",
      levelCodes: ["deuxieme", "troisieme"],
      sortOrder: 4,
    },
    {
      code: "tech-math",
      nameAr: "تقني رياضي",
      nameFr: "Technique Mathématique",
      levelCodes: ["deuxieme", "troisieme"],
      sortOrder: 5,
    },
    {
      code: "gestion",
      nameAr: "تسيير واقتصاد",
      nameFr: "Gestion et Économie",
      levelCodes: ["deuxieme", "troisieme"],
      sortOrder: 6,
    },
    {
      code: "lettres-philo",
      nameAr: "آداب وفلسفة",
      nameFr: "Lettres et Philosophie",
      levelCodes: ["deuxieme", "troisieme"],
      sortOrder: 7,
    },
    {
      code: "lettres-langues",
      nameAr: "آداب ولغات أجنبية",
      nameFr: "Lettres et Langues Étrangères",
      levelCodes: ["deuxieme", "troisieme"],
      sortOrder: 8,
    },
  ];

  const branchIds: Record<string, number> = {};
  for (const br of branchDefs) {
    const existing = await db
      .select()
      .from(branchesTable)
      .where(eq(branchesTable.code, br.code));

    const ids = br.levelCodes.map((c) => levels[c]);
    if (existing.length > 0) {
      branchIds[br.code] = existing[0].id;
      console.log(`  ✓ Branch "${br.code}" already exists (id=${existing[0].id})`);
    } else {
      const [row] = await db
        .insert(branchesTable)
        .values({
          code: br.code,
          nameAr: br.nameAr,
          nameFr: br.nameFr,
          levelId: ids[0],
          levelIds: ids,
          sortOrder: br.sortOrder,
        })
        .returning();
      branchIds[br.code] = row.id;
      console.log(`  ✨ Created branch "${br.code}" (id=${row.id})`);
    }
  }

  // ── 3. Subjects ─────────────────────────────────────────────────────────
  // branchId=null  → subject applies to ALL branches of that grade
  // branchId=X     → subject specific to one branch
  //
  // Subjects that appear in 3+ branches of a grade → branchId=null
  // Subjects specific to 1-2 branches → branchId set accordingly

  type SubjectSeed = {
    name: string;
    nameAr: string;
    nameFr: string;
    grade: string;
    branchCode?: string; // undefined = all branches (null in DB)
    color: string;
    icon: string;
  };

  const subjects: SubjectSeed[] = [
    // ── Première (premiere) ──────────────────────────────────────────────
    // Both tronc-sciences AND tronc-lettres → branchId=null
    { name: "Arabic", nameAr: "اللغة العربية", nameFr: "Langue Arabe", grade: "premiere", color: "#16a34a", icon: "📖" },
    { name: "Math", nameAr: "الرياضيات", nameFr: "Mathématiques", grade: "premiere", color: "#2563eb", icon: "🧮" },
    { name: "French", nameAr: "اللغة الفرنسية", nameFr: "Langue Française", grade: "premiere", color: "#4f46e5", icon: "🌍" },
    { name: "English", nameAr: "اللغة الإنجليزية", nameFr: "Langue Anglaise", grade: "premiere", color: "#0284c7", icon: "🌎" },
    { name: "History", nameAr: "التاريخ والجغرافيا", nameFr: "Histoire et Géographie", grade: "premiere", color: "#b45309", icon: "🗺️" },
    { name: "Philosophy", nameAr: "الفلسفة", nameFr: "Philosophie", grade: "premiere", color: "#db2777", icon: "🧠" },
    { name: "Islamic", nameAr: "العلوم الإسلامية", nameFr: "Sciences Islamiques", grade: "premiere", color: "#0d9488", icon: "⭐" },
    { name: "Amazigh", nameAr: "اللغة الأمازيغية", nameFr: "Langue Amazighe", grade: "premiere", color: "#ea580c", icon: "⛰️" },
    // tronc-sciences only
    { name: "Physics", nameAr: "العلوم الفيزيائية", nameFr: "Sciences Physiques", grade: "premiere", branchCode: "tronc-sciences", color: "#7c3aed", icon: "⚛️" },
    { name: "Biology", nameAr: "العلوم الطبيعية والحياة", nameFr: "Sciences de la Nature et de la Vie", grade: "premiere", branchCode: "tronc-sciences", color: "#059669", icon: "🍃" },

    // ── Deuxième (deuxieme) ──────────────────────────────────────────────
    // Common to all 6 branches → branchId=null
    { name: "Arabic", nameAr: "اللغة العربية", nameFr: "Langue Arabe", grade: "deuxieme", color: "#16a34a", icon: "📖" },
    { name: "Math", nameAr: "الرياضيات", nameFr: "Mathématiques", grade: "deuxieme", color: "#2563eb", icon: "🧮" },
    { name: "French", nameAr: "اللغة الفرنسية", nameFr: "Langue Française", grade: "deuxieme", color: "#4f46e5", icon: "🌍" },
    { name: "English", nameAr: "اللغة الإنجليزية", nameFr: "Langue Anglaise", grade: "deuxieme", color: "#0284c7", icon: "🌎" },
    { name: "History", nameAr: "التاريخ والجغرافيا", nameFr: "Histoire et Géographie", grade: "deuxieme", color: "#b45309", icon: "🗺️" },
    { name: "Philosophy", nameAr: "الفلسفة", nameFr: "Philosophie", grade: "deuxieme", color: "#db2777", icon: "🧠" },
    { name: "Islamic", nameAr: "العلوم الإسلامية", nameFr: "Sciences Islamiques", grade: "deuxieme", color: "#0d9488", icon: "⭐" },
    { name: "Amazigh", nameAr: "اللغة الأمازيغية", nameFr: "Langue Amazighe", grade: "deuxieme", color: "#ea580c", icon: "⛰️" },
    // Sciences (appears in 3 branches) → branchId=null
    { name: "Physics", nameAr: "العلوم الفيزيائية", nameFr: "Sciences Physiques", grade: "deuxieme", color: "#7c3aed", icon: "⚛️" },
    // Branch-specific deuxieme
    { name: "Biology (exp)", nameAr: "العلوم الطبيعية والحياة", nameFr: "Sciences de la Nature et de la Vie", grade: "deuxieme", branchCode: "sciences-exp", color: "#059669", icon: "🍃" },
    { name: "Biology", nameAr: "العلوم الطبيعية", nameFr: "Sciences Naturelles", grade: "deuxieme", branchCode: "math", color: "#059669", icon: "🌱" },
    { name: "Technology", nameAr: "التكنولوجيا", nameFr: "Technologie", grade: "deuxieme", branchCode: "tech-math", color: "#0891b2", icon: "💻" },
    { name: "Economics", nameAr: "الاقتصاد والمانجمنت", nameFr: "Économie et Management", grade: "deuxieme", branchCode: "gestion", color: "#7c3aed", icon: "📈" },
    { name: "Accounting", nameAr: "المحاسبة والمالية", nameFr: "Comptabilité et Finance", grade: "deuxieme", branchCode: "gestion", color: "#ca8a04", icon: "🧾" },
    { name: "Law", nameAr: "القانون", nameFr: "Droit", grade: "deuxieme", branchCode: "gestion", color: "#b91c1c", icon: "⚖️" },
    { name: "Arabic Lit (lettres-philo)", nameAr: "الأدب العربي", nameFr: "Littérature Arabe", grade: "deuxieme", branchCode: "lettres-philo", color: "#16a34a", icon: "📝" },
    { name: "Arabic Lit (lettres-langues)", nameAr: "الأدب العربي", nameFr: "Littérature Arabe", grade: "deuxieme", branchCode: "lettres-langues", color: "#16a34a", icon: "📝" },

    // ── Troisième (troisieme) ────────────────────────────────────────────
    // Common
    { name: "Arabic", nameAr: "اللغة العربية", nameFr: "Langue Arabe", grade: "troisieme", color: "#16a34a", icon: "📖" },
    { name: "Math", nameAr: "الرياضيات", nameFr: "Mathématiques", grade: "troisieme", color: "#2563eb", icon: "🧮" },
    { name: "French", nameAr: "اللغة الفرنسية", nameFr: "Langue Française", grade: "troisieme", color: "#4f46e5", icon: "🌍" },
    { name: "English", nameAr: "اللغة الإنجليزية", nameFr: "Langue Anglaise", grade: "troisieme", color: "#0284c7", icon: "🌎" },
    { name: "History", nameAr: "التاريخ والجغرافيا", nameFr: "Histoire et Géographie", grade: "troisieme", color: "#b45309", icon: "🗺️" },
    { name: "Philosophy", nameAr: "الفلسفة", nameFr: "Philosophie", grade: "troisieme", color: "#db2777", icon: "🧠" },
    { name: "Islamic", nameAr: "العلوم الإسلامية", nameFr: "Sciences Islamiques", grade: "troisieme", color: "#0d9488", icon: "⭐" },
    { name: "Amazigh", nameAr: "اللغة الأمازيغية", nameFr: "Langue Amazighe", grade: "troisieme", color: "#ea580c", icon: "⛰️" },
    { name: "Physics", nameAr: "العلوم الفيزيائية", nameFr: "Sciences Physiques", grade: "troisieme", color: "#7c3aed", icon: "⚛️" },
    // Branch-specific troisieme
    { name: "Biology (exp)", nameAr: "العلوم الطبيعية والحياة", nameFr: "Sciences de la Nature et de la Vie", grade: "troisieme", branchCode: "sciences-exp", color: "#059669", icon: "🍃" },
    { name: "Biology", nameAr: "العلوم الطبيعية", nameFr: "Sciences Naturelles", grade: "troisieme", branchCode: "math", color: "#059669", icon: "🌱" },
    { name: "Technology", nameAr: "التكنولوجيا", nameFr: "Technologie", grade: "troisieme", branchCode: "tech-math", color: "#0891b2", icon: "💻" },
    { name: "Economics", nameAr: "الاقتصاد والمانجمنت", nameFr: "Économie et Management", grade: "troisieme", branchCode: "gestion", color: "#7c3aed", icon: "📈" },
    { name: "Accounting", nameAr: "المحاسبة والمالية", nameFr: "Comptabilité et Finance", grade: "troisieme", branchCode: "gestion", color: "#ca8a04", icon: "🧾" },
    { name: "Law", nameAr: "القانون", nameFr: "Droit", grade: "troisieme", branchCode: "gestion", color: "#b91c1c", icon: "⚖️" },
    { name: "Arabic Lit (lettres-philo)", nameAr: "الأدب العربي", nameFr: "Littérature Arabe", grade: "troisieme", branchCode: "lettres-philo", color: "#16a34a", icon: "📝" },
    { name: "Arabic Lit (lettres-langues)", nameAr: "الأدب العربي", nameFr: "Littérature Arabe", grade: "troisieme", branchCode: "lettres-langues", color: "#16a34a", icon: "📝" },
  ];

  let created = 0;
  let skipped = 0;

  for (const s of subjects) {
    const branchId = s.branchCode ? branchIds[s.branchCode] : null;

    // Skip if a subject with same nameAr + grade + branchId already exists
    const existing = await db
      .select()
      .from(subjectsTable)
      .where(eq(subjectsTable.nameAr, s.nameAr));

    const duplicate = existing.find(
      (e) => e.grade === s.grade && e.branchId === branchId
    );

    if (duplicate) {
      skipped++;
      continue;
    }

    await db.insert(subjectsTable).values({
      name: s.name,
      nameAr: s.nameAr,
      nameFr: s.nameFr,
      grade: s.grade,
      branchId,
      color: s.color,
      icon: s.icon,
      lessonCount: 0,
    });
    created++;
  }

  console.log(`  ✨ Created ${created} subjects, skipped ${skipped} (already existed)`);
  console.log("✅ Seeding complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
