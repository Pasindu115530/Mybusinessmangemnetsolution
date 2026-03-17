import { Link } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  TrendingDown, 
  Package, 
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Users,
  Truck,
  FileText,
  ShoppingBag
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

// Sales trend data
const salesTrendData = [
  { month: 'Jan', revenue: 65000 },
  { month: 'Feb', revenue: 72000 },
  { month: 'Mar', revenue: 68000 },
  { month: 'Apr', revenue: 85000 },
  { month: 'May', revenue: 91000 },
  { month: 'Jun', revenue: 98000 },
];

// Expense breakdown data
const expenseData = [
  { name: 'Operations', value: 45000, color: '#3b82f6' },
  { name: 'Salaries', value: 68000, color: '#10b981' },
  { name: 'Marketing', value: 25000, color: '#f59e0b' },
  { name: 'Supplies', value: 35000, color: '#ef4444' },
  { name: 'Utilities', value: 12000, color: '#8b5cf6' },
];

// Income vs Expenses data
const incomeExpensesData = [
  { month: 'Jan', income: 65000, expenses: 38000 },
  { month: 'Feb', income: 72000, expenses: 42000 },
  { month: 'Mar', income: 68000, expenses: 39000 },
  { month: 'Apr', income: 85000, expenses: 45000 },
  { month: 'May', income: 91000, expenses: 48000 },
  { month: 'Jun', income: 98000, expenses: 52000 },
];

// Recent activities
const recentActivities = [
  { id: 1, type: 'Customer Order', entity: 'Acme Corp', description: 'New order placed', amount: 15000, status: 'completed', time: '2 hours ago' },
  { id: 2, type: 'Supplier Update', entity: 'XYZ Industries', description: 'Quotation submitted', amount: 22000, status: 'pending', time: '4 hours ago' },
  { id: 3, type: 'Payment Received', entity: 'Tech Solutions', description: 'Invoice payment', amount: 8500, status: 'completed', time: '6 hours ago' },
  { id: 4, type: 'Stock Alert', entity: 'Product A - Electronics', description: 'Low stock warning', amount: null, status: 'alert', time: '8 hours ago' },
  { id: 5, type: 'Customer Order', entity: 'Global Enterprises', description: 'Order dispatched', amount: 20100, status: 'processing', time: '1 day ago' },
];

// Low stock items
const lowStockItems = [
  { name: 'Product A - Electronics', sku: 'SKU-001', quantity: 15, threshold: 50 },
  { name: 'Product C - Textiles', sku: 'SKU-003', quantity: 8, threshold: 25 },
  { name: 'Product E - Hardware', sku: 'SKU-005', quantity: 22, threshold: 100 },
];

