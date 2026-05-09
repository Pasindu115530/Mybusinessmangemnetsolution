import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SupplierLayout } from './SupplierLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { toast } from 'sonner';
import {
  Truck,
  CheckCircle2,
  Clock,
  Package,
  Send,
  Upload,
  FileText,
  CheckCircle,
  Loader2,
  Search,
  MapPin,
  ShieldCheck,
  AlertCircle,
  Receipt
} from 'lucide-react';

interface Order {
  _id: string;
  po_id: string;
  status: string;
}

interface DeliveryProgress {
  totalItems: number;
  dispatchedItems: number;
  receivedItems: number;
  items: Array<{
    name: string;
    ordered: number;
    issued: number;
    received: number;
    rejected: number;
  }>;
}

export function DeliveryDispatch() {
  const location = useLocation();
  const navigate = useNavigate();
  const stateOrderId = (location.state as { orderId?: string })?.orderId;

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(stateOrderId || '');
  const [progress, setProgress] = useState<DeliveryProgress | null>(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const getAuthHeader = () => {
    const token = localStorage.getItem('supplierToken') || localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const headers = getAuthHeader();
      const res = await axios.get('http://localhost:5900/api/suppliers/orders/dispatch-list', { headers });
      setOrders(res.data.orders || []);
      if (!selectedOrderId && res.data.orders?.length > 0) {
        setSelectedOrderId(res.data.orders[0]._id);
      }
    } catch (err: any) {
      toast.error('Failed to load dispatchable orders');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchProgress = async (id: string) => {
    if (!id) return;
    try {
      setIsLoadingProgress(true);
      const headers = getAuthHeader();
      const res = await axios.get(`http://localhost:5900/api/suppliers/orders/${id}/delivery-progress`, { headers });
      setProgress(res.data.progress);
    } catch (err: any) {
      console.error('Progress fetch error:', err);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedOrderId) {
      fetchProgress(selectedOrderId);
    }
  }, [selectedOrderId]);

  const handleDispatch = async () => {
    if (!selectedOrderId) return;
    try {
      setIsDispatching(true);
      const headers = getAuthHeader();
      await axios.post(`http://localhost:5900/api/suppliers/orders/${selectedOrderId}/dispatch`, {
        vehicleNumber,
        driverName,
        deliveryNotes
      }, { headers });
      
      setShowSuccessModal(true);
      fetchOrders();
      fetchProgress(selectedOrderId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to dispatch order');
    } finally {
      setIsDispatching(false);
    }
  };

  const selectedOrderObj = orders.find(o => o._id === selectedOrderId);

  return (
    <SupplierLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-8 text-white shadow-modern-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-5 h-5" />
              <span className="text-green-100 uppercase tracking-wider text-xs font-bold font-mono">Logistics Management</span>
            </div>
            <h1 className="text-3xl mb-2 font-black">Delivery & Dispatch</h1>
            <p className="text-green-100 opacity-90">Manage order fulfillment, logistics details, and transit progress</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            {/* Order Selection */}
            <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
              <CardHeader className="bg-slate-50/80 border-b border-slate-100">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-600" />
                  Select Order
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingOrders ? (
                  <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-green-600" /></div>
                ) : (
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-400">Order Reference</Label>
                    <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                      <SelectTrigger className="border-slate-200 h-12 rounded-xl">
                        <SelectValue placeholder="Select an order" />
                      </SelectTrigger>
                      <SelectContent>
                        {orders.length === 0 ? (
                          <SelectItem value="none" disabled>No orders ready to dispatch</SelectItem>
                        ) : (
                          orders.map(o => (
                            <SelectItem key={o._id} value={o._id}>{o.po_id || 'PO-NEW'}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Progress Stats */}
            <Card className="modern-card border-0 shadow-modern-lg overflow-hidden bg-slate-900 text-white">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Item Fulfillment</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {isLoadingProgress ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-green-400" /></div>
                ) : progress ? (
                  <>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Total Line Items</span>
                        <span className="font-bold">{progress.totalItems}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Successfully Received</span>
                        <span className="font-bold text-green-400">{progress.receivedItems}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Progress Visualization</p>
                      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500 h-full transition-all duration-1000" 
                          style={{ width: `${(progress.receivedItems / progress.totalItems) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-slate-500 italic text-sm">Select an order to see progress</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Dispatch Form */}
            <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
              <CardHeader className="bg-slate-50/80 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                  <Send className="w-4 h-4 text-green-600" />
                  Dispatch Information
                </CardTitle>
                {selectedOrderObj && (
                  <Badge className="bg-green-100 text-green-700 border-green-200 capitalize">
                    {selectedOrderObj.status}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Vehicle Number *</Label>
                    <div className="relative">
                      <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        placeholder="e.g. WP-ABC-1234"
                        className="pl-10 border-slate-200 h-12 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Driver Name *</Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        placeholder="Enter driver name"
                        className="pl-10 border-slate-200 h-12 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Delivery Notes</Label>
                  <Textarea 
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Add special instructions for delivery..."
                    className="min-h-[100px] border-slate-200 rounded-xl focus:border-green-400 transition-colors"
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <Button
                    onClick={handleDispatch}
                    disabled={isDispatching || !selectedOrderId || !vehicleNumber || !driverName}
                    className="h-14 px-10 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-green-100 disabled:opacity-50"
                  >
                    {isDispatching ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Finalize Dispatch <Send className="w-4 h-4 ml-2" /></>}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Item Breakdown */}
            <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
              <CardHeader className="bg-slate-50/80 border-b border-slate-100">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  Itemized Transit Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-0">
                        <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 pl-6">Product</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 text-center">Ordered</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 text-center">In Transit</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 text-center">Received</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingProgress ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-green-600" /></TableCell></TableRow>
                      ) : progress?.items.map((item, idx) => (
                        <TableRow key={idx} className="border-slate-100">
                          <TableCell className="pl-6 py-4 font-bold text-slate-700">{item.name}</TableCell>
                          <TableCell className="text-center font-black text-slate-400">{item.ordered}</TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-blue-50 text-blue-600 border-blue-100">{item.issued}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-green-50 text-green-600 border-green-100">{item.received}</Badge>
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow><TableCell colSpan={4} className="text-center py-10 text-slate-400 italic">No progress data available</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="border-0 shadow-2xl max-w-md p-0 overflow-hidden">
          <div className="text-center p-8 bg-green-50">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-green-200/50">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900">Dispatch Successful!</DialogTitle>
            <p className="text-slate-500 mt-2">
              The order has been marked as dispatched. Real-time tracking is now available for the customer and administration.
            </p>
          </div>
          
          <div className="p-8 space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">Vehicle Number</span>
                <span className="text-slate-900 font-black">{vehicleNumber}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">Driver</span>
                <span className="text-slate-900 font-black">{driverName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">Time</span>
                <span className="text-slate-900 font-black">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            <Button
              onClick={() => navigate('/supplier/quotations')}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
            >
              Go to Quotations
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SupplierLayout>
  );
}
