import { useState } from 'react';
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
import {
  DollarSign,
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  Receipt,
  Calendar,
  Filter,
  Download,
  Eye,
  Edit,
  CheckCircle,
  X,
  Upload,
  FileText,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface Transaction {
  id: string;
  date: string;
  type: 'expense' | 'supplier' | 'customer';
  category: string;
  relatedEntity: string;
  amount: number;
  paymentMethod: 'cash' | 'bank' | 'online';
  status: 'pending' | 'completed' | 'failed';
}

const transactions: Transaction[] = [
  { id: 'TXN-001', date: '2024-01-15', type: 'customer', category: 'Service', relatedEntity: 'Acme Corp', amount: 15000, paymentMethod: 'bank', status: 'completed' },
  { id: 'TXN-002', date: '2024-01-14', type: 'supplier', category: 'Stock Purchase', relatedEntity: 'Tech Supplies Inc', amount: 8500, paymentMethod: 'online', status: 'completed' },
  { id: 'TXN-003', date: '2024-01-14', type: 'expense', category: 'Salary', relatedEntity: 'Monthly Salaries', amount: 25000, paymentMethod: 'bank', status: 'completed' },
  { id: 'TXN-004', date: '2024-01-13', type: 'customer', category: 'Product Sale', relatedEntity: 'XYZ Industries', amount: 22000, paymentMethod: 'online', status: 'completed' },
  { id: 'TXN-005', date: '2024-01-13', type: 'expense', category: 'Utilities', relatedEntity: 'Electricity Bill', amount: 1200, paymentMethod: 'online', status: 'completed' },
  { id: 'TXN-006', date: '2024-01-12', type: 'supplier', category: 'Stock Purchase', relatedEntity: 'Global Trade Partners', amount: 12000, paymentMethod: 'bank', status: 'pending' },
  { id: 'TXN-007', date: '2024-01-12', type: 'customer', category: 'Service', relatedEntity: 'Tech Solutions', amount: 8500, paymentMethod: 'bank', status: 'completed' },
  { id: 'TXN-008', date: '2024-01-11', type: 'expense', category: 'Rent', relatedEntity: 'Office Rent - January', amount: 5000, paymentMethod: 'bank', status: 'completed' },
];

const stackedData = [
  { month: 'Jan', expenses: 31200, suppliers: 20500, customers: 45500 },
  { month: 'Feb', expenses: 28900, suppliers: 18200, customers: 52000 },
  { month: 'Mar', expenses: 35000, suppliers: 22000, customers: 48000 },
  { month: 'Apr', expenses: 29500, suppliers: 19800, customers: 55000 },
  { month: 'May', expenses: 32000, suppliers: 21000, customers: 60000 },
  { month: 'Jun', expenses: 30000, suppliers: 20000, customers: 58000 },
];

const lineData = [
  { month: 'Jan', income: 45500, expenses: 51700 },
  { month: 'Feb', income: 52000, expenses: 47100 },
  { month: 'Mar', income: 48000, expenses: 57000 },
  { month: 'Apr', income: 55000, expenses: 49300 },
  { month: 'May', income: 60000, expenses: 53000 },
  { month: 'Jun', income: 58000, expenses: 50000 },
];

const pieData = [
  { name: 'Salaries', value: 25000, color: '#8b5cf6' },
  { name: 'Utilities', value: 1200, color: '#06b6d4' },
  { name: 'Rent', value: 5000, color: '#10b981' },
  { name: 'Stock Purchase', value: 20500, color: '#f59e0b' },
  { name: 'Other', value: 3000, color: '#ef4444' },
];

export function PaymentsTransactions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    paymentType: 'expense',
    relatedEntity: '',
    amount: '',
    paymentMethod: 'bank',
    date: new Date().toISOString().split('T')[0],
    category: '',
    notes: '',
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Calculate summary stats
  const totalExpenses = transactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSupplierPayments = transactions
    .filter(t => t.type === 'supplier' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCustomerIncome = transactions
    .filter(t => t.type === 'customer' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalCustomerIncome - totalExpenses - totalSupplierPayments;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    setShowAddModal(false);
    setShowSuccessModal(true);
    // Reset form
    setFormData({
      paymentType: 'expense',
      relatedEntity: '',
      amount: '',
      paymentMethod: 'bank',
      date: new Date().toISOString().split('T')[0],
      category: '',
      notes: '',
    });
    setUploadedFile(null);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'customer':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'supplier':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'expense':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          txn.relatedEntity.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || txn.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || txn.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb and Header */}
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
            <span>Admin</span>
            <span>/</span>
            <span>Finance</span>
            <span>/</span>
            <span className="text-emerald-600">Payments & Transactions</span>
          </div>
          
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 p-8 text-white shadow-modern-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5" />
                    <span className="text-emerald-100">Finance Management</span>
                  </div>
                  <h1 className="text-3xl mb-2">Payments & Transactions</h1>
                  <p className="text-emerald-100">Track and manage all payments, expenses, and income</p>
                </div>
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Expenses */}
          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-red-600" />
                </div>
                <Badge className="bg-red-50 text-red-700 border-red-200">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5.2%
                </Badge>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Total Expenses</h3>
              <p className="text-2xl text-slate-900">${totalExpenses.toLocaleString()}</p>
            </CardContent>
          </Card>

          {/* Supplier Payments */}
          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  -2.1%
                </Badge>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Supplier Payments</h3>
              <p className="text-2xl text-slate-900">${totalSupplierPayments.toLocaleString()}</p>
            </CardContent>
          </Card>

          {/* Customer Income */}
          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <Badge className="bg-green-50 text-green-700 border-green-200">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8.5%
                </Badge>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Customer Income</h3>
              <p className="text-2xl text-slate-900">${totalCustomerIncome.toLocaleString()}</p>
            </CardContent>
          </Card>

          {/* Net Balance */}
          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-emerald-600" />
                </div>
                <Badge className={netBalance >= 0 ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
                  {netBalance >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                  {netBalance >= 0 ? '+' : ''}{((netBalance / totalCustomerIncome) * 100).toFixed(1)}%
                </Badge>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Net Balance</h3>
              <p className={`text-2xl ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(netBalance).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Section 2: Transactions Table */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Payment Logs & Transactions
              </CardTitle>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64 border-slate-200"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40 border-slate-200">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="supplier">Supplier</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 border-slate-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
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
                    <TableHead>Date</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Payment Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Related Entity</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((txn) => (
                    <TableRow key={txn.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="text-slate-600">{txn.date}</TableCell>
                      <TableCell className="text-slate-900">{txn.id}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(txn.type)}>
                          {txn.type === 'customer' && <ArrowUpRight className="w-3 h-3 mr-1" />}
                          {txn.type === 'supplier' && <ArrowDownRight className="w-3 h-3 mr-1" />}
                          {txn.type === 'expense' && <Receipt className="w-3 h-3 mr-1" />}
                          {txn.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-900">{txn.category}</TableCell>
                      <TableCell className="text-slate-900">{txn.relatedEntity}</TableCell>
                      <TableCell className={txn.type === 'customer' ? 'text-green-600' : 'text-red-600'}>
                        {txn.type === 'customer' ? '+' : '-'}${txn.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-slate-700">
                          {txn.paymentMethod === 'bank' && <Building2 className="w-4 h-4" />}
                          {txn.paymentMethod === 'cash' && <Wallet className="w-4 h-4" />}
                          {txn.paymentMethod === 'online' && <CreditCard className="w-4 h-4" />}
                          <span className="capitalize">{txn.paymentMethod}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(txn.status)}>
                          {txn.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {txn.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="hover:bg-emerald-50 hover:text-emerald-600">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:text-blue-600">
                            <Edit className="w-4 h-4" />
                          </Button>
                          {txn.status === 'pending' && (
                            <Button variant="outline" size="sm" className="hover:bg-green-50 hover:text-green-600">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-600">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Financial Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stacked Bar Chart */}
          <Card className="modern-card border-0 shadow-modern-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  Payment Distribution
                </CardTitle>
                <Select defaultValue="6months">
                  <SelectTrigger className="w-32 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6months">6 Months</SelectItem>
                    <SelectItem value="quarter">Quarter</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stackedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="expenses" stackId="a" fill="#ef4444" name="Expenses" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="suppliers" stackId="a" fill="#8b5cf6" name="Suppliers" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="customers" stackId="a" fill="#10b981" name="Customers" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Expense Breakdown Pie Chart */}
          <Card className="modern-card border-0 shadow-modern-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-emerald-600" />
                  Expense Breakdown
                </CardTitle>
                <Select defaultValue="month">
                  <SelectTrigger className="w-32 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">Quarter</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Income vs Expenses Line Chart - Full Width */}
          <Card className="modern-card border-0 shadow-modern-lg lg:col-span-2">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  Income vs Expenses Trend
                </CardTitle>
                <Select defaultValue="6months">
                  <SelectTrigger className="w-32 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6months">6 Months</SelectItem>
                    <SelectItem value="quarter">Quarter</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Income"
                    dot={{ fill: '#10b981', r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    name="Expenses"
                    dot={{ fill: '#ef4444', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Section 5: Reports & Export */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-600" />
              Reports & Export
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">Generate and export financial reports</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>Date Range</Label>
                <Select defaultValue="month">
                  <SelectTrigger className="mt-1 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Type</Label>
                <Select defaultValue="all">
                  <SelectTrigger className="mt-1 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="expense">Expenses Only</SelectItem>
                    <SelectItem value="supplier">Supplier Only</SelectItem>
                    <SelectItem value="customer">Customer Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select defaultValue="all">
                  <SelectTrigger className="mt-1 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Export Format</Label>
                <Select defaultValue="pdf">
                  <SelectTrigger className="mt-1 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                    <SelectItem value="csv">CSV Data</SelectItem>
                    <SelectItem value="excel">Excel File</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" className="border-slate-300">
                <FileText className="w-4 h-4 mr-2" />
                Preview Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 3: Add New Payment Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="border-0 shadow-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              Add New Payment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Payment Type *</Label>
                <Select 
                  value={formData.paymentType} 
                  onValueChange={(value) => setFormData({ ...formData, paymentType: value })}
                >
                  <SelectTrigger className="mt-1 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="supplier">Supplier Payment</SelectItem>
                    <SelectItem value="customer">Customer Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="mt-1 border-slate-200">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.paymentType === 'expense' && (
                      <>
                        <SelectItem value="salary">Salary</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </>
                    )}
                    {formData.paymentType === 'supplier' && (
                      <>
                        <SelectItem value="stock-purchase">Stock Purchase</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="raw-materials">Raw Materials</SelectItem>
                      </>
                    )}
                    {formData.paymentType === 'customer' && (
                      <>
                        <SelectItem value="product-sale">Product Sale</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="subscription">Subscription</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Related Entity *</Label>
              {formData.paymentType === 'expense' ? (
                <Input
                  placeholder="Enter expense title"
                  value={formData.relatedEntity}
                  onChange={(e) => setFormData({ ...formData, relatedEntity: e.target.value })}
                  className="mt-1 border-slate-200"
                />
              ) : (
                <Select 
                  value={formData.relatedEntity} 
                  onValueChange={(value) => setFormData({ ...formData, relatedEntity: value })}
                >
                  <SelectTrigger className="mt-1 border-slate-200">
                    <SelectValue placeholder={`Select ${formData.paymentType}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.paymentType === 'supplier' && (
                      <>
                        <SelectItem value="tech-supplies">Tech Supplies Inc</SelectItem>
                        <SelectItem value="global-trade">Global Trade Partners</SelectItem>
                        <SelectItem value="premium-materials">Premium Materials Co</SelectItem>
                      </>
                    )}
                    {formData.paymentType === 'customer' && (
                      <>
                        <SelectItem value="acme-corp">Acme Corp</SelectItem>
                        <SelectItem value="xyz-industries">XYZ Industries</SelectItem>
                        <SelectItem value="tech-solutions">Tech Solutions</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Amount *</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="mt-1 border-slate-200"
                />
              </div>
              <div>
                <Label>Payment Method *</Label>
                <Select 
                  value={formData.paymentMethod} 
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                >
                  <SelectTrigger className="mt-1 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="online">Online Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Payment Date *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-1 border-slate-200"
              />
            </div>

            <div>
              <Label>Notes / Description</Label>
              <Textarea
                placeholder="Add any additional notes or description..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1 border-slate-200"
                rows={3}
              />
            </div>

            <div>
              <Label>Upload Receipt / Proof (Optional)</Label>
              <div className="mt-2 border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-emerald-400 hover:bg-emerald-50/50 transition-all">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 mb-2">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-500 mb-3">PDF, PNG, JPG (Max 5MB)</p>
                <input
                  type="file"
                  id="receipt-upload"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                />
                <label htmlFor="receipt-upload">
                  <Button type="button" variant="outline" size="sm" className="cursor-pointer" onClick={() => document.getElementById('receipt-upload')?.click()}>
                    Choose File
                  </Button>
                </label>
                {uploadedFile && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-sm text-emerald-700">
                    <CheckCircle className="w-4 h-4" />
                    {uploadedFile.name}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              Save as Draft
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
            >
              Add Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="border-0 shadow-2xl max-w-md">
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <DialogTitle className="text-2xl mb-2">Payment Added Successfully!</DialogTitle>
            <p className="text-slate-600 mb-6">
              Your payment transaction has been recorded and will be reflected in the reports.
            </p>
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
