/**
 * Admin Statistics route
 * GET /api/admin/stats — comprehensive platform statistics
 */
import { Router, type IRouter, type Request, type Response } from "express";
import { count, eq, sql, desc, isNotNull } from "drizzle-orm";
import {
  db,
  usersTable,
  lessonsTable,
  examsTable,
  testsTable,
  homeworkTable,
  baccalaureatePapersTable,
  subjectsTable,
  branchesTable,
  activityTable,
} from "@workspace/db";

const router: IRouter = Router();

router.get("/", async (_req: Request, res: Response): Promise<void> => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    [totalStudents],
    [activeStudents],
    [totalLessons],
    [totalExams],
    [totalTests],
    [totalHomework],
    [totalBaccalaureates],
    [totalFileViews],
    topSubjectsByVisits,
    topBranchesByActivity,
    viewsByContentType,
    dailyViews,
  ] = await Promise.all([
    // 1. Total students (all roles, but primarily students)
    db.select({ total: count() })
      .from(usersTable)
      .where(eq(usersTable.role, "student")),

    // 2. Active students
    db.select({ total: count() })
      .from(usersTable)
      .where(sql`${usersTable.role} = 'student' AND ${usersTable.isActive} = true`),

    // 3. Content counts
    db.select({ total: count() }).from(lessonsTable),
    db.select({ total: count() }).from(examsTable),
    db.select({ total: count() }).from(testsTable),
    db.select({ total: count() }).from(homeworkTable),
    db.select({ total: count() }).from(baccalaureatePapersTable),

    // 8. Total file views (all activity records)
    db.select({ total: count() }).from(activityTable),

    // 9. Most visited subjects — grouped by cached subjectName in activity
    db.select({
      subjectName: activityTable.subjectName,
      total: count(),
    })
      .from(activityTable)
      .where(isNotNull(activityTable.subjectName))
      .groupBy(activityTable.subjectName)
      .orderBy(desc(count()))
      .limit(8),

    // 10. Most active branches — join activity → lessons → subjects → branches
    db.select({
      branchNameAr: branchesTable.nameAr,
      branchNameFr: branchesTable.nameFr,
      total: count(),
    })
      .from(activityTable)
      .innerJoin(lessonsTable, eq(activityTable.lessonId, lessonsTable.id))
      .innerJoin(subjectsTable, eq(lessonsTable.subjectId, subjectsTable.id))
      .innerJoin(branchesTable, eq(subjectsTable.branchId, branchesTable.id))
      .groupBy(branchesTable.nameAr, branchesTable.nameFr)
      .orderBy(desc(count()))
      .limit(6),

    // Views by content type breakdown
    db.select({
      contentType: activityTable.contentType,
      total: count(),
    })
      .from(activityTable)
      .groupBy(activityTable.contentType)
      .orderBy(desc(count())),

    // Daily views last 14 days
    db.select({
      date: sql<string>`DATE(${activityTable.viewedAt} AT TIME ZONE 'UTC')`,
      total: count(),
    })
      .from(activityTable)
      .where(sql`${activityTable.viewedAt} >= NOW() - INTERVAL '14 days'`)
      .groupBy(sql`DATE(${activityTable.viewedAt} AT TIME ZONE 'UTC')`)
      .orderBy(sql`DATE(${activityTable.viewedAt} AT TIME ZONE 'UTC')`),
  ]);

  res.json({
    counts: {
      totalStudents:      totalStudents?.total  ?? 0,
      activeStudents:     activeStudents?.total  ?? 0,
      totalLessons:       totalLessons?.total    ?? 0,
      totalExams:         totalExams?.total      ?? 0,
      totalTests:         totalTests?.total      ?? 0,
      totalHomework:      totalHomework?.total   ?? 0,
      totalBaccalaureates: totalBaccalaureates?.total ?? 0,
      totalFileViews:     totalFileViews?.total  ?? 0,
    },
    topSubjectsByVisits,
    topBranchesByActivity,
    viewsByContentType,
    dailyViews,
  });
});

export default router;
