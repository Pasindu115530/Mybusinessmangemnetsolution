import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SupplierLayout } from './SupplierLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { toast } from 'sonner';
import {
  ShoppingCart,
  Search,
  Eye,
  CheckCircle,
  Truck,
  Clock,
  Package,
  Send,
  Loader2,
  RefreshCw,
  AlertCircle,
  Calendar
} from 'lucide-react';

interface OrderItem {
  productID: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  _id: string;
  po_id: string;
  customerName: string;
  total: number;
  status: string;
  date: string;
  items: OrderItem[];
  expectedDeliveryDate: string;
  payment_terms: string;
}

interface Stats {
  total: number;
  confirmed: number;
  dispatched: number;
  delivered: number;
}

export function SupplierOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const getAuthHeader = () => {
    const token = localStorage.getItem('supplierToken') || localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const headers = getAuthHeader();
      
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const [ordersRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5900/api/suppliers/orders/all', { headers, params }),
        axios.get('http://localhost:5900/api/suppliers/orders/stats', { headers })
      ]);

      setOrders(ordersRes.data.orders || []);
      setStats(statsRes.data.stats || null);
    } catch (err: any) {
      console.error('Failed to load orders:', err);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'dispatched':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'preparing':
      case 'confirmed':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'dispatched':
        return <Truck className="w-3 h-3 mr-1" />;
      case 'delivered':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'preparing':
      case 'confirmed':
        return <Package className="w-3 h-3 mr-1" />;
      case 'pending':
        return <Clock className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    const q = searchQuery.toLowerCase();
    return (
      (order.po_id || '').toLowerCase().includes(q) ||
      (order._id || '').toLowerCase().includes(q)
    );
  });

  const handleAcknowledge = async () => {
    if (!selectedOrder) return;
    try {
      setIsProcessing(true);
      const headers = getAuthHeader();
      await axios.patch(`http://localhost:5900/api/suppliers/orders/${selectedOrder._id}/acknowledge`, {}, { headers });
      toast.success('Order acknowledged successfully');
      setShowAcknowledgeModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to acknowledge order');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrepareDispatch = (orderId: string) => {
    navigate('/supplier/delivery', { state: { orderId } });
  };

  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
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
              <span className="text-green-100 uppercase tracking-wider text-xs font-bold">Order Management</span>
            </div>
            <h1 className="text-3xl mb-2 font-black">Customer Orders</h1>
            <p className="text-green-100 opacity-90">Manage purchase orders and fulfillment lifecycle</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Orders', count: stats?.total || 0, color: 'slate', icon: ShoppingCart },
            { label: 'Confirmed', count: stats?.confirmed || 0, color: 'purple', icon: CheckCircle },
            { label: 'Dispatched', count: stats?.dispatched || 0, color: 'blue', icon: Truck },
            { label: 'Delivered', count: stats?.delivered || 0, color: 'green', icon: Package },
          ].map((stat) => (
            <Card key={stat.label} className="modern-card border-0 shadow-modern-lg overflow-hidden">
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-${stat.color}-50 rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</h3>
                <p className="text-2xl font-black text-slate-900">{stat.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Orders Table */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-green-600" />
                Purchase Orders
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search PO ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64 border-slate-200"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 border-slate-200">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="dispatched">Dispatched</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={fetchData} className="border-slate-200">
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50 border-b">
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">PO ID</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Amount</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Order Date</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Expected Delivery</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-48 text-center text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-green-600" />
                        Loading orders...
                      </TableCell>
                    </TableRow>
                  ) : filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-slate-400 italic">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order._id} className="hover:bg-slate-50/50 transition-colors border-b last:border-0 group">
                        <TableCell className="font-mono text-xs font-bold text-slate-400 group-hover:text-green-600 transition-colors">
                          {order.po_id || 'PO-NEW'}
                        </TableCell>
                        <TableCell className="text-slate-900 font-black">${order.total.toLocaleString()}</TableCell>
                        <TableCell className="text-slate-600 text-sm font-bold">{new Date(order.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-slate-600 text-sm italic">
                          {order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${getStatusColor(order.status)} text-[10px] border capitalize px-3`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0 border-slate-200 hover:bg-blue-50 hover:text-blue-600"
                              onClick={() => openDetails(order)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {order.status === 'pending' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0 border-slate-200 hover:bg-yellow-50 hover:text-amber-600"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowAcknowledgeModal(true);
                                }}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            {(order.status === 'confirmed' || order.status === 'preparing') && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0 border-slate-200 hover:bg-green-50 hover:text-green-600"
                                onClick={() => handlePrepareDispatch(order._id)}
                              >
                                <Truck className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
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

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="border-0 shadow-2xl max-w-2xl overflow-hidden p-0">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-black flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-green-400" />
                  Order #{selectedOrder?.po_id}
                </DialogTitle>
                <Badge className={`${getStatusColor(selectedOrder?.status || '')} border-0`}>
                  {selectedOrder?.status}
                </Badge>
              </div>
            </DialogHeader>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Order Date</p>
                <p className="text-sm font-bold text-slate-900">{selectedOrder && new Date(selectedOrder.date).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Expected Delivery</p>
                <p className="text-sm font-bold text-slate-900">
                  {selectedOrder?.expectedDeliveryDate ? new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Amount</p>
                <p className="text-lg font-black text-green-600">${selectedOrder?.total.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Payment Terms</p>
                <p className="text-sm font-bold text-slate-900">{selectedOrder?.payment_terms || 'Net 30'}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-green-600" />
                Items ({selectedOrder?.items.length})
              </h4>
              <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="font-bold">Item</TableHead>
                      <TableHead className="text-center font-bold">Qty</TableHead>
                      <TableHead className="text-right font-bold">Price</TableHead>
                      <TableHead className="text-right font-bold">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder?.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-bold text-slate-900">{item.name}</TableCell>
                        <TableCell className="text-center font-black">{item.quantity}</TableCell>
                        <TableCell className="text-right text-slate-600">${item.price.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-black text-slate-900">
                          ${(item.price * item.quantity).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
              {selectedOrder?.status === 'pending' && (
                <Button 
                  className="flex-1 h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-100"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowAcknowledgeModal(true);
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Acknowledge Order
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Acknowledge Modal */}
      <Dialog open={showAcknowledgeModal} onOpenChange={setShowAcknowledgeModal}>
        <DialogContent className="border-0 shadow-2xl max-w-md p-0 overflow-hidden">
          <div className="bg-amber-50 p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <DialogTitle className="text-xl font-black text-slate-900">Acknowledge Order</DialogTitle>
            <p className="text-slate-500 text-sm mt-2">
              Acknowledge order <span className="font-mono font-bold text-amber-700">{selectedOrder?.po_id}</span> and begin preparation?
            </p>
          </div>
          
          <div className="p-6 bg-white space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600 leading-relaxed italic border border-slate-100">
              By acknowledging, you confirm receipt of this purchase order and commit to fulfilling the items listed within the expected delivery timeline.
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAcknowledgeModal(false)}
                className="flex-1 h-12 rounded-xl"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAcknowledge}
                disabled={isProcessing}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-100"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SupplierLayout>
  );
}
