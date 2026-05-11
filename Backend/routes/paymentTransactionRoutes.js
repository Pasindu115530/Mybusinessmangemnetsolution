import express from "express";
import {
  getPayments,
  addPayment,
  updatePayment,
  deletePayment,
} from "../controllers/paymentTransactionController.js";

const router = express.Router();

router.get("/getPayments", getPayments);
router.post("/addPayment", addPayment);
router.put("/updatePayment/:id", updatePayment);
router.delete("/deletePayment/:id", deletePayment);

export default router;