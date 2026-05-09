import { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import {
  FileText,
  Search,
  Plus,
  Trash2,
  CheckCircle,
  X,
  Phone,
  Mail,
  Calendar,
  Hash,
  Send,
  Save,
  Eye,
  XCircle,
  Users,
  Package,
  Clock,
  Loader2,
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface RequirementRow {
  id: number;
  itemName: string;
  quantity: string;
  unit: string;
  deliveryDate: string;
  notes: string;
}

interface SupplierData {
  id: string;
  fullName: string;
  contactNumber: string;
  email: string;
  status: string;
}

interface PreviousRequest {
  id: string;
  requirementId: string;
  createdAt: string;
  itemSummary: string;
  status: string;
}

export function RequestQuotation() {
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [previousRequests, setPreviousRequests] = useState<PreviousRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requirements, setRequirements] = useState<RequirementRow[]>([
    { id: 1, itemName: '', quantity: '', unit: 'units', deliveryDate: '', notes: '' }
  ]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [priority, setPriority] = useState('medium');
  const [expiryDate, setExpiryDate] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('previous');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [suppliersRes, requestsRes] = await Promise.all([
        axios.get('http://localhost:5900/api/suppliers/all', { headers: getAuthHeader() }),
        axios.get('http://localhost:5900/api/suppliers/supplier-requirements/my', { headers: getAuthHeader() }) // Admin can also view all
      ]);
      setSuppliers(suppliersRes.data.suppliers || []);
      setPreviousRequests(requestsRes.data.requirements || []);
    } catch (err: any) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addRequirementRow = () => {
    setRequirements([
      ...requirements,
      { id: Date.now(), itemName: '', quantity: '', unit: 'units', deliveryDate: '', notes: '' }
    ]);
  };

  const removeRequirementRow = (id: number) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter(req => req.id !== id));
    }
  };

  const updateRequirement = (id: number, field: keyof RequirementRow, value: string) => {
    setRequirements(requirements.map(req =>
      req.id === id ? { ...req, [field]: value } : req
    ));
  };

  const handleSubmit = async () => {
    if (!selectedSupplierId) {
      toast.error('Please select a supplier first');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        supplierId: selectedSupplierId,
        items: requirements.map(r => ({
          itemName: r.itemName,
          quantity: parseFloat(r.quantity),
          unit: r.unit,
          deliveryDate: r.deliveryDate || undefined,
          notes: r.notes
        }))
      };

      await axios.post('http://localhost:5900/api/suppliers/supplier-requirements', payload, {
        headers: getAuthHeader()
      });

      setShowSuccessModal(true);
      fetchData();
      setRequirements([{ id: 1, itemName: '', quantity: '', unit: 'units', deliveryDate: '', notes: '' }]);
      setSelectedSupplierId('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'quoted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredRequests = previousRequests.filter(request => {
    const q = searchQuery.toLowerCase();
    return (
      (request.requirementId || '').toLowerCase().includes(q) ||
      (request.itemSummary || '').toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-8 text-white shadow-modern-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-violet-200" />
              <span className="text-violet-100 uppercase tracking-widest text-xs font-bold">Supplier Portal Connect</span>
            </div>
            <h1 className="text-3xl mb-2 font-black">Request Quotations</h1>
            <p className="text-violet-100 opacity-90">Broadcast your requirements to verified suppliers and receive competitive bids</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="previous" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-purple-600 font-bold">
              History
            </TabsTrigger>
            <TabsTrigger value="new" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-purple-600 font-bold">
              New Request
            </TabsTrigger>
          </TabsList>

          <TabsContent value="previous" className="mt-6">
            <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
              <CardHeader className="bg-slate-50/80 border-b border-slate-100">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    Request History
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-64 border-slate-200 rounded-xl"
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchData} className="h-10 w-10 p-0 rounded-xl">
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
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-6">ID</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Date</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Requirements</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-right pr-6">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" /></TableCell></TableRow>
                      ) : filteredRequests.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-20 text-slate-400 italic">No requests discovered.</TableCell></TableRow>
                      ) : (
                        filteredRequests.map((request) => (
                          <TableRow key={request.id} className="hover:bg-slate-50/50 transition-colors border-b last:border-0 group">
                            <TableCell className="pl-6 py-4 font-mono font-bold text-slate-600 group-hover:text-purple-600">{request.requirementId}</TableCell>
                            <TableCell className="py-4 text-slate-500 text-sm">{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="py-4 max-w-xs truncate font-medium text-slate-900">{request.itemSummary}</TableCell>
                            <TableCell className="py-4 text-center">
                              <Badge className={`${getStatusColor(request.status)} border capitalize px-3 h-6 text-[10px] font-bold`}>
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 text-right pr-6">
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg border-slate-200 hover:bg-purple-50 hover:text-purple-600">
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
          </TabsContent>

          <TabsContent value="new" className="mt-6 space-y-6">
            {/* New Request Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
                  <CardHeader className="bg-slate-50/80 border-b border-slate-100 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                      <Package className="w-4 h-4 text-purple-600" />
                      Line Items
                    </CardTitle>
                    <Button onClick={addRequirementRow} variant="outline" size="sm" className="rounded-xl border-purple-200 text-purple-600 hover:bg-purple-50 font-bold">
                      <Plus className="w-4 h-4 mr-2" /> Add Item
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50/30 border-b border-slate-100">
                          <tr>
                            <th className="py-3 pl-6 text-left text-[10px] font-black uppercase text-slate-400">Item Name</th>
                            <th className="py-3 text-left text-[10px] font-black uppercase text-slate-400">Qty</th>
                            <th className="py-3 text-left text-[10px] font-black uppercase text-slate-400">Unit</th>
                            <th className="py-3 pr-6 text-right text-[10px] font-black uppercase text-slate-400">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {requirements.map((req) => (
                            <tr key={req.id} className="border-b last:border-0 group">
                              <td className="py-4 pl-6">
                                <Input
                                  placeholder="What do you need?"
                                  value={req.itemName}
                                  onChange={(e) => updateRequirement(req.id, 'itemName', e.target.value)}
                                  className="border-slate-200 rounded-lg h-9 bg-slate-50/50 focus:bg-white"
                                />
                              </td>
                              <td className="py-4 w-24">
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={req.quantity}
                                  onChange={(e) => updateRequirement(req.id, 'quantity', e.target.value)}
                                  className="border-slate-200 rounded-lg h-9"
                                />
                              </td>
                              <td className="py-4 w-32">
                                <Select value={req.unit} onValueChange={(v) => updateRequirement(req.id, 'unit', v)}>
                                  <SelectTrigger className="border-slate-200 rounded-lg h-9">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="units">Units</SelectItem>
                                    <SelectItem value="kg">KG</SelectItem>
                                    <SelectItem value="m">Meters</SelectItem>
                                    <SelectItem value="pcs">Pieces</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="py-4 pr-6 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeRequirementRow(req.id)}
                                  disabled={requirements.length === 1}
                                  className="text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg h-8 w-8 p-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
                  <CardHeader className="bg-slate-50/80 border-b border-slate-100">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600">Additional Context</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Textarea
                      placeholder="Special instructions, delivery timelines, or technical specifications..."
                      value={generalNotes}
                      onChange={(e) => setGeneralNotes(e.target.value)}
                      className="min-h-32 border-slate-200 rounded-xl resize-none"
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="modern-card border-0 shadow-modern-lg overflow-hidden bg-slate-900 text-white">
                  <CardHeader className="border-b border-white/10">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-400 mb-2 block">Target Supplier *</Label>
                      <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-lg h-10">
                          <SelectValue placeholder="Select a supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.fullName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-400 mb-2 block">Response Deadline</Label>
                      <Input
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="bg-white/5 border-white/10 text-white rounded-lg h-10"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-400 mb-2 block">Priority Level</Label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-lg h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="pt-4">
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || requirements.some(r => !r.itemName || !r.quantity)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest rounded-xl h-12 shadow-xl shadow-purple-900/20"
                      >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Broadcast Request</>}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
                  <CardHeader className="bg-slate-50/80 border-b border-slate-100">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600">Suppliers Reach</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{suppliers.length} Verified Suppliers</p>
                        <p className="text-xs text-slate-500">Global reach across all partners</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed italic">
                      This request will be visible to all active suppliers in the portal. They will be notified to submit their quotations based on these requirements.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="border-0 shadow-2xl max-w-md p-0 overflow-hidden">
          <div className="bg-slate-900 p-8 text-center text-white">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black mb-2">Request Broadcasted!</DialogTitle>
            <p className="text-slate-400 text-sm">Your requirement has been sent to all verified suppliers. You can track their quotations in the 'History' tab.</p>
          </div>
          <div className="p-6">
            <Button
              onClick={() => { setShowSuccessModal(false); setActiveTab('previous'); }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 rounded-xl"
            >
              Track History
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
