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
  DollarSign,
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Upload,
  FileText,
  Download
} from 'lucide-react';

interface Payment {
  id: string;
  orderId: string;
  invoiceId: string;
  customer: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
}

const payments: Payment[] = [
  { id: 'PAY-20240115', orderId: 'ORD-20240115', invoiceId: 'INV-20240115', customer: 'Acme Corp', amount: 147400, paymentMethod: 'Bank Transfer', status: 'completed', date: '2024-01-15' },
  { id: 'PAY-20240114', orderId: 'ORD-20240114', invoiceId: 'INV-20240114', customer: 'XYZ Industries', amount: 165200, paymentMethod: 'Credit Card', status: 'pending', date: '2024-01-14' },
  { id: 'PAY-20240113', orderId: 'ORD-20240113', invoiceId: 'INV-20240113', customer: 'Tech Solutions', amount: 89500, paymentMethod: 'Online Payment', status: 'completed', date: '2024-01-13' },
  { id: 'PAY-20240112', orderId: 'ORD-20240112', invoiceId: 'INV-20240112', customer: 'Global Enterprises', amount: 201000, paymentMethod: 'Bank Transfer', status: 'failed', date: '2024-01-12' },
];

export function PaymentStatus() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'pending':
        return <Clock className="w-3 h-3 mr-1" />;
      case 'failed':
        return <XCircle className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          payment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          payment.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const totalReceived = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  return (
    <SupplierLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-8 text-white shadow-modern-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-green-100">Payment Tracking</span>
            </div>
            <h1 className="text-3xl mb-2">Payment Status</h1>
            <p className="text-green-100">Track payments received from customers</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Received</h3>
              <p className="text-2xl text-slate-900">${totalReceived.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Pending</h3>
              <p className="text-2xl text-slate-900">${totalPending.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Total Payments</h3>
              <p className="text-2xl text-slate-900">{payments.length}</p>
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
              <h3 className="text-sm text-slate-600 mb-1">Failed</h3>
              <p className="text-2xl text-slate-900">{payments.filter(p => p.status === 'failed').length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                All Payments
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search payments..."
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
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
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
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="text-slate-900">{payment.id}</TableCell>
                      <TableCell className="text-slate-600">{payment.orderId}</TableCell>
                      <TableCell className="text-slate-900">{payment.customer}</TableCell>
                      <TableCell className="text-slate-900">${payment.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-slate-600">{payment.paymentMethod}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          {getStatusIcon(payment.status)}
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">{payment.date}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => handleViewDetails(payment)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {payment.status === 'completed' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="hover:bg-green-50 hover:text-green-600"
                            >
                              <Download className="w-4 h-4" />
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
              <DollarSign className="w-5 h-5 text-green-600" />
              Payment Details
            </DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-xl">
                <div>
                  <p className="text-sm text-slate-600">Payment ID</p>
                  <p className="text-slate-900">{selectedPayment.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Order ID</p>
                  <p className="text-slate-900">{selectedPayment.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Invoice ID</p>
                  <p className="text-slate-900">{selectedPayment.invoiceId}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Customer</p>
                  <p className="text-slate-900">{selectedPayment.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Amount</p>
                  <p className="text-slate-900 text-xl">${selectedPayment.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Payment Method</p>
                  <p className="text-slate-900">{selectedPayment.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Date</p>
                  <p className="text-slate-900">{selectedPayment.date}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <Badge className={getStatusColor(selectedPayment.status)}>
                    {getStatusIcon(selectedPayment.status)}
                    {selectedPayment.status}
                  </Badge>
                </div>
              </div>

              {selectedPayment.status === 'completed' && (
                <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <h4 className="text-blue-900 mb-2">Payment Proof</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">Payment_Receipt.pdf</p>
                      <p className="text-xs text-slate-600">Uploaded by customer</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
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
                {selectedPayment.status === 'completed' && (
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                    <Download className="w-4 h-4 mr-2" />
                    Download Receipt
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
