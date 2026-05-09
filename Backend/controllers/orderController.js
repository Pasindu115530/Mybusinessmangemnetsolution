import mongoose from "mongoose";
import Order from "../models/Order.js";
import StockItem from "../models/Stock.js";

// 1. GET: Customer kenekta adala orders tika pamanak ganna (Table eka sandaha)
export const getOrdersByCustomerId = async (req, res) => {
    try {
        const { customerId } = req.params;
        // customerId eka anuwa filter kara aluthma order eka udaata ena se sort kirima
        const orders = await Order.find({ customerId: customerId }).sort({ date: -1 });

        // Frontend eke interface ekata galapena widiyata map kirima
        const mappedOrders = orders.map(o => ({
            _id: o._id,
            orderID: o.orderID,
            email: o.email,
            quotationRef: o.quotationRef || null,
            orderDate: o.date,
            totalAmount: o.total || o.totalCost,
            totalItems: o.items?.length || 0,
            status: o.status.toLowerCase(),
            customerID: o.customerId,
            items: o.items, // Include items for tracking
            invoiced: o.invoiced || false
        }));

        res.status(200).json(mappedOrders);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// 2. GET: Pending Count
export const getPendingOrderCountByCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;
        const count = await Order.countDocuments({ customerId, status: { $regex: /^pending$/i } });
        res.status(200).json({ count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. GET: Processing Count
export const getProcessingOrderCountByCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;
        const count = await Order.countDocuments({ customerId, status: { $regex: /^processing$/i } });
        res.status(200).json({ count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. GET: Dispatched Count
export const getDispatchedOrderCountByCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;
        const count = await Order.countDocuments({ customerId, status: { $regex: /^dispatched$/i } });
        res.status(200).json({ count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. GET: In-Transit Count
export const getInTransitOrderCountByCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;
        const count = await Order.countDocuments({ customerId, status: { $regex: /^in-transit$/i } });
        res.status(200).json({ count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 6. GET: Delivered Count
export const getDeliveredOrderCountByCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;
        const count = await Order.countDocuments({ customerId, status: { $regex: /^delivered$/i } });
        res.status(200).json({ count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all orders for Admin
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ date: -1 });
        
        const mappedOrders = orders.map(o => ({
            id: o.orderID,
            customer: o.name || "Customer",
            email: o.email,
            phonenumber: o.phonenumber,
            address: o.address,
            quotationRef: o.quotationRef || "N/A",
            orderDate: o.date,
            totalItems: o.items?.length || 0,
            totalAmount: o.total || o.totalCost || 0,
            status: o.status.toLowerCase(),
            items: o.items, // Include items for detail view
            _id: o._id
        }));

        res.status(200).json(mappedOrders);
    } catch (error) {
        res.status(500).json({ message: "Orders ලබා ගැනීමට නොහැකි විය", error: error.message });
    }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status: status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: "Error updating status", error: error.message });
    }
};

// Issue items from an order
export const issueOrderItems = async (req, res) => {
    try {
        const { id } = req.params;
        const { issuedItems } = req.body; // Array of { productID, quantityToIssue }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Update issuedQuantity for each item
        issuedItems.forEach(issuedItem => {
            const item = order.items.find(i => i.productID === issuedItem.productID);
            if (item) {
                item.issuedQuantity = (item.issuedQuantity || 0) + issuedItem.quantityToIssue;
                // Cap at ordered quantity
                if (item.issuedQuantity > item.quantity) {
                    item.issuedQuantity = item.quantity;
                }
            }
        });

        // Check if all items are fully issued
        const allIssued = order.items.every(item => (item.issuedQuantity || 0) >= item.quantity);
        if (allIssued) {
            order.status = "dispatched"; // Or "issued"
        } else {
            order.status = "partially-issued";
        }

        await order.save();
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: "Error issuing items", error: error.message });
    }
};
// Confirm delivery by customer
export const confirmOrderDelivery = async (req, res) => {
    try {
        const { id } = req.params;
        const { receivedItems } = req.body; // Array of { productID, receivedQuantity }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        receivedItems.forEach(recItem => {
            const item = order.items.find(i => i.productID === recItem.productID);
            if (item) {
                item.receivedQuantity = recItem.receivedQuantity;
                item.rejectedQuantity = (item.issuedQuantity || 0) - recItem.receivedQuantity;
                if (item.rejectedQuantity < 0) item.rejectedQuantity = 0;
            }
        });

        order.status = "delivered";
        await order.save();
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: "Error confirming delivery", error: error.message });
    }
};

// Restock rejected items by admin
export const restockRejectedItems = async (req, res) => {
    try {
        const { id } = req.params;
        const { productID } = req.body;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const item = order.items.find(i => i.productID === productID);
        if (!item || item.rejectedQuantity <= 0 || item.restocked) {
            return res.status(400).json({ message: "Item not found or already restocked" });
        }

        // Increase stock - try finding by ID first, then by name as fallback
        let stock = null;
        try {
            if (mongoose.Types.ObjectId.isValid(item.productID)) {
                stock = await StockItem.findById(item.productID);
            }
        } catch (e) {
            console.log("Restock: ID lookup failed, trying name...");
        }

        if (!stock) {
            stock = await StockItem.findOne({ item_name: item.name });
        }

        if (stock) {
            stock.quantity += item.rejectedQuantity;
            await stock.save();
            console.log(`Restocked ${item.rejectedQuantity} of ${item.name}`);
        } else {
            console.warn(`Could not find stock item for ${item.name} to restock.`);
            // We still mark as restocked in the order to avoid duplicate attempts
            // but you might want to return an error if stock must be updated.
        }

        item.restocked = true;
        await order.save();

        res.status(200).json({ message: "Item restocked successfully", order });
    } catch (error) {
        res.status(500).json({ message: "Error restocking item", error: error.message });
    }
};

