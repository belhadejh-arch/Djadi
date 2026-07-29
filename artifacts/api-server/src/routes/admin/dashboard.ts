import { Router, type IRouter, type Request, type Response } from "express";
import { count, eq, gte, sql } from "drizzle-orm";
import {
  db,
  usersTable,
  levelsTable,
  branchesTable,
  subjectsTable,
  lessonsTable,
  examsTable,
  testsTable,
  homeworkTable,
  baccalaureatePapersTable,
  reviewChannelsTable,
  reviewChannelVideosTable,
} from "@workspace/db";

const router: IRouter = Router();

router.get("/stats", async (_req: Request, res: Response): Promise<void> => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    [usersRow],
    [levelsRow],
    [branchesRow],
    [subjectsRow],
    [lessonsRow],
    [pdfRow],
    [videoRow],
    [examsRow],
    [testsRow],
    [bacsRow],
    [channelsRow],
    [channelVideosRow],
    [homeworkRow],
    lessonsByType,
    usersByGrade,
    recentUsers,
    subjectsByLessons,
    dailyRegs,
    monthlyRegs,
  ] = await Promise.all([
    db.select({ total: count() }).from(usersTable),
    db.select({ total: count() }).from(levelsTable),
    db.select({ total: count() }).from(branchesTable),
    db.select({ total: count() }).from(subjectsTable),
    db.select({ total: count() }).from(lessonsTable),
    db.select({ total: count() }).from(lessonsTable).where(eq(lessonsTable.type, "pdf")),
    db.select({ total: count() }).from(lessonsTable).where(eq(lessonsTable.type, "video")),
    db.select({ total: count() }).from(examsTable),
    db.select({ total: count() }).from(testsTable),
    db.select({ total: count() }).from(baccalaureatePapersTable),
    db.select({ total: count() }).from(reviewChannelsTable),
    db.select({ total: count() }).from(reviewChannelVideosTable),
    db.select({ total: count() }).from(homeworkTable),
    db
      .select({ type: lessonsTable.type, total: count() })
      .from(lessonsTable)
      .groupBy(lessonsTable.type),
    db
      .select({ grade: usersTable.grade, total: count() })
      .from(usersTable)
      .groupBy(usersTable.grade),
    db
      .select({
        id: usersTable.id,
        fullName: usersTable.fullName,
        email: usersTable.email,
        grade: usersTable.grade,
        isActive: usersTable.isActive,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .orderBy(sql`${usersTable.createdAt} DESC`)
      .limit(8),
    db
      .select({
        subjectName: subjectsTable.name,
        subjectNameAr: subjectsTable.nameAr,
        total: count(),
      })
      .from(lessonsTable)
      .leftJoin(subjectsTable, eq(lessonsTable.subjectId, subjectsTable.id))
      .groupBy(subjectsTable.name, subjectsTable.nameAr)
      .orderBy(sql`count(*) DESC`)
      .limit(6),
    db
      .select({
        date: sql<string>`DATE(${usersTable.createdAt} AT TIME ZONE 'UTC')`,
        total: count(),
      })
      .from(usersTable)
      .where(gte(usersTable.createdAt, sevenDaysAgo))
      .groupBy(sql`DATE(${usersTable.createdAt} AT TIME ZONE 'UTC')`),
    db
      .select({
        month: sql<string>`TO_CHAR(DATE_TRUNC('month', ${usersTable.createdAt}), 'YYYY-MM')`,
        total: count(),
      })
      .from(usersTable)
      .where(gte(usersTable.createdAt, sixMonthsAgo))
      .groupBy(sql`DATE_TRUNC('month', ${usersTable.createdAt})`),
  ]);

  res.json({
    counts: {
      users: usersRow?.total ?? 0,
      levels: levelsRow?.total ?? 0,
      branches: branchesRow?.total ?? 0,
      subjects: subjectsRow?.total ?? 0,
      lessons: lessonsRow?.total ?? 0,
      pdfs: pdfRow?.total ?? 0,
      videos: videoRow?.total ?? 0,
      exams: examsRow?.total ?? 0,
      tests: testsRow?.total ?? 0,
      baccalaureates: bacsRow?.total ?? 0,
      channels: channelsRow?.total ?? 0,
      channelVideos: channelVideosRow?.total ?? 0,
      homework: homeworkRow?.total ?? 0,
    },
    lessonsByType,
    usersByGrade,
    recentUsers,
    topSubjectsByLessons: subjectsByLessons,
    dailyRegistrations: dailyRegs,
    monthlyRegistrations: monthlyRegs,
  });
});

export default router;
