import { useEffect, useMemo, useState } from 'react';
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
  Download,
  Eye,
  Edit,
  CheckCircle,
  Upload,
  FileText,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
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
  ResponsiveContainer,
} from 'recharts';

type PaymentType = 'expense' | 'supplier' | 'customer';
type PaymentMethod = 'cash' | 'bank';
type PaymentStatus = 'pending' | 'completed' | 'failed';

interface Transaction {
  _id?: string;
  id?: string;
  transaction_id?: string;
  date: string;
  type: PaymentType;
  category: string;
  relatedEntity: string;
  amount: number;
  paymentMethod: PaymentMethod;
  bankAccountId?: string;
  bankAccountName?: string;
  status: PaymentStatus;
  notes?: string;
  receiptUrl?: string;
}

interface BankAccount {
  _id?: string;
  id?: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  branch?: string;
  notes?: string;
  opening_balance?: number;
}

const API_BASE = 'http://localhost:5900/api/paymentTransactions';
const API_BASE_BANK = 'http://localhost:5900/api/bankAccounts';

const parseNumber = (value: any): number => {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value) || 0;

  if (typeof value === 'object') {
    if ('$numberDecimal' in value) return Number(value.$numberDecimal) || 0;
    if (typeof value.toString === 'function') {
      const n = Number(value.toString());
      return Number.isNaN(n) ? 0 : n;
    }
  }

  return 0;
};

const mapBankFromBackend = (item: any): BankAccount => ({
  _id: item._id || item.id,
  id: item._id || item.id,
  bank_name: item.bank_name || '',
  account_name: item.account_name || '',
  account_number: item.account_number || '',
  branch: item.branch || '',
  notes: item.notes || '',
  opening_balance: parseNumber(item.opening_balance),
});

const mapTransactionFromBackend = (item: any): Transaction => ({
  _id: item._id || item.id,
  id: item._id || item.id,
  transaction_id: item.transaction_id || item.txn_id || item.id || item._id,
  date: item.date ? String(item.date).slice(0, 10) : '',
  type: item.type || 'expense',
  category: item.category || '',
  relatedEntity: item.relatedEntity || item.related_entity || '',
  amount: parseNumber(item.amount),
  paymentMethod: item.paymentMethod || item.payment_method || 'cash',
  bankAccountId: item.bankAccountId || item.bank_account_id || '',
  bankAccountName: item.bankAccountName || item.bank_account_name || '',
  status: item.status || 'pending',
  notes: item.notes || '',
  receiptUrl: item.receiptUrl || item.receipt_url || '',
});

const initialForm = {
  paymentType: 'expense' as PaymentType,
  relatedEntity: '',
  amount: '',
  paymentMethod: 'bank' as PaymentMethod,
  date: new Date().toISOString().split('T')[0],
  category: '',
  notes: '',
  status: 'completed' as PaymentStatus,
  bankAccountId: '',
};

