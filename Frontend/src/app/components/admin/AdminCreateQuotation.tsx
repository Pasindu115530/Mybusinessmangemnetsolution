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
import {
  Send,
  Save,
  X,
  CheckCircle,
  FileText,
  DollarSign,
  Calendar,
  Package,
  Plus,
  Trash2,
  Search,
  Upload,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface QuotationItem {
  id: number;
  itemName: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: string;
  total: number;
  notes: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  contact: string;
  status: 'active' | 'inactive';
}

const customers: Customer[] = [
  { id: 'CUST-001', name: 'Acme Corp', email: 'contact@acme.com', contact: '+1 234 567 8900', status: 'active' },
  { id: 'CUST-002', name: 'XYZ Industries', email: 'info@xyz.com', contact: '+1 234 567 8901', status: 'active' },
  { id: 'CUST-003', name: 'Tech Solutions', email: 'hello@tech.com', contact: '+1 234 567 8902', status: 'active' },
  { id: 'CUST-004', name: 'Global Enterprises', email: 'sales@global.com', contact: '+1 234 567 8903', status: 'active' },
];

const stockItems = [
  'Product A - Electronics',
  'Product B - Furniture',
  'Product C - Textiles',
  'Product D - Hardware',
  'Product E - Software Licenses',
  'Product F - Office Supplies',
];

const quotationsMonthly = [
  { month: 'Jan', count: 12 },
  { month: 'Feb', count: 18 },
  { month: 'Mar', count: 15 },
  { month: 'Apr', count: 22 },
  { month: 'May', count: 28 },
  { month: 'Jun', count: 25 },
];

const quotationStatus = [
  { name: 'Approved', value: 65, color: '#10b981' },
  { name: 'Pending', value: 25, color: '#f59e0b' },
  { name: 'Rejected', value: 10, color: '#ef4444' },
];

const topCustomers = [
  { name: 'Acme Corp', value: 125000 },
  { name: 'XYZ Industries', value: 98000 },
  { name: 'Tech Solutions', value: 85000 },
  { name: 'Global Enterprises', value: 72000 },
  { name: 'Innovate Ltd', value: 65000 },
];

export function AdminCreateQuotation() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  
  const [items, setItems] = useState<QuotationItem[]>([
    { id: 1, itemName: '', quantity: 1, unitOfMeasure: 'pcs', unitPrice: '', total: 0, notes: '' },
  ]);
  
  const [quotationDetails, setQuotationDetails] = useState({
    quotationId: 'QT-' + Date.now().toString().slice(-6),
    creationDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    priority: 'medium',
    status: 'draft'
  });
  
  const [generalNotes, setGeneralNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Add new item row
  const addItem = () => {
    const newItem: QuotationItem = {
      id: items.length + 1,
      itemName: '',
      quantity: 1,
      unitOfMeasure: 'pcs',
      unitPrice: '',
      total: 0,
      notes: ''
    };
    setItems([...items, newItem]);
  };

  // Remove item row
  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  // Update item field
  const updateItem = (id: number, field: keyof QuotationItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // Recalculate total if quantity or price changes
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = field === 'quantity' ? parseFloat(value) || 0 : item.quantity;
          const price = field === 'unitPrice' ? parseFloat(value) || 0 : parseFloat(item.unitPrice) || 0;
          updated.total = qty * price;
        }
        
        return updated;
      }
      return item;
    }));
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0.1; // 10% VAT
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // Filter customers
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles([...uploadedFiles, ...Array.from(e.target.files)]);
    }
  };

  // Remove uploaded file
  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  // Handle submit
  const handleSubmit = (action: 'send' | 'draft') => {
    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }
    if (items.some(item => !item.itemName || item.quantity <= 0 || !item.unitPrice)) {
      alert('Please fill in all item details');
      return;
    }
    if (!quotationDetails.expiryDate) {
      alert('Please set an expiry date');
      return;
    }
    
    setShowSuccessModal(true);
  };

  // Reset form
  const handleReset = () => {
    setSelectedCustomer(null);
    setItems([{ id: 1, itemName: '', quantity: 1, unitOfMeasure: 'pcs', unitPrice: '', total: 0, notes: '' }]);
    setGeneralNotes('');
    setUploadedFiles([]);
    setQuotationDetails({
      quotationId: 'QT-' + Date.now().toString().slice(-6),
      creationDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      priority: 'medium',
      status: 'draft'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'draft': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 text-white shadow-modern-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Send className="w-5 h-5" />
              <span className="text-blue-100">Customer Management</span>
            </div>
            <h1 className="text-3xl mb-2">Create Quotation</h1>
            <p className="text-blue-100">Prepare and send quotation to customer</p>
          </div>
        </div>

        {/* Charts & Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quotations This Month */}
          <Card className="modern-card border-0 shadow-modern-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl pb-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Quotations This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={quotationsMonthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Approved vs Pending */}
          <Card className="modern-card border-0 shadow-modern-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl pb-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Quotation Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={quotationStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {quotationStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {quotationStatus.map((item) => (
                  <div key={item.name} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs text-slate-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card className="modern-card border-0 shadow-modern-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl pb-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Top Customers
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={topCustomers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '10px' }} angle={-15} textAnchor="end" height={60} />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Customer Selection */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Customer Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {!selectedCustomer ? (
              <div>
                <div className="flex gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      placeholder="Search customers by name or email..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="pl-10 border-slate-200"
                    />
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead>Customer ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer) => (
                        <TableRow key={customer.id} className="hover:bg-slate-50/50">
                          <TableCell className="text-slate-900">{customer.id}</TableCell>
                          <TableCell className="text-slate-900">{customer.name}</TableCell>
                          <TableCell className="text-slate-600">{customer.email}</TableCell>
                          <TableCell className="text-slate-600">{customer.contact}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              {customer.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCustomer(customer)}
                              className="hover:bg-blue-50 hover:text-blue-600"
                            >
                              Select
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Customer ID</p>
                      <p className="text-slate-900">{selectedCustomer.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Name</p>
                      <p className="text-slate-900">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Email</p>
                      <p className="text-slate-900">{selectedCustomer.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Contact</p>
                      <p className="text-slate-900">{selectedCustomer.contact}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCustomer(null)}
                    className="text-slate-600 hover:text-red-600"
                  >
                    Change
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quotation Details */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Quotation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label>Quotation ID</Label>
                <Input
                  value={quotationDetails.quotationId}
                  disabled
                  className="mt-1 bg-slate-50 border-slate-200"
                />
              </div>
              <div>
                <Label>Creation Date</Label>
                <Input
                  type="date"
                  value={quotationDetails.creationDate}
                  disabled
                  className="mt-1 bg-slate-50 border-slate-200"
                />
              </div>
              <div>
                <Label>Expiry Date <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={quotationDetails.expiryDate}
                  onChange={(e) => setQuotationDetails({ ...quotationDetails, expiryDate: e.target.value })}
                  className="mt-1 border-slate-200"
                  min={quotationDetails.creationDate}
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={quotationDetails.priority}
                  onValueChange={(value) => setQuotationDetails({ ...quotationDetails, priority: value })}
                >
                  <SelectTrigger className="mt-1 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1">
                  <Badge className={getStatusColor(quotationDetails.status)}>
                    {quotationDetails.status}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quotation Items */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Quotation Items
              </CardTitle>
              <Button
                onClick={addItem}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="w-[40px]">#</TableHead>
                    <TableHead className="min-w-[200px]">Item Name</TableHead>
                    <TableHead className="w-[120px]">Quantity</TableHead>
                    <TableHead className="w-[120px]">Unit</TableHead>
                    <TableHead className="w-[120px]">Unit Price ($)</TableHead>
                    <TableHead className="w-[120px]">Total ($)</TableHead>
                    <TableHead className="min-w-[200px]">Notes</TableHead>
                    <TableHead className="w-[80px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/50">
                      <TableCell className="text-slate-600">{index + 1}</TableCell>
                      <TableCell>
                        <Select
                          value={item.itemName}
                          onValueChange={(value) => updateItem(item.id, 'itemName', value)}
                        >
                          <SelectTrigger className="border-slate-200">
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            {stockItems.map((stockItem) => (
                              <SelectItem key={stockItem} value={stockItem}>
                                {stockItem}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                          className="border-slate-200"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.unitOfMeasure}
                          onValueChange={(value) => updateItem(item.id, 'unitOfMeasure', value)}
                        >
                          <SelectTrigger className="border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pcs">Pieces</SelectItem>
                            <SelectItem value="kg">Kilograms</SelectItem>
                            <SelectItem value="m">Meters</SelectItem>
                            <SelectItem value="box">Boxes</SelectItem>
                            <SelectItem value="set">Sets</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                          placeholder="0.00"
                          className="border-slate-200"
                        />
                      </TableCell>
                      <TableCell className="text-slate-900">
                        ${item.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.notes}
                          onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                          placeholder="Add notes..."
                          className="border-slate-200"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                          className="text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals Summary */}
            <div className="mt-6 flex justify-end">
              <div className="w-full md:w-96 space-y-3 p-6 bg-slate-50 rounded-xl">
                <div className="flex justify-between text-slate-700">
                  <span>Subtotal:</span>
                  <span className="text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Tax (VAT 10%):</span>
                  <span className="text-slate-900">${tax.toFixed(2)}</span>
                </div>
                <div className="h-px bg-slate-300"></div>
                <div className="flex justify-between text-lg text-slate-900">
                  <span>Total Amount:</span>
                  <span className="text-blue-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* General Notes */}
            <div>
              <Label>General Notes / Message to Customer</Label>
              <Textarea
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Add any additional information, terms, or special instructions..."
                className="mt-2 min-h-32 border-slate-200"
              />
            </div>

            {/* File Upload */}
            <div>
              <Label>Upload Documents (Optional)</Label>
              <div className="mt-2 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-slate-500">PDF, Images, Documents (Max 10MB each)</p>
                </label>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-slate-900">{file.name}</p>
                          <p className="text-xs text-slate-600">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 justify-end">
              <Button
                variant="outline"
                onClick={handleReset}
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel / Reset
              </Button>
              <Button
                onClick={() => handleSubmit('draft')}
                className="bg-slate-600 hover:bg-slate-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button
                onClick={() => handleSubmit('send')}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Quotation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="border-0 shadow-2xl max-w-md">
          <DialogHeader>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-center text-2xl">Quotation Sent Successfully!</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-slate-600 mb-2">Quotation ID</p>
              <p className="text-lg text-slate-900">{quotationDetails.quotationId}</p>
            </div>
            <p className="text-slate-600">
              The quotation has been sent to {selectedCustomer?.name}. You can track its status in the quotations list.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSuccessModal(false);
                  handleReset();
                }}
                className="flex-1"
              >
                Create Another
              </Button>
              <Button
                onClick={() => {
                  setShowSuccessModal(false);
                  // Navigate to quotations list
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                View Quotations
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
