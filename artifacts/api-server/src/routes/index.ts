import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import levelsRouter from "./levels";
import branchesRouter from "./branches";
import subjectsRouter from "./subjects";
import lessonsRouter from "./lessons";
import dashboardRouter from "./dashboard";
import contentRouter from "./content";
import reviewChannelsRouter from "./review-channels";
import baccalaureatesRouter from "./baccalaureates";
import favoritesRouter from "./favorites";
import activityRouter from "./activity";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(levelsRouter);
router.use(branchesRouter);
router.use(subjectsRouter);
router.use(lessonsRouter);
router.use(dashboardRouter);
router.use(reviewChannelsRouter);
router.use(baccalaureatesRouter);
router.use("/content", contentRouter);
router.use("/favorites", favoritesRouter);
router.use("/activity", activityRouter);
router.use("/admin", adminRouter);

export default router;
