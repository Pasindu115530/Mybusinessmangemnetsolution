import { useState } from 'react';
import { SupplierLayout } from './SupplierLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  CheckCircle,
  Search,
  Eye,
  Edit,
  Clock,
  XCircle,
  FileText,
  AlertCircle
} from 'lucide-react';

interface Quotation {
  id: string;
  reqId: string;
  customer: string;
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  date: string;
}

const quotations: Quotation[] = [
  { id: 'QT-20240115', reqId: 'REQ-20240115', customer: 'Acme Corp', totalAmount: 147400, status: 'pending', date: '2024-01-15' },
  { id: 'QT-20240114', reqId: 'REQ-20240114', customer: 'XYZ Industries', totalAmount: 165200, status: 'approved', adminNotes: 'Approved with standard terms', date: '2024-01-14' },
  { id: 'QT-20240113', reqId: 'REQ-20240113', customer: 'Tech Solutions', totalAmount: 89500, status: 'rejected', adminNotes: 'Price too high, please revise', date: '2024-01-13' },
  { id: 'QT-20240112', reqId: 'REQ-20240112', customer: 'Global Enterprises', totalAmount: 201000, status: 'approved', date: '2024-01-12' },
];

export function QuotationStatus() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'rejected':
        return <XCircle className="w-3 h-3 mr-1" />;
      case 'pending':
        return <Clock className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const filteredQuotations = quotations.filter(quot => {
    const matchesSearch = quot.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          quot.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quot.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setShowDetailsModal(true);
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
              <CheckCircle className="w-5 h-5" />
              <span className="text-green-100">Quotation Tracking</span>
            </div>
            <h1 className="text-3xl mb-2">Quotation Status</h1>
            <p className="text-green-100">Track approval status of submitted quotations</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Pending', count: quotations.filter(q => q.status === 'pending').length, color: 'yellow', icon: Clock },
            { label: 'Approved', count: quotations.filter(q => q.status === 'approved').length, color: 'green', icon: CheckCircle },
            { label: 'Rejected', count: quotations.filter(q => q.status === 'rejected').length, color: 'red', icon: XCircle },
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

        {/* Quotations Table */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Submitted Quotations
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search quotations..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
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
                    <TableHead>Quotation ID</TableHead>
                    <TableHead>Requirement ID</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Admin Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations.map((quot) => (
                    <TableRow key={quot.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="text-slate-900">{quot.id}</TableCell>
                      <TableCell className="text-slate-600">{quot.reqId}</TableCell>
                      <TableCell className="text-slate-900">{quot.customer}</TableCell>
                      <TableCell className="text-slate-900">${quot.totalAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-slate-600">{quot.date}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(quot.status)}>
                          {getStatusIcon(quot.status)}
                          {quot.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 max-w-xs truncate">
                        {quot.adminNotes || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => handleViewDetails(quot)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {quot.status === 'rejected' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="hover:bg-green-50 hover:text-green-600"
                            >
                              <Edit className="w-4 h-4" />
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

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="border-0 shadow-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Quotation Details
            </DialogTitle>
          </DialogHeader>
          {selectedQuotation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-xl">
                <div>
                  <p className="text-sm text-slate-600">Quotation ID</p>
                  <p className="text-slate-900">{selectedQuotation.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Requirement ID</p>
                  <p className="text-slate-900">{selectedQuotation.reqId}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Customer</p>
                  <p className="text-slate-900">{selectedQuotation.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Date</p>
                  <p className="text-slate-900">{selectedQuotation.date}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Amount</p>
                  <p className="text-slate-900">${selectedQuotation.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <Badge className={getStatusColor(selectedQuotation.status)}>
                    {getStatusIcon(selectedQuotation.status)}
                    {selectedQuotation.status}
                  </Badge>
                </div>
              </div>

              {selectedQuotation.adminNotes && (
                <div className={`p-4 rounded-xl ${
                  selectedQuotation.status === 'rejected' 
                    ? 'bg-red-50 border-2 border-red-200' 
                    : 'bg-green-50 border-2 border-green-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className={`w-5 h-5 ${
                      selectedQuotation.status === 'rejected' ? 'text-red-600' : 'text-green-600'
                    } flex-shrink-0 mt-0.5`} />
                    <div>
                      <p className={`text-sm ${
                        selectedQuotation.status === 'rejected' ? 'text-red-900' : 'text-green-900'
                      } mb-1`}>Admin Notes</p>
                      <p className={`text-sm ${
                        selectedQuotation.status === 'rejected' ? 'text-red-700' : 'text-green-700'
                      }`}>
                        {selectedQuotation.adminNotes}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </Button>
                {selectedQuotation.status === 'rejected' && (
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit & Resubmit
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SupplierLayout>
  );
}
