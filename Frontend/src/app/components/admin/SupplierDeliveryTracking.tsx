import { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import {
  Truck,
  Search,
  Eye,
  Loader2,
  RefreshCw,
  CheckCircle,
  Clock,
  Package,
  AlertCircle,
} from 'lucide-react';

interface OrderItem {
  productID: string;
  name: string;
  quantity: number;
  issuedQuantity: number;
  receivedQuantity?: number;
  rejectedQuantity?: number;
  price?: number;
}

interface PurchaseOrder {
  _id: string;
  po_id: string;
  supplierEmail: string;
  name?: string;
  status: string;
  total: number;
  date: string;
  expectedDeliveryDate?: string;
  items: OrderItem[];
  orderType: string;
}

export function SupplierDeliveryTracking() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<PurchaseOrder | null>(null);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receivedQtys, setReceivedQtys] = useState<{ [key: string]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('http://localhost:5900/api/supplier-orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      toast.error('Failed to load supplier delivery data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':    return 'bg-green-100 text-green-700 border-green-200';
      case 'dispatched':   return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'confirmed':    return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'pending':      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'rejected':     return 'bg-red-100 text-red-700 border-red-200';
      default:             return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'dispatched':
      case 'confirmed': return <Truck className="w-3 h-3 mr-1" />;
      default:          return <Clock className="w-3 h-3 mr-1" />;
    }
  };

  const getProgress = (order: PurchaseOrder) => {
    const totalItems = order.items?.length || 0;
    const receivedItems = order.items?.filter(i => (i.receivedQuantity || 0) > 0).length || 0;
    return { received: receivedItems, total: totalItems };
  };

  const filtered = orders.filter(o => {
    const q = searchTerm.toLowerCase();
    return (
      (o.po_id || '').toLowerCase().includes(q) ||
      (o.supplierEmail || '').toLowerCase().includes(q) ||
      (o.status || '').toLowerCase().includes(q)
    );
  });

  // Stats
  const delivered  = orders.filter(o => o.status === 'delivered').length;
  const dispatched = orders.filter(o => o.status === 'dispatched').length;
  const pending    = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-700 p-8 text-white shadow-modern-lg">
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-5 h-5 text-cyan-100" />
              <span className="text-cyan-100 uppercase tracking-wider text-xs font-bold">Logistics Tracking</span>
            </div>
            <h1 className="text-3xl mb-2">Supplier Delivery Tracking</h1>
            <p className="text-cyan-100">Monitor all supplier purchase orders and delivery statuses</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Orders', value: `${orders.length}`, icon: Package, color: 'text-slate-600', bg: 'from-slate-100 to-slate-200' },
            { label: 'Delivered', value: `${delivered}`, icon: CheckCircle, color: 'text-green-600', bg: 'from-green-100 to-emerald-100' },
            { label: 'In Transit', value: `${dispatched}`, icon: Truck, color: 'text-blue-600', bg: 'from-blue-100 to-cyan-100' },
            { label: 'Pending', value: `${pending}`, icon: Clock, color: 'text-yellow-600', bg: 'from-yellow-100 to-amber-100' },
          ].map((card, i) => (
            <Card key={i} className="modern-card border-0 shadow-modern-lg">
              <CardContent className="pt-6">
                <div className={`w-12 h-12 bg-gradient-to-br ${card.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <h3 className="text-sm text-slate-600 mb-1">{card.label}</h3>
                <p className="text-3xl font-black text-slate-900">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by PO ID, supplier or status..."
              className="pl-10 border-slate-200 h-12 rounded-xl"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-slate-200 h-12 rounded-xl px-6" onClick={fetchOrders}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl py-6">
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-teal-600" />
              Purchase Order Delivery Status ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="font-bold">PO ID</TableHead>
                    <TableHead className="font-bold">Supplier</TableHead>
                    <TableHead className="font-bold">Total Value</TableHead>
                    <TableHead className="font-bold text-center">Progress</TableHead>
                    <TableHead className="font-bold text-center">Status</TableHead>
                    <TableHead className="font-bold">Order Date</TableHead>
                    <TableHead className="font-bold">Expected By</TableHead>
                    <TableHead className="text-right font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-64 text-center text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-600" />
                        Loading delivery data...
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center text-slate-500 italic">
                        No purchase orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(order => {
                      const prog = getProgress(order);
                      return (
                        <TableRow key={order._id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="font-mono text-xs font-bold text-slate-900">{order.po_id}</TableCell>
                          <TableCell className="text-slate-900 text-sm">{order.supplierEmail}</TableCell>
                          <TableCell className="font-black text-slate-900">LKR {order.total?.toLocaleString() || '—'}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="flex-1 max-w-[80px] bg-slate-200 rounded-full h-2">
                                <div
                                  className="bg-teal-500 h-2 rounded-full transition-all"
                                  style={{ width: prog.total > 0 ? `${(prog.received / prog.total) * 100}%` : '0%' }}
                                />
                              </div>
                              <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
                                {prog.received}/{prog.total}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={`${getStatusColor(order.status)} capitalize border flex items-center gap-1 w-fit mx-auto`}>
                              {getStatusIcon(order.status)}{order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">
                            {new Date(order.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">
                            {order.expectedDeliveryDate
                              ? new Date(order.expectedDeliveryDate).toLocaleDateString()
                              : '—'
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-teal-600 hover:text-white border-slate-200 transition-all"
                              onClick={() => { setSelected(order); setShowModal(true); }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="border-0 shadow-2xl max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black">
              <Truck className="w-5 h-5 text-teal-600" />
              Purchase Order: {selected?.po_id}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 p-5 bg-teal-50 rounded-2xl text-sm">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Supplier</p>
                  <p className="font-bold text-slate-900 mt-0.5">{selected.supplierEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Status</p>
                  <Badge className={`${getStatusColor(selected.status)} capitalize border mt-1 flex items-center gap-1 w-fit`}>
                    {getStatusIcon(selected.status)}{selected.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Order Date</p>
                  <p className="font-bold text-slate-900 mt-0.5">{new Date(selected.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Expected Delivery</p>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {selected.expectedDeliveryDate
                      ? new Date(selected.expectedDeliveryDate).toLocaleDateString()
                      : 'Not specified'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Total Value</p>
                  <p className="font-black text-teal-700 text-xl mt-0.5">LKR {selected.total?.toLocaleString() || '—'}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-teal-600" />
                  Order Items & Delivery Progress
                </h3>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="font-bold">Item</TableHead>
                        <TableHead className="font-bold text-center">Ordered Qty</TableHead>
                        <TableHead className="font-bold text-center">Received Qty</TableHead>
                        <TableHead className="font-bold text-center">Progress</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selected.items?.map((item, idx) => {
                        const pct = item.quantity > 0 ? Math.min(100, ((item.receivedQuantity || 0) / item.quantity) * 100) : 0;
                        return (
                          <TableRow key={idx}>
                            <TableCell className="font-bold text-slate-900">{item.name}</TableCell>
                            <TableCell className="text-center font-medium">{item.quantity}</TableCell>
                            <TableCell className="text-center font-black text-teal-700">{item.receivedQuantity || 0}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-slate-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all ${pct >= 100 ? 'bg-green-500' : 'bg-teal-500'}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-600 w-10 text-right">{Math.round(pct)}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {selected.status === 'dispatched' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-center gap-3 text-blue-800">
                    <Truck className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">Shipment is in transit. Awaiting delivery confirmation.</p>
                  </div>
                  <Button 
                    className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
                    onClick={() => {
                      const initial: { [key: string]: number } = {};
                      selected.items.forEach(item => {
                        initial[item.productID] = item.issuedQuantity || item.quantity;
                      });
                      setReceivedQtys(initial);
                      setShowReceiveModal(true);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Items Received
                  </Button>
                </div>
              )}
              {selected.status === 'pending' && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-3 text-amber-800">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">Order is awaiting supplier acknowledgment and dispatch.</p>
                </div>
              )}

              <Button variant="outline" className="w-full" onClick={() => setShowModal(false)}>Close</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Receive Modal */}
      <Dialog open={showReceiveModal} onOpenChange={setShowReceiveModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black">
              <CheckCircle className="w-5 h-5 text-teal-600" />
              Confirm Delivery Reception
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600 mb-4">
              Verify the items received from the supplier. Specify the accepted quantity; the difference will be marked as rejected.
            </p>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Item Name</TableHead>
                    <TableHead className="text-center">Dispatched Qty</TableHead>
                    <TableHead className="w-32">Received Qty</TableHead>
                    <TableHead className="text-center text-red-600">Rejected</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selected?.items?.map((item) => (
                    <TableRow key={item.productID}>
                      <TableCell className="font-bold text-slate-900">{item.name}</TableCell>
                      <TableCell className="text-center font-black">{item.issuedQuantity || 0}</TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          min="0"
                          max={item.issuedQuantity || 0}
                          value={receivedQtys[item.productID] ?? (item.issuedQuantity || 0)}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setReceivedQtys(prev => ({ ...prev, [item.productID]: Math.min(val, item.issuedQuantity || 0) }));
                          }}
                          className="h-9 border-teal-200 font-bold text-center"
                        />
                      </TableCell>
                      <TableCell className="text-center font-black text-red-600">
                        {(item.issuedQuantity || 0) - (receivedQtys[item.productID] ?? (item.issuedQuantity || 0))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={() => setShowReceiveModal(false)}>Cancel</Button>
            <Button 
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold"
              disabled={isSubmitting}
              onClick={async () => {
                if (!selected) return;
                try {
                  setIsSubmitting(true);
                  const itemsToUpdate = selected.items.map(item => {
                    const received = receivedQtys[item.productID] ?? (item.issuedQuantity || 0);
                    return {
                      productID: item.productID,
                      receivedQuantity: received,
                      rejectedQuantity: (item.issuedQuantity || 0) - received
                    };
                  });
                  await axios.put(`http://localhost:5900/api/supplier-orders/${selected._id}/confirm-delivery`, {
                    items: itemsToUpdate
                  });
                  toast.success("Delivery confirmed successfully");
                  setShowReceiveModal(false);
                  setShowModal(false);
                  fetchOrders();
                } catch (err) {
                  toast.error("Failed to confirm delivery");
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Finalize Reception"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
