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
  Send,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  FileText,
  Package,
} from 'lucide-react';

interface QuotationItem {
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit?: string;
  notes?: string;
}

interface Quotation {
  _id: string;
  quotationID?: string;
  supplierEmail?: string;
  companyName?: string;
  status: string;
  totalAmount?: number;
  subtotal?: number;
  tax_amount?: number;
  createdAt: string;
  items: QuotationItem[];
  notes?: string;
  quotationType?: string;
}

export function SupplierQuotationsAdmin() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Quotation | null>(null);

  const fetchQuotations = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('http://localhost:5900/api/suppliers/quotations/all');
      setQuotations(res.data.quotations || res.data || []);
    } catch (err) {
      console.error('Failed to load quotations:', err);
      toast.error('Failed to load supplier quotations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchQuotations(); }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':  return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':  return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':   return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'submitted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'draft':     return 'bg-slate-100 text-slate-600 border-slate-200';
      default:          return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await axios.put(`http://localhost:5900/api/suppliers/quotations/accept/${id}`);
      toast.success('Quotation approved');
      fetchQuotations();
      setShowModal(false);
    } catch (err) {
      toast.error('Failed to approve quotation');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await axios.put(`http://localhost:5900/api/suppliers/quotations/reject/${id}`);
      toast.error('Quotation rejected');
      fetchQuotations();
      setShowModal(false);
    } catch (err) {
      toast.error('Failed to reject quotation');
    }
  };

  const filtered = quotations.filter(q => {
    const queryLower = searchTerm.toLowerCase();
    const matchSearch =
      (q.quotationID || q._id).toLowerCase().includes(queryLower) ||
      (q.supplierEmail || '').toLowerCase().includes(queryLower) ||
      (q.companyName || '').toLowerCase().includes(queryLower);
    const matchStatus = statusFilter === 'all' || q.status?.toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 text-white shadow-modern-lg">
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Send className="w-5 h-5 text-violet-100" />
              <span className="text-violet-100 uppercase tracking-wider text-xs font-bold">Quotation Review</span>
            </div>
            <h1 className="text-3xl mb-2">Supplier Quotations</h1>
            <p className="text-violet-100">Review and approve or reject supplier price quotations</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by ID, supplier email..."
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
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-slate-200 h-12 rounded-xl px-5" onClick={fetchQuotations}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl py-6">
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-violet-600" />
              Supplier Quotations ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="font-bold">Quotation ID</TableHead>
                    <TableHead className="font-bold">Supplier</TableHead>
                    <TableHead className="font-bold">Items</TableHead>
                    <TableHead className="font-bold">Total Amount</TableHead>
                    <TableHead className="font-bold text-center">Status</TableHead>
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="text-right font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-64 text-center text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-violet-600" />
                        Loading quotations...
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-slate-500 italic">
                        No supplier quotations found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(q => (
                      <TableRow key={q._id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-slate-900">
                          {q._id || q.quotationID || q._id.slice(-8).toUpperCase()}
                        </TableCell>
                        <TableCell className="text-slate-900 text-sm">{q.supplierEmail || q.companyName || '—'}</TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-violet-50 rounded-full text-violet-700 font-black text-sm">
                            {q.items?.length || 0}
                          </span>
                        </TableCell>
                        <TableCell className="font-black text-slate-900">
                          LKR {(q.totalAmount || q.subtotal || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${getStatusColor(q.status)} capitalize border-2`}>
                            {q.status || '—'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">
                          {new Date(q.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-violet-600 hover:text-white border-slate-200 transition-all"
                              onClick={() => { setSelected(q); setShowModal(true); }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            {(q.status === 'pending' || q.status === 'submitted') && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="hover:bg-green-600 hover:text-white border-green-200 text-green-700"
                                  onClick={() => handleApprove(q._id)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="hover:bg-red-600 hover:text-white border-red-200 text-red-600"
                                  onClick={() => handleReject(q._id)}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
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
        <DialogContent className="border-0 shadow-2xl max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black">
              <FileText className="w-5 h-5 text-violet-600" />
              Quotation Details
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 p-5 bg-violet-50 rounded-2xl text-sm">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Quotation ID</p>
                  <p className="font-bold text-slate-900 mt-0.5 font-mono">
                    {selected._id || selected.quotationID || selected._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Submitted</p>
                  <p className="font-bold text-slate-900 mt-0.5">{new Date(selected.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Supplier</p>
                  <p className="font-bold text-slate-900 mt-0.5">{selected.supplierEmail || selected.companyName || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Status</p>
                  <Badge className={`${getStatusColor(selected.status)} capitalize border mt-1`}>
                    {selected.status || '—'}
                  </Badge>
                </div>
              </div>

              {/* Quotation Items */}
              <div>
                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-violet-600" />
                  Quoted Items
                </h3>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="font-bold">Item</TableHead>
                        <TableHead className="font-bold text-center">Qty</TableHead>
                        <TableHead className="font-bold text-right">Unit Price</TableHead>
                        <TableHead className="font-bold text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selected.items?.length > 0 ? (
                        selected.items.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-bold text-slate-900">{item.itemName}</TableCell>
                            <TableCell className="text-center">{item.quantity} {item.unit || ''}</TableCell>
                            <TableCell className="text-right">LKR {item.unitPrice.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-black">LKR {item.totalPrice.toLocaleString()}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-slate-400 italic py-6">
                            No items listed in this quotation
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end mt-4">
                  <div className="bg-violet-50 rounded-xl p-4 min-w-[260px] space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span>LKR {(selected.subtotal || selected.totalAmount || 0).toLocaleString()}</span>
                    </div>
                    {selected.tax_amount !== undefined && (
                      <div className="flex justify-between text-slate-600">
                        <span>Tax</span>
                        <span>LKR {selected.tax_amount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-black text-violet-900 border-t border-violet-200 pt-2">
                      <span>Total</span>
                      <span>LKR {(selected.totalAmount || selected.subtotal || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selected.notes && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-slate-900 text-sm whitespace-pre-wrap">{selected.notes}</p>
                </div>
              )}

              {/* Approve / Reject Actions */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Close</Button>
                {(selected.status === 'pending' || selected.status === 'submitted') && (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleReject(selected._id)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />Reject
                    </Button>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200"
                      onClick={() => handleApprove(selected._id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />Approve
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
