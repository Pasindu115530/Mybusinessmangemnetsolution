import { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
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
  Download,
  Truck,
  CheckCircle,
  Package,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Hash,
  Clock,
  Edit,
  XCircle,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Send,
  ShoppingBag,
  Printer
} from 'lucide-react';

interface CustomerOrder {
  id: string;
  customer: string;
  quotationRef: string;
  orderDate: string;
  totalItems: number;
  totalAmount: number;
  status: 'pending' | 'dispatched' | 'in-transit' | 'partially-delivered' | 'completed';
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

const customerOrders: CustomerOrder[] = [
  { id: 'ORD-20240115', customer: 'Acme Corp', quotationRef: 'QT-20240110', orderDate: '2024-01-15', totalItems: 3, totalAmount: 15000, status: 'completed' },
  { id: 'ORD-20240114', customer: 'XYZ Industries', quotationRef: 'QT-20240109', orderDate: '2024-01-14', totalItems: 5, totalAmount: 22000, status: 'in-transit' },
  { id: 'ORD-20240113', customer: 'Tech Solutions', quotationRef: 'QT-20240108', orderDate: '2024-01-13', totalItems: 2, totalAmount: 8500, status: 'dispatched' },
  { id: 'ORD-20240112', customer: 'Global Enterprises', quotationRef: 'QT-20240107', orderDate: '2024-01-12', totalItems: 4, totalAmount: 18000, status: 'pending' },
];

const orderItems: OrderItem[] = [
  { id: 1, name: 'Product A - Electronics', orderedQty: 500, receivedQty: 0, damagedQty: 0, unitPrice: 250, warehouse: '', confirmed: false },
  { id: 2, name: 'Product B - Furniture', orderedQty: 300, receivedQty: 0, damagedQty: 0, unitPrice: 180, warehouse: '', confirmed: false },
  { id: 3, name: 'Product C - Textiles', orderedQty: 200, receivedQty: 0, damagedQty: 0, unitPrice: 45, warehouse: '', confirmed: false },
];

export function CustomerOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('list');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [items, setItems] = useState<OrderItem[]>(orderItems);
  const [currentStatus, setCurrentStatus] = useState<string>('in-transit');
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const timeline: TimelineStep[] = [
    { name: 'Quotation Accepted', status: 'completed', date: '2024-01-14 10:00 AM', notes: 'Customer accepted quotation' },
    { name: 'Goods Prepared', status: 'completed', date: '2024-01-14 02:30 PM', notes: 'Order prepared for delivery' },
    { name: 'Dispatched', status: 'completed', date: '2024-01-15 09:00 AM', notes: 'Package dispatched to customer' },
    { name: 'In Transit', status: 'current', date: '2024-01-15 03:00 PM', notes: 'Package in transit - ETA 1 day' },
    { name: 'Delivered', status: 'pending', notes: 'Awaiting delivery confirmation' },
    { name: 'Stock Updated', status: 'pending', notes: 'Pending delivery completion' },
  ];

  const updateItemField = (id: number, field: keyof OrderItem, value: any) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleConfirmDelivery = () => {
    setShowReceiveModal(false);
    setShowSuccessModal(true);
    setCurrentStatus('completed');
  };

  const handleGenerateInvoice = () => {
    setShowInvoiceModal(true);
  };

  const handleDownloadInvoice = () => {
    // In a real app, this would generate and download a PDF
    alert('Invoice downloaded successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in-transit':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'dispatched':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'partially-delivered':
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

  const filteredOrders = customerOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const canGenerateInvoice = currentStatus !== 'pending';
  const canUpdateStatus = currentStatus !== 'completed';
  const canConfirmDelivery = currentStatus === 'in-transit' || currentStatus === 'dispatched';
  const canEditOrder = currentStatus === 'pending';

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb and Header */}
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
            <span>Admin</span>
            <span>/</span>
            <span>Customer Management</span>
            <span>/</span>
            <span className="text-amber-600">Customer Orders</span>
          </div>
          
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600 via-orange-600 to-yellow-600 p-8 text-white shadow-modern-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-5 h-5" />
                <span className="text-amber-100">Customer Management</span>
              </div>
              <h1 className="text-3xl mb-2">Customer Orders</h1>
              <p className="text-amber-100">Manage orders, track deliveries, and generate invoices</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px] bg-slate-100">
            <TabsTrigger value="list" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Orders List
            </TabsTrigger>
            <TabsTrigger value="view" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <Eye className="w-4 h-4 mr-2" />
              Order Details
            </TabsTrigger>
          </TabsList>