// =============================================================
//   SUPPLIER-SPECIFIC ORDER FUNCTIONS
// =============================================================

// GET: All purchase orders for this supplier
export const getSupplierOrders = async (req, res) => {
    try {
        const supplierEmail = req.user.email;
        const orders = await Order.find({ supplierEmail, orderType: "purchase" }).sort({ date: -1 });
        return res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET: Single purchase order by ID for this supplier
export const getSupplierOrderById = async (req, res) => {
    try {
        const supplierEmail = req.user.email;
        const order = await Order.findOne({ _id: req.params.id, supplierEmail, orderType: "purchase" });
        if (!order) return res.status(404).json({ message: "Order not found" });
        return res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT: Update purchase order status by supplier
export const updateSupplierOrderStatus = async (req, res) => {
    try {
        const supplierEmail = req.user.email;
        const { status } = req.body;
        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, supplierEmail, orderType: "purchase" },
            { status },
            { new: true }
        );
        if (!order) return res.status(404).json({ message: "Order not found" });
        return res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET: Supplier order stats (stat cards)
export const getSupplierOrderStats = async (req, res) => {
    try {
        const supplierEmail = req.user.email;
        const [total, confirmed, dispatched, delivered] = await Promise.all([
            Order.countDocuments({ supplierEmail, orderType: "purchase" }),
            Order.countDocuments({ supplierEmail, orderType: "purchase", status: "confirmed" }),
            Order.countDocuments({ supplierEmail, orderType: "purchase", status: "dispatched" }),
            Order.countDocuments({ supplierEmail, orderType: "purchase", status: "delivered" }),
        ]);
        return res.status(200).json({ success: true, stats: { total, confirmed, dispatched, delivered } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET: All supplier orders as table (with optional status filter)
export const getSupplierOrdersTable = async (req, res) => {
    try {
        const supplierEmail = req.user.email;
        const filter = { supplierEmail, orderType: "purchase" };
        if (req.query.status) filter.status = req.query.status;
        const orders = await Order.find(filter).sort({ date: -1 });
        return res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH: Supplier acknowledges (confirms) a purchase order
export const acknowledgeSupplierOrder = async (req, res) => {
    try {
        const supplierEmail = req.user.email;
        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, supplierEmail, orderType: "purchase", status: "pending" },
            { status: "confirmed" },
            { new: true }
        );
        if (!order) return res.status(404).json({ message: "Order not found or already confirmed" });
        return res.status(200).json({ success: true, message: "Order acknowledged", order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET: Orders ready to dispatch (confirmed, not yet dispatched)
export const getDispatchOrderList = async (req, res) => {
    try {
        const supplierEmail = req.user.email;
        const orders = await Order.find({
            supplierEmail,
            orderType: "purchase",
            status: { $in: ["confirmed", "pending"] },
        }).sort({ date: -1 });
        return res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET: Delivery progress for a specific order
export const getDeliveryProgress = async (req, res) => {
    try {
        const supplierEmail = req.user.email;
        const order = await Order.findOne({ _id: req.params.id, supplierEmail, orderType: "purchase" });
        if (!order) return res.status(404).json({ message: "Order not found" });

        const progress = {
            totalItems:    order.items.length,
            dispatchedItems: order.items.filter(i => (i.issuedQuantity || 0) > 0).length,
            receivedItems: order.items.filter(i => (i.receivedQuantity || 0) > 0).length,
            items: order.items.map(i => ({
                name:             i.name,
                ordered:          i.quantity,
                issued:           i.issuedQuantity  || 0,
                received:         i.receivedQuantity || 0,
                rejected:         i.rejectedQuantity || 0,
            })),
        };
        return res.status(200).json({ success: true, progress });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST: Dispatch a supplier order (mark as dispatched with dispatch details)
export const dispatchSupplierOrder = async (req, res) => {
    try {
        const supplierEmail = req.user.email;
        const { vehicleNumber, driverName, deliveryNotes } = req.body;

        const order = await Order.findOne({ _id: req.params.id, supplierEmail, orderType: "purchase" });
        if (!order) return res.status(404).json({ message: "Order not found" });

        order.status = "dispatched";
        order.dispatchDetails = {
            vehicleNumber: vehicleNumber || "",
            driverName:    driverName    || "",
            dispatchDate:  new Date(),
            deliveryNotes: deliveryNotes || "",
        };

        await order.save();
        return res.status(200).json({ success: true, message: "Order dispatched", order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET: All purchase orders for Admin
export const getAllPurchaseOrders = async (req, res) => {
    try {
        const orders = await Order.find({ orderType: "purchase" }).sort({ date: -1 });
        const mapped = orders.map(o => ({
            id: o._id,
            po_id: o.orderID || "PO-NEW",
            supplier: o.supplierEmail || "Unknown Supplier",
            orderDate: o.date,
            expectedDelivery: o.dispatchDetails?.dispatchDate || "Pending",
            totalItems: o.items?.length || 0,
            totalAmount: o.total || 0,
            status: o.status.toLowerCase(),
            items: o.items
        }));
        return res.status(200).json({ success: true, orders: mapped });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT: Update PO status by Admin
export const updatePurchaseOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!order) return res.status(404).json({ message: "Purchase Order not found" });
        return res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
