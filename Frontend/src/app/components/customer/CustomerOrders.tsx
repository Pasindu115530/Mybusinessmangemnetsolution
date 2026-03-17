import { useState } from 'react';
import { CustomerLayout } from './CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  ShoppingBag,
  Search,
  Eye,
  XCircle,
  CheckCircle,
  Clock,
  Truck,
  Package,
  Send,
  AlertCircle
} from 'lucide-react';

interface Order {
  id: string;
  quotationRef: string;
  orderDate: string;
  totalItems: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'dispatched' | 'in-transit' | 'delivered';
}

const orders: Order[] = [
  { id: 'ORD-20240115', quotationRef: 'QT-20240110', orderDate: '2024-01-15', totalItems: 3, totalAmount: 15000, status: 'delivered' },
  { id: 'ORD-20240114', quotationRef: 'QT-20240109', orderDate: '2024-01-14', totalItems: 5, totalAmount: 22000, status: 'in-transit' },
  { id: 'ORD-20240113', quotationRef: 'QT-20240108', orderDate: '2024-01-13', totalItems: 2, totalAmount: 8500, status: 'dispatched' },
  { id: 'ORD-20240112', quotationRef: 'QT-20240107', orderDate: '2024-01-12', totalItems: 4, totalAmount: 18000, status: 'processing' },
  { id: 'ORD-20240111', quotationRef: 'QT-20240106', orderDate: '2024-01-11', totalItems: 3, totalAmount: 12500, status: 'pending' },
];

export function CustomerOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in-transit':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'dispatched':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'pending':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'in-transit':
        return <Truck className="w-3 h-3 mr-1" />;
      case 'dispatched':
        return <Send className="w-3 h-3 mr-1" />;
      case 'processing':
        return <Package className="w-3 h-3 mr-1" />;
      case 'pending':
        return <Clock className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCancelOrder = (id: string) => {
    setSelectedOrder(id);
    setShowCancelModal(true);
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 text-white shadow-modern-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="w-5 h-5" />
              <span className="text-blue-100">Order Management</span>
            </div>
            <h1 className="text-3xl mb-2">My Orders</h1>
            <p className="text-blue-100">Track and manage your orders from accepted quotations</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            { label: 'Pending', count: orders.filter(o => o.status === 'pending').length, color: 'slate', icon: Clock },
            { label: 'Processing', count: orders.filter(o => o.status === 'processing').length, color: 'yellow', icon: Package },
            { label: 'Dispatched', count: orders.filter(o => o.status === 'dispatched').length, color: 'purple', icon: Send },
            { label: 'In Transit', count: orders.filter(o => o.status === 'in-transit').length, color: 'blue', icon: Truck },
            { label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length, color: 'green', icon: CheckCircle },
          ].map((stat) => (
            <Card key={stat.label} className="modern-card border-0 shadow-modern-lg overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16`}></div>
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
                <h3 className="text-sm text-slate-600 mb-1">{stat.label}</h3>
                <p className="text-2xl text-slate-900">{stat.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Orders Table */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                All Orders
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64 border-slate-200"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 border-slate-200">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="dispatched">Dispatched</SelectItem>
                    <SelectItem value="in-transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Quotation Ref</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Total Items</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="text-slate-900">{order.id}</TableCell>
                      <TableCell className="text-slate-600">{order.quotationRef}</TableCell>
                      <TableCell className="text-slate-600">{order.orderDate}</TableCell>
                      <TableCell className="text-slate-900">{order.totalItems} items</TableCell>
                      <TableCell className="text-slate-900">${order.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {order.status === 'pending' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => handleCancelOrder(order.id)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancel Order Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="border-0 shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Cancel Order
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 mb-4">
              Are you sure you want to cancel order <span className="text-red-600 font-medium">{selectedOrder}</span>?
            </p>
            <div className="bg-red-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-red-700">
                This action cannot be undone. The supplier will be notified of the cancellation.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
              className="flex-1"
            >
              Keep Order
            </Button>
            <Button
              onClick={() => setShowCancelModal(false)}
              className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
            >
              Cancel Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
}
