import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Truck, CheckCircle, Clock, Package, Loader2, Send, AlertCircle, Receipt } from 'lucide-react';
import { toast } from 'sonner';

// 1. Define the Data Interface
interface OrderItem {
  productID: string;
  name: string;
  price: number;
  quantity: number;
  issuedQuantity: number;
  receivedQuantity: number;
  rejectedQuantity: number;
  restocked: boolean;
  image: string;
}

interface Delivery {
  id: string; // This is the orderID (e.g., ORD-001)
  _id: string; // MongoDB ID
  customer: string;
  status: string;
  orderDate: string;
  totalAmount: number;
  totalItems: number;
  items: OrderItem[];
}

export function CustomerDeliveryTracking() {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Delivery | null>(null);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issuingData, setIssuingData] = useState<{ [key: string]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Fetch Data Logic
  const fetchDeliveries = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5900/api/orders');
      setDeliveries(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching deliveries:", err);
      setError('Failed to load delivery data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleOpenIssueModal = (order: Delivery) => {
    setSelectedOrder(order);
    const initialIssuingData: { [key: string]: number } = {};
    order.items.forEach(item => {
      initialIssuingData[item.productID] = 0; // Default to 0
    });
    setIssuingData(initialIssuingData);
    setIssueModalOpen(true);
  };

  const handleIssuingChange = (productID: string, value: number, max: number) => {
    setIssuingData(prev => ({
      ...prev,
      [productID]: Math.min(Math.max(0, value), max)
    }));
  };

  const handleSubmitIssuing = async () => {
    if (!selectedOrder) return;

    try {
      setIsSubmitting(true);
      const issuedItems = Object.entries(issuingData)
        .filter(([_, qty]) => qty > 0)
        .map(([productID, quantityToIssue]) => ({
          productID,
          quantityToIssue
        }));

      if (issuedItems.length === 0) {
        toast.error("Please specify items to issue");
        setIsSubmitting(false);
        return;
      }

      await axios.put(`http://localhost:5900/api/orders/${selectedOrder._id}/issue-items`, {
        issuedItems
      });

      toast.success("Stock issued successfully");
      setIssueModalOpen(false);
      fetchDeliveries(); // Refresh data
    } catch (err) {
      console.error("Error issuing stock:", err);
      toast.error("Failed to issue stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [restockLoading, setRestockLoading] = useState<string | null>(null);

  const handleRestock = async (orderId: string, productID: string) => {
    try {
      setRestockLoading(`${orderId}-${productID}`);
      const response = await axios.put(`http://localhost:5900/api/orders/restock-rejected/${orderId}`, {
        productID
      });
      
      if (response.data) {
        toast.success("Item restocked and added back to inventory");
        fetchDeliveries();
      }
    } catch (err: any) {
      console.error("Error restocking:", err);
      const errorMsg = err.response?.data?.message || "Failed to restock item";
      toast.error(errorMsg);
    } finally {
      setRestockLoading(null);
    }
  };

  const handleCreateInvoice = async (order: Delivery) => {
    try {
      setIsSubmitting(true);
      await axios.post(`http://localhost:5900/api/invoices/create-from-order/${order._id}`);
      toast.success(`Invoice created successfully for ${order.id}`);
      fetchDeliveries(); // Refresh status
      navigate('/customer-invoices');
    } catch (err: any) {
      console.error("Error creating invoice:", err);
      const errorMsg = err.response?.data?.message || "Failed to create invoice";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Derived Stats
  const stats = [
    { label: 'Total Orders', count: deliveries.length, color: 'blue', icon: Truck },
    { label: 'In Transit', count: deliveries.filter(d => d.status === 'in-transit').length, color: 'yellow', icon: Clock },
    { label: 'Delivered', count: deliveries.filter(d => d.status === 'delivered').length, color: 'green', icon: CheckCircle },
    { label: 'Pending Dispatch', count: deliveries.filter(d => d.status === 'pending' || d.status === 'partially-issued').length, color: 'purple', icon: Package },
  ];

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Delivered</Badge>;
      case 'in-transit':
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">In Transit</Badge>;
      case 'dispatched':
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200">Dispatched</Badge>;
      case 'partially-issued':
        return <Badge className="bg-orange-50 text-orange-700 border-orange-200">Partially Issued</Badge>;
      default:
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">{status}</Badge>;
    }
  };

  const getProgress = (order: Delivery) => {
    const totalOrdered = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalIssued = order.items.reduce((sum, item) => sum + (item.issuedQuantity || 0), 0);
    return totalOrdered > 0 ? (totalIssued / totalOrdered) * 100 : 0;
  };

  // Show order in rejections section if it has ANY rejections (even if already restocked, until it is invoiced/resolved)
  const rejectedDeliveries = deliveries.filter(d => d.items.some(item => (item.rejectedQuantity || 0) > 0));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 text-white shadow-modern-lg">
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-5 h-5" />
              <span className="text-blue-100">Customer Management</span>
            </div>
            <h1 className="text-3xl mb-2">Customer Delivery Tracking</h1>
            <p className="text-blue-100">Track order delivery status and issue stock for dispatch</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="modern-card border-0 shadow-modern-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-slate-600`} />
                  </div>
                </div>
                <h3 className="text-sm text-slate-600 mb-1">{stat.label}</h3>
                <p className="text-2xl font-bold text-slate-900">
                  {isLoading ? "..." : stat.count}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Rejected Items Handling */}
        {rejectedDeliveries.length > 0 && (
          <Card className="modern-card border-0 shadow-modern-lg border-l-4 border-red-500">
            <CardHeader className="bg-red-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                Delivery Exceptions & Rejections
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {rejectedDeliveries.map(order => {
                  const hasPendingRestock = order.items.some(i => (i.rejectedQuantity || 0) > 0 && !i.restocked);
                  return (
                    <div key={order._id} className="border rounded-xl p-4 bg-slate-50/50">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex flex-col">
                          <div className="font-bold text-slate-900">Order: {order.id} - {order.customer}</div>
                          <div className="text-xs text-slate-500">Status: {order.status}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-white">{new Date(order.orderDate).toLocaleDateString()}</Badge>
                          {!hasPendingRestock && (
                            <Button 
                              size="sm" 
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => handleCreateInvoice(order)}
                            >
                              <Receipt className="w-4 h-4 mr-2" />
                              Create Invoice
                            </Button>
                          )}
                        </div>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item Name</TableHead>
                            <TableHead className="text-center">Issued</TableHead>
                            <TableHead className="text-center text-red-600">Rejected</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.items.filter(i => (i.rejectedQuantity || 0) > 0).map(item => (
                            <TableRow key={item.productID}>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell className="text-center">{item.issuedQuantity}</TableCell>
                              <TableCell className="text-center text-red-600 font-bold">{item.rejectedQuantity}</TableCell>
                              <TableCell className="text-right">
                                {item.restocked ? (
                                  <Badge className="bg-green-100 text-green-700 border-green-200">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Restocked
                                  </Badge>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleRestock(order._id, item.productID)}
                                    disabled={restockLoading === `${order._id}-${item.productID}`}
                                  >
                                    {restockLoading === `${order._id}-${item.productID}` ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Accept & Restock
                                      </>
                                    )}
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Table */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              Delivery Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issuing Progress</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-500">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Loading deliveries...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-red-500">
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : deliveries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    deliveries.map((delivery) => (
                      <TableRow key={delivery._id} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium text-slate-900">{delivery.id}</TableCell>
                        <TableCell className="text-slate-900">{delivery.customer}</TableCell>
                        <TableCell>
                          {getStatusBadge(delivery.status)}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs italic">
                              {Math.round(getProgress(delivery))}% Issued
                            </span>
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500" 
                                style={{ width: `${getProgress(delivery)}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">{new Date(delivery.orderDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {delivery.status.toLowerCase() === 'delivered' ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleCreateInvoice(delivery)}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                <Receipt className="w-4 h-4 mr-2" />
                                Create Invoice
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={delivery.status === 'dispatched'}
                                onClick={() => handleOpenIssueModal(delivery)}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                <Package className="w-4 h-4 mr-2" />
                                Issue Stock
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

      {/* Issue Stock Dialog */}
      <Dialog open={issueModalOpen} onOpenChange={setIssueModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Issue Stock for Order {selectedOrder?.id}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Item Name</TableHead>
                    <TableHead className="text-center">Ordered</TableHead>
                    <TableHead className="text-center">Issued</TableHead>
                    <TableHead className="w-32">Issue Now</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedOrder?.items.map((item) => (
                    <TableRow key={item.productID}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-center">{item.issuedQuantity || 0}</TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          min="0"
                          max={item.quantity - (item.issuedQuantity || 0)}
                          value={issuingData[item.productID] || 0}
                          onChange={(e) => handleIssuingChange(item.productID, parseInt(e.target.value) || 0, item.quantity - (item.issuedQuantity || 0))}
                          className="h-8"
                          disabled={item.issuedQuantity >= item.quantity}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                Specify the quantities you are issuing for delivery. Once all items are fully issued, the order status will change to "Dispatched".
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmitIssuing} 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Confirm Issue
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}