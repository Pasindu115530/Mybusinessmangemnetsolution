import Finance from '../models/finance.js';
import StockItem from '../models/Stock.js';
import Requirement from '../models/Requirement.js';
import SupplierOrder from '../models/supplierOrder.js';
import PaymentTransaction from '../models/PaymentTransaction.js';
import SupplierPaymentTransaction from '../models/supplierPaymentTransaction.js';
import mongoose from 'mongoose';

export const getAdminDashboardStats = async (req, res) => {
    try {
        // 1. Financial Stats - Aggregating from multiple sources for robustness
        const revenueFinance = await Finance.aggregate([
            { $match: { transaction_type: { $in: ['cash_in', 'bank_deposit', 'fund'] } } },
            { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }
        ]);

        const revenuePayments = await PaymentTransaction.aggregate([
            { $match: { type: 'customer', status: 'completed', isFinanceLinked: { $ne: true } } },
            { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }
        ]);

        const expensesFinance = await Finance.aggregate([
            { $match: { transaction_type: { $in: ['cash_out', 'bank_withdraw'] } } },
            { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }
        ]);

        const expensesPayments = await PaymentTransaction.aggregate([
            { $match: { type: { $in: ['expense', 'supplier'] }, status: 'completed', isFinanceLinked: { $ne: true } } },
            { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }
        ]);

        const expensesSupplierPayments = await SupplierPaymentTransaction.aggregate([
            { $match: { status: 'completed', isFinanceLinked: { $ne: true } } },
            { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }
        ]);

        const totalRevenue = (revenueFinance[0]?.total || 0) + (revenuePayments[0]?.total || 0);
        const totalExpenses = (expensesFinance[0]?.total || 0) + (expensesPayments[0]?.total || 0) + (expensesSupplierPayments[0]?.total || 0);
        const totalProfit = totalRevenue - totalExpenses;

        // 2. Low Stock Alerts - threshold set to 10
        const stockItems = await StockItem.find();
        const lowStockAlerts = stockItems.filter(item => item.quantity < 10).length;

        // 3. Pending Requests
        const pendingCustomerRequests = await Requirement.countDocuments({ status: 'pending' });
        const pendingSupplierRequests = await SupplierOrder.countDocuments({ status: 'Pending' });

        // 4. Sales Trend (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const salesTrendFinance = await Finance.aggregate([
            { 
                $match: { 
                    transaction_type: { $in: ['cash_in', 'bank_deposit', 'fund'] },
                    date: { $gte: sixMonthsAgo }
                } 
            },
            {
                $group: {
                    _id: { month: { $month: "$date" }, year: { $year: "$date" } },
                    revenue: { $sum: { $toDouble: "$amount" } }
                }
            }
        ]);

        const salesTrendPayments = await PaymentTransaction.aggregate([
            { 
                $match: { 
                    type: 'customer',
                    status: 'completed',
                    isFinanceLinked: { $ne: true },
                    date: { $gte: sixMonthsAgo }
                } 
            },
            {
                $group: {
                    _id: { month: { $month: "$date" }, year: { $year: "$date" } },
                    revenue: { $sum: { $toDouble: "$amount" } }
                }
            }
        ]);

        // Merge sales trend data
        const trendMap = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        [...salesTrendFinance, ...salesTrendPayments].forEach(item => {
            const key = `${item._id.year}-${item._id.month}`;
            if (!trendMap[key]) {
                trendMap[key] = { month: monthNames[item._id.month - 1], revenue: 0, sortKey: item._id.year * 100 + item._id.month };
            }
            trendMap[key].revenue += item.revenue;
        });

        const formattedSalesTrend = Object.values(trendMap).sort((a, b) => a.sortKey - b.sortKey);

        // 5. Expense Breakdown
        const expenseBreakdownFinance = await Finance.aggregate([
            { $match: { transaction_type: { $in: ['cash_out', 'bank_withdraw'] } } },
            { $group: { _id: "$category", value: { $sum: { $toDouble: "$amount" } } } }
        ]);

        const expenseBreakdownPayments = await PaymentTransaction.aggregate([
            { $match: { type: { $in: ['expense', 'supplier'] }, status: 'completed', isFinanceLinked: { $ne: true } } },
            { $group: { _id: "$category", value: { $sum: { $toDouble: "$amount" } } } }
        ]);

        const expenseBreakdownSupplier = await SupplierPaymentTransaction.aggregate([
            { $match: { status: 'completed', isFinanceLinked: { $ne: true } } },
            { $group: { _id: "$category", value: { $sum: { $toDouble: "$amount" } } } }
        ]);

        const catMap = {};
        [...expenseBreakdownFinance, ...expenseBreakdownPayments, ...expenseBreakdownSupplier].forEach(item => {
            const cat = item._id || 'General';
            catMap[cat] = (catMap[cat] || 0) + item.value;
        });

        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899'];
        const formattedExpenses = Object.entries(catMap).map(([name, value], idx) => ({
            name,
            value,
            color: colors[idx % colors.length]
        }));

        // 6. Recent Activities
        const recentFinance = await Finance.find().sort({ createdAt: -1 }).limit(5);
        const recentAdminPayments = await PaymentTransaction.find({ isFinanceLinked: { $ne: true } }).sort({ createdAt: -1 }).limit(5);
        const recentSupplierPayments = await SupplierPaymentTransaction.find({ isFinanceLinked: { $ne: true } }).sort({ createdAt: -1 }).limit(5);
        const recentOrders = await SupplierOrder.find().sort({ createdAt: -1 }).limit(2);

        const activities = [
            ...recentFinance.map(p => ({
                id: `f-${p._id}`,
                type: (p.transaction_type.includes('in') || p.transaction_type === 'fund') ? 'Revenue Entry' : 'Expense Entry',
                entity: p.description || 'Finance Entry',
                description: p.notes || 'Transaction recorded',
                amount: Number(p.amount.toString()),
                status: 'completed',
                time: formatDate(p.createdAt)
            })),
            ...recentAdminPayments.map(p => ({
                id: `ap-${p._id}`,
                type: p.type === 'customer' ? 'Customer Payment' : 'Admin Expense',
                entity: p.relatedEntity,
                description: p.category,
                amount: Number(p.amount.toString()),
                status: p.status,
                time: formatDate(p.createdAt)
            })),
            ...recentSupplierPayments.map(p => ({
                id: `sp-${p._id}`,
                type: 'Supplier Payout',
                entity: p.relatedEntity,
                description: p.billRef || 'Direct Payment',
                amount: Number(p.amount.toString()),
                status: p.status,
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
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

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
