import { useState } from 'react';
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
  Upload,
  MapPin,
  Clock,
  AlertCircle,
  ArrowRight,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Filter,
  Download,
  Edit,
  Sparkles
} from 'lucide-react';

interface PurchaseOrder {
  id: string;
  supplier: string;
  orderDate: string;
  expectedDelivery: string;
  totalItems: number;
  totalAmount: number;
  status: 'pending' | 'dispatched' | 'in-transit' | 'partially-received' | 'completed';
}

interface OrderItem {
  id: number;
  name: string;
  orderedQty: number;
  receivedQty: number;
  damagedQty: number;
  unitPrice: number;
  warehouse: string;
  confirmed: boolean;
}

interface TimelineStep {
  name: string;
  status: 'completed' | 'current' | 'pending';
  date?: string;
  notes?: string;
}

const purchaseOrders: PurchaseOrder[] = [
  { id: 'PO-20240115', supplier: 'Tech Supplies Inc', orderDate: '2024-01-15', expectedDelivery: '2024-01-25', totalItems: 5, totalAmount: 45000, status: 'completed' },
  { id: 'PO-20240112', supplier: 'Global Trade Partners', orderDate: '2024-01-12', expectedDelivery: '2024-01-22', totalItems: 3, totalAmount: 28000, status: 'in-transit' },
  { id: 'PO-20240110', supplier: 'Premium Materials Co', orderDate: '2024-01-10', expectedDelivery: '2024-01-20', totalItems: 8, totalAmount: 62000, status: 'dispatched' },
  { id: 'PO-20240108', supplier: 'Swift Logistics Ltd', orderDate: '2024-01-08', expectedDelivery: '2024-01-18', totalItems: 4, totalAmount: 35000, status: 'pending' },
];

const sampleItems: OrderItem[] = [
  { id: 1, name: 'Product A - Electronics', orderedQty: 500, receivedQty: 0, damagedQty: 0, unitPrice: 250, warehouse: '', confirmed: false },
  { id: 2, name: 'Product B - Furniture', orderedQty: 300, receivedQty: 0, damagedQty: 0, unitPrice: 180, warehouse: '', confirmed: false },
  { id: 3, name: 'Product C - Textiles', orderedQty: 200, receivedQty: 0, damagedQty: 0, unitPrice: 45, warehouse: '', confirmed: false },
];

