import { Router, type IRouter } from "express";
import { requireAdmin } from "../../middlewares/admin-auth";
import usersRouter from "./users";
import levelsRouter from "./levels";
import branchesRouter from "./branches";
import subjectsRouter from "./subjects";
import lessonsRouter from "./lessons";
import examsRouter from "./exams";
import testsRouter from "./tests";
import baccalaureatePapersRouter from "./baccalaureates";
import reviewChannelsRouter from "./review-channels";
import announcementsRouter from "./announcements";
import notificationsRouter from "./notifications";
import languageSettingsRouter from "./language-settings";
import dashboardRouter from "./dashboard";
import backupRouter from "./backup";

const router: IRouter = Router();

// All admin routes require super_admin role
router.use(requireAdmin);

router.use("/dashboard", dashboardRouter);
router.use("/backup", backupRouter);
router.use("/users", usersRouter);
router.use("/levels", levelsRouter);
router.use("/branches", branchesRouter);
router.use("/subjects", subjectsRouter);
router.use("/lessons", lessonsRouter);
router.use("/exams", examsRouter);
router.use("/tests", testsRouter);
router.use("/baccalaureates", baccalaureatePapersRouter);
router.use("/review-channels", reviewChannelsRouter);
router.use("/announcements", announcementsRouter);
router.use("/notifications", notificationsRouter);
router.use("/language-settings", languageSettingsRouter);

export default router;