export function AdminDashboard() {
  const kpis = [
    { 
      label: 'Total Revenue', 
      value: '$479K', 
      change: '+12.5%', 
      trend: 'up', 
      icon: DollarSign, 
      color: 'green',
      description: 'vs last month'
    },
    { 
      label: 'Total Profit', 
      value: '$215K', 
      change: '+8.2%', 
      trend: 'up', 
      icon: TrendingUp, 
      color: 'blue',
      description: 'vs last month'
    },
    { 
      label: 'Total Expenses', 
      value: '$264K', 
      change: '-3.1%', 
      trend: 'down', 
      icon: TrendingDown, 
      color: 'purple',
      description: 'vs last month'
    },
    { 
      label: 'Low Stock Alerts', 
      value: '3', 
      change: '+2', 
      trend: 'alert', 
      icon: AlertTriangle, 
      color: 'red',
      description: 'items need restock'
    },
  ];

  const pendingRequests = [
    { label: 'Pending Customer Requests', value: '8', icon: Users, color: 'blue' },
    { label: 'Pending Supplier Requests', value: '5', icon: Truck, color: 'green' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'alert':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Overview of your business performance</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi) => (
            <Card key={kpi.label} className="modern-card border-0 shadow-modern-lg overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${kpi.color}-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16`}></div>
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br from-${kpi.color}-100 to-${kpi.color}-200 rounded-xl flex items-center justify-center`}>
                    <kpi.icon className={`w-6 h-6 text-${kpi.color}-600`} />
                  </div>
                  <Badge className={
                    kpi.trend === 'up' 
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : kpi.trend === 'down'
                      ? 'bg-blue-100 text-blue-700 border-blue-200'
                      : 'bg-red-100 text-red-700 border-red-200'
                  }>
                    {kpi.change}
                  </Badge>
                </div>
                <h3 className="text-sm text-slate-600 mb-1">{kpi.label}</h3>
                <p className="text-2xl text-slate-900 mb-1">{kpi.value}</p>
                <p className="text-xs text-slate-500">{kpi.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pending Requests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingRequests.map((req) => (
            <Card key={req.label} className="modern-card border-0 shadow-modern-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br from-${req.color}-100 to-${req.color}-200 rounded-xl flex items-center justify-center`}>
                      <req.icon className={`w-6 h-6 text-${req.color}-600`} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">{req.label}</p>
                      <p className="text-2xl text-slate-900">{req.value}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend */}
          <Card className="modern-card border-0 shadow-modern-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Sales Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <Card className="modern-card border-0 shadow-modern-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Expense Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={(entry) => entry.name}
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Income vs Expenses */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Monthly Income vs Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeExpensesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activities & Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <Card className="modern-card border-0 shadow-modern-lg lg:col-span-2">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead>Type</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivities.map((activity) => (
                      <TableRow key={activity.id} className="hover:bg-slate-50/50">
                        <TableCell className="text-slate-900">{activity.type}</TableCell>
                        <TableCell className="text-slate-900">{activity.entity}</TableCell>
                        <TableCell className="text-slate-600">{activity.description}</TableCell>
                        <TableCell className="text-slate-900">
                          {activity.amount ? `$${activity.amount.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">{activity.time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card className="modern-card border-0 shadow-modern-lg">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {lowStockItems.map((item, index) => (
                  <div key={index} className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-red-900">{item.name}</p>
                      <Badge className="bg-red-100 text-red-700 border-red-200">
                        {item.quantity} left
                      </Badge>
                    </div>
                    <p className="text-xs text-red-600">SKU: {item.sku}</p>
                    <p className="text-xs text-red-600">Threshold: {item.threshold}</p>
                  </div>
                ))}
                <Link to="/stock">
                  <Button variant="outline" className="w-full border-red-300 text-red-700 hover:bg-red-50">
                    View All Stock
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/stock">
                <Button variant="outline" className="w-full h-auto p-4 flex-col items-start hover:bg-blue-50 hover:border-blue-300">
                  <Package className="w-5 h-5 text-blue-600 mb-2" />
                  <span className="text-slate-900">Stock Management</span>
                </Button>
              </Link>
              <Link to="/customer-requests">
                <Button variant="outline" className="w-full h-auto p-4 flex-col items-start hover:bg-green-50 hover:border-green-300">
                  <FileText className="w-5 h-5 text-green-600 mb-2" />
                  <span className="text-slate-900">Customer Requests</span>
                </Button>
              </Link>
              <Link to="/purchase-orders">
                <Button variant="outline" className="w-full h-auto p-4 flex-col items-start hover:bg-purple-50 hover:border-purple-300">
                  <ShoppingBag className="w-5 h-5 text-purple-600 mb-2" />
                  <span className="text-slate-900">Purchase Orders</span>
                </Button>
              </Link>
              <Link to="/payments">
                <Button variant="outline" className="w-full h-auto p-4 flex-col items-start hover:bg-yellow-50 hover:border-yellow-300">
                  <DollarSign className="w-5 h-5 text-yellow-600 mb-2" />
                  <span className="text-slate-900">Payments</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
