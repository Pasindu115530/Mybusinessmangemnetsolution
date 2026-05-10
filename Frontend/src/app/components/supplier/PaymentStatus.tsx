import { useState, useEffect } from 'react';
import axios from 'axios';
import { SupplierLayout } from './SupplierLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { toast } from 'sonner';
import {
  DollarSign,
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Loader2,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  CreditCard,
  Calendar,
  Receipt,
  Package
} from 'lucide-react';

interface Payment {
  id: string;
  transaction_id: string;
  po_id: string | null;
  invoiceId: string | null;
  amount: number;
  paymentMethod: string;
  status: string;
  date: string;
  notes: string;
}

interface Stats {
  receivedAmount: number;
  pendingAmount: number;
  totalPayments: number;
  failedPayments: number;
}

export function PaymentStatus() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('supplierToken') || localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const headers = getAuthHeader();

      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const [paymentsRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5900/api/supplier-payments/all', { headers, params }),
        axios.get('http://localhost:5900/api/supplier-payments/stats', { headers }),
      ]);

      setPayments(paymentsRes.data.payments || []);
      setStats(statsRes.data.stats || null);
    } catch (err: any) {
      console.error('Failed to load payments:', err);
      toast.error(err.response?.data?.message || 'Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': 
      case 'paid':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':   
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'failed':    
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:          
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': 
      case 'paid':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'pending':   
        return <Clock className="w-3 h-3 mr-1" />;
      case 'failed':    
      case 'rejected':
        return <XCircle className="w-3 h-3 mr-1" />;
      default:          
        return null;
    }
  };

  const filteredPayments = payments.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      (p.transaction_id || '').toLowerCase().includes(q) ||
      (p.po_id || '').toLowerCase().includes(q) ||
      (p.invoiceId || '').toLowerCase().includes(q)
    );
  });

  return (
    <SupplierLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-8 text-white shadow-modern-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-green-100 uppercase tracking-wider text-xs font-bold font-mono">Revenue & Tracking</span>
            </div>
            <h1 className="text-3xl mb-2 font-black">Payment Status</h1>
            <p className="text-green-100 opacity-90">Monitor your transaction history, received payouts, and pending settlements</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Received', value: `LKR ${(stats?.receivedAmount || 0).toLocaleString()}`, icon: CheckCircle, color: 'text-green-600', bg: 'from-green-50 to-green-100' },
            { label: 'In Settlement', value: `LKR ${(stats?.pendingAmount || 0).toLocaleString()}`, icon: Clock, color: 'text-amber-600', bg: 'from-amber-50 to-amber-100' },
            { label: 'Transactions', value: `${stats?.totalPayments || 0}`, icon: TrendingUp, color: 'text-blue-600', bg: 'from-blue-50 to-blue-100' },
            { label: 'Unsuccessful', value: `${stats?.failedPayments || 0}`, icon: XCircle, color: 'text-red-600', bg: 'from-red-50 to-rose-100' },
          ].map((card, i) => (
            <Card key={i} className="modern-card border-0 shadow-modern-lg overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${card.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <card.icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <Badge className="bg-white/50 text-slate-400 border-slate-100 text-[10px] font-bold">LIVE</Badge>
                </div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</h3>
                <p className="text-2xl font-black text-slate-900">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payments Table */}
        <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
          <CardHeader className="bg-slate-50/80 border-b border-slate-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-green-600" />
                Transaction Ledger
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search IDs..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 w-64 border-slate-200 rounded-xl h-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 border-slate-200 rounded-xl h-10">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={fetchData} className="border-slate-200 h-10 w-10 p-0 rounded-xl">
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
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-6">TX ID</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Order/Invoice</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Amount</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Method</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-green-600" />
                        Syncing transaction data...
                      </TableCell>
                    </TableRow>
                  ) : filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-slate-400 italic">
                        No payment records discovered.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map(p => (
                      <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors border-b last:border-0 group">
                        <TableCell className="pl-6 py-4">
                          <span className="font-mono text-[10px] font-black text-slate-400 group-hover:text-green-600 transition-colors">
                            {p.transaction_id || '—'}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900">{p.invoiceId || 'N/A'}</span>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">{p.po_id || 'Direct'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="font-black text-slate-900">LKR {p.amount.toLocaleString()}</span>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <Badge variant="outline" className="text-[10px] font-bold uppercase bg-slate-50 border-slate-200">
                            {p.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <Badge className={`${getStatusColor(p.status)} text-[10px] px-3 border capitalize h-6`}>
                            {getStatusIcon(p.status)}{p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-right pr-6">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 border-slate-200 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                            onClick={() => { setSelectedPayment(p); setShowDetailsModal(true); }}
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
      </div>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="border-0 shadow-2xl max-w-lg p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-black flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  Payment Receipt
                </DialogTitle>
                <Badge className={`${getStatusColor(selectedPayment?.status || '')} border-0`}>
                  {selectedPayment?.status}
                </Badge>
              </div>
            </DialogHeader>
          </div>
          
          {selectedPayment && (
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                {[
                  { label: 'Transaction ID', value: selectedPayment.transaction_id || '—', icon: FileText },
                  { label: 'Invoice / Bill', value: selectedPayment.invoiceId || '—', icon: Receipt },
                  { label: 'Order Ref', value: selectedPayment.po_id || '—', icon: Package },
                  { label: 'Settlement Date', value: new Date(selectedPayment.date).toLocaleDateString(), icon: Calendar },
                  { label: 'Method', value: selectedPayment.paymentMethod, icon: CreditCard },
                ].map((row, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      <row.icon className="w-3 h-3" />
                      {row.label}
                    </div>
                    <p className="font-bold text-slate-900 truncate">{row.value}</p>
                  </div>
                ))}
                <div className="col-span-2 pt-4 border-t border-slate-200 mt-2">
                  <p className="text-[10px] font-black uppercase text-green-600 tracking-widest mb-1">Disbursed Amount</p>
                  <p className="text-3xl font-black text-slate-900">LKR {selectedPayment.amount.toLocaleString()}</p>
                </div>
              </div>

              {selectedPayment.notes && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-amber-800 tracking-widest mb-1">Transaction Notes</p>
                    <p className="text-xs text-amber-700 leading-relaxed italic">{selectedPayment.notes}</p>
                  </div>
                </div>
              )}

              <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl font-bold border-slate-200" 
                onClick={() => setShowDetailsModal(false)}
              >
                Close Receipt
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SupplierLayout>
  );
}
