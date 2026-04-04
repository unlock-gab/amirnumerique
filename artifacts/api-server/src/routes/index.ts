import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import servicesRouter from "./services";
import ordersRouter from "./orders";
import quotesRouter from "./quotes";
import portfolioRouter from "./portfolio";
import usersRouter from "./users";
import settingsRouter from "./settings";
import uploadRouter from "./upload";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(servicesRouter);
router.use(ordersRouter);
router.use(quotesRouter);
router.use(portfolioRouter);
router.use(usersRouter);
router.use(settingsRouter);
router.use(uploadRouter);
router.use(statsRouter);

export default router;
