import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { FileText, FilePlus, Send, Loader2, XCircle, ClipboardList, Clock, CheckCircle2, ArrowUpRight } from 'lucide-react';

const API = 'http://localhost:5900/api/requirements';

const STATUS_STYLES: Record<string, string> = {
  pending:     'bg-amber-50 text-amber-700 border-amber-200',
  quoted:      'bg-indigo-50 text-indigo-700 border-indigo-200',
  accepted:    'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  delivered:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected:    'bg-red-50 text-red-700 border-red-200',
};

export function CustomerRequests() {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, completed: 0 });
  const [activeTab, setActiveTab] = useState('all');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [reqRes, statsRes] = await Promise.all([
        axios.get(API),
        axios.get(`${API}/stats`),
      ]);
      if (reqRes.data.success) setRequirements(reqRes.data.requirements);
      if (statsRes.data.success) setStats(statsRes.data.stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) { alert('Please enter a rejection reason.'); return; }
    setRejecting(true);
    try {
      await axios.patch(`${API}/${id}/status`, { status: 'rejected', rejectReason });
      setRejectingId(null);
      setRejectReason('');
      await fetchAll();
    } catch (e) {
      console.error(e);
      alert('Failed to reject requirement.');
    } finally {
      setRejecting(false);
    }
  };


  const filtered = activeTab === 'all' ? requirements : requirements.filter(r => r.status === activeTab);

  // --- Stats Boxes සඳහා Data ---
  const statCards = [
    { label: 'Total Received', value: stats.total, icon: <ClipboardList className="h-6 w-6" />, color: 'bg-blue-50 text-blue-600' },
    { label: 'In Progress', value: stats.in_progress, icon: <Send className="h-6 w-6" />, color: 'bg-violet-50 text-violet-600' },
    { label: 'Pending Review', value: stats.pending, icon: <Clock className="h-6 w-6" />, color: 'bg-amber-50 text-amber-600' },
    { label: 'Completed', value: stats.completed, icon: <CheckCircle2 className="h-6 w-6" />, color: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 pb-10">
        
        {/* 1. Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-10 text-white shadow-2xl">
          <div className="relative z-10">
            <span className="bg-violet-500/20 text-violet-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-violet-500/30 mb-3 inline-block">Admin Portal</span>
            <h1 className="text-4xl font-extrabold tracking-tight">Customer <span className="text-violet-400">Requests</span></h1>
            <p className="mt-2 text-slate-400 max-w-md">Manage and process all customer requirements in real-time.</p>
          </div>
        </div>

        {/* 2. Stats Boxes Section (දැන් මෙය නැවත ඇතුළත් කර ඇත) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {statCards.map((s) => (
            <div key={s.label} className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${s.color}`}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
                  <h3 className="text-3xl font-black text-slate-900">{s.value}</h3>
                </div>
              </div>
              <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-slate-200" />
            </div>
          ))}
        </div>

        {/* 3. Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'quoted', 'delivered'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-all ${
                activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 4. Table Card */}
        <Card className="rounded-[30px] border-none bg-white shadow-xl overflow-hidden">
          <div className="bg-slate-900 px-8 py-5 flex items-center justify-between">
            <h3 className="text-white font-bold flex items-center gap-2"><ClipboardList className="h-5 w-5 text-violet-400" /> Requirement Log</h3>
          </div>

          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="py-5 pl-8 text-[10px] font-black uppercase text-slate-400">Req ID</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-400">Customer</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-400">Items Summary</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-400">Status</TableHead>
                <TableHead className="text-right pr-8 text-[10px] font-black uppercase text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-violet-600 h-8 w-8" /></TableCell></TableRow>
              ) : filtered.map((req) => (
                <TableRow key={req.id} className="group hover:bg-slate-50/50 transition-colors">
                  <TableCell className="py-5 pl-8 font-bold text-slate-900">{req.requirementId}</TableCell>
                  <TableCell>
                    <div className="text-sm font-bold text-slate-700">{req.customerName}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-tighter">{req.companyName}</div>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm max-w-[200px] truncate">{req.itemSummary}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${STATUS_STYLES[req.status] || ''} px-3 py-1 rounded-lg capitalize border`}>
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex justify-end gap-2">
                      
                      {/* Detailed View Dialog */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="rounded-xl border-slate-200 text-slate-500 hover:text-violet-600">
                            <FileText className="w-4 h-4 mr-1" /> View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] rounded-[30px] p-0 overflow-hidden border-none shadow-2xl">
                          <div className="bg-slate-900 p-8 text-white">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-black">Requirement — {req.requirementId}</DialogTitle>
                              <p className="text-slate-400 text-xs">Submitted on {new Date(req.createdAt).toLocaleDateString()}</p>
                            </DialogHeader>
                          </div>
                          
                          <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                               <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Customer</p>
                                  <p className="text-sm font-bold text-slate-800">{req.customerName}</p>
                               </div>
                               <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Status</p>
                                  <Badge className={STATUS_STYLES[req.status]}>{req.status.toUpperCase()}</Badge>
                               </div>
                            </div>

                            <div className="rounded-2xl border border-slate-100 overflow-hidden">
                              <Table>
                                <TableHeader className="bg-slate-50">
                                  <TableRow>
                                    <TableHead className="text-[10px] uppercase font-bold px-4">Item</TableHead>
                                    <TableHead className="text-center text-[10px] uppercase font-bold">Qty</TableHead>
                                    <TableHead className="text-right text-[10px] uppercase font-bold px-4">Delivery</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {/* Backend එකෙන් එවන Full Items Array එක Map කිරීම */}
                                  {req.items && req.items.length > 0 ? req.items.map((item: any, i: number) => (
                                    <TableRow key={i}>
                                      <TableCell className="py-4 px-4">
                                        <p className="text-sm font-bold text-slate-800">{item.itemName}</p>
                                        {item.notes && <p className="text-[10px] text-slate-400 italic mt-1">{item.notes}</p>}
                                      </TableCell>
                                      <TableCell className="text-center text-sm font-black text-slate-700">
                                        {item.quantity} <span className="text-[10px] font-medium text-slate-400 uppercase">{item.unit}</span>
                                      </TableCell>
                                      <TableCell className="text-right text-xs text-slate-500 px-4">
                                        {item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString() : 'Immediate'}
                                      </TableCell>
                                    </TableRow>
                                  )) : (
                                    <TableRow><TableCell colSpan={3} className="text-center py-10 text-slate-400">No items found</TableCell></TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </div>

                            {/* Reject Section */}
                            {req.status !== 'rejected' && (
                              <div className="rounded-2xl border-2 border-dashed border-red-200 bg-red-50/50 p-5 space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-1">
                                  <XCircle className="h-3.5 w-3.5" /> Reject This Requirement
                                </p>
                                {rejectingId === req.id ? (
                                  <>
                                    <Textarea
                                      value={rejectReason}
                                      onChange={(e) => setRejectReason(e.target.value)}
                                      placeholder="Enter reason for rejection (visible to customer)..."
                                      className="min-h-20 text-sm border-red-200 focus:border-red-400 focus:ring-red-100 resize-none bg-white"
                                    />
                                    <div className="flex gap-2 justify-end">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => { setRejectingId(null); setRejectReason(''); }}
                                        className="rounded-xl border-slate-200 text-slate-500"
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        disabled={rejecting}
                                        onClick={() => handleReject(req.id)}
                                        className="rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200"
                                      >
                                        {rejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><XCircle className="h-4 w-4 mr-1" /> Confirm Reject</>}
                                      </Button>
                                    </div>
                                  </>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setRejectingId(req.id)}
                                    className="rounded-xl border-red-300 text-red-600 hover:bg-red-100 w-full"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" /> Reject Requirement
                                  </Button>
                                )}
                              </div>
                            )}

                            {/* Already rejected notice */}
                            {req.status === 'rejected' && (
                              <div className="rounded-2xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                                <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-black text-red-600 uppercase tracking-widest">Rejected</p>
                                  <p className="text-sm text-red-700 mt-1">{req.rejectReason || 'No reason provided.'}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Create Quotation Button */}
                      <Button
                        size="sm"
                        onClick={() => navigate('/create-quotation', { state: { requirement: req } })}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-200"
                      >
                        <FilePlus className="h-4 w-4 mr-1" /> Create Quotation
                      </Button>


                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AdminLayout>
  );
}