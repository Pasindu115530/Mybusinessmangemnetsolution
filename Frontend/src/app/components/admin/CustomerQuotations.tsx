import { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Send,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Loader2,
  AlertCircle,
  RefreshCw,
  Package,
  User,
  Building,
  FileText,
  DollarSign
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuotationItem {
  name: string;
  productID?: string;
  quantity: number;
  unit?: string;
  price?: number;
  unitPrice?: number;
  totalPrice?: number;
  description?: string;
}

interface Quotation {
  _id: string;
  quotationID: string;
  sq_id?: string;
  name: string;
  email: string;
  items: QuotationItem[];
  date: string;
  createdAt?: string;
  status: 'draft' | 'pending' | 'accepted' | 'rejected' | string;
  total: number;
  total_estimate?: number;
  subtotal?: number;
  tax_amount?: number;
  currency?: string;
  notes?: string;
  validUntil?: string;
  payment_terms?: string;
  delivery_timeline?: string;
  quotationType?: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

const BACKEND = 'http://localhost:5900';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft:     { label: 'Draft',     cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  pending:   { label: 'Pending',   cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  quoted:    { label: 'Quoted',    cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  accepted:  { label: 'Accepted',  cls: 'bg-green-100 text-green-700 border-green-200' },
  delivered: { label: 'Delivered', cls: 'bg-purple-100 text-purple-700 border-purple-200' },
  rejected:  { label: 'Rejected',  cls: 'bg-red-100 text-red-700 border-red-200' },
};

function getStatusCls(status: string) {
  return STATUS_MAP[status?.toLowerCase()]?.cls ?? 'bg-slate-100 text-slate-700 border-slate-200';
}
function getStatusLabel(status: string) {
  return STATUS_MAP[status?.toLowerCase()]?.label ?? status;
}

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CustomerQuotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery]   = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showDetailsModal, setShowDetailsModal]     = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchQuotations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND}/api/quotations/all`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to load quotations');
      setQuotations(data.quotations ?? []);
    } catch (err: any) {
      setError(err.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuotations(); }, []);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     quotations.length,
    pending:   quotations.filter(q => q.status?.toLowerCase() === 'pending').length,
    accepted:  quotations.filter(q => q.status?.toLowerCase() === 'accepted' || q.status?.toLowerCase() === 'quoted').length,
    rejected:  quotations.filter(q => q.status?.toLowerCase() === 'rejected').length,
  }), [quotations]);

  // ── Monthly chart ──────────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    const months: Record<string, { month: string; approved: number; rejected: number }> = {};
    const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    quotations.forEach(q => {
      const dateStr = q.date || q.createdAt;
      if (!dateStr) return;
      const d = new Date(dateStr);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!months[key]) {
        months[key] = { month: MONTH_NAMES[d.getMonth()], approved: 0, rejected: 0 };
      }
      if (q.status?.toLowerCase() === 'rejected') months[key].rejected++;
      else months[key].approved++;
    });

    return Object.values(months).slice(-6);
  }, [quotations]);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => quotations.filter(q => {
    const query = searchQuery.toLowerCase();
    const idStr = q.quotationID || q.sq_id || '';
    const nameStr = q.name || '';
    const emailStr = q.email || '';
    
    const matchesSearch =
      idStr.toLowerCase().includes(query) ||
      nameStr.toLowerCase().includes(query) ||
      emailStr.toLowerCase().includes(query);
      
    const matchesStatus = statusFilter === 'all' || q.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  }), [quotations, searchQuery, statusFilter]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 text-white shadow-modern-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5" />
                <span className="text-blue-100">Quotation Management</span>
              </div>
              <h1 className="text-3xl mb-2">Quotations</h1>
              <p className="text-blue-100">Manage and track all generated quotations</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchQuotations}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
            <Button variant="outline" size="sm" onClick={fetchQuotations} className="ml-auto">
              Retry
            </Button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Quotations', count: stats.total,    color: 'blue',   icon: FileText },
            { label: 'Pending',          count: stats.pending,  color: 'yellow', icon: Clock },
            { label: 'Approved',         count: stats.accepted, color: 'green',  icon: CheckCircle },
            { label: 'Rejected',         count: stats.rejected, color: 'red',    icon: XCircle },
          ].map((stat) => (
            <Card key={stat.label} className="modern-card border-0 shadow-modern-lg overflow-hidden">
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
                <h3 className="text-sm text-slate-600 mb-1">{stat.label}</h3>
                {loading ? (
                  <div className="h-8 w-12 bg-slate-200 animate-pulse rounded" />
                ) : (
                  <p className="text-2xl text-slate-900">{stat.count}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Monthly Chart */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Quotations Overview (Monthly)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                No data available yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} name="Approved" />
                  <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} name="Rejected" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                All Quotations
                {!loading && (
                  <span className="text-sm font-normal text-slate-500">({filtered.length})</span>
                )}
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by ID, Customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-72 border-slate-200"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 border-slate-200">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-3 text-slate-500">Loading quotations...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <FileText className="w-12 h-12 mb-3 opacity-40" />
                <p className="text-lg">No quotations found</p>
                <p className="text-sm mt-1">Try adjusting your search or filter</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead>Quotation ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total (Rs)</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((q) => (
                      <TableRow key={q._id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-mono text-sm text-slate-900">{q.quotationID || q.sq_id}</TableCell>
                        <TableCell>
                          <div className="text-slate-900 font-medium">{q.name}</div>
                          <div className="text-slate-500 text-xs">{q.email}</div>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {q.items?.length ?? 0} item{q.items?.length !== 1 ? 's' : ''}
                        </TableCell>
                        <TableCell className="text-slate-900 font-semibold">
                          Rs. {(q.total || q.total_estimate || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-slate-600 whitespace-nowrap">
                          {formatDate(q.date || q.createdAt || '')}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusCls(q.status)}>
                            {getStatusLabel(q.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => {
                              setSelectedQuotation(q);
                              setShowDetailsModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="border-0 shadow-2xl max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Quotation Details
            </DialogTitle>
          </DialogHeader>

          {selectedQuotation && (
            <div className="space-y-5">
              {/* Meta grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-xl">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Quotation ID</p>
                  <p className="font-mono text-sm font-bold text-slate-900">{selectedQuotation.quotationID || selectedQuotation.sq_id}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <Badge className={getStatusCls(selectedQuotation.status)}>
                    {getStatusLabel(selectedQuotation.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><User className="w-3 h-3"/>Customer</p>
                  <p className="text-sm font-medium text-slate-900">{selectedQuotation.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Date</p>
                  <p className="text-sm font-medium text-slate-900">{formatDate(selectedQuotation.date || selectedQuotation.createdAt || '')}</p>
                </div>

                <div className="col-span-2">
                  <p className="text-xs text-slate-500 mb-1">Email</p>
                  <p className="text-sm text-slate-900">{selectedQuotation.email}</p>
                </div>
                {selectedQuotation.validUntil && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500 mb-1">Valid Until</p>
                    <p className="text-sm font-medium text-slate-900">{formatDate(selectedQuotation.validUntil)}</p>
                  </div>
                )}
              </div>

              {/* Items list */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  Quoted Items ({selectedQuotation.items?.length ?? 0})
                </h3>
                <div className="space-y-2">
                  {selectedQuotation.items?.map((item, idx) => {
                    const price = item.unitPrice || item.price || 0;
                    const total = item.totalPrice || (price * item.quantity);
                    return (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{item.name || item.productID}</p>
                          {item.description && <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>}
                        </div>
                        <div className="flex items-center gap-6 sm:w-64">
                          <div className="flex-1">
                            <p className="text-xs text-slate-500">Qty</p>
                            <p className="text-sm font-semibold text-slate-700">
                              {item.quantity} {item.unit || ''}
                            </p>
                          </div>
                          <div className="flex-1 text-right">
                            <p className="text-xs text-slate-500">Unit Price</p>
                            <p className="text-sm font-medium text-slate-700">Rs. {price.toFixed(2)}</p>
                          </div>
                          <div className="flex-1 text-right">
                            <p className="text-xs text-slate-500">Total</p>
                            <p className="text-sm font-black text-blue-700">Rs. {total.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="flex justify-end pt-4">
                <div className="w-full sm:w-64 space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span>Rs. {(selectedQuotation.subtotal || selectedQuotation.total || selectedQuotation.total_estimate || 0).toFixed(2)}</span>
                  </div>
                  {selectedQuotation.tax_amount !== undefined && selectedQuotation.tax_amount > 0 && (
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Tax</span>
                      <span>Rs. {selectedQuotation.tax_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-blue-700">Rs. {(selectedQuotation.total || selectedQuotation.total_estimate || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedQuotation.notes && (
                <div className="p-4 bg-yellow-50/50 border border-yellow-100 rounded-lg">
                  <p className="text-xs font-semibold text-yellow-800 mb-1">Notes</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedQuotation.notes}</p>
                </div>
              )}

              <div className="flex justify-end pt-4 gap-3 border-t border-slate-100">
                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