export function PurchaseOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('list');
  const [selectedPO, setSelectedPO] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>(sampleItems);
  const [currentStatus, setCurrentStatus] = useState<string>('in-transit');
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('TRK-2024-5678');

  const timeline: TimelineStep[] = [
    { name: 'Purchase Order Sent', status: 'completed', date: '2024-01-12 10:30 AM', notes: 'PO sent to supplier via email' },
    { name: 'Supplier Confirmed', status: 'completed', date: '2024-01-12 02:15 PM', notes: 'Order confirmed by supplier' },
    { name: 'Goods Dispatched', status: 'completed', date: '2024-01-14 09:00 AM', notes: 'Goods dispatched from warehouse' },
    { name: 'In Transit', status: 'current', date: '2024-01-15 11:30 AM', notes: 'Package in transit - ETA 2 days' },
    { name: 'Goods Received', status: 'pending', notes: 'Awaiting delivery' },
    { name: 'Stock Updated', status: 'pending', notes: 'Pending goods receipt' },
  ];

  const updateItemField = (id: number, field: keyof OrderItem, value: any) => {
    setOrderItems(orderItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleReceiveGoods = () => {
    setShowReceiveModal(false);
    setShowSuccessModal(true);
    setCurrentStatus('completed');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in-transit':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'dispatched':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'partially-received':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'pending':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'in-transit':
        return <Truck className="w-3 h-3 mr-1" />;
      case 'dispatched':
        return <Send className="w-3 h-3 mr-1" />;
      case 'pending':
        return <Clock className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const canSendPO = currentStatus === 'pending';
  const canMarkDispatched = currentStatus === 'pending' || currentStatus === 'dispatched';
  const canReceiveGoods = currentStatus === 'in-transit' || currentStatus === 'dispatched';
  const canCompleteOrder = currentStatus === 'partially-received';

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb and Header */}
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
            <span>Admin</span>
            <span>/</span>
            <span>Supplier Management</span>
            <span>/</span>
            <span className="text-blue-600">Purchase Orders</span>
          </div>
          
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 text-white shadow-modern-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="w-5 h-5" />
                <span className="text-blue-100">Supplier Management</span>
              </div>
              <h1 className="text-3xl mb-2">Purchase Orders & Delivery Tracking</h1>
              <p className="text-blue-100">Manage purchase orders, track deliveries, and update stock automatically</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px] bg-slate-100">
            <TabsTrigger value="list" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Purchase Orders
            </TabsTrigger>
            <TabsTrigger value="view" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Eye className="w-4 h-4 mr-2" />
              View Order
            </TabsTrigger>
          </TabsList>

          {/* Section 1: Purchase Orders List */}
          <TabsContent value="list" className="mt-6">
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                    Purchase Orders List
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search PO or supplier..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-64 border-slate-200"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48 border-slate-200">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="dispatched">Dispatched</SelectItem>
                        <SelectItem value="in-transit">In Transit</SelectItem>
                        <SelectItem value="partially-received">Partially Received</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
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
                        <TableHead>PO Number</TableHead>
                        <TableHead>Supplier Name</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Expected Delivery</TableHead>
                        <TableHead>Total Items</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Delivery Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="text-slate-900">{order.id}</TableCell>
                          <TableCell className="text-slate-900">{order.supplier}</TableCell>
                          <TableCell className="text-slate-600">{order.orderDate}</TableCell>
                          <TableCell className="text-slate-600">{order.expectedDelivery}</TableCell>
                          <TableCell className="text-slate-900">{order.totalItems} items</TableCell>
                          <TableCell className="text-slate-900">${order.totalAmount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusIcon(order.status)}
                              {order.status.replace('-', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="hover:bg-blue-50 hover:text-blue-600"
                                onClick={() => {
                                  setSelectedPO(order.id);
                                  setActiveTab('view');
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="hover:bg-purple-50 hover:text-purple-600">
                                <Truck className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="hover:bg-green-50 hover:text-green-600">
                                <Package className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* View/Create Purchase Order Tab */}
          <TabsContent value="view" className="mt-6 space-y-6">
            {/* Section 2: Supplier Information */}
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Supplier Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-200">
                    <h3 className="text-blue-900 mb-4">Global Trade Partners</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Phone className="w-4 h-4 text-blue-600" />
                        +1 234 567 8901
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Mail className="w-4 h-4 text-blue-600" />
                        info@globaltrade.com
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Quotation Ref: <span className="text-slate-900">QT-20240110</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-200">
                    <h3 className="text-purple-900 mb-4">Payment Terms</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Payment Method:</span>
                        <span className="text-slate-900">Bank Transfer</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Payment Terms:</span>
                        <span className="text-slate-900">Net 30 Days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Currency:</span>
                        <span className="text-slate-900">USD</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Purchase Order Items */}
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Order Items
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">Items from approved quotation</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead>Item Name</TableHead>
                        <TableHead>Ordered Qty</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total Price</TableHead>
                        <TableHead>Expected Delivery</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50/50">
                          <TableCell className="text-slate-900">{item.name}</TableCell>
                          <TableCell className="text-slate-900">{item.orderedQty} units</TableCell>
                          <TableCell className="text-slate-900">${item.unitPrice}</TableCell>
                          <TableCell className="text-slate-900">${(item.orderedQty * item.unitPrice).toLocaleString()}</TableCell>
                          <TableCell className="text-slate-600">2024-01-22</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 flex justify-end">
                  <div className="bg-blue-50 rounded-xl p-4 min-w-[300px]">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Subtotal:</span>
                        <span className="text-slate-900">$134,000</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Tax (10%):</span>
                        <span className="text-slate-900">$13,400</span>
                      </div>
                      <div className="border-t-2 border-blue-200 pt-2 flex justify-between">
                        <span className="text-blue-900">Total Amount:</span>
                        <span className="text-blue-900">$147,400</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Delivery Tracking Timeline */}
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  Delivery Tracking Timeline
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">Track order progress from purchase to stock update</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="relative">
                  {timeline.map((step, index) => (
                    <div key={index} className="flex gap-4 pb-8 last:pb-0">
                      {/* Timeline line */}
                      {index !== timeline.length - 1 && (
                        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-200"></div>
                      )}
                      
                      {/* Status icon */}
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

                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <div className={`p-4 rounded-xl border-2 ${
                          step.status === 'completed'
                            ? 'bg-green-50 border-green-200'
                            : step.status === 'current'
                            ? 'bg-blue-50 border-blue-300 shadow-md'
                            : 'bg-slate-50 border-slate-200'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className={
                              step.status === 'completed'
                                ? 'text-green-900'
                                : step.status === 'current'
                                ? 'text-blue-900'
                                : 'text-slate-600'
                            }>
                              {step.name}
                            </h4>
                            {step.date && (
                              <Badge variant="outline" className="text-xs">
                                {step.date}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600">{step.notes}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Supplier Delivery Updates */}
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Label>Tracking Number</Label>
                    <Input
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="mt-1 border-slate-200"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label>Vehicle Reference</Label>
                    <Input
                      value="VEH-TRK-456"
                      className="mt-1 border-slate-200"
                      readOnly
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <Label>Supplier Notes</Label>
                    <Textarea
                      value="Package dispatched from our main warehouse. Expected delivery within 2 business days. Please ensure receiving staff are available during business hours."
                      className="mt-1 border-slate-200 bg-slate-50"
                      readOnly
                      rows={3}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <Label>Delivery Documents</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-900">Invoice_PO-20240112.pdf</p>
                            <p className="text-xs text-slate-500">245 KB</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-900">Delivery_Note_20240112.pdf</p>
                            <p className="text-xs text-slate-500">128 KB</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 6: Receive Goods */}
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Receive Goods & Stock Update
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">Record received quantities and update stock</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead>Confirm</TableHead>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Ordered Qty</TableHead>
                        <TableHead>Received Qty</TableHead>
                        <TableHead>Damaged/Missing</TableHead>
                        <TableHead>Warehouse Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50/50">
                          <TableCell>
                            <Checkbox
                              checked={item.confirmed}
                              onCheckedChange={(checked) => 
                                updateItemField(item.id, 'confirmed', checked)
                              }
                            />
                          </TableCell>
                          <TableCell className="text-slate-900">{item.name}</TableCell>
                          <TableCell className="text-slate-900">{item.orderedQty}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.receivedQty}
                              onChange={(e) => updateItemField(item.id, 'receivedQty', parseInt(e.target.value) || 0)}
                              className="w-24 border-slate-200"
                              placeholder="0"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.damagedQty}
                              onChange={(e) => updateItemField(item.id, 'damagedQty', parseInt(e.target.value) || 0)}
                              className="w-24 border-slate-200"
                              placeholder="0"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.warehouse}
                              onValueChange={(value) => updateItemField(item.id, 'warehouse', value)}
                            >
                              <SelectTrigger className="w-40 border-slate-200">
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="warehouse-a">Warehouse A</SelectItem>
                                <SelectItem value="warehouse-b">Warehouse B</SelectItem>
                                <SelectItem value="warehouse-c">Warehouse C</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-900 mb-1">Important Notice</p>
                      <p className="text-sm text-yellow-700">
                        Confirming goods receipt will automatically add received items to stock. 
                        Please verify all quantities and warehouse locations before proceeding.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 8: Actions */}
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 justify-end">
                  <Button
                    variant="outline"
                    disabled={!canSendPO}
                    className="border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Purchase Order
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!canMarkDispatched}
                    className="border-purple-300 text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Mark as Dispatched
                  </Button>
                  <Button
                    disabled={!canReceiveGoods}
                    onClick={() => setShowReceiveModal(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Goods Received
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!canCompleteOrder}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Receive Goods Confirmation Modal */}
      <Dialog open={showReceiveModal} onOpenChange={setShowReceiveModal}>
        <DialogContent className="border-0 shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Confirm Goods Receipt
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 mb-4">
              You are about to confirm receipt of goods for Purchase Order <span className="text-blue-600 font-medium">PO-20240112</span>.
            </p>
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <h4 className="text-blue-900 mb-2">What will happen:</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Received items will be added to stock automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Stock activity log will be created</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>PO reference will be linked to stock records</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Order status will be updated to "Completed"</span>
                </li>
              </ul>
            </div>
            <p className="text-sm text-slate-600">
              Are you sure you want to proceed?
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowReceiveModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReceiveGoods}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              Confirm & Update Stock
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="border-0 shadow-2xl max-w-md">
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <DialogTitle className="text-2xl mb-2">Stock Updated Successfully!</DialogTitle>
            <p className="text-slate-600 mb-6">
              Received items have been added to stock automatically.
            </p>
            <div className="bg-green-50 rounded-xl p-4 mb-6 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Purchase Order:</span>
                  <span className="text-slate-900">PO-20240112</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Items Added:</span>
                  <span className="text-slate-900">3 items</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total Quantity:</span>
                  <span className="text-slate-900">1,000 units</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Status:</span>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                setActiveTab('list');
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              View Purchase Orders
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
