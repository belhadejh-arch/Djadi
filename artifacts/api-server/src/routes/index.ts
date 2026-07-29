import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import subjectsRouter from "./subjects";
import lessonsRouter from "./lessons";
import dashboardRouter from "./dashboard";
import contentRouter from "./content";
import favoritesRouter from "./favorites";
import activityRouter from "./activity";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(subjectsRouter);
router.use(lessonsRouter);
router.use(dashboardRouter);
router.use("/content", contentRouter);
router.use("/favorites", favoritesRouter);
router.use("/activity", activityRouter);
router.use("/admin", adminRouter);

export default router;
