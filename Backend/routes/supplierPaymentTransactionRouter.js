import express from 'express';
import {
    getSupplierPayments,
    addSupplierPayment,
    deleteSupplierPayment,
    getSupplierPaymentsByEmail,
    getSupplierPaymentStats
} from '../controllers/supplierpaymentTransactionController.js';

const supplierPaymentTransactionRouter = express.Router();

// Base path: /api/supplier-payments

supplierPaymentTransactionRouter.get('/', getSupplierPayments);
supplierPaymentTransactionRouter.get('/all', getSupplierPaymentsByEmail); // Frontend expects /all
supplierPaymentTransactionRouter.get('/stats', getSupplierPaymentStats); // Frontend expects /stats
supplierPaymentTransactionRouter.post('/', addSupplierPayment);
supplierPaymentTransactionRouter.delete('/:id', deleteSupplierPayment);

export default supplierPaymentTransactionRouter;