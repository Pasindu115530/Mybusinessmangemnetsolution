import { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import {
  FileText,
  Search,
  Eye,
  Truck,
  CheckCircle,
  X,
  Phone,
  Mail,
  Building2,
  Calendar,
  Package,
  Send,
  Download,
  Clock,
  AlertCircle,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

interface PurchaseOrder {
  id: string;
  po_id: string;
  supplier: string;
  orderDate: string;
  expectedDelivery: string;
  totalItems: number;
  totalAmount: number;
  status: string;
  items: any[];
}

export function PurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('list');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('http://localhost:5900/api/orders/purchase-orders', {
        headers: getAuthHeader()
      });
      setPurchaseOrders(res.data.orders || []);
    } catch (err: any) {
      toast.error('Failed to load purchase orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      await axios.put(`http://localhost:5900/api/orders/purchase-orders/${id}/status`, 
        { status: newStatus }, 
        { headers: getAuthHeader() }
      );
      toast.success(`Order updated to ${newStatus}`);
      fetchOrders();
      if (selectedPO?.id === id) {
        setSelectedPO({ ...selectedPO, status: newStatus });
      }
    } catch (err: any) {
      toast.error('Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'dispatched': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in-transit': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'confirmed': return 'bg-teal-100 text-teal-700 border-teal-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = order.po_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-8 text-white shadow-modern-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="w-5 h-5" />
              <span className="text-blue-100 uppercase tracking-widest text-xs font-bold">Procurement</span>
            </div>
            <h1 className="text-3xl mb-2 font-black">Purchase Orders</h1>
            <p className="text-blue-100 opacity-90">Track inventory restocking, supplier fulfillments, and delivery progress</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="list" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 font-bold">
              Active Orders
            </TabsTrigger>
            <TabsTrigger value="view" disabled={!selectedPO} className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 font-bold">
              Order Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
              <CardHeader className="bg-slate-50/80 border-b border-slate-100">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Purchase Ledger
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search PO or supplier..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-64 border-slate-200 rounded-xl"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48 border-slate-200 rounded-xl">
                        <SelectValue placeholder="Status Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="dispatched">Dispatched</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={fetchOrders} className="h-10 w-10 p-0 rounded-xl">
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-0">
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-6">PO Ref</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Supplier</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Date</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Total Value</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-right pr-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow><TableCell colSpan={6} className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></TableCell></TableRow>
                      ) : filteredOrders.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center py-20 text-slate-400 italic">No purchase orders found.</TableCell></TableRow>
                      ) : (
                        filteredOrders.map((order) => (
                          <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors border-b last:border-0 group">
                            <TableCell className="pl-6 py-4 font-mono font-bold text-blue-600">{order.po_id}</TableCell>
                            <TableCell className="py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900">{order.supplier}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Verified Partner</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 text-slate-500 text-sm">{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                            <TableCell className="py-4 font-black text-slate-900">${order.totalAmount.toLocaleString()}</TableCell>
                            <TableCell className="py-4 text-center">
                              <Badge className={`${getStatusColor(order.status)} border capitalize px-3 h-6 text-[10px] font-bold`}>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 text-right pr-6">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0 rounded-lg border-slate-200 hover:bg-blue-50 hover:text-blue-600"
                                onClick={() => {
                                  setSelectedPO(order);
                                  setActiveTab('view');
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="view" className="mt-6 space-y-6">
            {selectedPO && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Order Items */}
                  <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
                    <CardHeader className="bg-slate-50/80 border-b border-slate-100 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-600" />
                        Line Items
                      </CardTitle>
                      <Badge className="bg-blue-600 text-white border-0">{selectedPO.items?.length} Items</Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-0">
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-6">Product</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Quantity</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-right">Unit Price</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-right pr-6">Subtotal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedPO.items?.map((item: any, idx: number) => (
                            <TableRow key={idx} className="border-b last:border-0">
                              <TableCell className="pl-6 py-4 font-bold text-slate-700">{item.name}</TableCell>
                              <TableCell className="py-4 text-center font-black text-slate-400">{item.quantity} {item.unit}</TableCell>
                              <TableCell className="py-4 text-right text-slate-600 font-mono text-xs">${item.price?.toLocaleString()}</TableCell>
                              <TableCell className="py-4 text-right pr-6 font-black text-slate-900">${(item.quantity * item.price).toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Actions & Status Control */}
                  <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
                    <CardHeader className="bg-slate-50/80 border-b border-slate-100">
                      <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600">Administrative Controls</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex flex-wrap gap-4">
                        <Button 
                          onClick={() => handleUpdateStatus(selectedPO.id, 'confirmed')}
                          disabled={isUpdatingStatus || selectedPO.status === 'confirmed'}
                          className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl h-11 px-6 shadow-lg shadow-teal-100"
                        >
                          Confirm Order
                        </Button>
                        <Button 
                          onClick={() => handleUpdateStatus(selectedPO.id, 'cancelled')}
                          disabled={isUpdatingStatus || selectedPO.status === 'cancelled'}
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl h-11 px-6"
                        >
                          Cancel Order
                        </Button>
                        <div className="flex-1" />
                        <Button
                          onClick={() => handleUpdateStatus(selectedPO.id, 'completed')}
                          disabled={isUpdatingStatus || selectedPO.status === 'completed'}
                          className="bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest rounded-xl h-11 px-8 shadow-xl shadow-green-100"
                        >
                          Mark as Received
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  {/* Summary Card */}
                  <Card className="modern-card border-0 shadow-modern-lg overflow-hidden bg-slate-900 text-white">
                    <CardHeader className="border-b border-white/10">
                      <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Status</span>
                        <Badge className={`${getStatusColor(selectedPO.status)} border-0 font-bold`}>{selectedPO.status}</Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Items Count</span>
                        <span className="font-bold">{selectedPO.totalItems}</span>
                      </div>
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-1">Grand Total</p>
                        <p className="text-4xl font-black text-white">${selectedPO.totalAmount.toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Supplier Details */}
                  <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
                    <CardHeader className="bg-slate-50/80 border-b border-slate-100">
                      <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600">Supplier Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{selectedPO.supplier}</p>
                          <p className="text-xs text-slate-500">Verified System Supplier</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-100 space-y-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-4 h-4 text-blue-500" />
                          <span>{selectedPO.supplier}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-4 h-4 text-blue-500" />
                          <span>+94 77 123 4567</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
