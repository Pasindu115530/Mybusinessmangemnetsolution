import { useState, useEffect } from 'react';
import axios from 'axios';
import { CustomerLayout } from './CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Truck,
  CheckCircle2,
  Clock,
  Package,
  Send,
  MapPin,
  Calendar,
  Upload,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  productID: string;
  name: string;
  price: number;
  quantity: number;
  issuedQuantity: number;
  receivedQuantity: number;
  rejectedQuantity: number;
  image: string;
}

interface Order {
  _id: string;
  orderID: string;
  status: string;
  orderDate: string; // Matches backend
  totalAmount: number; // Matches backend
  items: OrderItem[];
  delivery?: {
    trackingNumber?: string;
    estimatedDeliveryDate?: string;
    deliveryAddress?: string;
  };
}

interface TimelineStep {
  name: string;
  status: 'completed' | 'current' | 'pending';
  date?: string;
  notes?: string;
}

export function DeliveryTracking() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [receivedData, setReceivedData] = useState<{ [key: string]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userDataString = localStorage.getItem('user');
  const userData = userDataString ? JSON.parse(userDataString) : null;
  const customerId = userData?.id || userData?._id || localStorage.getItem('customID') || localStorage.getItem('customerId');

  const fetchOrders = async () => {
    console.log("Fetching orders for customerId:", customerId);
    if (!customerId) {
      console.error("No customerId found in localStorage");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5900/api/orders/customer/${customerId}`);
      // The API seems to return mapped orders, but let's see. 
      // Based on orderController.js, it returns: _id, orderID, quotationRef, orderDate, totalAmount, totalItems, status, customerID
      // Wait, that one doesn't return items. I might need a "get order by id" or update the customer route.
      // Let's check orderController.js again.
      
      // Ah, I see: getOrdersByCustomerId maps only a few fields. 
      // I should probably use a route that gives full details. 
      // For now, I'll assume I can fetch all and filter or I'll just use the admin route if allowed, 
      // but better to have a specific customer route.
      
      // Actually, I'll update the backend to include items in getOrdersByCustomerId.
      setOrders(response.data);
      if (response.data.length > 0 && !selectedOrderId) {
        setSelectedOrderId(response.data[0]._id);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [customerId]);

  const selectedOrder = orders.find(o => o._id === selectedOrderId);

  const handleOpenConfirmModal = () => {
    if (!selectedOrder || !selectedOrder.items) return;
    const initialData: { [key: string]: number } = {};
    selectedOrder.items.forEach(item => {
      initialData[item.productID] = item.issuedQuantity || 0; // Default to full issued quantity
    });
    setReceivedData(initialData);
    setConfirmModalOpen(true);
  };

  const handleReceivedChange = (productID: string, value: number, max: number) => {
    setReceivedData(prev => ({
      ...prev,
      [productID]: Math.min(Math.max(0, value), max)
    }));
  };

  const handleSubmitConfirmation = async () => {
    if (!selectedOrder) return;
    try {
      setIsSubmitting(true);
      const receivedItems = Object.entries(receivedData).map(([productID, receivedQuantity]) => ({
        productID,
        receivedQuantity
      }));

      await axios.put(`http://localhost:5900/api/orders/confirm-delivery/${selectedOrder._id}`, {
        receivedItems
      });

      toast.success("Delivery confirmed successfully");
      setConfirmModalOpen(false);
      fetchOrders();
    } catch (err) {
      console.error("Error confirming delivery:", err);
      toast.error("Failed to confirm delivery");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTimeline = (status: string | undefined): TimelineStep[] => {
    if (!status) return [];
    const s = status.toLowerCase();
    return [
      { name: 'Order Placed', status: 'completed', date: selectedOrder?.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString() : '' },
      { name: 'Processing', status: (s === 'pending' || s === 'processing') ? 'current' : 'completed' },
      { name: 'Dispatched', status: s === 'dispatched' ? 'current' : (s === 'in-transit' || s === 'delivered' || s === 'completed' ? 'completed' : 'pending') },
      { name: 'In Transit', status: s === 'in-transit' ? 'current' : (s === 'delivered' || s === 'completed' ? 'completed' : 'pending') },
      { name: 'Delivered', status: (s === 'delivered' || s === 'completed') ? 'completed' : 'pending' },
    ];
  };

  const timeline = selectedOrder ? getTimeline(selectedOrder.status) : [];

  if (loading && orders.length === 0) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 text-white shadow-modern-lg">
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-5 h-5" />
              <span className="text-blue-100">Delivery Management</span>
            </div>
            <h1 className="text-3xl mb-2">Delivery Tracking</h1>
            <p className="text-blue-100">Track your order delivery status in real-time</p>
          </div>
        </div>

        {/* Order Selection */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Select Order to Track
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
              <SelectTrigger className="border-slate-200">
                <SelectValue placeholder="Select an order" />
              </SelectTrigger>
              <SelectContent>
                {orders.length === 0 ? (
                  <div className="p-2 text-sm text-slate-500 text-center">No orders found for your account</div>
                ) : (
                  orders.map(order => (
                    <SelectItem key={order._id} value={order._id}>
                      {order.orderID} - {order.status}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedOrder ? (
          <>
            {/* Delivery Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="modern-card border-0 shadow-modern-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Delivery Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <div>
                    <p className="text-sm text-slate-600">Tracking Number</p>
                    <p className="text-slate-900">{selectedOrder.delivery?.trackingNumber || 'Awaiting Dispatch'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Estimated Delivery</p>
                    <p className="text-slate-900">
                      {selectedOrder.delivery?.estimatedDeliveryDate 
                        ? new Date(selectedOrder.delivery.estimatedDeliveryDate).toLocaleDateString() 
                        : 'To be announced'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Delivery Address</p>
                    <p className="text-slate-900">{selectedOrder.delivery?.deliveryAddress || 'Address on file'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="modern-card border-0 shadow-modern-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <div>
                    <p className="text-sm text-slate-600">Order Number</p>
                    <p className="text-slate-900 font-bold">{selectedOrder.orderID}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Items</p>
                    <p className="text-slate-900">{selectedOrder.items.length} items</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Status</p>
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200">{selectedOrder.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tracking Timeline */}
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    Delivery Timeline
                  </CardTitle>
                  <p className="text-sm text-slate-600 mt-1">Track your order progress from placement to delivery</p>
                </div>
                {(selectedOrder.status.toLowerCase() === 'dispatched' || selectedOrder.status.toLowerCase() === 'in-transit') && (
                  <Button 
                    onClick={handleOpenConfirmModal}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Delivery Receipt
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                <div className="relative">
                  {timeline.map((step, index) => (
                    <div key={index} className="flex gap-4 pb-8 last:pb-0">
                      {index !== timeline.length - 1 && (
                        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-200"></div>
                      )}
                      <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                        step.status === 'completed' 
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                          : step.status === 'current'
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-600 animate-pulse'
                          : 'bg-slate-200'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        ) : step.status === 'current' ? (
                          <Clock className="w-6 h-6 text-white" />
                        ) : (
                          <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className={`p-4 rounded-xl border-2 ${
                          step.status === 'completed' ? 'bg-green-50 border-green-200' : 
                          step.status === 'current' ? 'bg-blue-50 border-blue-300 shadow-md' : 
                          'bg-slate-50 border-slate-200'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className={step.status === 'completed' ? 'text-green-900' : step.status === 'current' ? 'text-blue-900' : 'text-slate-600'}>
                              {step.name}
                            </h4>
                            {step.date && (
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="w-3 h-3 mr-1" />
                                {step.date}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600">{step.notes || (step.status === 'completed' ? 'Step completed' : step.status === 'current' ? 'Currently in this stage' : 'Awaiting this stage')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Items Status (If delivered) */}
            {selectedOrder.status.toLowerCase() === 'delivered' && (
              <Card className="modern-card border-0 shadow-modern-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Received Items Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead>Item</TableHead>
                          <TableHead className="text-center">Issued</TableHead>
                          <TableHead className="text-center">Accepted</TableHead>
                          <TableHead className="text-center">Rejected</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items?.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className="text-center">{item.issuedQuantity}</TableCell>
                            <TableCell className="text-center text-green-600 font-bold">{item.receivedQuantity}</TableCell>
                            <TableCell className="text-center text-red-600 font-bold">{item.rejectedQuantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-slate-500">
            Select an order above to track its status.
          </div>
        )}
      </div>

      {/* Confirm Receipt Dialog */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Confirm Delivery Receipt
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600 mb-4">
              Please verify the items received. If any item is missing or damaged, you can reject the specific quantity.
            </p>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Item Name</TableHead>
                    <TableHead className="text-center">Issued Qty</TableHead>
                    <TableHead className="w-32">Accepted Qty</TableHead>
                    <TableHead className="text-center">Rejected</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedOrder?.items?.map((item) => (
                    <TableRow key={item.productID}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-center">{item.issuedQuantity}</TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          min="0"
                          max={item.issuedQuantity}
                          value={receivedData[item.productID] || 0}
                          onChange={(e) => handleReceivedChange(item.productID, parseInt(e.target.value) || 0, item.issuedQuantity)}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell className="text-center text-red-600">
                        {item.issuedQuantity - (receivedData[item.productID] || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-800">
                Warning: Once you submit this confirmation, the record will be final. Any rejected items will be reported back to the administrator.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmitConfirmation} 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Submit Confirmation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
}
