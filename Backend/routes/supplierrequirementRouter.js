import express from "express";
import {
    createSupplierRequirement,
    getMySupplierRequirements,
    getSupplierRequirementStats,
    getSupplierRequirementById,
    getAllSuppliersForAdmin,
    getSupplierDashboardStats,
    getRecentSupplierRequirements,
    getRecentSupplierOrders,
    getSupplierPendingPayments
} from "../controllers/supplierRequirementController.js";

const supplierRequirementRouter = express.Router();

// Base path: /api/suppliers

// Dashboard Routes
supplierRequirementRouter.get("/dashboard/stats", getSupplierDashboardStats);
supplierRequirementRouter.get("/dashboard/recent-requirements", getRecentSupplierRequirements);
supplierRequirementRouter.get("/dashboard/recent-orders", getRecentSupplierOrders);
supplierRequirementRouter.get("/dashboard/pending-payments", getSupplierPendingPayments);

// Match frontend expectations
// GET  /api/suppliers/all
supplierRequirementRouter.get("/all", getAllSuppliersForAdmin);

// GET  /api/suppliers/supplier-requirements/my
supplierRequirementRouter.get("/supplier-requirements/my", getMySupplierRequirements);

// POST /api/suppliers/supplier-requirements
supplierRequirementRouter.post("/supplier-requirements", createSupplierRequirement);

// GET  /api/suppliers/requirements/stats
supplierRequirementRouter.get("/requirements/stats", getSupplierRequirementStats);

// GET  /api/suppliers/requirements/:id
supplierRequirementRouter.get("/requirements/:id", getSupplierRequirementById);

export default supplierRequirementRouter;