          {/* Section 1: Orders List */}
          <TabsContent value="list" className="mt-6">
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-amber-600" />
                    Customer Orders List
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search orders or customer..."
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
                        <SelectItem value="partially-delivered">Partially Delivered</SelectItem>
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
                        <TableHead>Order Number</TableHead>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Quotation Ref</TableHead>
                        <TableHead>Order Date</TableHead>
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
                          <TableCell className="text-slate-900">{order.customer}</TableCell>
                          <TableCell className="text-slate-600">{order.quotationRef}</TableCell>
                          <TableCell className="text-slate-600">{order.orderDate}</TableCell>
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
                                className="hover:bg-amber-50 hover:text-amber-600"
                                onClick={() => {
                                  setSelectedOrder(order.id);
                                  setActiveTab('view');
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:text-blue-600" onClick={handleGenerateInvoice}>
                                <FileText className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="hover:bg-purple-50 hover:text-purple-600">
                                <Truck className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="hover:bg-green-50 hover:text-green-600">
                                <CheckCircle className="w-4 h-4" />
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

          {/* View Order Tab */}
          <TabsContent value="view" className="mt-6 space-y-6">
            {/* Section 2: Order Details & Invoice */}
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    Order Details & Invoice
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleGenerateInvoice}
                      disabled={!canGenerateInvoice}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Invoice
                    </Button>
                    <Button 
                      onClick={handleDownloadInvoice}
                      disabled={!canGenerateInvoice}
                      className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Invoice Info */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Hash className="w-5 h-5 text-amber-600" />
                      <h3 className="text-amber-900">Invoice Information</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Invoice Number:</span>
                        <span className="text-slate-900">INV-20240114</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Order Number:</span>
                        <span className="text-slate-900">ORD-20240114</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Order Date:</span>
                        <span className="text-slate-900">2024-01-14</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Quotation Ref:</span>
                        <span className="text-slate-900">QT-20240109</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-blue-600" />
                      <h3 className="text-blue-900">Customer Details</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="text-slate-900">XYZ Industries</div>
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        123 Business Street, Suite 400, NY 10001
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Phone className="w-4 h-4 text-blue-600" />
                        +1 234 567 8902
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Mail className="w-4 h-4 text-blue-600" />
                        contact@xyzindustries.com
                      </div>
                    </div>
                  </div>
                </div>

                {/* Itemized List */}
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50/50">
                          <TableCell className="text-slate-900">{item.name}</TableCell>
                          <TableCell className="text-slate-900">{item.orderedQty} units</TableCell>
                          <TableCell className="text-slate-900">${item.unitPrice}</TableCell>
                          <TableCell className="text-slate-900">${(item.orderedQty * item.unitPrice).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Invoice Summary */}
                <div className="mt-4 flex justify-end">
                  <div className="bg-amber-50 rounded-xl p-4 min-w-[300px]">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Subtotal:</span>
                        <span className="text-slate-900">$134,000</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Tax (10%):</span>
                        <span className="text-slate-900">$13,400</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Discount:</span>
                        <span className="text-green-600">-$5,400</span>
                      </div>
                      <div className="border-t-2 border-amber-200 pt-2 flex justify-between">
                        <span className="text-amber-900">Total Amount:</span>
                        <span className="text-amber-900">$142,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Delivery Tracking Timeline */}
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-600" />
                  Delivery Tracking Timeline
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">Track order progress from acceptance to delivery</p>
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
                          ? 'bg-gradient-to-br from-amber-500 to-orange-600 animate-pulse'
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
                            ? 'bg-amber-50 border-amber-300 shadow-md'
                            : 'bg-slate-50 border-slate-200'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className={
                              step.status === 'completed'
                                ? 'text-green-900'
                                : step.status === 'current'
                                ? 'text-amber-900'
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

            {/* Section 4: Goods Receipt & Stock Update */}
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-600" />
                  Confirm Delivery & Stock Update
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">Confirm delivery and update stock quantities</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead>Confirm</TableHead>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Ordered Qty</TableHead>
                        <TableHead>Delivered Qty</TableHead>
                        <TableHead>Damaged/Returned</TableHead>
                        <TableHead>Warehouse Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
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
                        Confirming delivery will automatically update stock quantities. 
                        Items will be deducted from inventory. Please verify all quantities before proceeding.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Actions */}
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 justify-end">
                  <Button
                    variant="outline"
                    onClick={handleGenerateInvoice}
                    disabled={!canGenerateInvoice}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Invoice
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!canUpdateStatus}
                    className="border-purple-300 text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Update Status
                  </Button>
                  <Button
                    disabled={!canConfirmDelivery}
                    onClick={() => setShowReceiveModal(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Delivery
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!canEditOrder}
                    className="text-red-600 border-red-300 hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Invoice Preview Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="border-0 shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                Invoice Preview
              </DialogTitle>
              <Button variant="outline" onClick={handleDownloadInvoice}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </DialogHeader>
          
          {/* Invoice Template */}
          <div className="bg-white p-8 border border-slate-200 rounded-lg">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl text-slate-900 mb-2">INVOICE</h2>
                <div className="text-sm text-slate-600">
                  <p>Invoice #: INV-20240114</p>
                  <p>Date: January 14, 2024</p>
                  <p>Order #: ORD-20240114</p>
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-xl text-slate-900 mb-2">Your Company Name</h3>
                <div className="text-sm text-slate-600">
                  <p>123 Business Avenue</p>
                  <p>New York, NY 10001</p>
                  <p>Phone: +1 234 567 8900</p>
                  <p>Email: info@company.com</p>
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-8 p-4 bg-slate-50 rounded-lg">
              <h4 className="text-sm text-slate-600 mb-2">BILL TO:</h4>
              <div className="text-slate-900">
                <p className="font-medium">XYZ Industries</p>
                <p className="text-sm">123 Business Street, Suite 400</p>
                <p className="text-sm">New York, NY 10001</p>
                <p className="text-sm">Phone: +1 234 567 8902</p>
              </div>
            </div>

            {/* Invoice Items */}
            <table className="w-full mb-8">
              <thead>
                <tr className="border-b-2 border-slate-300">
                  <th className="text-left py-3 text-sm text-slate-600">ITEM</th>
                  <th className="text-right py-3 text-sm text-slate-600">QTY</th>
                  <th className="text-right py-3 text-sm text-slate-600">UNIT PRICE</th>
                  <th className="text-right py-3 text-sm text-slate-600">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-200">
                    <td className="py-3 text-sm text-slate-900">{item.name}</td>
                    <td className="py-3 text-sm text-slate-900 text-right">{item.orderedQty}</td>
                    <td className="py-3 text-sm text-slate-900 text-right">${item.unitPrice}</td>
                    <td className="py-3 text-sm text-slate-900 text-right">${(item.orderedQty * item.unitPrice).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Invoice Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="text-slate-900">$134,000.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax (10%):</span>
                  <span className="text-slate-900">$13,400.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Discount:</span>
                  <span className="text-green-600">-$5,400.00</span>
                </div>
                <div className="border-t-2 border-slate-300 pt-2 flex justify-between">
                  <span className="text-slate-900">TOTAL:</span>
                  <span className="text-slate-900 text-xl">$142,000.00</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t pt-4 text-sm text-slate-600 text-center">
              <p>Thank you for your business!</p>
              <p className="mt-2">Payment due within 30 days. Please make checks payable to Your Company Name.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Delivery Modal */}
      <Dialog open={showReceiveModal} onOpenChange={setShowReceiveModal}>
        <DialogContent className="border-0 shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Confirm Delivery
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 mb-4">
              You are about to confirm delivery for Order <span className="text-amber-600 font-medium">ORD-20240114</span>.
            </p>
            <div className="bg-amber-50 rounded-xl p-4 mb-4">
              <h4 className="text-amber-900 mb-2">What will happen:</h4>
              <ul className="space-y-1 text-sm text-amber-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Stock will be deducted from inventory</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Stock activity log will be updated</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Order status will be marked as "Completed"</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Customer will be notified of delivery</span>
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
              onClick={handleConfirmDelivery}
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
            <DialogTitle className="text-2xl mb-2">Delivery Confirmed!</DialogTitle>
            <p className="text-slate-600 mb-6">
              Order has been marked as delivered and stock has been updated successfully.
            </p>
            <div className="bg-green-50 rounded-xl p-4 mb-6 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Order Number:</span>
                  <span className="text-slate-900">ORD-20240114</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Items Delivered:</span>
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
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
            >
              View Orders List
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
