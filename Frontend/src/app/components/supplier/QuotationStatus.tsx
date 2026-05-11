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
  CheckCircle,
  Search,
  Eye,
  Edit,
  Clock,
  XCircle,
  FileText,
  AlertCircle,
  Loader2,
  RefreshCw,
  Package,
  Calendar,
  Banknote
} from 'lucide-react';

interface QuotationItem {
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
}

interface Quotation {
  _id: string;
  id?: string; // fallback
  quotationId?: string; // frontend legacy
  quotationID?: string; // backend field
  sq_id?: string; // backend field
  requirementId?: string; // backend field
  requirementRef?: string; // frontend field
  total: number;
  status: string;
  adminNotes?: string;
  notes?: string; // backend field
  date: string;
  validUntil: string;
  items: QuotationItem[];
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export function QuotationStatus() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

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

      const [quotRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5900/api/suppliers/quotations/table', { headers, params }),
        axios.get('http://localhost:5900/api/suppliers/quotations/stats', { headers })
      ]);

      setQuotations(quotRes.data.quotations || []);
      setStats(statsRes.data.stats || null);
    } catch (err: any) {
      console.error('Failed to load quotations:', err);
      toast.error('Failed to load quotations');
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
      case 'approved':
      case 'accepted':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'submitted':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'accepted':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'rejected':
        return <XCircle className="w-3 h-3 mr-1" />;
      case 'pending':
      case 'submitted':
        return <Clock className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const filteredQuotations = quotations.filter(quot => {
    const q = searchQuery.toLowerCase();
    return (
      (quot.sq_id || '').toLowerCase().includes(q) ||
      (quot.quotationID || '').toLowerCase().includes(q) ||
      (quot.requirementId || '').toLowerCase().includes(q)
    );
  });

  const handleViewDetails = async (id: string) => {
    try {
      setIsLoadingDetail(true);
      setShowDetailsModal(true);
      const headers = getAuthHeader();
      const res = await axios.get(`http://localhost:5900/api/suppliers/quotations/${id}/detail`, { headers });
      setSelectedQuotation(res.data.quotation);
    } catch (err: any) {
      toast.error('Failed to load quotation details');
      setShowDetailsModal(false);
    } finally {
      setIsLoadingDetail(false);
    }
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
              <span className="text-green-100 uppercase tracking-wider text-xs font-bold">Quotation Tracking</span>
            </div>
            <h1 className="text-3xl mb-2 font-black">Quotation Status</h1>
            <p className="text-green-100 opacity-90">Monitor the approval status of your submitted pricing quotes</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Submitted', count: stats?.total || 0, color: 'blue', icon: FileText, bg: 'from-blue-50 to-blue-100', value: `LKR ${(quotations.reduce((s,q) => s + q.total, 0)).toLocaleString()}` },
            { label: 'Pending Review', count: stats?.pending || 0, color: 'yellow', icon: Clock, bg: 'from-yellow-50 to-amber-100' },
            { label: 'Approved', count: stats?.approved || 0, color: 'green', icon: CheckCircle, bg: 'from-green-50 to-emerald-100' },
            { label: 'Rejected', count: stats?.rejected || 0, color: 'red', icon: XCircle, bg: 'from-red-50 to-rose-100' },
          ].map((stat) => (
            <Card key={stat.label} className="modern-card border-0 shadow-modern-lg overflow-hidden">
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.bg} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</h3>
                <p className="text-2xl font-black text-slate-900">{stat.label === 'Total Submitted' ? stat.value : stat.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quotations Table */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-600" />
                Submitted Quotations
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search IDs..."
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
                <Button variant="outline" size="sm" onClick={fetchData} className="border-slate-200">
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50 border-b">
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Quotation ID</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Requirement Ref</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Total Amount</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Date Submitted</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-48 text-center text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-green-600" />
                        Loading quotations...
                      </TableCell>
                    </TableRow>
                  ) : filteredQuotations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-slate-400 italic">
                        No quotations found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredQuotations.map((quot) => (
                      <TableRow key={quot._id} className="hover:bg-slate-50/50 transition-colors border-b last:border-0 group">
                        <TableCell className="font-mono text-xs font-bold text-slate-400 group-hover:text-green-600 transition-colors">
                          {quot.sq_id || quot.quotationID}
                        </TableCell>
                        <TableCell className="text-slate-600 text-xs font-bold">{quot.requirementId || 'Direct'}</TableCell>
                        <TableCell className="text-slate-900 font-black">LKR {quot.total.toLocaleString()}</TableCell>
                        <TableCell className="text-slate-600 text-sm font-bold">{new Date(quot.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${getStatusColor(quot.status)} text-[10px] border capitalize px-3`}>
                            {getStatusIcon(quot.status)}
                            {quot.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0 border-slate-200 hover:bg-blue-50 hover:text-blue-600"
                              onClick={() => handleViewDetails(quot._id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
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

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="border-0 shadow-2xl max-w-3xl overflow-hidden p-0">
          {isLoadingDetail ? (
            <div className="py-20 text-center">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-green-600 mb-4" />
              <p className="text-slate-500">Fetching detailed data...</p>
            </div>
          ) : selectedQuotation && (
            <>
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-xl font-black flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-400" />
                      Quotation Detail
                    </DialogTitle>
                    <Badge className={`${getStatusColor(selectedQuotation.status)} border-0`}>
                      {selectedQuotation.status}
                    </Badge>
                  </div>
                </DialogHeader>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Quote ID</p>
                    <p className="text-xs font-bold text-slate-900 font-mono">{selectedQuotation.sq_id || selectedQuotation.quotationID}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Requirement</p>
                    <p className="text-xs font-bold text-slate-900 font-mono">{selectedQuotation.requirementId || 'Direct'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Submitted On</p>
                    <p className="text-xs font-bold text-slate-900">{new Date(selectedQuotation.date).toLocaleDateString()}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Valid Until</p>
                    <p className="text-xs font-bold text-slate-900">{selectedQuotation.validUntil ? new Date(selectedQuotation.validUntil).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-green-600" />
                    Quoted Items
                  </h4>
                  <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50">
                          <TableHead className="font-bold">Item</TableHead>
                          <TableHead className="text-center font-bold">Qty</TableHead>
                          <TableHead className="text-right font-bold">Unit Price</TableHead>
                          <TableHead className="text-right font-bold">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedQuotation.items.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-bold text-slate-900">{item.itemName}</TableCell>
                            <TableCell className="text-center font-black">{item.quantity} {item.unit}</TableCell>
                            <TableCell className="text-right text-slate-600">LKR {item.unitPrice?.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-black text-slate-900">
                              LKR {item.subtotal?.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-slate-50/30">
                          <TableCell colSpan={3} className="text-right font-black uppercase tracking-tighter text-slate-400">Grand Total</TableCell>
                          <TableCell className="text-right font-black text-green-600 text-lg">
                            LKR {selectedQuotation.total.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {(selectedQuotation.adminNotes || selectedQuotation.notes) && (
                  <div className={`p-4 rounded-xl flex gap-3 ${
                    selectedQuotation.status === 'rejected' ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'
                  }`}>
                    <AlertCircle className={`w-5 h-5 ${
                      selectedQuotation.status === 'rejected' ? 'text-red-600' : 'text-green-600'
                    } shrink-0 mt-0.5`} />
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${
                        selectedQuotation.status === 'rejected' ? 'text-red-800' : 'text-green-800'
                      } mb-1`}>Admin Feedback</p>
                      <p className={`text-sm ${
                        selectedQuotation.status === 'rejected' ? 'text-red-700' : 'text-green-700'
                      }`}>
                        {selectedQuotation.adminNotes || selectedQuotation.notes}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailsModal(false)}
                    className="h-12 px-8 rounded-xl font-bold border-slate-200"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </SupplierLayout>
  );
}
