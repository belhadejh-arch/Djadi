import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import subjectsRouter from "./subjects";
import lessonsRouter from "./lessons";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(subjectsRouter);
router.use(lessonsRouter);
router.use(dashboardRouter);

export default router;
