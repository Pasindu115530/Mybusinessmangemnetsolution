import { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { FileText, Send, Loader2, ClipboardList, Clock, CheckCircle2, ArrowUpRight } from 'lucide-react';

const API = 'http://localhost:5900/api/requirements';

const STATUS_STYLES: Record<string, string> = {
  pending:     'bg-amber-50 text-amber-700 border border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border border-blue-200',
  completed:   'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected:    'bg-red-50 text-red-700 border border-red-200',
};

export function CustomerRequests() {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [stats, setStats]               = useState({ total: 0, pending: 0, in_progress: 0, completed: 0 });
  const [activeTab, setActiveTab]       = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [updating, setUpdating]         = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [reqRes, statsRes] = await Promise.all([
        axios.get(API),
        axios.get(`${API}/stats`),
      ]);
      if (reqRes.data.success)   setRequirements(reqRes.data.requirements);
      if (statsRes.data.success) {
        const s = statsRes.data.stats;
        setStats({ total: s.total, pending: s.pending, in_progress: s.in_progress, completed: s.completed });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await axios.patch(`${API}/${id}/status`, { status });
      await fetchAll();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(null);
    }
  };

  const filtered = activeTab === 'all' ? requirements : requirements.filter(r => r.status === activeTab);

  const statCards = [
    {
      label: 'Total Received',
      value: stats.total,
      icon: <ClipboardList className="h-6 w-6" />,
      color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
      accent: 'group-hover:text-blue-400',
    },
    {
      label: 'In Progress',
      value: stats.in_progress,
      icon: <Send className="h-6 w-6" />,
      color: 'bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white',
      accent: 'group-hover:text-violet-400',
    },
    {
      label: 'Pending Review',
      value: stats.pending,
      icon: <Clock className="h-6 w-6" />,
      color: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
      accent: 'group-hover:text-amber-400',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: <CheckCircle2 className="h-6 w-6" />,
      color: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
      accent: 'group-hover:text-emerald-400',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 pb-10">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-10 text-white shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative z-10">
            <span className="bg-violet-500/20 text-violet-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-violet-500/30 mb-3 inline-block">
              Admin Portal
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight">
              Customer <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">Requests</span>
            </h1>
            <p className="mt-2 text-slate-400 max-w-md">
              Manage all incoming customer requirements and update their processing status in real time.
            </p>
          </div>
        </div>

        {/* ── Stat Cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {statCards.map((s) => (
            <div key={s.label} className="group relative overflow-hidden rounded-3xl bg-white p-1 shadow-sm transition-all hover:shadow-xl border border-slate-100">
              <div className="flex items-center p-5">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-colors ${s.color}`}>
                  {s.icon}
                </div>
                <div className="ml-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
                  <h3 className="text-3xl font-black text-slate-900">{s.value}</h3>
                </div>
                <ArrowUpRight className={`absolute top-4 right-4 h-4 w-4 text-slate-200 transition-colors ${s.accent}`} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter Tabs ────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'in_progress', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
              }`}
            >
              {tab === 'in_progress' ? 'In Progress' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Table Card ─────────────────────────────────────────────── */}
        <Card className="rounded-[30px] border-none bg-white shadow-xl overflow-hidden">
          <div className="bg-slate-900 px-8 py-5 flex items-center justify-between">
            <h3 className="text-white font-bold flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-violet-400" />
              Requirement Log
            </h3>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Live Data</span>
          </div>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="py-5 pl-8 text-[10px] font-black uppercase text-slate-400">Req ID</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400">Customer ID</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400">Items</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400">Date</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400">Status</TableHead>
                    <TableHead className="text-right pr-8 text-[10px] font-black uppercase text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-20">
                        <Loader2 className="animate-spin mx-auto text-violet-600 h-8 w-8" />
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-20 text-slate-400 text-sm">
                        No requirements found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((req) => (
                      <TableRow key={req._id} className="group hover:bg-slate-50/50 transition-colors">
                        <TableCell className="py-5 pl-8 font-bold text-slate-900">{req.requirementId}</TableCell>
                        <TableCell className="text-slate-500 text-sm font-mono">{req.customerId?.slice(-8) ?? '—'}</TableCell>
                        <TableCell className="text-slate-700 text-sm max-w-[200px] truncate">
                          {req.requirements?.map((i: any) => i.itemName).filter(Boolean).join(', ') || '—'}
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[req.status] ?? ''}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${req.status === 'pending' ? 'bg-amber-500 animate-pulse' : req.status === 'in_progress' ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`} />
                            {req.status === 'in_progress' ? 'In Progress' : req.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-8">
                          <div className="flex justify-end gap-2">

                            {/* View Dialog */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="rounded-xl text-slate-500 hover:text-violet-600 hover:border-violet-300">
                                  <FileText className="w-4 h-4 mr-1" /> View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[500px] rounded-2xl">
                                <DialogHeader>
                                  <DialogTitle className="text-slate-900">Requirement — {req.requirementId}</DialogTitle>
                                </DialogHeader>
                                <div className="mt-4 space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                  {req.requirements?.map((item: any, idx: number) => (
                                    <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                      <p className="font-semibold text-slate-800">{item.itemName || '—'}</p>
                                      <div className="mt-1 grid grid-cols-2 gap-1 text-sm text-slate-500">
                                        <span>Qty: <strong>{item.quantity} {item.unit}</strong></span>
                                        {item.deliveryDate && <span>Delivery: <strong>{item.deliveryDate}</strong></span>}
                                        {item.notes && <span className="col-span-2">Notes: {item.notes}</span>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* Status update */}
                            {req.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={updating === req._id}
                                onClick={() => handleStatusChange(req._id, 'in_progress')}
                                className="rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                {updating === req._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="w-4 h-4 mr-1" /> Process</>}
                              </Button>
                            )}
                            {req.status === 'in_progress' && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={updating === req._id}
                                onClick={() => handleStatusChange(req._id, 'completed')}
                                className="rounded-xl text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                              >
                                {updating === req._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-1" /> Complete</>}
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
    </AdminLayout>
  );
}
