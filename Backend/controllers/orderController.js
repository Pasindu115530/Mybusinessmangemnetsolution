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
            quotationRef: o.quotationRef || null,
            orderDate: o.date,
            totalAmount: o.total || o.totalCost,
            totalItems: o.items?.length || 0,
            status: o.status.toLowerCase(),
            customerID: o.customerId,
            items: o.items // Include items for tracking
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

        // Increase stock
        const stock = await StockItem.findById(item.productID);
        if (stock) {
            stock.quantity += item.rejectedQuantity;
            await stock.save();
        }

        item.restocked = true;
        await order.save();

        res.status(200).json({ message: "Item restocked successfully", order });
    } catch (error) {
        res.status(500).json({ message: "Error restocking item", error: error.message });
    }
};
