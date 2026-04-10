import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.js";
import {
  getCandidates,
  getCandidate,
  createCandidateController,
  updateCandidateController,
  deleteCandidateController,
} from "../controllers/candidate.controller.js";

const router = express.Router();
router.get("/test", (req, res) => {
  res.send("CANDIDATE ROUTE WORKS");
});
// admin + instructor
router.get("/", authMiddleware, authorize(["admin", "instructor"]), getCandidates);
router.get("/:id", authMiddleware, authorize(["admin", "instructor"]), getCandidate);

// admin only
router.post("/", authMiddleware, authorize(["admin"]), createCandidateController);
router.put("/:id", authMiddleware, authorize(["admin"]), updateCandidateController);
router.delete("/:id", authMiddleware, authorize(["admin"]), deleteCandidateController);

export default router;