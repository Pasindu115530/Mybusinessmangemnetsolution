import { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  FileText,
  Upload,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Sparkles,
  PieChart as PieChartIcon,
  BarChart3,
  Receipt
} from 'lucide-react';

interface Expense {
  id: number;
  date: string;
  name: string;
  category: string;
  amount: number;
  paymentMethod: string;
  status: 'paid' | 'pending';
}

interface FundEntry {
  id: number;
  date: string;
  description: string;
  amount: number;
  module: string;
}

const monthlyData = [
  { month: 'Jan', income: 125000, expenses: 78000 },
  { month: 'Feb', income: 138000, expenses: 82000 },
  { month: 'Mar', income: 142000, expenses: 85000 },
  { month: 'Apr', income: 155000, expenses: 91000 },
  { month: 'May', income: 168000, expenses: 95000 },
  { month: 'Jun', income: 180000, expenses: 102000 },
];

const expenseBreakdown = [
  { name: 'Supplier Payment', value: 45000, color: '#667eea' },
  { name: 'Salaries', value: 35000, color: '#10b981' },
  { name: 'Utilities', value: 12000, color: '#f59e0b' },
  { name: 'Transport', value: 8000, color: '#ef4444' },
  { name: 'Maintenance', value: 6000, color: '#8b5cf6' },
  { name: 'Other', value: 4000, color: '#ec4899' },
];

const expenses: Expense[] = [
  { id: 1, date: '2024-01-15', name: 'Supplier Payment - Tech Inc', category: 'Supplier payment', amount: 15000, paymentMethod: 'Bank Transfer', status: 'paid' },
  { id: 2, date: '2024-01-14', name: 'Employee Salaries - Jan', category: 'Salary', amount: 35000, paymentMethod: 'Bank Transfer', status: 'paid' },
  { id: 3, date: '2024-01-13', name: 'Office Utilities', category: 'Utilities', amount: 3500, paymentMethod: 'Credit Card', status: 'paid' },
  { id: 4, date: '2024-01-12', name: 'Transport & Logistics', category: 'Transport', amount: 2800, paymentMethod: 'Cash', status: 'pending' },
  { id: 5, date: '2024-01-11', name: 'Equipment Maintenance', category: 'Maintenance', amount: 1500, paymentMethod: 'Credit Card', status: 'paid' },
];

const fundsLog: FundEntry[] = [
  { id: 1, date: '2024-01-15', description: 'Sales Revenue - Q1', amount: 125000, module: 'Sales' },
  { id: 2, date: '2024-01-10', description: 'Investment Funding', amount: 50000, module: 'Investment' },
  { id: 3, date: '2024-01-08', description: 'Supplier Payment', amount: -15000, module: 'Stock' },
  { id: 4, date: '2024-01-05', description: 'Salary Disbursement', amount: -35000, module: 'Expense' },
];

