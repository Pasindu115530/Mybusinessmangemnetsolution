import express from "express";
import {
  createRequirement,
  getRequirements,
  getStats,
  getRequirementById,
  updateStatus,
  upload,
} from "../controllers/requirementController.js";

const router = express.Router();

router.post("/",                        upload.array("attachedDocument"), createRequirement);
router.get("/",                         getRequirements);
router.get("/stats",                    getStats);
router.get("/:id",                      getRequirementById);
router.patch("/:id/status",             updateStatus);

export default router;
