/**
 * Seed script — populates levels, branches, and subjects from branch-data.ts
 * Run: NEON_DATABASE_URL=... tsx scripts/seed-catalog.ts
 *
 * Safe to run multiple times: uses INSERT ... ON CONFLICT DO NOTHING
 */

import pg from "pg";

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
if (!connectionString) {
  console.error("❌  DATABASE_URL or NEON_DATABASE_URL must be set");
  process.exit(1);
}

const pool = new Pool({ connectionString });

// ─── Levels ─────────────────────────────────────────────────────────────────

const LEVELS = [
  { code: "premiere",  nameAr: "أولى ثانوي",   nameFr: "1ère Secondaire", sortOrder: 1 },
  { code: "deuxieme",  nameAr: "ثانية ثانوي",  nameFr: "2ème Secondaire", sortOrder: 2 },
  { code: "troisieme", nameAr: "ثالثة ثانوي",  nameFr: "Terminale",        sortOrder: 3 },
];

// ─── Branches (grades is a list of level codes) ──────────────────────────────

const BRANCHES = [
  { code: "tronc-sciences",  nameAr: "جذع مشترك علوم",       nameFr: "Tronc Commun Sciences",          grades: ["premiere"],              sortOrder: 1 },
  { code: "tronc-lettres",   nameAr: "جذع مشترك آداب",       nameFr: "Tronc Commun Lettres",           grades: ["premiere"],              sortOrder: 2 },
  { code: "sciences-exp",    nameAr: "علوم تجريبية",          nameFr: "Sciences Expérimentales",         grades: ["deuxieme", "troisieme"], sortOrder: 3 },
  { code: "math",            nameAr: "رياضيات",               nameFr: "Mathématiques",                   grades: ["deuxieme", "troisieme"], sortOrder: 4 },
  { code: "tech-math",       nameAr: "تقني رياضي",            nameFr: "Technique Mathématique",          grades: ["deuxieme", "troisieme"], sortOrder: 5 },
  { code: "gestion",         nameAr: "تسيير واقتصاد",         nameFr: "Gestion et Économie",             grades: ["deuxieme", "troisieme"], sortOrder: 6 },
  { code: "lettres-philo",   nameAr: "آداب وفلسفة",           nameFr: "Lettres et Philosophie",          grades: ["deuxieme", "troisieme"], sortOrder: 7 },
  { code: "lettres-langues", nameAr: "آداب ولغات أجنبية",    nameFr: "Lettres et Langues Étrangères",   grades: ["deuxieme", "troisieme"], sortOrder: 8 },
];

// ─── Subjects per branch code ─────────────────────────────────────────────────
// Each entry: { key, name, nameAr, nameFr, color, icon }
// Will be inserted once per grade that the branch covers.

