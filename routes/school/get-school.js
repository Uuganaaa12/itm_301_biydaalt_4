import express from "express";

import {
  createSchool,
  getAllSchools,
  getSchool,
} from "../../controllers/user/school.js";
import { addUsertoSchool } from "../../controllers/user/add-user.js";

const schoolRouter = express.Router();

schoolRouter.post("/schools", createSchool);
schoolRouter.get("/schools", getAllSchools);
schoolRouter.get("/schools/:schoolId", getSchool);
schoolRouter.post("/schools/:schoolId/users", addUsertoSchool);

export default schoolRouter;
