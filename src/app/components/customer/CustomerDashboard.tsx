import { Link } from 'react-router-dom';
import { CustomerLayout } from './CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Package,
  Clock,
  CheckCircle,
  DollarSign,
  Send,
  FileText,
  CreditCard,
  ShoppingBag,
  Truck,
  Receipt,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

const stats = [
  { label: 'Active Orders', value: '5', icon: ShoppingBag, color: 'blue', trend: '+2' },
  { label: 'Pending Quotations', value: '3', icon: FileText, color: 'yellow', trend: '+1' },
  { label: 'Delivered', value: '12', icon: CheckCircle, color: 'green', trend: '+3' },
  { label: 'Pending Payment', value: '2', icon: DollarSign, color: 'red', trend: '0' },
];

const recentOrders = [
  { id: 'ORD-20240115', items: 3, amount: 15000, status: 'delivered', date: '2024-01-15' },
  { id: 'ORD-20240114', items: 5, amount: 22000, status: 'in-transit', date: '2024-01-14' },
  { id: 'ORD-20240113', items: 2, amount: 8500, status: 'dispatched', date: '2024-01-13' },
];

const pendingQuotations = [
  { id: 'QT-20240115', reqRef: 'REQ-20240110', amount: 15000, expiryDate: '2024-01-25' },
  { id: 'QT-20240112', reqRef: 'REQ-20240108', amount: 22000, expiryDate: '2024-01-22' },
];

const recentActivity = [
  { type: 'delivery', message: 'Order ORD-20240115 delivered successfully', time: '2 hours ago', icon: CheckCircle, color: 'green' },
  { type: 'quotation', message: 'New quotation received for REQ-20240110', time: '5 hours ago', icon: FileText, color: 'blue' },
  { type: 'payment', message: 'Payment confirmed for INV-20240113', time: '1 day ago', icon: DollarSign, color: 'green' },
  { type: 'order', message: 'Order ORD-20240114 dispatched', time: '2 days ago', icon: Truck, color: 'purple' },
];

export function CustomerDashboard() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in-transit':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'dispatched':
        return 'bg-purple-100 text-purple-700 border-purple-200';
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
            <Link to="/send-requirements">
              <Button className="bg-white text-blue-700 hover:bg-blue-50 shadow-xl">
                <Send className="w-4 h-4 mr-2" />
                Send New Requirement
              </Button>
            </Link>
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
                  {stat.trend !== '0' && (
                    <Badge className={`${stat.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {stat.trend}
                    </Badge>
                  )}
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
              <Link to="/send-requirements">
                <Button variant="outline" className="w-full h-auto p-4 flex-col items-start hover:bg-blue-50 hover:border-blue-300">
                  <Send className="w-5 h-5 text-blue-600 mb-2" />
                  <span className="text-slate-900">Send Requirements</span>
                  <span className="text-xs text-slate-500 mt-1">Submit new request</span>
                </Button>
              </Link>
              <Link to="/quotations">
                <Button variant="outline" className="w-full h-auto p-4 flex-col items-start hover:bg-yellow-50 hover:border-yellow-300">
                  <FileText className="w-5 h-5 text-yellow-600 mb-2" />
                  <span className="text-slate-900">View Quotations</span>
                  <span className="text-xs text-slate-500 mt-1">Review & accept quotes</span>
                </Button>
              </Link>
              <Link to="/delivery-tracking">
                <Button variant="outline" className="w-full h-auto p-4 flex-col items-start hover:bg-purple-50 hover:border-purple-300">
                  <Truck className="w-5 h-5 text-purple-600 mb-2" />
                  <span className="text-slate-900">Track Delivery</span>
                  <span className="text-xs text-slate-500 mt-1">Monitor shipments</span>
                </Button>
              </Link>
              <Link to="/payments">
                <Button variant="outline" className="w-full h-auto p-4 flex-col items-start hover:bg-green-50 hover:border-green-300">
                  <CreditCard className="w-5 h-5 text-green-600 mb-2" />
                  <span className="text-slate-900">Make Payment</span>
                  <span className="text-xs text-slate-500 mt-1">Pay invoices</span>
                </Button>
              </Link>
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
                <Link to="/orders">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-900">{order.id}</span>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{order.items} items</span>
                      <span className="text-slate-900">${order.amount.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">{order.date}</div>
                  </div>
                ))}
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
                <Link to="/quotations">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {pendingQuotations.map((quotation) => (
                  <div key={quotation.id} className="p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200 hover:border-yellow-300 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-900">{quotation.id}</span>
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Req: {quotation.reqRef}</span>
                      <span className="text-slate-900">${quotation.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                      <span>Expires: {quotation.expiryDate}</span>
                      <Link to="/quotations">
                        <Button size="sm" variant="outline" className="h-6 text-xs">
                          Review
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`w-10 h-10 bg-gradient-to-br from-${activity.color}-100 to-${activity.color}-200 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <activity.icon className={`w-5 h-5 text-${activity.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">{activity.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}
