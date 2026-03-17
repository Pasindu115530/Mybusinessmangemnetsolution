import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SupplierLayout } from './SupplierLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  FileText,
  Search,
  Eye,
  Send,
  Clock,
  CheckCircle,
  Download,
  Package,
  Calendar,
  User,
  XCircle
} from 'lucide-react';

interface Requirement {
  id: string;
  customer: string;
  items: number;
  totalQuantity: number;
  expectedDelivery: string;
  uploadedDocs: number;
  status: 'new' | 'quoted' | 'in-progress' | 'completed';
  date: string;
}

const requirements: Requirement[] = [
  { id: 'REQ-20240115', customer: 'Acme Corp', items: 3, totalQuantity: 1000, expectedDelivery: '2024-02-15', uploadedDocs: 2, status: 'new', date: '2024-01-15' },
  { id: 'REQ-20240114', customer: 'XYZ Industries', items: 5, totalQuantity: 1500, expectedDelivery: '2024-02-10', uploadedDocs: 1, status: 'quoted', date: '2024-01-14' },
  { id: 'REQ-20240113', customer: 'Tech Solutions', items: 2, totalQuantity: 500, expectedDelivery: '2024-02-20', uploadedDocs: 3, status: 'in-progress', date: '2024-01-13' },
  { id: 'REQ-20240112', customer: 'Global Enterprises', items: 4, totalQuantity: 2000, expectedDelivery: '2024-02-25', uploadedDocs: 2, status: 'completed', date: '2024-01-12' },
];

const requirementItems = [
  { id: 1, name: 'Product A - Electronics', quantity: 500, unit: 'units', notes: 'High quality required' },
  { id: 2, name: 'Product B - Furniture', quantity: 300, unit: 'units', notes: 'Include assembly instructions' },
  { id: 3, name: 'Product C - Textiles', quantity: 200, unit: 'units', notes: 'Fire-resistant material preferred' },
];

export function CustomerRequirements() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'quoted':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'in-progress':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <FileText className="w-3 h-3 mr-1" />;
      case 'quoted':
        return <Clock className="w-3 h-3 mr-1" />;
      case 'in-progress':
        return <Send className="w-3 h-3 mr-1" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (id: string) => {
    setSelectedRequirement(id);
    setShowDetailsModal(true);
  };

  const handlePrepareQuotation = (id: string) => {
    navigate('/create-quotation', { state: { requirementId: id } });
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
              <FileText className="w-5 h-5" />
              <span className="text-green-100">Requirements Management</span>
            </div>
            <h1 className="text-3xl mb-2">Customer Requirements</h1>
            <p className="text-green-100">Review customer requests and prepare quotations</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'New Requests', count: requirements.filter(r => r.status === 'new').length, color: 'blue', icon: FileText },
            { label: 'Quoted', count: requirements.filter(r => r.status === 'quoted').length, color: 'yellow', icon: Clock },
            { label: 'In Progress', count: requirements.filter(r => r.status === 'in-progress').length, color: 'purple', icon: Send },
            { label: 'Completed', count: requirements.filter(r => r.status === 'completed').length, color: 'green', icon: CheckCircle },
          ].map((stat) => (
            <Card key={stat.label} className="modern-card border-0 shadow-modern-lg overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16`}></div>
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
                <h3 className="text-sm text-slate-600 mb-1">{stat.label}</h3>
                <p className="text-2xl text-slate-900">{stat.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Requirements Table */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                All Requirements
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search requirements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64 border-slate-200"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 border-slate-200">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
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
                    <TableHead>Requirement ID</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total Qty</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead>Uploaded Docs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequirements.map((req) => (
                    <TableRow key={req.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="text-slate-900">{req.id}</TableCell>
                      <TableCell className="text-slate-900">{req.customer}</TableCell>
                      <TableCell className="text-slate-600">{req.items} items</TableCell>
                      <TableCell className="text-slate-900">{req.totalQuantity} units</TableCell>
                      <TableCell className="text-slate-600">{req.expectedDelivery}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-blue-700 border-blue-300">
                          <Download className="w-3 h-3 mr-1" />
                          {req.uploadedDocs}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(req.status)}>
                          {getStatusIcon(req.status)}
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => handleViewDetails(req.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {req.status === 'new' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="hover:bg-green-50 hover:text-green-600"
                              onClick={() => handlePrepareQuotation(req.id)}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="border-0 shadow-2xl max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Requirement Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-xl">
              <div>
                <p className="text-sm text-slate-600 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  Requirement ID
                </p>
                <p className="text-slate-900">REQ-20240115</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 flex items-center gap-2">
                  <User className="w-4 h-4 text-green-600" />
                  Customer
                </p>
                <p className="text-slate-900">Acme Corp</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  Date Submitted
                </p>
                <p className="text-slate-900">2024-01-15</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  Expected Delivery
                </p>
                <p className="text-slate-900">2024-02-15</p>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h4 className="text-slate-900 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-green-600" />
                Requested Items
              </h4>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requirementItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-slate-900">{item.name}</TableCell>
                        <TableCell className="text-slate-900">{item.quantity}</TableCell>
                        <TableCell className="text-slate-600">{item.unit}</TableCell>
                        <TableCell className="text-slate-600">{item.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Uploaded Documents */}
            <div>
              <h4 className="text-slate-900 mb-3 flex items-center gap-2">
                <Download className="w-4 h-4 text-green-600" />
                Uploaded Documents (2)
              </h4>
              <div className="space-y-2">
                {['Specification_Document.pdf', 'Reference_Images.zip'].map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-sm text-slate-900">{doc}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowDetailsModal(false);
                  handlePrepareQuotation(selectedRequirement || '');
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Prepare Quotation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SupplierLayout>
  );
}
