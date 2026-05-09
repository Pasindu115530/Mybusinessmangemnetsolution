import { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { toast } from 'sonner';
import {
  Truck,
  Package,
  CheckCircle,
  Clock,
  Search,
  Eye,
  UserPlus,
  RefreshCw,
  Loader2,
  Building2,
  Mail,
  Phone,
  BarChart3
} from 'lucide-react';

interface Supplier {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  status: string;
  companyName?: string;
  address?: string;
}

export function SupplierManagement() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('http://localhost:5900/api/suppliers/all', {
        headers: getAuthHeader()
      });
      setSuppliers(res.data.suppliers || []);
    } catch (err: any) {
      toast.error('Failed to load suppliers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredSuppliers = suppliers.filter(s => 
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-white shadow-modern-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-5 h-5 text-blue-400" />
              <span className="text-slate-400 uppercase tracking-widest text-[10px] font-black">Vendor Ecosystem</span>
            </div>
            <h1 className="text-3xl mb-2 font-black">Supplier Directory</h1>
            <p className="text-slate-400 max-w-lg">Manage your network of verified suppliers, track their performance, and maintain contact details</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Registered', value: suppliers.length, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active Partners', value: suppliers.length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Pending Verification', value: 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Performance Avg', value: '4.8/5', icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((stat, i) => (
            <Card key={i} className="modern-card border-0 shadow-modern-lg overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <CardContent className="pt-6 relative">
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</h3>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Suppliers Table */}
        <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
          <CardHeader className="bg-slate-50/80 border-b border-slate-100 flex flex-row items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-600" />
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600">Supplier Ledger</CardTitle>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 border-slate-200 rounded-xl"
                />
              </div>
              <Button variant="outline" size="sm" onClick={fetchSuppliers} className="h-10 w-10 p-0 rounded-xl">
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-10 px-6">
                <UserPlus className="w-4 h-4 mr-2" /> Add Supplier
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-0">
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-6">Company & Lead</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Contact Channels</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Address</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></TableCell></TableRow>
                  ) : filteredSuppliers.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-20 text-slate-400 italic">No suppliers found in registry.</TableCell></TableRow>
                  ) : (
                    filteredSuppliers.map((supplier) => (
                      <TableRow key={supplier.id} className="hover:bg-slate-50/50 transition-colors border-b last:border-0 group">
                        <TableCell className="pl-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900">{supplier.fullName}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{supplier.companyName || 'Verified Independent'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                              <Mail className="w-3 h-3 text-blue-500" /> {supplier.email}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                              <Phone className="w-3 h-3 text-blue-500" /> {supplier.contactNumber}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-xs text-slate-500 max-w-[200px] truncate">{supplier.address || '—'}</TableCell>
                        <TableCell className="py-4 text-center">
                          <Badge className="bg-green-100 text-green-700 border-green-200 border capitalize px-3 h-6 text-[10px] font-bold">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-right pr-6">
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg border-slate-200 hover:bg-blue-50 hover:text-blue-600">
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
    </AdminLayout>
  );
}