const BRANCH_SUBJECTS: Record<string, { key: string; name: string; nameAr: string; nameFr: string; color: string; icon: string }[]> = {
  "tronc-sciences": [
    { key: "arabic",    name: "arabic",    nameAr: "اللغة العربية",             nameFr: "Langue Arabe",                             color: "#16a34a", icon: "📖" },
    { key: "math",      name: "math",      nameAr: "الرياضيات",                 nameFr: "Mathématiques",                             color: "#2563eb", icon: "🔢" },
    { key: "physics",   name: "physics",   nameAr: "العلوم الفيزيائية",         nameFr: "Sciences Physiques",                        color: "#7c3aed", icon: "⚛️" },
    { key: "biology",   name: "biology",   nameAr: "العلوم الطبيعية والحياة",   nameFr: "Sciences de la Nature et de la Vie",        color: "#059669", icon: "🌿" },
    { key: "french",    name: "french",    nameAr: "اللغة الفرنسية",            nameFr: "Langue Française",                          color: "#4f46e5", icon: "🌍" },
    { key: "english",   name: "english",   nameAr: "اللغة الإنجليزية",          nameFr: "Langue Anglaise",                           color: "#0284c7", icon: "🌐" },
    { key: "history",   name: "history",   nameAr: "التاريخ والجغرافيا",        nameFr: "Histoire et Géographie",                    color: "#b45309", icon: "🗺️" },
    { key: "philo",     name: "philo",     nameAr: "الفلسفة",                   nameFr: "Philosophie",                               color: "#db2777", icon: "🧠" },
    { key: "islamic",   name: "islamic",   nameAr: "العلوم الإسلامية",          nameFr: "Sciences Islamiques",                       color: "#0d9488", icon: "⭐" },
    { key: "amazigh",   name: "amazigh",   nameAr: "اللغة الأمازيغية",          nameFr: "Langue Amazighe",                           color: "#ea580c", icon: "🏔️" },
  ],
  "tronc-lettres": [
    { key: "arabic",    name: "arabic",    nameAr: "اللغة العربية",             nameFr: "Langue Arabe",                              color: "#16a34a", icon: "📖" },
    { key: "math",      name: "math",      nameAr: "الرياضيات",                 nameFr: "Mathématiques",                             color: "#2563eb", icon: "🔢" },
    { key: "french",    name: "french",    nameAr: "اللغة الفرنسية",            nameFr: "Langue Française",                          color: "#4f46e5", icon: "🌍" },
    { key: "english",   name: "english",   nameAr: "اللغة الإنجليزية",          nameFr: "Langue Anglaise",                           color: "#0284c7", icon: "🌐" },
    { key: "history",   name: "history",   nameAr: "التاريخ والجغرافيا",        nameFr: "Histoire et Géographie",                    color: "#b45309", icon: "🗺️" },
    { key: "philo",     name: "philo",     nameAr: "الفلسفة",                   nameFr: "Philosophie",                               color: "#db2777", icon: "🧠" },
    { key: "islamic",   name: "islamic",   nameAr: "العلوم الإسلامية",          nameFr: "Sciences Islamiques",                       color: "#0d9488", icon: "⭐" },
    { key: "amazigh",   name: "amazigh",   nameAr: "اللغة الأمازيغية",          nameFr: "Langue Amazighe",                           color: "#ea580c", icon: "🏔️" },
  ],
  "sciences-exp": [
    { key: "biology",   name: "biology",   nameAr: "العلوم الطبيعية والحياة",   nameFr: "Sciences de la Nature et de la Vie",        color: "#059669", icon: "🌿" },
    { key: "physics",   name: "physics",   nameAr: "العلوم الفيزيائية",         nameFr: "Sciences Physiques",                        color: "#7c3aed", icon: "⚛️" },
    { key: "math",      name: "math",      nameAr: "الرياضيات",                 nameFr: "Mathématiques",                             color: "#2563eb", icon: "🔢" },
    { key: "arabic",    name: "arabic",    nameAr: "اللغة العربية",             nameFr: "Langue Arabe",                              color: "#16a34a", icon: "📖" },
    { key: "french",    name: "french",    nameAr: "اللغة الفرنسية",            nameFr: "Langue Française",                          color: "#4f46e5", icon: "🌍" },
    { key: "english",   name: "english",   nameAr: "اللغة الإنجليزية",          nameFr: "Langue Anglaise",                           color: "#0284c7", icon: "🌐" },
    { key: "philo",     name: "philo",     nameAr: "الفلسفة",                   nameFr: "Philosophie",                               color: "#db2777", icon: "🧠" },
    { key: "history",   name: "history",   nameAr: "التاريخ والجغرافيا",        nameFr: "Histoire et Géographie",                    color: "#b45309", icon: "🗺️" },
    { key: "islamic",   name: "islamic",   nameAr: "العلوم الإسلامية",          nameFr: "Sciences Islamiques",                       color: "#0d9488", icon: "⭐" },
    { key: "amazigh",   name: "amazigh",   nameAr: "اللغة الأمازيغية",          nameFr: "Langue Amazighe",                           color: "#ea580c", icon: "🏔️" },
  ],
  "math": [
    { key: "biology-s", name: "biology-simple", nameAr: "العلوم الطبيعية",        nameFr: "Sciences Naturelles",                     color: "#059669", icon: "🌿" },
    { key: "physics",   name: "physics",   nameAr: "العلوم الفيزيائية",         nameFr: "Sciences Physiques",                        color: "#7c3aed", icon: "⚛️" },
    { key: "math",      name: "math",      nameAr: "الرياضيات",                 nameFr: "Mathématiques",                             color: "#2563eb", icon: "🔢" },
    { key: "arabic",    name: "arabic",    nameAr: "اللغة العربية",             nameFr: "Langue Arabe",                              color: "#16a34a", icon: "📖" },
    { key: "french",    name: "french",    nameAr: "اللغة الفرنسية",            nameFr: "Langue Française",                          color: "#4f46e5", icon: "🌍" },
    { key: "english",   name: "english",   nameAr: "اللغة الإنجليزية",          nameFr: "Langue Anglaise",                           color: "#0284c7", icon: "🌐" },
    { key: "philo",     name: "philo",     nameAr: "الفلسفة",                   nameFr: "Philosophie",                               color: "#db2777", icon: "🧠" },
    { key: "history",   name: "history",   nameAr: "التاريخ والجغرافيا",        nameFr: "Histoire et Géographie",                    color: "#b45309", icon: "🗺️" },
    { key: "islamic",   name: "islamic",   nameAr: "العلوم الإسلامية",          nameFr: "Sciences Islamiques",                       color: "#0d9488", icon: "⭐" },
    { key: "amazigh",   name: "amazigh",   nameAr: "اللغة الأمازيغية",          nameFr: "Langue Amazighe",                           color: "#ea580c", icon: "🏔️" },
  ],
  "tech-math": [
    { key: "tech",      name: "tech",      nameAr: "التكنولوجيا",               nameFr: "Technologie",                               color: "#0891b2", icon: "⚙️" },
    { key: "physics",   name: "physics",   nameAr: "العلوم الفيزيائية",         nameFr: "Sciences Physiques",                        color: "#7c3aed", icon: "⚛️" },
    { key: "math",      name: "math",      nameAr: "الرياضيات",                 nameFr: "Mathématiques",                             color: "#2563eb", icon: "🔢" },
    { key: "arabic",    name: "arabic",    nameAr: "اللغة العربية",             nameFr: "Langue Arabe",                              color: "#16a34a", icon: "📖" },
    { key: "french",    name: "french",    nameAr: "اللغة الفرنسية",            nameFr: "Langue Française",                          color: "#4f46e5", icon: "🌍" },
    { key: "english",   name: "english",   nameAr: "اللغة الإنجليزية",          nameFr: "Langue Anglaise",                           color: "#0284c7", icon: "🌐" },
    { key: "philo",     name: "philo",     nameAr: "الفلسفة",                   nameFr: "Philosophie",                               color: "#db2777", icon: "🧠" },
    { key: "history",   name: "history",   nameAr: "التاريخ والجغرافيا",        nameFr: "Histoire et Géographie",                    color: "#b45309", icon: "🗺️" },
    { key: "islamic",   name: "islamic",   nameAr: "العلوم الإسلامية",          nameFr: "Sciences Islamiques",                       color: "#0d9488", icon: "⭐" },
    { key: "amazigh",   name: "amazigh",   nameAr: "اللغة الأمازيغية",          nameFr: "Langue Amazighe",                           color: "#ea580c", icon: "🏔️" },
  ],
  "gestion": [
    { key: "economics",  name: "economics",  nameAr: "الاقتصاد والمانجمنت",     nameFr: "Économie et Management",                    color: "#7c3aed", icon: "📈" },
    { key: "math",       name: "math",       nameAr: "الرياضيات",               nameFr: "Mathématiques",                             color: "#2563eb", icon: "🔢" },
    { key: "accounting", name: "accounting", nameAr: "المحاسبة والمالية",       nameFr: "Comptabilité et Finance",                   color: "#ca8a04", icon: "🧾" },
    { key: "law",        name: "law",        nameAr: "القانون",                 nameFr: "Droit",                                     color: "#b91c1c", icon: "⚖️" },
    { key: "arabic",     name: "arabic",     nameAr: "اللغة العربية",           nameFr: "Langue Arabe",                              color: "#16a34a", icon: "📖" },
    { key: "french",     name: "french",     nameAr: "اللغة الفرنسية",          nameFr: "Langue Française",                          color: "#4f46e5", icon: "🌍" },
    { key: "english",    name: "english",    nameAr: "اللغة الإنجليزية",        nameFr: "Langue Anglaise",                           color: "#0284c7", icon: "🌐" },
    { key: "history",    name: "history",    nameAr: "التاريخ والجغرافيا",      nameFr: "Histoire et Géographie",                    color: "#b45309", icon: "🗺️" },
    { key: "philo",      name: "philo",      nameAr: "الفلسفة",                 nameFr: "Philosophie",                               color: "#db2777", icon: "🧠" },
    { key: "islamic",    name: "islamic",    nameAr: "العلوم الإسلامية",        nameFr: "Sciences Islamiques",                       color: "#0d9488", icon: "⭐" },
    { key: "amazigh",    name: "amazigh",    nameAr: "اللغة الأمازيغية",        nameFr: "Langue Amazighe",                           color: "#ea580c", icon: "🏔️" },
  ],
  "lettres-philo": [
    { key: "arabic-lit", name: "arabic-lit", nameAr: "الأدب العربي",            nameFr: "Littérature Arabe",                         color: "#16a34a", icon: "📖" },
    { key: "philo",      name: "philo",      nameAr: "الفلسفة",                 nameFr: "Philosophie",                               color: "#db2777", icon: "🧠" },
    { key: "math",       name: "math",       nameAr: "الرياضيات",               nameFr: "Mathématiques",                             color: "#2563eb", icon: "🔢" },
    { key: "history",    name: "history",    nameAr: "التاريخ والجغرافيا",      nameFr: "Histoire et Géographie",                    color: "#b45309", icon: "🗺️" },
    { key: "french",     name: "french",     nameAr: "اللغة الفرنسية",          nameFr: "Langue Française",                          color: "#4f46e5", icon: "🌍" },
    { key: "english",    name: "english",    nameAr: "اللغة الإنجليزية",        nameFr: "Langue Anglaise",                           color: "#0284c7", icon: "🌐" },
    { key: "islamic",    name: "islamic",    nameAr: "العلوم الإسلامية",        nameFr: "Sciences Islamiques",                       color: "#0d9488", icon: "⭐" },
    { key: "amazigh",    name: "amazigh",    nameAr: "اللغة الأمازيغية",        nameFr: "Langue Amazighe",                           color: "#ea580c", icon: "🏔️" },
  ],
  "lettres-langues": [
    { key: "arabic-lit", name: "arabic-lit", nameAr: "الأدب العربي",            nameFr: "Littérature Arabe",                         color: "#16a34a", icon: "📖" },
    { key: "philo",      name: "philo",      nameAr: "الفلسفة",                 nameFr: "Philosophie",                               color: "#db2777", icon: "🧠" },
    { key: "math",       name: "math",       nameAr: "الرياضيات",               nameFr: "Mathématiques",                             color: "#2563eb", icon: "🔢" },
    { key: "history",    name: "history",    nameAr: "التاريخ والجغرافيا",      nameFr: "Histoire et Géographie",                    color: "#b45309", icon: "🗺️" },
    { key: "french",     name: "french",     nameAr: "اللغة الفرنسية",          nameFr: "Langue Française",                          color: "#4f46e5", icon: "🌍" },
    { key: "english",    name: "english",    nameAr: "اللغة الإنجليزية",        nameFr: "Langue Anglaise",                           color: "#0284c7", icon: "🌐" },
    { key: "third-lang", name: "third-lang", nameAr: "اللغة الأجنبية الثالثة", nameFr: "3ème Langue Étrangère",                     color: "#be185d", icon: "🗣️" },
    { key: "islamic",    name: "islamic",    nameAr: "العلوم الإسلامية",        nameFr: "Sciences Islamiques",                       color: "#0d9488", icon: "⭐" },
    { key: "amazigh",    name: "amazigh",    nameAr: "اللغة الأمازيغية",        nameFr: "Langue Amazighe",                           color: "#ea580c", icon: "🏔️" },
  ],
};

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Insert levels
    console.log("📚 Inserting levels…");
    const levelIdMap: Record<string, number> = {};
    for (const lvl of LEVELS) {
      const res = await client.query(
        `INSERT INTO levels (name_ar, name_fr, code, sort_order)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO UPDATE SET name_ar = EXCLUDED.name_ar, name_fr = EXCLUDED.name_fr, sort_order = EXCLUDED.sort_order
         RETURNING id`,
        [lvl.nameAr, lvl.nameFr, lvl.code, lvl.sortOrder],
      );
      levelIdMap[lvl.code] = res.rows[0].id;
      console.log(`  ✓ ${lvl.nameAr} (id=${res.rows[0].id})`);
    }

    // 2. Insert branches
    console.log("\n🌿 Inserting branches…");
    const branchIdMap: Record<string, number> = {};
    for (const br of BRANCHES) {
      const levelIds = br.grades.map((g) => levelIdMap[g]);
      const primaryLevelId = levelIds[0]; // backward compat column

      // Check if branch already exists (no unique constraint on code yet)
      const existing = await client.query(
        `SELECT id FROM branches WHERE code = $1`,
        [br.code],
      );
      let res;
      if (existing.rows.length > 0) {
        await client.query(
          `UPDATE branches SET name_ar=$1, name_fr=$2, level_id=$3, level_ids=$4, sort_order=$5 WHERE code=$6`,
          [br.nameAr, br.nameFr, primaryLevelId, levelIds, br.sortOrder, br.code],
        );
        res = existing;
      } else {
        res = await client.query(
          `INSERT INTO branches (name_ar, name_fr, code, level_id, level_ids, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`,
          [br.nameAr, br.nameFr, br.code, primaryLevelId, levelIds, br.sortOrder],
        );
      }
      branchIdMap[br.code] = res.rows[0].id;
      console.log(`  ✓ ${br.nameAr} (id=${res.rows[0].id}, grades=${br.grades.join(",")})`);
    }

    // 3. Insert subjects — one row per branch × grade combination
    console.log("\n📝 Inserting subjects…");
    let subjectCount = 0;
    for (const br of BRANCHES) {
      const branchId = branchIdMap[br.code];
      const subjects = BRANCH_SUBJECTS[br.code] ?? [];

      for (const grade of br.grades) {
        for (const subj of subjects) {
          const existingSubj = await client.query(
            `SELECT id FROM subjects WHERE grade=$1 AND branch_id=$2 AND name=$3`,
            [grade, branchId, subj.name],
          );
          if (existingSubj.rows.length === 0) {
            await client.query(
              `INSERT INTO subjects (name, name_ar, name_fr, grade, branch_id, color, icon, lesson_count)
               VALUES ($1, $2, $3, $4, $5, $6, $7, 0)`,
              [subj.name, subj.nameAr, subj.nameFr, grade, branchId, subj.color, subj.icon],
            );
          }
          subjectCount++;
        }
      }
      console.log(`  ✓ ${br.nameAr} — ${subjects.length} subjects × ${br.grades.length} grade(s)`);
    }

    await client.query("COMMIT");
    console.log(`\n✅ Done! Inserted ${Object.keys(levelIdMap).length} levels, ${Object.keys(branchIdMap).length} branches, ~${subjectCount} subjects.`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
