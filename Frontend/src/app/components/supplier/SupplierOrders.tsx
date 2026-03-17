import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SupplierLayout } from './SupplierLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  ShoppingCart,
  Search,
  Eye,
  CheckCircle,
  Truck,
  Clock,
  Package,
  Send
} from 'lucide-react';

interface Order {
  id: string;
  customer: string;
  totalItems: number;
  totalAmount: number;
  deliveryStatus: 'pending' | 'acknowledged' | 'preparing' | 'ready' | 'dispatched';
  orderDate: string;
}

const orders: Order[] = [
  { id: 'ORD-20240115', customer: 'Acme Corp', totalItems: 3, totalAmount: 147400, deliveryStatus: 'dispatched', orderDate: '2024-01-15' },
  { id: 'ORD-20240114', customer: 'XYZ Industries', totalItems: 5, totalAmount: 165200, deliveryStatus: 'ready', orderDate: '2024-01-14' },
  { id: 'ORD-20240113', customer: 'Tech Solutions', totalItems: 2, totalAmount: 89500, deliveryStatus: 'preparing', orderDate: '2024-01-13' },
  { id: 'ORD-20240112', customer: 'Global Enterprises', totalItems: 4, totalAmount: 201000, deliveryStatus: 'acknowledged', orderDate: '2024-01-12' },
  { id: 'ORD-20240111', customer: 'Tech Innovations', totalItems: 3, totalAmount: 125000, deliveryStatus: 'pending', orderDate: '2024-01-11' },
];

export function SupplierOrders() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'dispatched':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'ready':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'preparing':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'acknowledged':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'pending':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'dispatched':
        return <Truck className="w-3 h-3 mr-1" />;
      case 'ready':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'preparing':
        return <Package className="w-3 h-3 mr-1" />;
      case 'acknowledged':
        return <Send className="w-3 h-3 mr-1" />;
      case 'pending':
        return <Clock className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.deliveryStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAcknowledge = (id: string) => {
    setSelectedOrder(id);
    setShowAcknowledgeModal(true);
  };

  const handlePrepareDispatch = (id: string) => {
    navigate('/delivery', { state: { orderId: id } });
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
              <ShoppingCart className="w-5 h-5" />
              <span className="text-green-100">Order Management</span>
            </div>
            <h1 className="text-3xl mb-2">Customer Orders</h1>
            <p className="text-green-100">Manage confirmed orders from customers</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            { label: 'Pending', count: orders.filter(o => o.deliveryStatus === 'pending').length, color: 'slate', icon: Clock },
            { label: 'Acknowledged', count: orders.filter(o => o.deliveryStatus === 'acknowledged').length, color: 'yellow', icon: Send },
            { label: 'Preparing', count: orders.filter(o => o.deliveryStatus === 'preparing').length, color: 'purple', icon: Package },
            { label: 'Ready', count: orders.filter(o => o.deliveryStatus === 'ready').length, color: 'blue', icon: CheckCircle },
            { label: 'Dispatched', count: orders.filter(o => o.deliveryStatus === 'dispatched').length, color: 'green', icon: Truck },
          ].map((stat) => (
            <Card key={stat.label} className="modern-card border-0 shadow-modern-lg overflow-hidden">
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
                <ShoppingCart className="w-5 h-5 text-green-600" />
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
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="dispatched">Dispatched</SelectItem>
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
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Total Items</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Delivery Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="text-slate-900">{order.id}</TableCell>
                      <TableCell className="text-slate-900">{order.customer}</TableCell>
                      <TableCell className="text-slate-900">{order.totalItems} items</TableCell>
                      <TableCell className="text-slate-900">${order.totalAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-slate-600">{order.orderDate}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.deliveryStatus)}>
                          {getStatusIcon(order.deliveryStatus)}
                          {order.deliveryStatus}
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
                          {order.deliveryStatus === 'pending' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="hover:bg-yellow-50 hover:text-yellow-600"
                              onClick={() => handleAcknowledge(order.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {(order.deliveryStatus === 'acknowledged' || order.deliveryStatus === 'preparing' || order.deliveryStatus === 'ready') && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="hover:bg-green-50 hover:text-green-600"
                              onClick={() => handlePrepareDispatch(order.id)}
                            >
                              <Truck className="w-4 h-4" />
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

      {/* Acknowledge Modal */}
      <Dialog open={showAcknowledgeModal} onOpenChange={setShowAcknowledgeModal}>
        <DialogContent className="border-0 shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Acknowledge Order
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 mb-4">
              Acknowledge order <span className="text-green-600 font-medium">{selectedOrder}</span> and begin preparation?
            </p>
            <div className="bg-green-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-green-700">
                By acknowledging, you confirm receipt of the order and commit to the delivery timeline.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAcknowledgeModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowAcknowledgeModal(false)}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              Acknowledge Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SupplierLayout>
  );
}
