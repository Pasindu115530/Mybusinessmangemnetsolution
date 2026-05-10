import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  XCircle,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface RequirementItem {
  itemName: string;
  quantity: number;
  unit: string;
  expectedDeliveryDate?: string;
  notes?: string;
}

interface Requirement {
  id: string;
  requirementId: string;
  customerName: string;
  companyName: string;
  items: RequirementItem[];
  itemSummary: string;
  createdAt: string;
  status: string;
  rejectReason: string | null;
  attachedDocument: string | null;
}

interface Stats {
  total: number;
  new: number;
  in_progress: number;
  completed: number;
  rejected: number;
}

export function CustomerRequirements() {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
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
      if (searchQuery) params.search = searchQuery;

      const [reqRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5900/api/suppliers/supplier-requirements/my', { headers, params }),
        axios.get('http://localhost:5900/api/suppliers/requirements/stats', { headers })
      ]);

      setRequirements(reqRes.data.requirements || []);
      setStats(statsRes.data.stats || null);
    } catch (err: any) {
      console.error('Failed to load requirements:', err);
      toast.error(err.response?.data?.message || 'Failed to load customer requirements');
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
      case 'pending':
      case 'sent':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'quoted':
      case 'accepted':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'sent':
        return <FileText className="w-3 h-3 mr-1" />;
      case 'quoted':
      case 'accepted':
        return <Clock className="w-3 h-3 mr-1" />;
      case 'delivered':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'rejected':
        return <XCircle className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const filteredRequirements = requirements.filter(req => {
    const q = searchQuery.toLowerCase();
    return (
      (req.requirementId || '').toLowerCase().includes(q) ||
      (req.customerName || '').toLowerCase().includes(q) ||
      (req.companyName || '').toLowerCase().includes(q) ||
      (req.itemSummary || '').toLowerCase().includes(q)
    );
  });

  const handleViewDetails = async (id: string) => {
    try {
      setIsLoadingDetail(true);
      setShowDetailsModal(true);
      const headers = getAuthHeader();
      const res = await axios.get(`http://localhost:5900/api/suppliers/requirements/${id}`, { headers });
      setSelectedRequirement(res.data.requirement);
    } catch (err: any) {
      toast.error('Failed to load requirement details');
      setShowDetailsModal(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handlePrepareQuotation = (requirement: Requirement) => {
    navigate('/supplier/create-quotation', { 
      state: { 
        requirementId: requirement.id,
        requirementRef: requirement.requirementId,
        items: requirement.items 
      } 
    });
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
              <span className="text-green-100 uppercase tracking-wider text-xs font-bold">Requirements Management</span>
            </div>
            <h1 className="text-3xl mb-2">Customer Requirements</h1>
            <p className="text-green-100">Review customer requests and prepare quotations</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'New Requests', count: stats?.new || 0, color: 'blue', icon: FileText, bg: 'from-blue-100 to-blue-200' },
            { label: 'In Progress', count: stats?.in_progress || 0, color: 'yellow', icon: Clock, bg: 'from-yellow-100 to-amber-100' },
            { label: 'Completed', count: stats?.completed || 0, color: 'green', icon: CheckCircle, bg: 'from-green-100 to-emerald-100' },
            { label: 'Rejected', count: stats?.rejected || 0, color: 'red', icon: XCircle, bg: 'from-red-100 to-rose-100' },
          ].map((stat) => (
            <Card key={stat.label} className="modern-card border-0 shadow-modern-lg overflow-hidden">
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.bg} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
                <h3 className="text-sm text-slate-600 mb-1">{stat.label}</h3>
                <p className="text-2xl font-black text-slate-900">{stat.count}</p>
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
                    <SelectItem value="pending">New</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="delivered">Completed</SelectItem>
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
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="font-bold">Requirement ID</TableHead>
                    <TableHead className="font-bold">Customer</TableHead>
                    <TableHead className="font-bold">Items Summary</TableHead>
                    <TableHead className="font-bold">Date Submitted</TableHead>
                    <TableHead className="font-bold text-center">Status</TableHead>
                    <TableHead className="font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-green-600" />
                        Loading requirements...
                      </TableCell>
                    </TableRow>
                  ) : filteredRequirements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-slate-400 italic">
                        No requirements found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequirements.map((req) => (
                      <TableRow key={req.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-slate-900">{req.requirementId}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-slate-900 font-bold">{req.customerName}</p>
                            <p className="text-xs text-slate-500">{req.companyName}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm max-w-xs truncate">{req.itemSummary}</TableCell>
                        <TableCell className="text-slate-600 text-sm">{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${getStatusColor(req.status)} capitalize border`}>
                            {getStatusIcon(req.status)}
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="hover:bg-blue-50 hover:text-blue-600 border-slate-200"
                              onClick={() => handleViewDetails(req.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {(req.status === 'pending' || req.status === 'sent') && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="hover:bg-green-50 hover:text-green-600 border-slate-200"
                                onClick={() => handlePrepareQuotation(req)}
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Create Quotation
                              </Button>
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

      {/* View Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="border-0 shadow-2xl max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black">
              <FileText className="w-5 h-5 text-green-600" />
              Requirement Details
            </DialogTitle>
          </DialogHeader>
          
          {isLoadingDetail ? (
            <div className="py-20 text-center">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-green-600 mb-4" />
              <p className="text-slate-500">Loading details...</p>
            </div>
          ) : selectedRequirement && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-green-50 rounded-2xl border border-green-100">
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Requirement ID</p>
                    <p className="text-slate-900 font-bold font-mono">{selectedRequirement.requirementId}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer</p>
                    <p className="text-slate-900 font-bold">{selectedRequirement.customerName}</p>
                    <p className="text-xs text-slate-500">{selectedRequirement.companyName}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date Submitted</p>
                    <p className="text-slate-900 font-bold">{new Date(selectedRequirement.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <Badge className={`${getStatusColor(selectedRequirement.status)} capitalize border-2`}>
                      {getStatusIcon(selectedRequirement.status)}
                      {selectedRequirement.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-widest">
                  <Package className="w-4 h-4 text-green-600" />
                  Requested Items
                </h4>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="font-bold">Item</TableHead>
                        <TableHead className="font-bold text-center">Quantity</TableHead>
                        <TableHead className="font-bold">Unit</TableHead>
                        <TableHead className="font-bold">Expected Delivery</TableHead>
                        <TableHead className="font-bold">Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedRequirement.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-slate-900 font-bold">{item.itemName}</TableCell>
                          <TableCell className="text-slate-900 text-center font-black">{item.quantity}</TableCell>
                          <TableCell className="text-slate-600">{item.unit}</TableCell>
                          <TableCell className="text-slate-600 text-sm">
                            {item.expectedDeliveryDate ? new Date(item.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell className="text-slate-500 text-xs italic">{item.notes || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Uploaded Documents */}
              {selectedRequirement.attachedDocument && (
                <div>
                  <h4 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-widest">
                    <Download className="w-4 h-4 text-green-600" />
                    Attached Document
                  </h4>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900">Reference Document</span>
                        <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Click download to view specifications</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                      onClick={() => window.open(`http://localhost:5900/${selectedRequirement.attachedDocument?.replace(/\\/g, '/')}`, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedRequirement.status === 'rejected' && selectedRequirement.rejectReason && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-red-800 uppercase tracking-widest mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-700">{selectedRequirement.rejectReason}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                  className="h-12 px-6 rounded-xl"
                >
                  Close
                </Button>
                {selectedRequirement.status === 'pending' && (
                  <Button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handlePrepareQuotation(selectedRequirement);
                    }}
                    className="h-12 px-8 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-200"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Prepare Quotation
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
