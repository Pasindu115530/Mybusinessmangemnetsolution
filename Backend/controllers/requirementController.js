import Requirement from "../models/requirementModel.js";
import multer from "multer";
import path from "path";

// ── Multer setup for file uploads ──────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
export const upload = multer({ storage });

// ── Create requirement (POST /api/requirements) ───────────────────────────
export const createRequirement = async (req, res) => {
  try {
    const { requirements, customerId } = req.body;
    const attachedDocument = req.files ? req.files.map((f) => f.filename) : [];

    const parsed = typeof requirements === "string" ? JSON.parse(requirements) : requirements;

    const newReq = new Requirement({
      customerId,
      requirements: parsed,
      attachedDocument,
    });

    await newReq.save();
    res.status(201).json({ success: true, requirement: newReq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get all requirements — admin sees all, customer sees own ───────────────
export const getRequirements = async (req, res) => {
  try {
    const { customerId } = req.query;
    const filter = customerId ? { customerId } : {};
    const requirements = await Requirement.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, requirements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Stats (GET /api/requirements/stats) ───────────────────────────────────
export const getStats = async (req, res) => {
  try {
    const { customerId } = req.query;
    const filter = customerId ? { customerId } : {};

    const [total, pending, in_progress, completed, rejected] = await Promise.all([
      Requirement.countDocuments(filter),
      Requirement.countDocuments({ ...filter, status: "pending" }),
      Requirement.countDocuments({ ...filter, status: "in_progress" }),
      Requirement.countDocuments({ ...filter, status: "completed" }),
      Requirement.countDocuments({ ...filter, status: "rejected" }),
    ]);

    res.json({ success: true, stats: { total, pending, in_progress, completed, rejected } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get single requirement by ID ───────────────────────────────────────────
export const getRequirementById = async (req, res) => {
  try {
    const req_ = await Requirement.findById(req.params.id);
    if (!req_) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, requirement: req_ });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Update status (PATCH /api/requirements/:id/status) ───────────────────
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Requirement.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, requirement: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
