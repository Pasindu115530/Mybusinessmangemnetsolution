import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  LineChart,
  Line,
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
  Banknote, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Users,
  Truck,
  FileText,
  ShoppingBag,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import axios from 'axios';

interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  lowStockAlerts: number;
  pendingCustomerRequests: number;
  pendingSupplierRequests: number;
  salesTrend: { month: string; revenue: number }[];
  expenseData: { name: string; value: number; color: string }[];
  recentActivities: any[];
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5900/api/dashboard/admin-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data.stats);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const kpis = [
    { 
      label: 'Total Revenue', 
      value: stats ? `LKR ${stats.totalRevenue.toLocaleString()}` : 'LKR 0', 
      change: '+12.5%', 
      trend: 'up', 
      icon: Banknote, 
      color: 'green',
      description: 'vs last month'
    },
    { 
      label: 'Total Profit', 
      value: stats ? `LKR ${stats.totalProfit.toLocaleString()}` : 'LKR 0', 
      change: '+8.2%', 
      trend: 'up', 
      icon: TrendingUp, 
      color: 'blue',
      description: 'vs last month'
    },
    { 
      label: 'Total Expenses', 
      value: stats ? `LKR ${stats.totalExpenses.toLocaleString()}` : 'LKR 0', 
      change: '-3.1%', 
      trend: 'down', 
      icon: TrendingDown, 
      color: 'purple',
      description: 'vs last month'
    },
    { 
      label: 'Low Stock Alerts', 
      value: stats ? stats.lowStockAlerts.toString() : '0', 
      change: '', 
      trend: 'alert', 
      icon: AlertTriangle, 
      color: 'red',
      description: 'items need restock'
    },
  ];

  const pendingRequests = [
    { label: 'Pending Customer Requests', value: stats ? stats.pendingCustomerRequests.toString() : '0', icon: Users, color: 'blue', link: '/admin/customer-requests' },
    { label: 'Pending Supplier Requests', value: stats ? stats.pendingSupplierRequests.toString() : '0', icon: Truck, color: 'green', link: '/admin/supplier-requests' },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'processing':
      case 'confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
      case 'unpaid':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'alert':
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-1">Dashboard</h1>
            <p className="text-slate-500 font-medium">Business intelligence and performance overview</p>
          </div>
          <Button onClick={fetchStats} variant="outline" className="gap-2 border-slate-200 shadow-sm hover:bg-slate-50">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] bg-white/50 rounded-3xl border-2 border-dashed border-slate-200">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="text-slate-500 font-bold animate-pulse">Aggregating real-time data...</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpis.map((kpi) => (
                <Card key={kpi.label} className="modern-card border-0 shadow-modern-lg overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-${kpi.color}-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16`}></div>
                  <CardContent className="pt-6 relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br from-${kpi.color}-50 to-${kpi.color}-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <kpi.icon className={`w-6 h-6 text-${kpi.color}-600`} />
                      </div>
                      {kpi.change && (
                        <Badge className={
                          kpi.trend === 'up' 
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : kpi.trend === 'down'
                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                            : 'bg-red-100 text-red-700 border-red-200'
                        }>
                          {kpi.change}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</h3>
                    <p className="text-2xl font-black text-slate-900 mb-1">{kpi.value}</p>
                    <p className="text-xs text-slate-500">{kpi.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pending Requests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingRequests.map((req) => (
                <Card key={req.label} className="modern-card border-0 shadow-modern-lg group hover:border-blue-200 transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-br from-${req.color}-50 to-${req.color}-100 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform`}>
                          <req.icon className={`w-6 h-6 text-${req.color}-600`} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{req.label}</p>
                          <p className="text-2xl font-black text-slate-900">{req.value}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-xl border-slate-200" onClick={() => navigate(req.link)}>
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
                <CardHeader className="bg-slate-50/80 border-b border-slate-100">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    Sales Trend (Revenue)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats?.salesTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `LKR ${val/1000}K`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: 'none',
                          borderRadius: '12px',
                          color: 'white'
                        }}
                        itemStyle={{ color: '#3b82f6' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3b82f6" 
                        strokeWidth={4}
                        dot={{ fill: '#3b82f6', r: 6, strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Expense Breakdown */}
              <Card className="modern-card border-0 shadow-modern-lg">
                <CardHeader className="bg-slate-50/80 border-b border-slate-100">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-rose-600" />
                    Expense Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats?.expenseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {stats?.expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: 'none',
                          borderRadius: '12px',
                          color: 'white'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="bg-slate-50/80 border-b border-slate-100">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-0">
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-6">Type</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Entity</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Description</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-right">Amount</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-right pr-6">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats?.recentActivities.map((activity) => (
                        <TableRow key={activity.id} className="hover:bg-slate-50/50 border-b border-slate-50 last:border-0">
                          <TableCell className="pl-6 font-bold text-slate-900 text-xs">{activity.type}</TableCell>
                          <TableCell className="text-slate-600 text-xs">{activity.entity}</TableCell>
                          <TableCell className="text-slate-500 text-xs italic">{activity.description}</TableCell>
                          <TableCell className="text-right font-black text-slate-900 text-xs">
                            {activity.amount ? `LKR ${activity.amount.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={`${getStatusColor(activity.status)} text-[10px] border px-2 h-5`}>
                              {activity.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6 text-[10px] font-bold text-slate-400 uppercase">{activity.time}</TableCell>
                        </TableRow>
                      ))}
                      {(!stats?.recentActivities || stats.recentActivities.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-slate-400 italic">No recent activities found</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="bg-slate-50/80 border-b border-slate-100">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link to="/stock">
                    <Button variant="outline" className="w-full h-auto p-4 flex-col items-start hover:bg-blue-50 hover:border-blue-300 transition-all">
                      <Package className="w-5 h-5 text-blue-600 mb-2" />
                      <span className="text-slate-900 font-bold">Stock Management</span>
                    </Button>
                  </Link>
                  <Link to="/customer-requests">
                    <Button variant="outline" className="w-full h-auto p-4 flex-col items-start hover:bg-green-50 hover:border-green-300 transition-all">
                      <FileText className="w-5 h-5 text-green-600 mb-2" />
                      <span className="text-slate-900 font-bold">Customer Requests</span>
                    </Button>
                  </Link>
                  <Link to="/purchase-orders">
                    <Button variant="outline" className="w-full h-auto p-4 flex-col items-start hover:bg-purple-50 hover:border-purple-300 transition-all">
                      <ShoppingBag className="w-5 h-5 text-purple-600 mb-2" />
                      <span className="text-slate-900 font-bold">Purchase Orders</span>
                    </Button>
                  </Link>
                  <Link to="/payments">
                    <Button variant="outline" className="w-full h-auto p-4 flex-col items-start hover:bg-yellow-50 hover:border-yellow-300 transition-all">
                      <Banknote className="w-5 h-5 text-yellow-600 mb-2" />
                      <span className="text-slate-900 font-bold">Payments</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
