import { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import {
  CreditCard,
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  RefreshCw,
  Banknote,
  FileText,
} from 'lucide-react';

interface SupplierPayment {
  _id: string;
  transaction_id: string;
  type: string;
  category: string;
  relatedEntity: string;
  amount: number;
  paymentMethod: string;
  bankAccountName?: string;
  date: string;
  status: string;
  notes?: string;
  receiptUrl?: string;
}

export function SupplierPaymentsAdmin() {
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<SupplierPayment | null>(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const headers = getAuthHeader();
      const res = await axios.get('http://localhost:5900/api/supplier-payments', { headers });
      setPayments(res.data.payments || []);
    } catch (err) {
      console.error('Error fetching supplier payments:', err);
      toast.error('Failed to load supplier payment data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':   return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'failed':    return 'bg-red-100 text-red-700 border-red-200';
      default:          return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'pending':   return <Clock className="w-3 h-3 mr-1" />;
      case 'failed':    return <XCircle className="w-3 h-3 mr-1" />;
      default:          return null;
    }
  };

  const filtered = payments.filter(p => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      (p.transaction_id || '').toLowerCase().includes(q) ||
      (p.relatedEntity || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Summary stats
  const totalPaid    = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const totalFailed  = payments.filter(p => p.status === 'failed').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 p-8 text-white shadow-modern-lg">
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-emerald-100" />
              <span className="text-emerald-100 uppercase tracking-wider text-xs font-bold">Outbound Payments</span>
            </div>
            <h1 className="text-3xl mb-2">Supplier Payments</h1>
            <p className="text-emerald-100">All payments made to suppliers from the business</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Paid Out', value: `LKR ${totalPaid.toLocaleString()}`, icon: CheckCircle, color: 'text-green-600', bg: 'from-green-100 to-emerald-100' },
            { label: 'Pending', value: `LKR ${totalPending.toLocaleString()}`, icon: Clock, color: 'text-yellow-600', bg: 'from-yellow-100 to-amber-100' },
            { label: 'All Transactions', value: `${payments.length}`, icon: FileText, color: 'text-blue-600', bg: 'from-blue-100 to-cyan-100' },
            { label: 'Failed', value: `${totalFailed}`, icon: XCircle, color: 'text-red-600', bg: 'from-red-100 to-rose-100' },
          ].map((card, i) => (
            <Card key={i} className="modern-card border-0 shadow-modern-lg">
              <CardContent className="pt-6">
                <div className={`w-12 h-12 bg-gradient-to-br ${card.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <h3 className="text-sm text-slate-600 mb-1">{card.label}</h3>
                <p className="text-2xl font-black text-slate-900">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by ID, supplier or category..."
              className="pl-10 border-slate-200 h-12 rounded-xl"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 border-slate-200 h-12 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-slate-200 h-12 rounded-xl px-5" onClick={fetchPayments}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl py-6">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              Payment Transactions ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="font-bold">Transaction ID</TableHead>
                    <TableHead className="font-bold">Supplier</TableHead>
                    <TableHead className="font-bold">Category</TableHead>
                    <TableHead className="font-bold">Amount</TableHead>
                    <TableHead className="font-bold">Method</TableHead>
                    <TableHead className="font-bold text-center">Status</TableHead>
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="text-right font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-64 text-center text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
                        Syncing with database...
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center text-slate-500 italic">
                        No supplier payment records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(p => (
                      <TableRow key={p._id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-slate-900">{p.transaction_id || '—'}</TableCell>
                        <TableCell className="text-slate-900 text-sm">{p.relatedEntity}</TableCell>
                        <TableCell className="text-slate-600 capitalize">{p.category}</TableCell>
                        <TableCell className="font-black text-slate-900">LKR {p.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-slate-600 capitalize">{p.paymentMethod}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${getStatusColor(p.status)} capitalize border flex items-center justify-center gap-1 w-fit mx-auto`}>
                            {getStatusIcon(p.status)}{p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">{new Date(p.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-emerald-600 hover:text-white border-slate-200 transition-all"
                            onClick={() => { setSelected(p); setShowModal(true); }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
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
      </div>

      {/* Detail Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="border-0 shadow-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black">
              <Banknote className="w-5 h-5 text-emerald-600" />
              Supplier Payment Details
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-5 bg-emerald-50 rounded-2xl text-sm">
                {[
                  { label: 'Transaction ID', value: selected.transaction_id || '—' },
                  { label: 'Supplier', value: selected.relatedEntity },
                  { label: 'Category', value: selected.category },
                  { label: 'Amount', value: `LKR ${selected.amount.toLocaleString()}` },
                  { label: 'Method', value: selected.paymentMethod },
                  { label: 'Bank', value: selected.bankAccountName || '—' },
                  { label: 'Date', value: new Date(selected.date).toLocaleDateString() },
                ].map((row, i) => (
                  <div key={i}>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{row.label}</p>
                    <p className="font-bold text-slate-900 mt-0.5">{row.value}</p>
                  </div>
                ))}
                <div className="col-span-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Status</p>
                  <Badge className={`${getStatusColor(selected.status)} capitalize border`}>
                    {getStatusIcon(selected.status)}{selected.status}
                  </Badge>
                </div>
                {selected.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Notes</p>
                    <p className="text-slate-900 mt-0.5 whitespace-pre-wrap">{selected.notes}</p>
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full" onClick={() => setShowModal(false)}>Close</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
