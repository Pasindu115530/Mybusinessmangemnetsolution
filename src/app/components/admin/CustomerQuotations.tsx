import { useState } from 'react';
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
  Calendar,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Quotation {
  id: string;
  customer: string;
  items: number;
  totalAmount: number;
  expiryDate: string;
  status: 'pending' | 'accepted' | 'rejected';
  date: string;
}

const quotations: Quotation[] = [
  { id: 'QT-001', customer: 'Acme Corp', items: 3, totalAmount: 15000, expiryDate: '2024-02-15', status: 'pending', date: '2024-01-15' },
  { id: 'QT-002', customer: 'XYZ Industries', items: 5, totalAmount: 22000, expiryDate: '2024-02-20', status: 'accepted', date: '2024-01-14' },
  { id: 'QT-003', customer: 'Tech Solutions', items: 2, totalAmount: 8500, expiryDate: '2024-02-10', status: 'rejected', date: '2024-01-13' },
  { id: 'QT-004', customer: 'Global Enterprises', items: 4, totalAmount: 20100, expiryDate: '2024-02-25', status: 'accepted', date: '2024-01-12' },
];

const chartData = [
  { month: 'Jan', approved: 12, rejected: 3 },
  { month: 'Feb', approved: 15, rejected: 2 },
  { month: 'Mar', approved: 18, rejected: 4 },
  { month: 'Apr', approved: 20, rejected: 3 },
  { month: 'May', approved: 22, rejected: 2 },
  { month: 'Jun', approved: 25, rejected: 5 },
];

export function CustomerQuotations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredQuotations = quotations.filter(quot => {
    const matchesSearch = quot.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          quot.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quot.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 text-white shadow-modern-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Send className="w-5 h-5" />
              <span className="text-blue-100">Customer Management</span>
            </div>
            <h1 className="text-3xl mb-2">Customer Quotations</h1>
            <p className="text-blue-100">Manage and track customer quotation status</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Quotations', count: quotations.length, color: 'blue', icon: Send },
            { label: 'Pending', count: quotations.filter(q => q.status === 'pending').length, color: 'yellow', icon: Clock },
            { label: 'Accepted', count: quotations.filter(q => q.status === 'accepted').length, color: 'green', icon: CheckCircle },
            { label: 'Rejected', count: quotations.filter(q => q.status === 'rejected').length, color: 'red', icon: XCircle },
          ].map((stat) => (
            <Card key={stat.label} className="modern-card border-0 shadow-modern-lg overflow-hidden">
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
                <h3 className="text-sm text-slate-600 mb-1">{stat.label}</h3>
                <p className="text-2xl text-slate-900">{stat.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Approved vs Rejected (Monthly)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
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
          </CardContent>
        </Card>

        {/* Quotations Table */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" />
                All Quotations
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search quotations..."
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
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead>Quotation ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations.map((quot) => (
                    <TableRow key={quot.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="text-slate-900">{quot.id}</TableCell>
                      <TableCell className="text-slate-900">{quot.customer}</TableCell>
                      <TableCell className="text-slate-600">{quot.items} items</TableCell>
                      <TableCell className="text-slate-900">${quot.totalAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-slate-600">{quot.expiryDate}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(quot.status)}>
                          {quot.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => {
                              setSelectedQuotation(quot);
                              setShowDetailsModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {quot.status === 'pending' && (
                            <>
                              <Button variant="outline" size="sm" className="hover:bg-green-50 hover:text-green-600">
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="hover:bg-red-50 hover:text-red-600">
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="border-0 shadow-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quotation Details</DialogTitle>
          </DialogHeader>
          {selectedQuotation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl">
                <div>
                  <p className="text-sm text-slate-600">Quotation ID</p>
                  <p className="text-slate-900">{selectedQuotation.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Customer</p>
                  <p className="text-slate-900">{selectedQuotation.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Amount</p>
                  <p className="text-slate-900">${selectedQuotation.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <Badge className={getStatusColor(selectedQuotation.status)}>
                    {selectedQuotation.status}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
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
