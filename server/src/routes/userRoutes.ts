import { Router } from "express";
import { getUsers } from "../controllers/userController";
import { getUser } from "../controllers/userController";
import { postUser } from "../controllers/userController";

const router = Router();

router.get("/",getUsers);
router.get("/:cognitoId", getUser);
router.post("/", postUser);
export default router;