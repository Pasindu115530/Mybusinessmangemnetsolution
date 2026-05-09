import { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner';
import {
  FileText,
  Search,
  Eye,
  Loader2,
  RefreshCw,
  Package,
  Calendar,
  Hash,
  Download,
  Plus,
  Trash2,
  Users,
  XCircle,
  Send,
  ClipboardList
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
  customerName: string; // This will show 'Administration' for procurement
  companyName: string;
  items: RequirementItem[];
  itemSummary: string;
  status: string;
  createdAt: string;
  attachedDocument: string | null;
}

interface Supplier {
  _id?: string;
  id?: string;
  fullName: string;
  companyName?: string;
}

interface NewItem {
  itemName: string;
  quantity: string;
  unit: string;
  deliveryDate: string;
  notes: string;
}

export function SupplierRequests() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selected, setSelected] = useState<Requirement | null>(null);

  // New Requirement State
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [newItems, setNewItems] = useState<NewItem[]>([
    { itemName: '', quantity: '', unit: 'units', deliveryDate: '', notes: '' }
  ]);
  const [isCreating, setIsCreating] = useState(false);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const headers = getAuthHeader();
      const [reqRes, supRes] = await Promise.all([
        axios.get('http://localhost:5900/api/suppliers/supplier-requirements/my', { headers }), // Admin can view all via this endpoint if backend allows
        axios.get('http://localhost:5900/api/suppliers/all', { headers })
      ]);
      setRequirements(reqRes.data.requirements || []);
      setSuppliers(supRes.data.suppliers || []);
    } catch (err) {
      console.error('Failed to load requirements:', err);
      toast.error('Failed to load procurement data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddItem = () => {
    setNewItems([...newItems, { itemName: '', quantity: '', unit: 'units', deliveryDate: '', notes: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    if (newItems.length > 1) {
      setNewItems(newItems.filter((_, i) => i !== index));
    }
  };

  const handleUpdateItem = (index: number, field: keyof NewItem, value: string) => {
    const updated = [...newItems];
    updated[index] = { ...updated[index], [field]: value };
    setNewItems(updated);
  };

  const handleCreateRequirement = async () => {
    if (!selectedSupplierId) { toast.error("Please select a target supplier"); return; }
    if (newItems.some(item => !item.itemName || !item.quantity)) { toast.error("Please fill item details"); return; }

    setIsCreating(true);
    try {
      const payload = {
        supplierId: selectedSupplierId,
        items: newItems.map(item => ({
          ...item,
          quantity: parseFloat(item.quantity)
        }))
      };

      await axios.post('http://localhost:5900/api/suppliers/supplier-requirements', payload, { headers: getAuthHeader() });
      toast.success("Procurement request sent to supplier");
      setShowAddModal(false);
      setSelectedSupplierId('');
      setNewItems([{ itemName: '', quantity: '', unit: 'units', deliveryDate: '', notes: '' }]);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send request");
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'sent':        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'quoted':      return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'accepted':    return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':    return 'bg-red-100 text-red-700 border-red-200';
      default:            return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filtered = requirements.filter(r => {
    const q = searchTerm.toLowerCase();
    return (
      (r.requirementId || '').toLowerCase().includes(q) ||
      (r.itemSummary || '').toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-10 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-indigo-400" />
                <span className="text-indigo-400 uppercase tracking-widest text-[10px] font-black">Procurement Division</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight">Supplier <span className="text-indigo-400">Requests</span></h1>
              <p className="mt-2 text-slate-400 max-w-md">Dispatch and monitor procurement requirements across the vendor network.</p>
            </div>
            
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-14 px-8 rounded-2xl shadow-xl shadow-indigo-900/20 transition-all hover:scale-105 active:scale-95">
                  <Plus className="w-5 h-5 mr-2" /> New Supplier Request
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] rounded-[30px] p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-slate-900 p-8 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-white">Procurement Broadcast</DialogTitle>
                    <p className="text-slate-400 text-xs">Direct a requirement to a specific verified supplier.</p>
                  </DialogHeader>
                </div>
                
                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto bg-white">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select Target Supplier *</Label>
                      <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                        <SelectTrigger className="h-12 border-slate-200 rounded-xl">
                          <SelectValue placeholder="Choose a supplier from the registry" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map(s => (
                            <SelectItem key={s._id || s.id} value={s._id || s.id || ''}>
                              <div className="flex flex-col">
                                <span className="font-bold">{s.fullName}</span>
                                {s.companyName && <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{s.companyName}</span>}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Requirement Items</Label>
                        <Button onClick={handleAddItem} variant="ghost" size="sm" className="text-indigo-600 font-bold hover:bg-indigo-50">
                          <Plus className="w-4 h-4 mr-1" /> Add Item
                        </Button>
                      </div>

                      {newItems.map((item, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 relative group">
                          {newItems.length > 1 && (
                            <Button 
                              onClick={() => handleRemoveItem(idx)}
                              variant="ghost" 
                              size="sm" 
                              className="absolute top-2 right-2 text-slate-300 hover:text-red-600 hover:bg-red-50 p-1 h-7 w-7 rounded-lg"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input 
                              placeholder="What is required?" 
                              value={item.itemName}
                              onChange={(e) => handleUpdateItem(idx, 'itemName', e.target.value)}
                              className="border-slate-200 h-10 rounded-lg" 
                            />
                            <div className="flex gap-2">
                              <Input 
                                type="number" 
                                placeholder="Qty" 
                                value={item.quantity}
                                onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                                className="border-slate-200 h-10 rounded-lg w-24" 
                              />
                              <Select value={item.unit} onValueChange={(v) => handleUpdateItem(idx, 'unit', v)}>
                                <SelectTrigger className="h-10 border-slate-200 rounded-lg flex-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="units">Units</SelectItem>
                                  <SelectItem value="kg">KG</SelectItem>
                                  <SelectItem value="m">Meters</SelectItem>
                                  <SelectItem value="pcs">Pieces</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <Input 
                            type="date" 
                            value={item.deliveryDate}
                            onChange={(e) => handleUpdateItem(idx, 'deliveryDate', e.target.value)}
                            className="border-slate-200 h-10 rounded-lg" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-8 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                  <Button variant="ghost" onClick={() => setShowAddModal(false)} className="rounded-xl font-bold h-12">Discard</Button>
                  <Button 
                    onClick={handleCreateRequirement}
                    disabled={isCreating}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-indigo-200"
                  >
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    Broadcast Request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search procurement logs..."
              className="pl-10 border-slate-200 h-11 rounded-xl bg-slate-50/50 focus:bg-white"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-slate-200 h-11 rounded-xl px-6 bg-white hover:bg-slate-50 transition-all" onClick={fetchData}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Sync Registry
          </Button>
        </div>

        <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
          <CardHeader className="bg-slate-50/80 border-b border-slate-100 py-6 px-8">
            <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
              <ClipboardList className="w-4 h-4 text-indigo-600" />
              Procurement Pipeline ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0"> 
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-0">
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-8">Ref ID</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Vendor</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Specifications</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Lifecycle</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Dispatched</TableHead>
                    <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-slate-400 pr-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={6} className="h-64 text-center py-20"><Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-indigo-600" /><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Loading Logistics...</p></TableCell></TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="h-40 text-center text-slate-400 italic font-medium">No active procurement requests discovered.</TableCell></TableRow>
                  ) : (
                    filtered.map(req => (
                      <TableRow key={req.id} className="hover:bg-slate-50/50 transition-colors border-b last:border-0 group">
                        <TableCell className="pl-8 py-5 font-mono text-[11px] font-black text-slate-500 group-hover:text-indigo-600 transition-colors">
                          {req.requirementId}
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="text-sm font-black text-slate-800">{req.customerName}</div>
                        </TableCell>
                        <TableCell className="py-5 text-slate-500 font-medium text-xs max-w-xs truncate">
                          {req.itemSummary}
                        </TableCell>
                        <TableCell className="py-5 text-center">
                          <Badge className={`${getStatusColor(req.status)} capitalize border px-3 h-6 text-[10px] font-bold shadow-sm`}>
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-5 text-slate-400 text-[10px] font-black uppercase">
                          {new Date(req.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </TableCell>
                        <TableCell className="py-5 text-right pr-8">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-4 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 rounded-xl transition-all"
                            onClick={() => { setSelected(req); setShowDetailModal(true); }}
                          >
                            <Eye className="w-4 h-4 mr-2" /> View Audit
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
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="border-0 shadow-2xl max-w-3xl p-0 overflow-hidden">
          <div className="bg-slate-900 p-8 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black">{selected?.requirementId}</DialogTitle>
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black italic">Procurement Audit Log</p>
                </div>
              </div>
            </DialogHeader>
          </div>

          {selected && (
            <div className="p-8 space-y-8 bg-white">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Target Vendor</p>
                  <p className="font-black text-slate-900 text-sm">{selected.customerName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Entry Date</p>
                  <p className="font-black text-slate-900 text-sm">{new Date(selected.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Line Items</p>
                  <p className="font-black text-slate-900 text-sm">{selected.items?.length || 0} Products</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Current State</p>
                  <Badge className={`${getStatusColor(selected.status)} capitalize border px-3 h-6 text-[10px] font-bold`}>
                    {selected.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-black text-slate-900 uppercase text-[10px] tracking-widest flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-600" />
                  Product Manifest
                </h3>
                <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-black text-[10px] uppercase px-6 py-4">Item Name</TableHead>
                        <TableHead className="font-black text-[10px] uppercase text-center">Quantity</TableHead>
                        <TableHead className="font-black text-[10px] uppercase">Requirement Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selected.items?.map((item, idx) => (
                        <TableRow key={idx} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                          <TableCell className="font-black text-slate-800 text-sm px-6 py-5">
                            {item.itemName}
                            {item.notes && <p className="text-[10px] text-slate-400 font-medium italic mt-1 leading-relaxed">"{item.notes}"</p>}
                          </TableCell>
                          <TableCell className="text-center">
                             <span className="text-sm font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                                {item.quantity} <span className="text-[10px] font-black uppercase ml-0.5">{item.unit}</span>
                             </span>
                          </TableCell>
                          <TableCell className="text-slate-600 text-xs font-bold italic px-6">
                            {item.expectedDeliveryDate ? new Date(item.expectedDeliveryDate).toLocaleDateString() : 'Immediate Fulfillment'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end bg-slate-50/30 -mx-8 -mb-8 p-8">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl h-12 px-12 transition-all shadow-lg shadow-slate-200" onClick={() => setShowDetailModal(false)}>
                  Close Audit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
