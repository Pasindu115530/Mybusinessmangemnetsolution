import SupplierInvoice from '../models/supplierInvoice.js';

// ==========================================
// 1. GET all supplier invoices (Admin)
// ==========================================
export const getAllSupplierInvoices = async (req, res) => {
    try {
        const invoices = await SupplierInvoice.find().sort({ date: -1 });
        res.status(200).json({ success: true, invoices });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 2. GET invoices for logged-in supplier
// ==========================================
export const getInvoicesBySupplierEmail = async (req, res) => {
    try {
        const supplierEmail = req.user.email;
        const invoices = await SupplierInvoice.find({ supplierEmail }).sort({ date: -1 });
        res.status(200).json({ success: true, invoices });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 3. GET invoice counts by status
// ==========================================
export const getPaidInvoiceCount = async (req, res) => {
    try {
        const email = req.params.email;
        const count = await SupplierInvoice.countDocuments({ supplierEmail: email, payment_status: 'paid' });
        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUnpaidInvoiceCount = async (req, res) => {
    try {
        const email = req.params.email;
        const count = await SupplierInvoice.countDocuments({ supplierEmail: email, payment_status: 'unpaid' });
        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOverdueInvoiceCount = async (req, res) => {
    try {
        const email = req.params.email;
        const count = await SupplierInvoice.countDocuments({ supplierEmail: email, payment_status: 'overdue' });
        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 4. ACCEPT / REJECT supplier invoice payment (Admin)
// ==========================================
export const acceptSupplierPayment = async (req, res) => {
    try {
        const invoice = await SupplierInvoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        invoice.status = 'paid';
        invoice.payment_status = 'paid';
        await invoice.save();
        res.status(200).json({ success: true, message: 'Payment accepted', invoice });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const rejectSupplierPayment = async (req, res) => {
    try {
        const invoice = await SupplierInvoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        invoice.status = 'unpaid';
        invoice.payment_status = 'unpaid';
        invoice.notes = (invoice.notes || '') + '\nAdmin: Payment rejected. Please re-submit.';
        await invoice.save();
        res.status(200).json({ success: true, message: 'Payment rejected', invoice });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 5. SUBMIT PAYMENT PROOF (Supplier)
// ==========================================
export const submitSupplierPaymentProof = async (req, res) => {
    try {
        const { invoiceID } = req.params;
        const { paymentMethod, transactionID, notes } = req.body;
        const paymentProof = req.file ? req.file.path : (req.body.paymentProof || '');

        const invoice = await SupplierInvoice.findOne({ invoiceID });
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

        invoice.paymentMethod = paymentMethod;
        invoice.transactionID = transactionID;
        invoice.paymentProof = paymentProof;
        invoice.notes = notes || invoice.notes;
        invoice.status = 'pending-verification';
        await invoice.save();

        res.json({ success: true, message: 'Payment proof submitted for verification' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// ==========================================
// 6. CREATE INVOICE (Supplier)
// ==========================================
export const createSupplierInvoiceBySupplier = async (req, res) => {
    try {
        const supplierEmail = req.user.email;
        const supplierId = req.user.id;
        const { purchaseOrderRef, items, subtotal, tax_amount, total, due_date, notes } = req.body;

        const invoice = new SupplierInvoice({
            invoiceID: `SINV-${Date.now()}`,
            purchaseOrderRef,
            orderID: purchaseOrderRef,
            supplierId,
            supplierEmail,
            email: supplierEmail,
            date: new Date(),
            due_date,
            total,
            subtotal,
            tax_amount,
            status: 'unpaid',
            payment_status: 'unpaid',
            items: items.map(i => ({
                itemName: i.itemName,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                totalPrice: i.totalPrice
            })),
            notes
        });

        await invoice.save();
        res.status(201).json({ success: true, invoice });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 7. GET INVOICE STATS (Supplier)
// ==========================================
export const getSupplierInvoiceStats = async (req, res) => {
    try {
        const supplierEmail = req.user.email;
        const [total, paid, unpaid, overdue] = await Promise.all([
            SupplierInvoice.countDocuments({ supplierEmail }),
            SupplierInvoice.countDocuments({ supplierEmail, payment_status: 'paid' }),
            SupplierInvoice.countDocuments({ supplierEmail, payment_status: 'unpaid' }),
            SupplierInvoice.countDocuments({ supplierEmail, payment_status: 'overdue' })
        ]);

        res.json({ success: true, stats: { total, paid, unpaid, overdue } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
