import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { SupplierLayout } from './SupplierLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { toast } from 'sonner';
import {
  Package,
  Clock,
  CheckCircle,
  DollarSign,
  Truck,
  FileText,
  Send,
  Receipt,
  TrendingUp,
  ShoppingCart,
  Loader2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export function SupplierDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentRequirements, setRecentRequirements] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAuthHeader = () => {
    const token = localStorage.getItem('supplierToken') || localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const headers = getAuthHeader();
        
        const [statsRes, reqRes, ordersRes, paymentsRes] = await Promise.all([
          axios.get('http://localhost:5900/api/suppliers/dashboard/stats', { headers }),
          axios.get('http://localhost:5900/api/suppliers/dashboard/recent-requirements', { headers }),
          axios.get('http://localhost:5900/api/suppliers/dashboard/recent-orders', { headers }),
          axios.get('http://localhost:5900/api/suppliers/dashboard/pending-payments', { headers })
        ]);

        setStats(statsRes.data.stats);
        setRecentRequirements(reqRes.data.recentRequirements || []);
        setRecentOrders(ordersRes.data.recentOrders || []);
        setPendingPayments(paymentsRes.data.pendingPayments || []);
      } catch (err: any) {
        console.error('Failed to load dashboard data:', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'new':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'quoted':
      case 'accepted':
      case 'ready':
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'in-progress':
      case 'preparing':
      case 'dispatched':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'completed':
      case 'delivered':
      case 'paid':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
      case 'overdue':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (isLoading) {
    return (
      <SupplierLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-green-600" />
          <p className="text-slate-500 font-medium">Preparing your dashboard...</p>
        </div>
      </SupplierLayout>
    );
  }

  return (
    <SupplierLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-8 text-white shadow-modern-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5" />
              <span className="text-green-100 uppercase tracking-wider text-xs font-bold">Supplier Portal</span>
            </div>
            <h1 className="text-3xl mb-2 font-black">Welcome Back!</h1>
            <p className="text-green-100 opacity-90">Manage customer requirements, quotations, and order fulfillment efficiently</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'New Requirements', value: stats?.newRequirements || 0, icon: FileText, color: 'blue', bg: 'from-blue-50 to-blue-100', text: 'text-blue-600' },
            { label: 'Pending Quotations', value: stats?.pendingQuotations || 0, icon: Clock, color: 'yellow', bg: 'from-yellow-50 to-amber-100', text: 'text-amber-600' },
            { label: 'Active Orders', value: stats?.activeOrders || 0, icon: ShoppingCart, color: 'purple', bg: 'from-purple-50 to-indigo-100', text: 'text-indigo-600' },
            { label: 'Total Revenue', value: `LKR ${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'green', bg: 'from-green-50 to-emerald-100', text: 'text-emerald-600' },
          ].map((stat) => (
            <Card key={stat.label} className="modern-card border-0 shadow-modern-lg overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-6 h-6 ${stat.text}`} />
                  </div>
                  <Badge className="bg-white/50 text-slate-400 border-slate-100">
                    Live
                  </Badge>
                </div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</h3>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
          <CardHeader className="bg-slate-50/80 border-b border-slate-100">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/supplier/requirements">
                <Button variant="outline" className="w-full h-auto p-5 flex-col items-start hover:bg-blue-50 hover:border-blue-300 group transition-all">
                  <FileText className="w-6 h-6 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-900 font-bold">View Requirements</span>
                  <span className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">Review customer requests</span>
                </Button>
              </Link>
              <Link to="/supplier/quotations">
                <Button variant="outline" className="w-full h-auto p-5 flex-col items-start hover:bg-yellow-50 hover:border-yellow-300 group transition-all">
                  <Send className="w-6 h-6 text-yellow-600 mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-900 font-bold">Quotations</span>
                  <span className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">Track your submitted quotes</span>
                </Button>
              </Link>
              <Link to="/supplier/orders">
                <Button variant="outline" className="w-full h-auto p-5 flex-col items-start hover:bg-purple-50 hover:border-purple-300 group transition-all">
                  <ShoppingCart className="w-6 h-6 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-900 font-bold">Manage Orders</span>
                  <span className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">Process & fulfill orders</span>
                </Button>
              </Link>
              <Link to="/supplier/invoices">
                <Button variant="outline" className="w-full h-auto p-5 flex-col items-start hover:bg-green-50 hover:border-green-300 group transition-all">
                  <Receipt className="w-6 h-6 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-900 font-bold">Invoices & Payments</span>
                  <span className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">Billing & transaction history</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Requirements */}
          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  Recent Requirements
                </CardTitle>
                <Link to="/supplier/requirements">
                  <Button variant="ghost" size="sm" className="text-xs font-bold text-green-600 hover:bg-green-50">
                    See All <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {recentRequirements.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 italic text-sm">No recent requirements</div>
                ) : (
                  recentRequirements.map((req) => (
                    <div key={req.id} className="p-4 bg-white rounded-xl border border-slate-100 hover:border-green-300 hover:shadow-md transition-all group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black font-mono text-slate-400 group-hover:text-green-600 transition-colors">
                          REQ-{req.id.toString().slice(-5).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-900 font-bold text-sm">{req.previewTitle}</span>
                        <Badge variant="outline" className="text-[10px] bg-slate-50">{req.itemCount} Items</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          asChild
                          variant="outline" 
                          size="sm" 
                          className="flex-1 h-8 text-[10px] font-black uppercase tracking-widest border-slate-200 hover:bg-green-50 hover:text-green-600"
                        >
                          <Link to="/supplier/create-quotation" state={{ requirementId: req.id, requirementRef: req.requirementId, items: req.items }}>
                            <Send className="w-3 h-3 mr-1" /> Create Quotation
                          </Link>
                        </Button>
                        <Button 
                          asChild
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-slate-400 hover:text-green-600 hover:bg-green-50"
                        >
                          <Link to="/supplier/requirements">
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-green-600" />
                  Recent Orders
                </CardTitle>
                <Link to="/supplier/orders">
                  <Button variant="ghost" size="sm" className="text-xs font-bold text-green-600 hover:bg-green-50">
                    See All <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {recentOrders.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 italic text-sm">No recent orders</div>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.id} className="p-4 bg-white rounded-xl border border-slate-100 hover:border-green-300 hover:shadow-md transition-all cursor-pointer group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black font-mono text-slate-400 group-hover:text-green-600 transition-colors">
                          {order.po_id || 'PO-NEW'}
                        </span>
                        <Badge className={`${getStatusColor(order.status)} text-[10px] px-2 py-0 h-5 border capitalize`}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-900 font-bold text-sm">Total: LKR {order.total.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(order.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Payments */}
        <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
          <CardHeader className="bg-slate-50/80 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                Pending Payments
              </CardTitle>
              <Link to="/supplier/payments">
                <Button variant="ghost" size="sm" className="text-xs font-bold text-green-600 hover:bg-green-50">
                  Manage Billing <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-0">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-6">Bill ID</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order Ref</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Due Date</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center text-slate-400 italic text-sm border-0">
                        No pending payments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingPayments.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-slate-50/50 border-slate-100 group">
                        <TableCell className="pl-6 font-mono text-xs font-bold text-slate-400 group-hover:text-green-600 transition-colors">
                          {payment.bill_id}
                        </TableCell>
                        <TableCell className="text-slate-600 text-xs font-bold">{payment.purchaseOrderRef}</TableCell>
                        <TableCell className="text-slate-900 font-black">LKR {payment.total.toLocaleString()}</TableCell>
                        <TableCell className="text-slate-500 text-xs font-bold">
                          {payment.due_date ? new Date(payment.due_date).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${getStatusColor(payment.payment_status)} text-[10px] border capitalize`}>
                            {payment.payment_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </SupplierLayout>
  );
}
