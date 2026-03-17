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
  Plus,
  Trash2,
  Upload,
  CheckCircle,
  X,
  Star,
  Phone,
  Mail,
  Building2,
  Calendar,
  Hash,
  Send,
  Save,
  Sparkles,
  Eye,
  Copy,
  XCircle,
  Filter,
  Users,
  Package,
  Clock,
  AlertCircle
} from 'lucide-react';

interface RequirementRow {
  id: number;
  itemName: string;
  quantity: string;
  unit: string;
  deliveryDate: string;
  notes: string;
}

interface SupplierData {
  id: string;
  name: string;
  contact: string;
  email: string;
  rating: number;
  status: 'active' | 'inactive';
}

interface PreviousRequest {
  id: string;
  date: string;
  suppliers: string[];
  itemCount: number;
  expiryDate: string;
  status: 'draft' | 'sent' | 'partially-responded' | 'completed';
}

const suppliers: SupplierData[] = [
  { id: 'SUP001', name: 'Tech Supplies Inc', contact: '+1 234 567 8900', email: 'contact@techsupplies.com', rating: 4.8, status: 'active' },
  { id: 'SUP002', name: 'Global Trade Partners', contact: '+1 234 567 8901', email: 'info@globaltrade.com', rating: 4.5, status: 'active' },
  { id: 'SUP003', name: 'Premium Materials Co', contact: '+1 234 567 8902', email: 'sales@premiummaterials.com', rating: 4.9, status: 'active' },
  { id: 'SUP004', name: 'Swift Logistics Ltd', contact: '+1 234 567 8903', email: 'hello@swiftlogistics.com', rating: 4.3, status: 'active' },
  { id: 'SUP005', name: 'Quality Distributors', contact: '+1 234 567 8904', email: 'sales@qualitydist.com', rating: 4.6, status: 'active' },
  { id: 'SUP006', name: 'Mega Wholesale Corp', contact: '+1 234 567 8905', email: 'orders@megawholesale.com', rating: 4.7, status: 'active' },
];

const stockItems = [
  'Product A - Electronics',
  'Product B - Furniture',
  'Product C - Textiles',
  'Product D - Electronics',
  'Product E - Hardware',
];

const previousRequests: PreviousRequest[] = [
  { id: 'RQ-20240115', date: '2024-01-15', suppliers: ['Tech Supplies Inc', 'Global Trade Partners'], itemCount: 3, expiryDate: '2024-01-25', status: 'completed' },
  { id: 'RQ-20240112', date: '2024-01-12', suppliers: ['Premium Materials Co'], itemCount: 5, expiryDate: '2024-01-22', status: 'sent' },
  { id: 'RQ-20240110', date: '2024-01-10', suppliers: ['Swift Logistics Ltd', 'Quality Distributors', 'Mega Wholesale Corp'], itemCount: 2, expiryDate: '2024-01-20', status: 'partially-responded' },
  { id: 'RQ-20240108', date: '2024-01-08', suppliers: ['Tech Supplies Inc'], itemCount: 4, expiryDate: '2024-01-18', status: 'draft' },
];

