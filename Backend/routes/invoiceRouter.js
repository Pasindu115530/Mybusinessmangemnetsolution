import express from "express"
import { getPaidInvoiceCountByCustomer, getUnpaidInvoiceCountByCustomer, getOverDueInvoiceCountByCustomer, getInvoicesByCustomer, createPaymentForInvoice, createCustomerInvoice, getAllInvoices } from "../controllers/invoiceController.js";
import { uploadPaymentProof } from "../middleware/uploadMiddleware.js";

const invoiceRouter = express.Router()

invoiceRouter.get("/paid-count/:email", getPaidInvoiceCountByCustomer);
invoiceRouter.get("/unpaid-count/:email", getUnpaidInvoiceCountByCustomer);
invoiceRouter.get("/overdue-count/:email", getOverDueInvoiceCountByCustomer);
invoiceRouter.get("/customer/:email", getInvoicesByCustomer);
invoiceRouter.get("/", getAllInvoices);
invoiceRouter.post("/create-from-order/:orderId", createCustomerInvoice);
invoiceRouter.post("/:invoiceID/payment", uploadPaymentProof.single("paymentProof"), createPaymentForInvoice);

export default invoiceRouter