export function PaymentsTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [formData, setFormData] = useState(initialForm);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [financeTransactions, setFinanceTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchTransactions();
    fetchBankAccounts();
    fetchFinanceTransactions();
  }, []);

  const fetchFinanceTransactions = async () => {
    try {
      const response = await fetch(`http://localhost:5900/api/finance/getTransactions`);
      if (!response.ok) return;
      const data = await response.json();
      const itemsArray =
        Array.isArray(data) ? data :
        Array.isArray(data.items) ? data.items :
        Array.isArray(data.data) ? data.data :
        Array.isArray(data.transactions) ? data.transactions :
        [];
      setFinanceTransactions(itemsArray);
    } catch (error) {
      console.error('Error fetching finance transactions:', error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/getPayments`);

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status}`);
      }

      const data = await response.json();

      const itemsArray =
        Array.isArray(data) ? data :
        Array.isArray(data.items) ? data.items :
        Array.isArray(data.data) ? data.data :
        Array.isArray(data.transactions) ? data.transactions :
        Array.isArray(data.payments) ? data.payments :
        [];

      setTransactions(itemsArray.map(mapTransactionFromBackend));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const response = await fetch(`${API_BASE_BANK}/getBankAccounts`);

      if (!response.ok) {
        throw new Error(`Failed to fetch bank accounts: ${response.status}`);
      }

      const data = await response.json();

      const itemsArray =
        Array.isArray(data) ? data :
        Array.isArray(data.items) ? data.items :
        Array.isArray(data.data) ? data.data :
        Array.isArray(data.bankAccounts) ? data.bankAccounts :
        [];

      setBankAccounts(itemsArray.map(mapBankFromBackend));
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      setBankAccounts([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!formData.category) {
      alert('Category is required');
      return;
    }

    if (!formData.relatedEntity.trim()) {
      alert('Related entity is required');
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    if (!formData.date) {
      alert('Payment date is required');
      return;
    }

    if (formData.paymentMethod === 'bank' && !formData.bankAccountId) {
      alert('Please select a bank account');
      return;
    }

    setSubmitLoading(true);

    try {
      const selectedBank = bankAccounts.find(
        (bank) => (bank._id || bank.id) === formData.bankAccountId
      );

      const payload = {
        type: formData.paymentType,
        category: formData.category,
        relatedEntity: formData.relatedEntity,
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        date: formData.date,
        notes: formData.notes,
        status: formData.status,
        bankAccountId: formData.paymentMethod === 'bank' ? formData.bankAccountId : null,
        bankAccountName:
          formData.paymentMethod === 'bank' && selectedBank
            ? `${selectedBank.bank_name} - ${selectedBank.account_number}`
            : '',
      };

      const response = await fetch(`${API_BASE}/addPayment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add payment');
      }

      setShowAddModal(false);
      setShowSuccessModal(true);
      setFormData(initialForm);
      setUploadedFile(null);
      await fetchTransactions();
    } catch (error: any) {
      console.error('Error adding payment:', error);
      alert(error.message || 'Failed to add payment');
    } finally {
      setSubmitLoading(false);
    }
  };

  const totalExpenses = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'expense' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const totalSupplierPayments = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'supplier' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const totalCustomerIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'customer' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const cashInHand = useMemo(() => {
    const cashCustomer = transactions
      .filter((t) => t.status === 'completed' && t.paymentMethod === 'cash' && t.type === 'customer')
      .reduce((sum, t) => sum + t.amount, 0);

    const cashSupplier = transactions
      .filter((t) => t.status === 'completed' && t.paymentMethod === 'cash' && t.type === 'supplier')
      .reduce((sum, t) => sum + t.amount, 0);

    const cashExpense = transactions
      .filter((t) => t.status === 'completed' && t.paymentMethod === 'cash' && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const financeCashIn = financeTransactions
      .filter((t) => t.transaction_type === 'cash_in' || t.type === 'cash_in')
      .reduce((sum, t) => sum + parseNumber(t.amount), 0);

    const financeCashOut = financeTransactions
      .filter((t) => t.transaction_type === 'cash_out' || t.type === 'cash_out')
      .reduce((sum, t) => sum + parseNumber(t.amount), 0);

    const financeBankWithdraw = financeTransactions
      .filter((t) => t.transaction_type === 'bank_withdraw' || t.type === 'bank_withdraw')
      .reduce((sum, t) => sum + parseNumber(t.amount), 0);

    const financeBankDeposit = financeTransactions
      .filter((t) => t.transaction_type === 'bank_deposit' || t.type === 'bank_deposit')
      .reduce((sum, t) => sum + parseNumber(t.amount), 0);

    return cashCustomer - cashSupplier - cashExpense + financeCashIn + financeBankWithdraw - financeCashOut - financeBankDeposit;
  }, [transactions, financeTransactions]);

  const getBankBalance = (bankId: string) => {
    const account = bankAccounts.find((b) => (b._id || b.id) === bankId);
    const openingBalance = parseNumber(account?.opening_balance);

    const bankCustomerIncome = transactions
      .filter(
        (t) =>
          t.status === 'completed' &&
          t.paymentMethod === 'bank' &&
          t.type === 'customer' &&
          t.bankAccountId === bankId
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const bankExpenses = transactions
      .filter(
        (t) =>
          t.status === 'completed' &&
          t.paymentMethod === 'bank' &&
          (t.type === 'expense' || t.type === 'supplier') &&
          t.bankAccountId === bankId
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const financeDeposits = financeTransactions
      .filter((t) => (t.transaction_type === 'bank_deposit' || t.type === 'bank_deposit') && (t.bankAccountId === bankId || t.bank_account_id === bankId))
      .reduce((sum, t) => sum + parseNumber(t.amount), 0);

    const financeWithdrawals = financeTransactions
      .filter((t) => (t.transaction_type === 'bank_withdraw' || t.type === 'bank_withdraw') && (t.bankAccountId === bankId || t.bank_account_id === bankId))
      .reduce((sum, t) => sum + parseNumber(t.amount), 0);

    return openingBalance + bankCustomerIncome - bankExpenses + financeDeposits - financeWithdrawals;
  };

  const totalBankBalance = useMemo(() => {
    return bankAccounts.reduce((sum, bank) => {
      const bankId = bank._id || bank.id || '';
      return sum + getBankBalance(bankId);
    }, 0);
  }, [bankAccounts, transactions]);

  const netBalance = totalCustomerIncome - totalExpenses - totalSupplierPayments;

  const filteredTransactions = transactions.filter((txn) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (txn.transaction_id || '').toLowerCase().includes(q) ||
      (txn.relatedEntity || '').toLowerCase().includes(q) ||
      (txn.category || '').toLowerCase().includes(q) ||
      (txn.bankAccountName || '').toLowerCase().includes(q);

    const matchesType = typeFilter === 'all' || txn.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || txn.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const stackedData = useMemo(() => {
    const dataMap: Record<string, { month: string; expenses: number; suppliers: number; customers: number }> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      dataMap[mKey] = { month: months[d.getMonth()], expenses: 0, suppliers: 0, customers: 0 };
    }

    transactions.forEach(t => {
      if ((t.status === 'completed' || t.status === undefined) && t.date) {
        const d = new Date(t.date);
        if (!isNaN(d.getTime())) {
          const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (dataMap[mKey]) {
            if (t.type === 'expense') dataMap[mKey].expenses += t.amount;
            else if (t.type === 'supplier') dataMap[mKey].suppliers += t.amount;
            else if (t.type === 'customer') dataMap[mKey].customers += t.amount;
          }
        }
      }
    });

    return Object.values(dataMap);
  }, [transactions]);

  const pieData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    transactions.forEach(t => {
      if ((t.status === 'completed' || t.status === undefined) && (t.type === 'expense' || t.type === 'supplier')) {
        const cat = t.category || 'Other';
        categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
      }
    });

    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#f97316'];
    
    return Object.entries(categoryMap)
      .filter(([_, value]) => value > 0)
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }));
  }, [transactions]);

  const lineData = useMemo(() => {
    const dataMap: Record<string, { month: string; income: number; expenses: number }> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      dataMap[mKey] = { month: months[d.getMonth()], income: 0, expenses: 0 };
    }

    transactions.forEach(t => {
      if ((t.status === 'completed' || t.status === undefined) && t.date) {
        const d = new Date(t.date);
        if (!isNaN(d.getTime())) {
          const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (dataMap[mKey]) {
            if (t.type === 'expense' || t.type === 'supplier') {
              dataMap[mKey].expenses += t.amount;
            } else if (t.type === 'customer') {
              dataMap[mKey].income += t.amount;
            }
          }
        }
      }
    });

    return Object.values(dataMap);
  }, [transactions]);

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

  return (
    <AdminLayout>
      <div className="space-y-6">
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
                  <p className="text-emerald-100">
                    Track expenses, supplier payments, customer income, cash in hand, and bank balances
                  </p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
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

          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
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

          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
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

          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Cash In Hand</h3>
              <p className={`${cashInHand >= 0 ? 'text-green-600' : 'text-red-600'} text-2xl`}>
                ${Math.abs(cashInHand).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-emerald-600" />
                </div>
                <Badge className={netBalance >= 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
                  {netBalance >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                  {netBalance >= 0 ? '+' : ''}{totalCustomerIncome ? ((netBalance / totalCustomerIncome) * 100).toFixed(1) : '0'}%
                </Badge>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Total Bank Balance</h3>
              <p className={`${totalBankBalance >= 0 ? 'text-green-600' : 'text-red-600'} text-2xl`}>
                ${Math.abs(totalBankBalance).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {bankAccounts.length > 0 && (
          <Card className="modern-card border-0 shadow-modern-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                Bank Account Balances
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {bankAccounts.map((bank) => {
                  const bankId = bank._id || bank.id || '';
                  return (
                    <div key={bankId} className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                      <p className="text-sm text-slate-500">{bank.bank_name}</p>
                      <h3 className="text-lg text-slate-900">{bank.account_name}</h3>
                      <p className="text-sm text-slate-600">{bank.account_number}</p>
                      <p className="mt-3 text-2xl text-emerald-700">
                        ${getBankBalance(bankId).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

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
                    <TableHead>Bank Account</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-6 text-slate-500">
                        Loading transactions...
                      </TableCell>
                    </TableRow>
                  ) : filteredTransactions.length > 0 ? (
                    filteredTransactions.map((txn) => (
                      <TableRow key={txn._id || txn.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="text-slate-600">{txn.date}</TableCell>
                        <TableCell className="text-slate-900">{txn.transaction_id}</TableCell>
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
                            {txn.paymentMethod === 'bank' ? <Building2 className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                            <span className="capitalize">
                              {txn.paymentMethod === 'bank' ? 'Bank Transfer' : 'Cash'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{txn.paymentMethod === 'bank' ? txn.bankAccountName || '-' : '-'}</TableCell>
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
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-6 text-slate-500">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="expenses" stackId="a" fill="#ef4444" name="Expenses" />
                  <Bar dataKey="suppliers" stackId="a" fill="#8b5cf6" name="Suppliers" />
                  <Bar dataKey="customers" stackId="a" fill="#10b981" name="Customers" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

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
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

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
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} name="Income" />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} name="Expenses" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-600" />
              Reports & Export
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">Generate and export financial reports</p>
          </CardHeader>
          <CardContent className="pt-6">
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
                  onValueChange={(value: PaymentType) =>
                    setFormData({ ...formData, paymentType: value, category: '', relatedEntity: '' })
                  }
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
                        <SelectItem value="transport">Transport</SelectItem>
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
              <Input
                placeholder={
                  formData.paymentType === 'expense'
                    ? 'Enter expense title'
                    : formData.paymentType === 'supplier'
                    ? 'Enter supplier name'
                    : 'Enter customer name'
                }
                value={formData.relatedEntity}
                onChange={(e) => setFormData({ ...formData, relatedEntity: e.target.value })}
                className="mt-1 border-slate-200"
              />
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
                  onValueChange={(value: PaymentMethod) =>
                    setFormData({
                      ...formData,
                      paymentMethod: value,
                      bankAccountId: value === 'bank' ? formData.bankAccountId : '',
                    })
                  }
                >
                  <SelectTrigger className="mt-1 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.paymentMethod === 'bank' && (
              <div>
                <Label>Bank Account *</Label>
                <Select
                  value={formData.bankAccountId}
                  onValueChange={(value) => setFormData({ ...formData, bankAccountId: value })}
                >
                  <SelectTrigger className="mt-1 border-slate-200">
                    <SelectValue placeholder="Select bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((bank) => {
                      const bankId = bank._id || bank.id || '';
                      return (
                        <SelectItem key={bankId} value={bankId}>
                          {bank.bank_name} - {bank.account_number}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label>Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: PaymentStatus) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="mt-1 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => document.getElementById('receipt-upload')?.click()}
                  >
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
            <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="outline" className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50">
              Save as Draft
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitLoading}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
            >
              {submitLoading ? 'Saving...' : 'Add Payment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="border-0 shadow-2xl max-w-md">
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <DialogTitle className="text-2xl mb-2">Payment Added Successfully!</DialogTitle>
            <p className="text-slate-600 mb-6">
              Your payment transaction has been recorded and reflected in cash/bank balances.
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