export function RequestQuotation() {
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<RequirementRow[]>([
    { id: 1, itemName: '', quantity: '', unit: 'units', deliveryDate: '', notes: '' }
  ]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [priority, setPriority] = useState('medium');
  const [expiryDate, setExpiryDate] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('previous');

  const requestId = `RQ-${Date.now().toString().slice(-8)}`;
  const requestDate = new Date().toISOString().split('T')[0];

  const toggleSupplier = (supplierId: string) => {
    setSelectedSuppliers(prev =>
      prev.includes(supplierId)
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  const toggleAllSuppliers = () => {
    if (selectedSuppliers.length === suppliers.length) {
      setSelectedSuppliers([]);
    } else {
      setSelectedSuppliers(suppliers.map(s => s.id));
    }
  };

  const addRequirementRow = () => {
    setRequirements([
      ...requirements,
      { id: Date.now(), itemName: '', quantity: '', unit: 'units', deliveryDate: '', notes: '' }
    ]);
  };

  const removeRequirementRow = (id: number) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter(req => req.id !== id));
    }
  };

  const updateRequirement = (id: number, field: keyof RequirementRow, value: string) => {
    setRequirements(requirements.map(req =>
      req.id === id ? { ...req, [field]: value } : req
    ));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      setUploadedFiles([...uploadedFiles, ...Array.from(files)]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleSubmit = () => {
    setShowSuccessModal(true);
  };

  const handleReset = () => {
    setSelectedSuppliers([]);
    setRequirements([{ id: 1, itemName: '', quantity: '', unit: 'units', deliveryDate: '', notes: '' }]);
    setGeneralNotes('');
    setPriority('medium');
    setExpiryDate('');
    setUploadedFiles([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'sent':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'partially-responded':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'draft':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'sent':
        return <Send className="w-3 h-3 mr-1" />;
      case 'partially-responded':
        return <Clock className="w-3 h-3 mr-1" />;
      case 'draft':
        return <FileText className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const filteredRequests = previousRequests.filter(request => {
    const matchesSearch = request.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <span className="text-purple-600">Request Quotation</span>
          </div>
          
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 p-8 text-white shadow-modern-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5" />
                <span className="text-purple-100">Supplier Management</span>
              </div>
              <h1 className="text-3xl mb-2">Request Quotation from Supplier</h1>
              <p className="text-purple-100">Manage quotation requests and send requirements to multiple suppliers</p>
            </div>
          </div>
        </div>

        {/* Tabs for Previous Requests and New Request */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px] bg-slate-100">
            <TabsTrigger value="previous" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Previous Requests
            </TabsTrigger>
            <TabsTrigger value="new" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </TabsTrigger>
          </TabsList>

          {/* Section 1: Previous Quotation Requests */}
          <TabsContent value="previous" className="mt-6">
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Previous Quotation Requests
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search by ID..."
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
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="partially-responded">Partially Responded</SelectItem>
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
                        <TableHead>Request ID</TableHead>
                        <TableHead>Request Date</TableHead>
                        <TableHead>Suppliers Sent To</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow key={request.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="text-slate-900">{request.id}</TableCell>
                          <TableCell className="text-slate-600">{request.date}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="modern-badge">
                                {request.suppliers.length} Suppliers
                              </Badge>
                              <div className="group relative">
                                <AlertCircle className="w-4 h-4 text-slate-400 cursor-help" />
                                <div className="absolute left-0 top-6 hidden group-hover:block z-10 bg-slate-900 text-white text-xs rounded-lg p-3 w-64 shadow-xl">
                                  <div className="space-y-1">
                                    {request.suppliers.map((sup, idx) => (
                                      <div key={idx}>• {sup}</div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-900">{request.itemCount} items</TableCell>
                          <TableCell className="text-slate-600">{request.expiryDate}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(request.status)}>
                              {getStatusIcon(request.status)}
                              {request.status.replace('-', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="hover:bg-purple-50 hover:text-purple-600">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:text-blue-600">
                                <Copy className="w-4 h-4" />
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

          {/* Create New Request Tab */}
          <TabsContent value="new" className="mt-6 space-y-6">
            {/* Section 2: Supplier Selection (Multi-Select) */}
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Select Suppliers
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">Choose one or more suppliers to send requirements</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Select All Option */}
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                    <Checkbox
                      checked={selectedSuppliers.length === suppliers.length}
                      onCheckedChange={toggleAllSuppliers}
                      id="select-all"
                    />
                    <Label htmlFor="select-all" className="text-purple-900 cursor-pointer">
                      Select All Suppliers ({suppliers.length})
                    </Label>
                  </div>

                  {/* Supplier List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suppliers.map((supplier) => (
                      <div
                        key={supplier.id}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                          selectedSuppliers.includes(supplier.id)
                            ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300 shadow-md'
                            : 'bg-white border-slate-200 hover:border-purple-200 hover:shadow-sm'
                        }`}
                        onClick={() => toggleSupplier(supplier.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedSuppliers.includes(supplier.id)}
                            onCheckedChange={() => toggleSupplier(supplier.id)}
                            id={supplier.id}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <Label htmlFor={supplier.id} className="text-slate-900 cursor-pointer">
                                {supplier.name}
                              </Label>
                              <Badge className={supplier.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}>
                                {supplier.status}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Phone className="w-3 h-3" />
                                {supplier.contact}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Mail className="w-3 h-3" />
                                {supplier.email}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                <span className="text-slate-900">{supplier.rating}</span>
                                <span>/ 5.0</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Selected Suppliers Summary */}
                  {selectedSuppliers.length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                        <span className="text-purple-900">
                          {selectedSuppliers.length} Supplier{selectedSuppliers.length > 1 ? 's' : ''} Selected
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedSuppliers.map(id => {
                          const supplier = suppliers.find(s => s.id === id);
                          return supplier ? (
                            <Badge key={id} className="bg-purple-600 text-white">
                              {supplier.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Requirements Request Form */}
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-600" />
                    Product Requirements
                  </CardTitle>
                  <Button
                    onClick={addRequirementRow}
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                <p className="text-sm text-slate-600 mt-1">These requirements will be sent to all selected suppliers</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left pb-3 text-sm text-slate-600 min-w-[200px]">Item Name</th>
                        <th className="text-left pb-3 text-sm text-slate-600 min-w-[120px]">Quantity</th>
                        <th className="text-left pb-3 text-sm text-slate-600 min-w-[120px]">Unit</th>
                        <th className="text-left pb-3 text-sm text-slate-600 min-w-[150px]">Delivery Date</th>
                        <th className="text-left pb-3 text-sm text-slate-600 min-w-[200px]">Notes</th>
                        <th className="text-left pb-3 text-sm text-slate-600 w-[80px]">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requirements.map((req, index) => (
                        <tr key={req.id} className="border-b border-slate-100">
                          <td className="py-3 pr-2">
                            <Select
                              value={req.itemName}
                              onValueChange={(value) => updateRequirement(req.id, 'itemName', value)}
                            >
                              <SelectTrigger className="border-slate-200">
                                <SelectValue placeholder="Select item..." />
                              </SelectTrigger>
                              <SelectContent>
                                {stockItems.map((item) => (
                                  <SelectItem key={item} value={item}>
                                    {item}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-3 pr-2">
                            <Input
                              type="number"
                              placeholder="0"
                              value={req.quantity}
                              onChange={(e) => updateRequirement(req.id, 'quantity', e.target.value)}
                              className="border-slate-200"
                            />
                          </td>
                          <td className="py-3 pr-2">
                            <Select
                              value={req.unit}
                              onValueChange={(value) => updateRequirement(req.id, 'unit', value)}
                            >
                              <SelectTrigger className="border-slate-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="units">Units</SelectItem>
                                <SelectItem value="kg">Kilograms</SelectItem>
                                <SelectItem value="m">Meters</SelectItem>
                                <SelectItem value="boxes">Boxes</SelectItem>
                                <SelectItem value="pieces">Pieces</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-3 pr-2">
                            <Input
                              type="date"
                              value={req.deliveryDate}
                              onChange={(e) => updateRequirement(req.id, 'deliveryDate', e.target.value)}
                              className="border-slate-200"
                            />
                          </td>
                          <td className="py-3 pr-2">
                            <Input
                              placeholder="Additional notes..."
                              value={req.notes}
                              onChange={(e) => updateRequirement(req.id, 'notes', e.target.value)}
                              className="border-slate-200"
                            />
                          </td>
                          <td className="py-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeRequirementRow(req.id)}
                              disabled={requirements.length === 1}
                              className="text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Additional Information */}
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <Label>General Message to Suppliers</Label>
                  <Textarea
                    placeholder="Add any additional requirements, specifications, or special instructions for all suppliers..."
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    className="mt-1 min-h-[120px] border-slate-200"
                  />
                </div>

                <div>
                  <Label className="mb-3 block">Upload Supporting Documents</Label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
                      isDragging
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-300 hover:border-purple-400 hover:bg-purple-50/50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-purple-600" />
                      </div>
                      <p className="text-slate-700 mb-2">Drag and drop files here, or click to browse</p>
                      <p className="text-sm text-slate-500 mb-4">Supports PDF, PNG, JPG (Max 10MB)</p>
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        multiple
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => handleFileUpload(e.target.files)}
                      />
                      <label htmlFor="file-upload">
                        <Button type="button" variant="outline" className="cursor-pointer" onClick={() => document.getElementById('file-upload')?.click()}>
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Files
                        </Button>
                      </label>
                    </div>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm text-slate-900">{file.name}</p>
                              <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Request Details */}
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Request Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-slate-500" />
                      Request ID
                    </Label>
                    <Input
                      value={requestId}
                      readOnly
                      className="mt-1 bg-slate-50 border-slate-200"
                    />
                  </div>
                  <div>
                    <Label>Request Date</Label>
                    <Input
                      type="date"
                      value={requestDate}
                      readOnly
                      className="mt-1 bg-slate-50 border-slate-200"
                    />
                  </div>
                  <div>
                    <Label>Quotation Expiry Date</Label>
                    <Input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="mt-1 border-slate-200"
                    />
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="mt-1 border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Low
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            Medium
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            High
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 justify-end">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="border-slate-300 hover:bg-slate-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save as Draft
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={selectedSuppliers.length === 0}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send to {selectedSuppliers.length} Supplier{selectedSuppliers.length !== 1 ? 's' : ''}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="border-0 shadow-2xl max-w-md">
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <DialogTitle className="text-2xl mb-2">Request Sent Successfully!</DialogTitle>
            <p className="text-slate-600 mb-6">
              Your quotation request has been sent to <span className="text-purple-600">{selectedSuppliers.length} supplier{selectedSuppliers.length > 1 ? 's' : ''}</span>.
            </p>
            <div className="bg-purple-50 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-600">Request ID:</span>
                <span className="text-slate-900">{requestId}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-600">Suppliers:</span>
                <span className="text-slate-900">{selectedSuppliers.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Status:</span>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  <Send className="w-3 h-3 mr-1" />
                  Sent
                </Badge>
              </div>
            </div>
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                handleReset();
                setActiveTab('previous');
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              View Previous Requests
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