export function FinanceManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);

  const totalIncome = 180000;
  const totalExpenses = 102000;
  const netProfit = totalIncome - totalExpenses;
  const availableFunds = 125000;

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb and Header */}
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
            <span>Admin</span>
            <span>/</span>
            <span className="text-blue-600">Finance & Funds</span>
          </div>
          
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 text-white shadow-modern-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-blue-100">Financial Management</span>
              </div>
              <h1 className="text-3xl mb-2">Finance & Funds Management</h1>
              <p className="text-blue-100">Track company funds, income, and expenses with clear financial insights</p>
            </div>
          </div>
        </div>

        {/* Section 1: Finance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="modern-card border-0 shadow-modern-lg bg-gradient-to-br from-blue-50 to-cyan-50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm text-blue-700">Available Funds</CardTitle>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-blue-900">${availableFunds.toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-600">Current balance</span>
              </div>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm text-green-700">Total Income</CardTitle>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-green-900">${totalIncome.toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">+15.2% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm text-orange-700">Total Expenses</CardTitle>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-orange-900">${totalExpenses.toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-600">+8.4% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg bg-gradient-to-br from-purple-50 to-indigo-50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm text-purple-700">Net Profit</CardTitle>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-purple-900">${netProfit.toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-600">+22.8% from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 2: Funds Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Funds Card */}
          <Card className="modern-card border-0 shadow-modern-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Add Funds
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label>Amount</Label>
                  <Input type="number" placeholder="0.00" className="mt-1 border-slate-200" />
                </div>
                <div>
                  <Label>Fund Source</Label>
                  <Select>
                    <SelectTrigger className="mt-1 border-slate-200">
                      <SelectValue placeholder="Select source..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales Revenue</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                      <SelectItem value="loan">Loan</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" className="mt-1 border-slate-200" />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea placeholder="Add description..." className="mt-1 border-slate-200" />
                </div>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Funds
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Funds Usage Log */}
          <Card className="modern-card border-0 shadow-modern-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                Funds Usage Log
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3 max-h-[380px] overflow-y-auto">
                {fundsLog.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        entry.amount > 0 
                          ? 'bg-gradient-to-br from-green-100 to-emerald-100' 
                          : 'bg-gradient-to-br from-red-100 to-orange-100'
                      }`}>
                        {entry.amount > 0 ? (
                          <ArrowUpRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-slate-900">{entry.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-slate-600">{entry.date}</p>
                          <Badge variant="outline" className="text-xs">{entry.module}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className={`${entry.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.amount > 0 ? '+' : ''}{entry.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 3: Expenses Management */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Expenses Management
              </CardTitle>
              <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-md">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Expense
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-0 shadow-2xl max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Add New Expense</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="md:col-span-2">
                      <Label>Expense Title</Label>
                      <Input placeholder="Enter expense title" className="mt-1 border-slate-200" />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select>
                        <SelectTrigger className="mt-1 border-slate-200">
                          <SelectValue placeholder="Select category..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="supplier">Supplier Payment</SelectItem>
                          <SelectItem value="transport">Transport</SelectItem>
                          <SelectItem value="utilities">Utilities</SelectItem>
                          <SelectItem value="salary">Salary</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Amount</Label>
                      <Input type="number" placeholder="0.00" className="mt-1 border-slate-200" />
                    </div>
                    <div>
                      <Label>Payment Method</Label>
                      <Select>
                        <SelectTrigger className="mt-1 border-slate-200">
                          <SelectValue placeholder="Select method..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                          <SelectItem value="card">Credit Card</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="check">Check</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Date</Label>
                      <Input type="date" className="mt-1 border-slate-200" />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Notes</Label>
                      <Textarea placeholder="Additional notes..." className="mt-1 border-slate-200" />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Upload Receipt (Optional)</Label>
                      <div className="mt-1 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-all">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-500 mt-1">PDF, PNG, JPG (Max 5MB)</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" onClick={() => setShowAddExpense(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600">
                      Add Expense
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-slate-200"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48 border-slate-200">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Supplier payment">Supplier Payment</SelectItem>
                  <SelectItem value="Transport">Transport</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Salary">Salary</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 border-slate-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expenses Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead>Date</TableHead>
                    <TableHead>Expense Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="text-slate-600">{expense.date}</TableCell>
                      <TableCell className="text-slate-900">{expense.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="modern-badge">{expense.category}</Badge>
                      </TableCell>
                      <TableCell className="text-slate-900">${expense.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-slate-600">{expense.paymentMethod}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            expense.status === 'paid'
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                          }
                        >
                          {expense.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:text-blue-600">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Financial Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income vs Expenses Chart */}
          <Card className="modern-card border-0 shadow-modern-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Monthly Income vs Expenses
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">Last 6 months performance</p>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fill="url(#incomeGradient)" name="Income" />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fill="url(#expenseGradient)" name="Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Expense Breakdown Pie Chart */}
          <Card className="modern-card border-0 shadow-modern-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-blue-600" />
                Expense Breakdown by Category
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">Current month distribution</p>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={3}
                    stroke="#fff"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Section 5: Reports & Export */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Financial Reports
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">Export income and expense reports</p>
              </div>
              <div className="flex items-center gap-3">
                <Input type="date" className="border-slate-200" />
                <span className="text-slate-600">to</span>
                <Input type="date" className="border-slate-200" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Income Report */}
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-green-900">Income Report</h3>
                    <p className="text-sm text-green-700">All revenue streams</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Income:</span>
                    <span className="text-green-900">${totalIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Transactions:</span>
                    <span className="text-slate-900">124</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 border-green-300 text-green-700 hover:bg-green-50">
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" className="flex-1 border-green-300 text-green-700 hover:bg-green-50">
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </div>

              {/* Expense Report */}
              <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-orange-900">Expense Report</h3>
                    <p className="text-sm text-orange-700">All expenditures</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Expenses:</span>
                    <span className="text-orange-900">${totalExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Transactions:</span>
                    <span className="text-slate-900">87</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50">
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50">
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}