import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CustomerLayout } from './CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Package,
  Clock,
  CheckCircle,
  Banknote,
  Send,
  FileText,
  CreditCard,
  ShoppingBag,
  Truck,
  Receipt,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

interface DashboardStats {
  activeOrders: number;
  pendingQuotationsCount: number;
  deliveredOrders: number;
  duePayment: number;
  recentOrders: {
    id: string;
    items: number;
    amount: number;
    status: string;
    date: string;
  }[];
  pendingQuotations: {
    id: string;
    reqRef: string;
    amount: number;
    expiryDate: string;
  }[];
  pendingInvoices: {
    id: string;
    orderRef: string;
    amount: number;
    dueDate: string;
    status: string;
  }[];
  recentActivity: {
    type: string;
    message: string;
    time: string;
    color: string;
    icon: string;
  }[];
}

export function CustomerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5900/api/dashboard/customer-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch customer stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const kpis = [
    { label: 'Active Orders', value: stats ? stats.activeOrders.toString() : '0', icon: ShoppingBag, color: 'blue' },
    { label: 'Pending Quotations', value: stats ? stats.pendingQuotationsCount.toString() : '0', icon: FileText, color: 'yellow' },
    { label: 'Delivered Items', value: stats ? stats.deliveredOrders.toString() : '0', icon: CheckCircle, color: 'green' },
    { label: 'Due Payment', value: stats ? `LKR ${stats.duePayment.toLocaleString()}` : 'LKR 0', icon: Banknote, color: 'red' },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in-transit':
      case 'dispatched':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'processing':
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 text-white shadow-modern-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-5 h-5" />
                <span className="text-blue-100">Customer Portal</span>
              </div>
              <h1 className="text-3xl mb-2">Welcome Back!</h1>
              <p className="text-blue-100">Manage your orders, quotations, and track deliveries</p>
            </div>
            <Link to="/customer/send-requirements">
              <Button className="bg-white text-blue-700 hover:bg-blue-50 shadow-xl">
                <Send className="w-4 h-4 mr-2" />
                Send New Requirement
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((stat) => (
            <Card key={stat.label} className="modern-card border-0 shadow-modern-lg overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16`}></div>
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</h3>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/customer/send-requirements">
                <Button variant="outline" className="w-full h-auto p-4 flex-col items-start hover:bg-blue-50 hover:border-blue-300">
                  <Send className="w-5 h-5 text-blue-600 mb-2" />
                  <span className="text-slate-900">Send Requirements</span>
                  <span className="text-xs text-slate-500 mt-1">Submit new request</span>
                </Button>
              </Link>
              <Link to="/customer/quotations">
                <Button variant="outline" className="w-full h-auto p-4 flex-col items-start hover:bg-yellow-50 hover:border-yellow-300">
                  <FileText className="w-5 h-5 text-yellow-600 mb-2" />
                  <span className="text-slate-900">View Quotations</span>
                  <span className="text-xs text-slate-500 mt-1">Review & accept quotes</span>
                </Button>
              </Link>
              <Link to="/customer/delivery-tracking">
                <Button variant="outline" className="w-full h-auto p-4 flex-col items-start hover:bg-purple-50 hover:border-purple-300">
                  <Truck className="w-5 h-5 text-purple-600 mb-2" />
                  <span className="text-slate-900">Track Delivery</span>
                  <span className="text-xs text-slate-500 mt-1">Monitor shipments</span>
                </Button>
              </Link>
              <Link to="/customer/payments">
                <Button variant="outline" className="w-full h-auto p-4 flex-col items-start hover:bg-green-50 hover:border-green-300">
                  <CreditCard className="w-5 h-5 text-green-600 mb-2" />
                  <span className="text-slate-900">Make Payment</span>
                  <span className="text-xs text-slate-500 mt-1">Pay invoices</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Pending Payments Table */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 rounded-t-xl">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-green-600" />
                Pending Payments
              </CardTitle>
              <Link to="/customer/payments">
                <Button variant="ghost" size="sm" className="text-green-600 font-bold hover:text-green-700 hover:bg-green-50 gap-2">
                  Manage Billing
                  <TrendingUp className="w-4 h-4 rotate-45" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-0">
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-6">Bill ID</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Order Ref</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Amount</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Due Date</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.pendingInvoices.map((inv) => (
                    <TableRow key={inv.id} className="hover:bg-slate-50/50 border-b border-slate-50 last:border-0 transition-colors">
                      <TableCell className="pl-6 font-bold text-slate-900 text-xs">{inv.id}</TableCell>
                      <TableCell className="text-slate-600 text-xs">{inv.orderRef}</TableCell>
                      <TableCell className="font-black text-slate-900 text-xs">LKR {inv.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-slate-500 text-xs">{inv.dueDate}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={`${getStatusColor(inv.status)} text-[10px] border px-2 h-5 font-black uppercase tracking-tighter`}>
                          {inv.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!stats?.pendingInvoices || stats.pendingInvoices.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-slate-400 italic">
                        No pending payments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card className="modern-card border-0 shadow-modern-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                  Recent Orders
                </CardTitle>
                <Link to="/customer/orders">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {stats?.recentOrders.map((order) => (
                  <div key={order.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-900 font-bold">{order.id}</span>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{order.items} items</span>
                      <span className="text-slate-900 font-black">LKR {order.amount.toLocaleString()}</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-2">{order.date}</div>
                  </div>
                ))}
                {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                  <div className="text-center py-8 text-slate-400 italic">No recent orders found</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pending Quotations */}
          <Card className="modern-card border-0 shadow-modern-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Pending Quotations
                </CardTitle>
                <Link to="/customer/quotations">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {stats?.pendingQuotations.map((quotation) => (
                  <div key={quotation.id} className="p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200 hover:border-yellow-300 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-900 font-bold">{quotation.id}</span>
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Quoted
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Ref: {quotation.reqRef}</span>
                      <span className="text-slate-900 font-black">LKR {quotation.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase mt-2">
                      <span>Expires: {quotation.expiryDate}</span>
                      <Link to="/customer/quotations">
                        <Button size="sm" variant="outline" className="h-6 text-[10px] uppercase font-black">
                          Review Quote
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                {(!stats?.pendingQuotations || stats.pendingQuotations.length === 0) && (
                  <div className="text-center py-8 text-slate-400 italic border-2 border-dashed border-slate-100 rounded-xl">
                    No pending quotations found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {stats?.recentActivity.map((activity, index) => {
                const Icon = activity.icon === 'Banknote' ? Banknote : activity.icon === 'Package' ? Package : activity.icon === 'FileText' ? FileText : Clock;
                return (
                  <div key={index} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className={`w-10 h-10 bg-gradient-to-br from-${activity.color}-50 to-${activity.color}-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <Icon className={`w-5 h-5 text-${activity.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">{activity.message}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
              {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                <div className="text-center py-8 text-slate-400 italic">No recent activity found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}
