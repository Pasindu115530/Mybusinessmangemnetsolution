import Finance from '../models/finance.js';
import StockItem from '../models/Stock.js';
import Requirement from '../models/Requirement.js';
import SupplierOrder from '../models/supplierOrder.js';
import mongoose from 'mongoose';

export const getAdminDashboardStats = async (req, res) => {
    try {
        // 1. Financial Stats
        const revenueRes = await Finance.aggregate([
            { $match: { transaction_type: { $in: ['cash_in', 'bank_deposit'] } } },
            { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }
        ]);

        const expensesRes = await Finance.aggregate([
            { $match: { transaction_type: { $in: ['cash_out', 'bank_withdraw'] } } },
            { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }
        ]);

        const totalRevenue = revenueRes[0]?.total || 0;
        const totalExpenses = expensesRes[0]?.total || 0;
        const totalProfit = totalRevenue - totalExpenses;

        // 2. Low Stock Alerts
        const stockItems = await StockItem.find();
        const lowStockAlerts = stockItems.filter(item => item.quantity <= (item.min_quantity || 0)).length;

        // 3. Pending Requests
        const pendingCustomerRequests = await Requirement.countDocuments({ status: 'pending' });
        const pendingSupplierRequests = await SupplierOrder.countDocuments({ status: 'Pending' });

        // 4. Sales Trend (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const salesTrend = await Finance.aggregate([
            { 
                $match: { 
                    transaction_type: { $in: ['cash_in', 'bank_deposit'] },
                    date: { $gte: sixMonthsAgo }
                } 
            },
            {
                $group: {
                    _id: { month: { $month: "$date" }, year: { $year: "$date" } },
                    revenue: { $sum: { $toDouble: "$amount" } }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedSalesTrend = salesTrend.map(item => ({
            month: monthNames[item._id.month - 1],
            revenue: item.revenue
        }));

        // 5. Expense Breakdown
        const expenseBreakdown = await Finance.aggregate([
            { $match: { transaction_type: { $in: ['cash_out', 'bank_withdraw'] } } },
            {
                $group: {
                    _id: "$category",
                    value: { $sum: { $toDouble: "$amount" } }
                }
            }
        ]);

        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899'];
        const formattedExpenses = expenseBreakdown.map((item, idx) => ({
            name: item._id || 'Uncategorized',
            value: item.value,
            color: colors[idx % colors.length]
        }));

        // 6. Recent Activities
        const recentPayments = await Finance.find().sort({ createdAt: -1 }).limit(3);
        const recentOrders = await SupplierOrder.find().sort({ createdAt: -1 }).limit(2);

        const activities = [
            ...recentPayments.map(p => ({
                id: `p-${p._id}`,
                type: p.transaction_type.includes('in') ? 'Payment Received' : 'Payment Made',
                entity: p.description || 'Finance Entry',
                description: p.notes || 'Transaction recorded',
                amount: Number(p.amount.toString()),
                status: 'completed',
                time: formatDate(p.createdAt)
            })),
            ...recentOrders.map(o => ({
                id: `o-${o._id}`,
                type: 'Supplier Order',
                entity: o.name,
                description: `Order ${o.po_id || o.orderID}`,
                amount: o.total,
                status: o.status.toLowerCase(),
                time: formatDate(o.createdAt)
            }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        res.status(200).json({
            success: true,
            stats: {
                totalRevenue,
                totalExpenses,
                totalProfit,
                lowStockAlerts,
                pendingCustomerRequests,
                pendingSupplierRequests,
                salesTrend: formattedSalesTrend.length ? formattedSalesTrend : [
                    { month: 'Jan', revenue: 0 }, { month: 'Feb', revenue: 0 }, { month: 'Mar', revenue: 0 }
                ],
                expenseData: formattedExpenses.length ? formattedExpenses : [{ name: 'None', value: 0, color: '#e2e8f0' }],
                recentActivities: activities
            }
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

function formatDate(date) {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
}
