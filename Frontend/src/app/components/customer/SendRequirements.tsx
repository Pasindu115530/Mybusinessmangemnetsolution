import { useState, useEffect } from 'react';
import axios from 'axios';
import { CustomerLayout } from './CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { 
  Plus, Trash2, Upload, Send, CheckCircle, X, FileText, 
  Package, Loader2, Clock, Eye, ShieldCheck, 
  ArrowUpRight, Layers, Hourglass
} from 'lucide-react';

interface RequirementItem {
  id: number;
  itemName: string;
  quantity: string;
  unit: string;
  notes: string;
  deliveryDate: string;
}

const stockItems = [
  'Product A - Electronics', 'Product B - Furniture', 'Product C - Textiles', 
  'Product D - Hardware', 'Product E - Office Supplies',
];

export function SendRequirements() {
  const [items, setItems] = useState<RequirementItem[]>([
    { id: 1, itemName: '', quantity: '', unit: 'units', notes: '', deliveryDate: '' }
  ]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sentRequirements, setSentRequirements] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, received: 0, pending: 0 });

  const getCustomerId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || user._id;
  };

  const fetchData = async () => {
    const customerId = getCustomerId();
    if (!customerId) return;
    try {
      setHistoryLoading(true);
      const res = await axios.get(`YOUR_BACKEND_URL/api/requirements?customerId=${customerId}`);
      const statsRes = await axios.get(`YOUR_BACKEND_URL/api/requirements/stats?customerId=${customerId}`);
      
      if (res.data.success) setSentRequirements(res.data.requirements);
      if (statsRes.data.success) {
        setStats({
          total: statsRes.data.stats.total,
          received: statsRes.data.stats.completed + statsRes.data.stats.in_progress,
          pending: statsRes.data.stats.new
        });
      }
    } catch (error) { console.error(error); } finally { setHistoryLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const addItem = () => setItems([...items, { id: Date.now(), itemName: '', quantity: '', unit: 'units', notes: '', deliveryDate: '' }]);
  const removeItem = (id: number) => items.length > 1 && setItems(items.filter(item => item.id !== id));
  const updateItem = (id: number, field: keyof RequirementItem, value: string) => setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('requirements', JSON.stringify(items));
      formData.append('customerId', getCustomerId());
      uploadedFiles.forEach(f => formData.append('attachedDocument', f));
      await axios.post('YOUR_BACKEND_URL/api/requirements', formData);
      setShowSuccessModal(true);
      setItems([{ id: 1, itemName: '', quantity: '', unit: 'units', notes: '', deliveryDate: '' }]);
      setUploadedFiles([]);
      fetchData();
    } catch (error) { alert("Failed to submit."); } finally { setLoading(false); }
  };

  return (
    <CustomerLayout>
      <div className="space-y-8 pb-10">
        
        {/* --- PREMIUM HEADER --- */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-10 text-white shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-blue-500/30">
                  Customer Portal v2.0
                </span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight">Requirement <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Intelligence</span></h1>
              <p className="mt-2 text-slate-400 max-w-md">Streamline your procurement process by sending detailed requirements directly to our administration.</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-[100px]">
                <p className="text-xs text-slate-500 uppercase font-bold">Health Score</p>
                <p className="text-xl font-bold text-green-400">98%</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- PREMIUM STATS BOXES --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group relative overflow-hidden rounded-3xl bg-white p-1 shadow-sm transition-all hover:shadow-xl border border-slate-100">
            <div className="flex items-center p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <Send className="h-6 w-6" />
              </div>
              <div className="ml-5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Sent</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-slate-900">{stats.total}</h3>
                  <span className="text-[10px] text-slate-400">Requests</span>
                </div>
              </div>
              <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-slate-200 group-hover:text-blue-400" />
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl bg-white p-1 shadow-sm transition-all hover:shadow-xl border border-slate-100">
            <div className="flex items-center p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="ml-5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Quoted</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-slate-900">{stats.received}</h3>
                  <span className="text-[10px] text-slate-400">Responses</span>
                </div>
              </div>
              <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-slate-200 group-hover:text-emerald-400" />
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl bg-white p-1 shadow-sm transition-all hover:shadow-xl border border-slate-100">
            <div className="flex items-center p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                <Hourglass className="h-6 w-6" />
              </div>
              <div className="ml-5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Pending</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-slate-900">{stats.pending}</h3>
                  <span className="text-[10px] text-slate-400">In Review</span>
                </div>
              </div>
              <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-slate-200 group-hover:text-amber-400" />
            </div>
          </div>
        </div>

        {/* --- MAIN FORM --- */}
        <Card className="rounded-[30px] border-none bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Plus className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Draft New Request</h2>
            </div>
            <Button onClick={addItem} variant="outline" className="rounded-xl border-slate-200 hover:bg-white hover:text-blue-600 transition-all">
              Add New Line Item
            </Button>
          </div>
          <CardContent className="p-8">
            <div className="space-y-6">
              {items.map((item, index) => (
                <div key={item.id} className="group relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1">
                      <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Product Selection</Label>
                      <Select value={item.itemName} onValueChange={(v) => updateItem(item.id, 'itemName', v)}>
                        <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50/50">
                          <SelectValue placeholder="Select Product" />
                        </SelectTrigger>
                        <SelectContent>
                          {stockItems.map(si => <SelectItem key={si} value={si}>{si}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Total Quantity</Label>
                      <Input type="number" className="rounded-xl border-slate-100 bg-slate-50/50" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Delivery Deadline</Label>
                      <Input type="date" className="rounded-xl border-slate-100 bg-slate-50/50" value={item.deliveryDate} onChange={(e) => updateItem(item.id, 'deliveryDate', e.target.value)} />
                    </div>
                    <div className="flex items-end justify-between gap-4">
                      <div className="flex-1">
                        <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Specifications</Label>
                        <Input className="rounded-xl border-slate-100 bg-slate-50/50" value={item.notes} onChange={(e) => updateItem(item.id, 'notes', e.target.value)} />
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-500" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col md:flex-row items-center justify-between p-8 rounded-3xl bg-blue-600 text-white shadow-2xl shadow-blue-300">
               <div className="mb-6 md:mb-0">
                 <h4 className="text-xl font-bold">Ready to dispatch?</h4>
                 <p className="text-blue-100 text-sm opacity-80">Double-check your quantities before submission.</p>
               </div>
               <Button onClick={handleSubmit} disabled={loading} className="w-full md:w-auto px-12 py-7 rounded-2xl bg-white text-blue-600 font-bold hover:bg-blue-50 transition-all shadow-xl">
                 {loading ? <Loader2 className="animate-spin" /> : <><Send className="h-5 w-5 mr-3" /> Dispatch Requirement</>}
               </Button>
            </div>
          </CardContent>
        </Card>

        {/* --- PREMIUM TABLE --- */}
        <Card className="rounded-[30px] border-none bg-white shadow-xl overflow-hidden">
          <div className="bg-slate-900 px-8 py-5 flex items-center justify-between">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              Activity Log
            </h3>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Live Updates</span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="py-5 pl-8 text-[10px] font-black uppercase text-slate-400">Reference ID</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400">Timestamp</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400">Current Status</TableHead>
                  <TableHead className="text-right pr-8 text-[10px] font-black uppercase text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-blue-600" /></TableCell></TableRow>
                ) : sentRequirements.map((req) => (
                  <TableRow key={req.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell className="py-5 pl-8">
                      <span className="font-bold text-slate-900">{req.requirementId}</span>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        req.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${req.status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                        {req.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* --- SUCCESS DIALOG --- */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-[400px] rounded-[40px] p-10 text-center border-none shadow-2xl">
          <div className="mx-auto h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-12 w-12 text-emerald-600" />
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900 mb-2">Request Dispatched!</DialogTitle>
          <p className="text-slate-500 text-sm mb-8">Your procurement request has been successfully logged. Our team will verify and provide a quote shortly.</p>
          <Button className="w-full py-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold" onClick={() => setShowSuccessModal(false)}>
            Return to Dashboard
          </Button>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
}