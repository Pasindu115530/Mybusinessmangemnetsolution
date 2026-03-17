import { Link } from 'react-router-dom';
import { SupplierLayout } from './SupplierLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
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
  ShoppingCart
} from 'lucide-react';

const stats = [
  { label: 'New Requirements', value: '4', icon: FileText, color: 'blue', trend: '+2' },
  { label: 'Pending Quotations', value: '3', icon: Clock, color: 'yellow', trend: '+1' },
  { label: 'Active Orders', value: '8', icon: ShoppingCart, color: 'purple', trend: '+3' },
  { label: 'Total Revenue', value: '$450K', icon: DollarSign, color: 'green', trend: '+15%' },
];

const recentRequirements = [
  { id: 'REQ-20240115', customer: 'Acme Corp', items: 3, status: 'new', date: '2024-01-15' },
  { id: 'REQ-20240114', customer: 'XYZ Industries', items: 5, status: 'quoted', date: '2024-01-14' },
  { id: 'REQ-20240113', customer: 'Tech Solutions', items: 2, status: 'in-progress', date: '2024-01-13' },
];

const recentOrders = [
  { id: 'ORD-20240115', customer: 'Acme Corp', amount: 147400, status: 'dispatched', date: '2024-01-15' },
  { id: 'ORD-20240114', customer: 'XYZ Industries', amount: 165200, status: 'ready', date: '2024-01-14' },
  { id: 'ORD-20240113', customer: 'Tech Solutions', amount: 89500, status: 'preparing', date: '2024-01-13' },
];

const pendingPayments = [
  { id: 'PAY-20240114', orderId: 'ORD-20240114', amount: 165200, customer: 'XYZ Industries', dueDate: '2024-02-13' },
  { id: 'PAY-20240112', orderId: 'ORD-20240112', amount: 201000, customer: 'Global Enterprises', dueDate: '2024-02-11' },
];

export function SupplierDashboard() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'quoted':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'in-progress':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'dispatched':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'ready':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'preparing':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

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
              <span className="text-green-100">Supplier Portal</span>
            </div>
            <h1 className="text-3xl mb-2">Welcome Back!</h1>
            <p className="text-green-100">Manage customer requirements, quotations, and order fulfillment</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="modern-card border-0 shadow-modern-lg overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16`}></div>
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.trend}
                  </Badge>
                </div>
                <h3 className="text-sm text-slate-600 mb-1">{stat.label}</h3>
                <p className="text-2xl text-slate-900">{stat.value}</p>
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
              <Link to="/requirements">
                <Button variant="outline" className="w-full h-auto p-4 flex-col items-start hover:bg-blue-50 hover:border-blue-300">
                  <FileText className="w-5 h-5 text-blue-600 mb-2" />
                  <span className="text-slate-900">View Requirements</span>
                  <span className="text-xs text-slate-500 mt-1">Review customer requests</span>
                </Button>
              </Link>
              <Link to="/create-quotation">
                <Button variant="outline" className="w-full h-auto p-4 flex-col items-start hover:bg-yellow-50 hover:border-yellow-300">
                  <Send className="w-5 h-5 text-yellow-600 mb-2" />
                  <span className="text-slate-900">Create Quotation</span>
                  <span className="text-xs text-slate-500 mt-1">Prepare pricing quote</span>
                </Button>
              </Link>
              <Link to="/delivery">
                <Button variant="outline" className="w-full h-auto p-4 flex-col items-start hover:bg-purple-50 hover:border-purple-300">
                  <Truck className="w-5 h-5 text-purple-600 mb-2" />
                  <span className="text-slate-900">Manage Delivery</span>
                  <span className="text-xs text-slate-500 mt-1">Track shipments</span>
                </Button>
              </Link>
              <Link to="/invoices">
                <Button variant="outline" className="w-full h-auto p-4 flex-col items-start hover:bg-green-50 hover:border-green-300">
                  <Receipt className="w-5 h-5 text-green-600 mb-2" />
                  <span className="text-slate-900">Submit Invoice</span>
                  <span className="text-xs text-slate-500 mt-1">Generate & send invoices</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Requirements */}
          <Card className="modern-card border-0 shadow-modern-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Recent Requirements
                </CardTitle>
                <Link to="/requirements">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {recentRequirements.map((req) => (
                  <div key={req.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50/50 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-900">{req.id}</span>
                      <Badge className={getStatusColor(req.status)}>
                        {req.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{req.customer}</span>
                      <span className="text-slate-600">{req.items} items</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">{req.date}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="modern-card border-0 shadow-modern-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                  Recent Orders
                </CardTitle>
                <Link to="/orders">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50/50 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-900">{order.id}</span>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{order.customer}</span>
                      <span className="text-slate-900">${order.amount.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">{order.date}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Payments */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Pending Payments
              </CardTitle>
              <Link to="/payments">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-slate-50/50">
                      <TableCell className="text-slate-900">{payment.id}</TableCell>
                      <TableCell className="text-slate-600">{payment.orderId}</TableCell>
                      <TableCell className="text-slate-900">{payment.customer}</TableCell>
                      <TableCell className="text-slate-900">${payment.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-slate-600">{payment.dueDate}</TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </SupplierLayout>
  );
}
