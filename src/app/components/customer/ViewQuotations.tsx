import { useState } from 'react';
import { CustomerLayout } from './CustomerLayout';
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
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Package,
  AlertCircle,
  Clock
} from 'lucide-react';

interface Quotation {
  id: string;
  requirementRef: string;
  date: string;
  expiryDate: string;
  totalItems: number;
  totalAmount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

interface QuotationItem {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
}

const quotations: Quotation[] = [
  { id: 'QT-20240115', requirementRef: 'REQ-20240110', date: '2024-01-15', expiryDate: '2024-01-25', totalItems: 3, totalAmount: 15000, status: 'pending' },
  { id: 'QT-20240112', requirementRef: 'REQ-20240108', date: '2024-01-12', expiryDate: '2024-01-22', totalItems: 5, totalAmount: 22000, status: 'accepted' },
  { id: 'QT-20240110', requirementRef: 'REQ-20240105', date: '2024-01-10', expiryDate: '2024-01-20', totalItems: 2, totalAmount: 8500, status: 'rejected' },
  { id: 'QT-20240108', requirementRef: 'REQ-20240103', date: '2024-01-08', expiryDate: '2024-01-15', totalItems: 4, totalAmount: 18000, status: 'expired' },
];

const quotationItems: QuotationItem[] = [
  { id: 1, name: 'Product A - Electronics', quantity: 500, unitPrice: 250 },
  { id: 2, name: 'Product B - Furniture', quantity: 300, unitPrice: 180 },
  { id: 3, name: 'Product C - Textiles', quantity: 200, unitPrice: 45 },
];

export function ViewQuotations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedQuotation, setSelectedQuotation] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'reject'>('accept');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'expired':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'pending':
        return <Clock className="w-3 h-3 mr-1" />;
      case 'rejected':
        return <XCircle className="w-3 h-3 mr-1" />;
      case 'expired':
        return <AlertCircle className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAccept = (id: string) => {
    setSelectedQuotation(id);
    setActionType('accept');
    setShowAcceptModal(true);
  };

  const handleReject = (id: string) => {
    setSelectedQuotation(id);
    setActionType('reject');
    setShowRejectModal(true);
  };

  const handleConfirmAction = () => {
    setShowAcceptModal(false);
    setShowRejectModal(false);
    setShowSuccessModal(true);
  };

  const handleViewDetails = (id: string) => {
    setSelectedQuotation(id);
    setShowDetailsModal(true);
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 text-white shadow-modern-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5" />
              <span className="text-blue-100">Quotation Management</span>
            </div>
            <h1 className="text-3xl mb-2">Quotations</h1>
            <p className="text-blue-100">Review and respond to quotations from suppliers</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Pending</h3>
              <p className="text-2xl text-slate-900">{quotations.filter(q => q.status === 'pending').length}</p>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Accepted</h3>
              <p className="text-2xl text-slate-900">{quotations.filter(q => q.status === 'accepted').length}</p>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Rejected</h3>
              <p className="text-2xl text-slate-900">{quotations.filter(q => q.status === 'rejected').length}</p>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-gray-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-slate-600" />
                </div>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Expired</h3>
              <p className="text-2xl text-slate-900">{quotations.filter(q => q.status === 'expired').length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quotations Table */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                All Quotations
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
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
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
                    <TableHead>Requirement Ref</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations.map((quotation) => (
                    <TableRow key={quotation.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="text-slate-900">{quotation.id}</TableCell>
                      <TableCell className="text-slate-600">{quotation.requirementRef}</TableCell>
                      <TableCell className="text-slate-600">{quotation.date}</TableCell>
                      <TableCell className="text-slate-600">{quotation.expiryDate}</TableCell>
                      <TableCell className="text-slate-900">{quotation.totalItems} items</TableCell>
                      <TableCell className="text-slate-900">${quotation.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(quotation.status)}>
                          {getStatusIcon(quotation.status)}
                          {quotation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => handleViewDetails(quotation.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {quotation.status === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="hover:bg-green-50 hover:text-green-600"
                                onClick={() => handleAccept(quotation.id)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => handleReject(quotation.id)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
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
        <DialogContent className="border-0 shadow-2xl max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Quotation Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl">
              <div>
                <p className="text-sm text-slate-600">Quotation ID</p>
                <p className="text-slate-900">QT-20240115</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Date</p>
                <p className="text-slate-900">2024-01-15</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Expiry Date</p>
                <p className="text-slate-900">2024-01-25</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
              </div>
            </div>

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
                  {quotationItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-slate-900">{item.name}</TableCell>
                      <TableCell className="text-slate-900">{item.quantity}</TableCell>
                      <TableCell className="text-slate-900">${item.unitPrice}</TableCell>
                      <TableCell className="text-slate-900">${(item.quantity * item.unitPrice).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end">
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
                    <span className="text-blue-900">Total:</span>
                    <span className="text-blue-900">$147,400</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Accept Modal */}
      <Dialog open={showAcceptModal} onOpenChange={setShowAcceptModal}>
        <DialogContent className="border-0 shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Accept Quotation
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 mb-4">
              Are you sure you want to accept quotation <span className="text-blue-600 font-medium">{selectedQuotation}</span>?
            </p>
            <div className="bg-green-50 rounded-xl p-4 mb-4">
              <h4 className="text-green-900 mb-2">After acceptance:</h4>
              <ul className="space-y-1 text-sm text-green-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>A customer order will be created</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>The supplier will be notified</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>You can track the order status</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAcceptModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              Accept Quotation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="border-0 shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Reject Quotation
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 mb-4">
              Are you sure you want to reject quotation <span className="text-red-600 font-medium">{selectedQuotation}</span>?
            </p>
            <div className="bg-red-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-red-700">
                This action cannot be undone. The supplier will be notified of your rejection.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowRejectModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
            >
              Reject Quotation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="border-0 shadow-2xl max-w-md">
          <div className="text-center py-6">
            <div className={`w-20 h-20 bg-gradient-to-br ${actionType === 'accept' ? 'from-green-100 to-emerald-100' : 'from-red-100 to-rose-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {actionType === 'accept' ? (
                <CheckCircle className="w-10 h-10 text-green-600" />
              ) : (
                <XCircle className="w-10 h-10 text-red-600" />
              )}
            </div>
            <DialogTitle className="text-2xl mb-2">
              {actionType === 'accept' ? 'Quotation Accepted!' : 'Quotation Rejected'}
            </DialogTitle>
            <p className="text-slate-600 mb-6">
              {actionType === 'accept' 
                ? 'Your order has been created and the supplier has been notified.' 
                : 'The supplier has been notified of your decision.'}
            </p>
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              {actionType === 'accept' ? 'View My Orders' : 'Close'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
}
