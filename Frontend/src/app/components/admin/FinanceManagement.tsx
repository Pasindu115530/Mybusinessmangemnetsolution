import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Wallet,
  Landmark,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  Trash2,
  Receipt,
  Building2,
  CreditCard
} from 'lucide-react';

type FundType =
  | 'fund'
  | 'loan'
  | 'cash_in'
  | 'cash_out'
  | 'bank_deposit'
  | 'bank_withdraw';

interface FundTransaction {
  _id?: string;
  id?: string;
  date: string;
  description: string;
  amount: number;
  type: FundType;
  notes?: string;
  bankAccountId?: string;
  bankAccountName?: string;
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

const API_BASE = 'http://localhost:5900/api/finance';
const API_BASE_BANK = 'http://localhost:5900/api/bankAccounts';

const initialTransaction: FundTransaction = {
  date: '',
  description: '',
  amount: 0,
  type: 'fund',
  notes: '',
  bankAccountId: ''
};

const initialBankAccount: BankAccount = {
  bank_name: '',
  account_name: '',
  account_number: '',
  branch: '',
  notes: '',
  opening_balance: 0
};

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

const mapFromBackend = (item: any): FundTransaction => ({
  _id: item._id || item.id,
  id: item._id || item.id,
  date: item.date ? String(item.date).slice(0, 10) : '',
  description: item.description || '',
  amount: parseNumber(item.amount),
  type: item.transaction_type || item.type || 'fund',
  notes: item.notes || '',
  bankAccountId: item.bankAccountId || item.bank_account_id || '',
  bankAccountName: item.bankAccountName || item.bank_account_name || ''
});

const mapBankFromBackend = (item: any): BankAccount => ({
  _id: item._id || item.id,
  id: item._id || item.id,
  bank_name: item.bank_name || '',
  account_name: item.account_name || '',
  account_number: item.account_number || '',
  branch: item.branch || '',
  notes: item.notes || '',
  opening_balance: parseNumber(item.opening_balance)
});

export function FinanceManagement() {
  const [transactions, setTransactions] = useState<FundTransaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [bankSubmitLoading, setBankSubmitLoading] = useState(false);
  const [newTransaction, setNewTransaction] = useState<FundTransaction>(initialTransaction);
  const [newBankAccount, setNewBankAccount] = useState<BankAccount>(initialBankAccount);
  const [showBankForm, setShowBankForm] = useState(false);
  const [paymentTransactions, setPaymentTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchTransactions();
    fetchBankAccounts();
    fetchPaymentTransactions();
  }, []);

  const fetchPaymentTransactions = async () => {
    try {
      const response = await fetch(`http://localhost:5900/api/paymentTransactions/getPayments`);
      if (!response.ok) return;
      const data = await response.json();
      const itemsArray =
        Array.isArray(data) ? data :
        Array.isArray(data.items) ? data.items :
        Array.isArray(data.data) ? data.data :
        Array.isArray(data.transactions) ? data.transactions :
        Array.isArray(data.payments) ? data.payments :
        [];
      setPaymentTransactions(itemsArray);
    } catch (error) {
      console.error('Error fetching payment transactions:', error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/getTransactions`);

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status}`);
      }

      const data = await response.json();

      const itemsArray =
        Array.isArray(data) ? data :
        Array.isArray(data.items) ? data.items :
        Array.isArray(data.data) ? data.data :
        Array.isArray(data.transactions) ? data.transactions :
        [];

      const mappedItems = itemsArray.map(mapFromBackend);

      const filtered = mappedItems.filter((item) =>
        ['fund', 'loan', 'cash_in', 'cash_out', 'bank_deposit', 'bank_withdraw'].includes(item.type)
      );

      setTransactions(filtered);
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

  const handleAddBankAccount = async () => {
    if (!newBankAccount.bank_name.trim()) {
      alert('Bank name is required');
      return;
    }

    if (!newBankAccount.account_name.trim()) {
      alert('Account name is required');
      return;
    }

    if (!newBankAccount.account_number.trim()) {
      alert('Account number is required');
      return;
    }

    setBankSubmitLoading(true);

    try {
      const payload = {
        bank_name: newBankAccount.bank_name,
        account_name: newBankAccount.account_name,
        account_number: newBankAccount.account_number,
        branch: newBankAccount.branch,
        notes: newBankAccount.notes,
        opening_balance: newBankAccount.opening_balance || 0
      };

      const response = await fetch(`${API_BASE_BANK}/addBankAccount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add bank account');
      }

      await fetchBankAccounts();
      setNewBankAccount(initialBankAccount);
      setShowBankForm(false);
    } catch (error) {
      console.error('Error adding bank account:', error);
      alert('Failed to add bank account');
    } finally {
      setBankSubmitLoading(false);
    }
  };

  const handleDeleteBankAccount = async (id?: string) => {
    if (!id) return;

    const confirmed = window.confirm('Are you sure you want to delete this bank account?');
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_BANK}/deleteBankAccount/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete bank account');
      }

      await fetchBankAccounts();
    } catch (error) {
      console.error('Error deleting bank account:', error);
      alert('Failed to delete bank account');
    }
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.description.trim()) {
      alert('Description is required');
      return;
    }

    if (!newTransaction.date) {
      alert('Date is required');
      return;
    }

    if (newTransaction.amount <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    const isBankType =
      newTransaction.type === 'bank_deposit' || newTransaction.type === 'bank_withdraw';

    if (isBankType && !newTransaction.bankAccountId) {
      alert('Please select a bank account');
      return;
    }

    if (newTransaction.type === 'bank_deposit') {
      const currentCash = cashInHand;
      if (newTransaction.amount > currentCash) {
        alert('Not enough cash in hand to deposit');
        return;
      }
    }

    if (newTransaction.type === 'bank_withdraw') {
      const accountBalance = getBankBalance(newTransaction.bankAccountId || '');
      if (newTransaction.amount > accountBalance) {
        alert('Not enough balance in selected bank account');
        return;
      }
    }

    setSubmitLoading(true);

    try {
      const selectedBank = bankAccounts.find(
        (bank) => (bank._id || bank.id) === newTransaction.bankAccountId
      );

      const payload = {
        transaction_type: newTransaction.type,
        amount: newTransaction.amount,
        description: newTransaction.description,
        date: newTransaction.date,
        notes: newTransaction.notes,
        bankAccountId: newTransaction.bankAccountId || null,
        bankAccountName: selectedBank
          ? `${selectedBank.bank_name} - ${selectedBank.account_number}`
          : null
      };

      const response = await fetch(`${API_BASE}/addTransaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add transaction');
      }

      await fetchTransactions();
      setNewTransaction(initialTransaction);
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteTransaction = async (id?: string) => {
    if (!id) return;

    const confirmed = window.confirm('Are you sure you want to delete this entry?');
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE}/deleteTransaction/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete transaction');
      }

      await fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    }
  };

  const getBankBalance = (bankId: string) => {
    const account = bankAccounts.find((b) => (b._id || b.id) === bankId);
    const openingBalance = parseNumber(account?.opening_balance);

    const deposits = transactions
      .filter((t) => t.type === 'bank_deposit' && t.bankAccountId === bankId)
      .reduce((sum, t) => sum + t.amount, 0);

    const withdrawals = transactions
      .filter((t) => t.type === 'bank_withdraw' && t.bankAccountId === bankId)
      .reduce((sum, t) => sum + t.amount, 0);

    const paymentCustomerIncome = paymentTransactions
      .filter(
        (t) =>
          (t.status === 'completed' || t.status === undefined) &&
          (t.paymentMethod === 'bank' || t.payment_method === 'bank') &&
          t.type === 'customer' &&
          (t.bankAccountId === bankId || t.bank_account_id === bankId)
      )
      .reduce((sum, t) => sum + parseNumber(t.amount), 0);

    const paymentExpenses = paymentTransactions
      .filter(
        (t) =>
          (t.status === 'completed' || t.status === undefined) &&
          (t.paymentMethod === 'bank' || t.payment_method === 'bank') &&
          (t.type === 'expense' || t.type === 'supplier') &&
          (t.bankAccountId === bankId || t.bank_account_id === bankId)
      )
      .reduce((sum, t) => sum + parseNumber(t.amount), 0);

    return openingBalance + deposits - withdrawals + paymentCustomerIncome - paymentExpenses;
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.notes || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.bankAccountName || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const totalFunds = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'fund')
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const totalLoans = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'loan')
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const cashInHand = useMemo(() => {
    const cashIn = transactions
      .filter((t) => t.type === 'cash_in')
      .reduce((sum, t) => sum + t.amount, 0);

    const cashOut = transactions
      .filter((t) => t.type === 'cash_out')
      .reduce((sum, t) => sum + t.amount, 0);

    const bankWithdraw = transactions
      .filter((t) => t.type === 'bank_withdraw')
      .reduce((sum, t) => sum + t.amount, 0);

    const bankDeposit = transactions
      .filter((t) => t.type === 'bank_deposit')
      .reduce((sum, t) => sum + t.amount, 0);

    const paymentCashCustomer = paymentTransactions
      .filter((t) => (t.status === 'completed' || t.status === undefined) && (t.paymentMethod === 'cash' || t.payment_method === 'cash') && t.type === 'customer')
      .reduce((sum, t) => sum + parseNumber(t.amount), 0);
      
    const paymentCashSupplier = paymentTransactions
      .filter((t) => (t.status === 'completed' || t.status === undefined) && (t.paymentMethod === 'cash' || t.payment_method === 'cash') && (t.type === 'supplier'))
      .reduce((sum, t) => sum + parseNumber(t.amount), 0);

    const paymentCashExpense = paymentTransactions
      .filter((t) => (t.status === 'completed' || t.status === undefined) && (t.paymentMethod === 'cash' || t.payment_method === 'cash') && (t.type === 'expense'))
      .reduce((sum, t) => sum + parseNumber(t.amount), 0);

    return cashIn + bankWithdraw - cashOut - bankDeposit + paymentCashCustomer - paymentCashSupplier - paymentCashExpense;
  }, [transactions, paymentTransactions]);

  const totalBankBalance = useMemo(() => {
    return bankAccounts.reduce((sum, bank) => {
      const bankId = bank._id || bank.id || '';
      return sum + getBankBalance(bankId);
    }, 0);
  }, [bankAccounts, transactions]);

  const availableFunds = totalFunds + totalLoans + cashInHand + totalBankBalance;

  const getTypeLabel = (type: FundType) => {
    switch (type) {
      case 'fund':
        return 'Fund';
      case 'loan':
        return 'Loan';
      case 'cash_in':
        return 'Cash In';
      case 'cash_out':
        return 'Cash Out';
      case 'bank_deposit':
        return 'Bank Deposit';
      case 'bank_withdraw':
        return 'Bank Withdraw';
      default:
        return type;
    }
  };

  const getAmountClass = (type: FundType) => {
    if (type === 'cash_out' || type === 'bank_deposit') return 'text-red-600';
    return 'text-green-600';
  };

  const getAmountPrefix = (type: FundType) => {
    if (type === 'cash_out' || type === 'bank_deposit') return '-';
    return '+';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 text-white shadow-modern-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5" />
              <span className="text-blue-100">Business Funds & Bank Accounts</span>
            </div>
            <h1 className="text-3xl mb-2">Finance Management</h1>
            <p className="text-blue-100">
              Manage company funds, loans, cash in hand, and multiple bank accounts
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          <Card className="modern-card border-0 shadow-modern-lg bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm text-blue-700">Total Funds</CardTitle>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-blue-900">${totalFunds.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg bg-gradient-to-br from-orange-50 to-red-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm text-orange-700">Loan Amount</CardTitle>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Landmark className="w-6 h-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-orange-900">${totalLoans.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm text-green-700">Cash In Hand</CardTitle>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-green-900">${cashInHand.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg bg-gradient-to-br from-sky-50 to-indigo-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm text-sky-700">Bank Balance</CardTitle>
              <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-sky-900">${totalBankBalance.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm text-purple-700">Available Funds</CardTitle>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-purple-900">${availableFunds.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Company Bank Accounts
              </CardTitle>
              <Button
                type="button"
                onClick={() => setShowBankForm(!showBankForm)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {showBankForm ? 'Close' : 'Add Bank Account'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {showBankForm && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-xl bg-slate-50">
                <div>
                  <Label>Bank Name</Label>
                  <Input
                    value={newBankAccount.bank_name}
                    onChange={(e) =>
                      setNewBankAccount({ ...newBankAccount, bank_name: e.target.value })
                    }
                    placeholder="e.g. Commercial Bank"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Account Name</Label>
                  <Input
                    value={newBankAccount.account_name}
                    onChange={(e) =>
                      setNewBankAccount({ ...newBankAccount, account_name: e.target.value })
                    }
                    placeholder="Company Account Name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Account Number</Label>
                  <Input
                    value={newBankAccount.account_number}
                    onChange={(e) =>
                      setNewBankAccount({ ...newBankAccount, account_number: e.target.value })
                    }
                    placeholder="Enter account number"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Branch</Label>
                  <Input
                    value={newBankAccount.branch}
                    onChange={(e) =>
                      setNewBankAccount({ ...newBankAccount, branch: e.target.value })
                    }
                    placeholder="Branch"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Opening Balance</Label>
                  <Input
                    type="number"
                    value={newBankAccount.opening_balance}
                    onChange={(e) =>
                      setNewBankAccount({
                        ...newBankAccount,
                        opening_balance: Number(e.target.value) || 0
                      })
                    }
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={newBankAccount.notes}
                    onChange={(e) =>
                      setNewBankAccount({ ...newBankAccount, notes: e.target.value })
                    }
                    placeholder="Optional notes"
                    className="mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <Button
                    onClick={handleAddBankAccount}
                    disabled={bankSubmitLoading}
                    className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {bankSubmitLoading ? 'Saving...' : 'Save Bank Account'}
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {bankAccounts.length > 0 ? (
                bankAccounts.map((bank) => {
                  const bankId = bank._id || bank.id || '';
                  const balance = getBankBalance(bankId);

                  return (
                    <Card key={bankId} className="border border-slate-200 shadow-sm">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <CreditCard className="w-4 h-4 text-sky-600" />
                              <h3 className="font-semibold text-slate-900">{bank.bank_name}</h3>
                            </div>
                            <p className="text-sm text-slate-700">{bank.account_name}</p>
                            <p className="text-sm text-slate-500">{bank.account_number}</p>
                            <p className="text-xs text-slate-500 mt-1">{bank.branch || 'No branch'}</p>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteBankAccount(bankId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="mt-4 p-3 rounded-lg bg-sky-50 border border-sky-100">
                          <p className="text-xs text-sky-700 mb-1">Current Balance</p>
                          <p className="text-2xl font-semibold text-sky-900">
                            ${balance.toLocaleString()}
                          </p>
                        </div>

                        {bank.notes ? (
                          <p className="text-xs text-slate-500 mt-3">{bank.notes}</p>
                        ) : null}
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-8 text-slate-500 border rounded-xl">
                  No bank accounts added yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="modern-card border-0 shadow-modern-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Add Finance Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label>Entry Type</Label>
                  <Select
                    value={newTransaction.type}
                    onValueChange={(val: FundType) =>
                      setNewTransaction({
                        ...newTransaction,
                        type: val,
                        bankAccountId:
                          val === 'bank_deposit' || val === 'bank_withdraw'
                            ? newTransaction.bankAccountId
                            : ''
                      })
                    }
                  >
                    <SelectTrigger className="mt-1 border-slate-200">
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fund">Fund</SelectItem>
                      <SelectItem value="loan">Loan</SelectItem>
                      <SelectItem value="cash_in">Cash In</SelectItem>
                      <SelectItem value="cash_out">Cash Out</SelectItem>
                      <SelectItem value="bank_deposit">Deposit To Bank</SelectItem>
                      <SelectItem value="bank_withdraw">Withdraw From Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(newTransaction.type === 'bank_deposit' ||
                  newTransaction.type === 'bank_withdraw') && (
                  <div>
                    <Label>Select Bank Account</Label>
                    <Select
                      value={newTransaction.bankAccountId || ''}
                      onValueChange={(value) =>
                        setNewTransaction({ ...newTransaction, bankAccountId: value })
                      }
                    >
                      <SelectTrigger className="mt-1 border-slate-200">
                        <SelectValue placeholder="Select bank account..." />
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

                <div>
                  <Label>Description</Label>
                  <Input
                    value={newTransaction.description}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, description: e.target.value })
                    }
                    placeholder="Enter description"
                    className="mt-1 border-slate-200"
                  />
                </div>

                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        amount: Number(e.target.value) || 0
                      })
                    }
                    placeholder="0.00"
                    className="mt-1 border-slate-200"
                  />
                </div>

                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, date: e.target.value })
                    }
                    className="mt-1 border-slate-200"
                  />
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={newTransaction.notes}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, notes: e.target.value })
                    }
                    placeholder="Optional notes"
                    className="mt-1 border-slate-200"
                  />
                </div>

                <Button
                  onClick={handleAddTransaction}
                  disabled={submitLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {submitLoading ? 'Saving...' : 'Add Entry'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                Recent Finance Log
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3 max-h-[460px] overflow-y-auto">
                {filteredTransactions.slice(0, 8).map((entry) => (
                  <div
                    key={entry._id || entry.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          entry.type === 'cash_out' || entry.type === 'bank_deposit'
                            ? 'bg-gradient-to-br from-red-100 to-orange-100'
                            : 'bg-gradient-to-br from-green-100 to-emerald-100'
                        }`}
                      >
                        {entry.type === 'cash_out' || entry.type === 'bank_deposit' ? (
                          <ArrowDownRight className="w-5 h-5 text-red-600" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-green-600" />
                        )}
                      </div>

                      <div>
                        <p className="text-sm text-slate-900">{entry.description}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <p className="text-xs text-slate-600">{entry.date}</p>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(entry.type)}
                          </Badge>
                          {entry.bankAccountName ? (
                            <Badge variant="outline" className="text-xs">
                              {entry.bankAccountName}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className={getAmountClass(entry.type)}>
                      {getAmountPrefix(entry.type)}
                      {entry.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle>Finance Entries</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[220px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-slate-200"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-52 border-slate-200">
                  <SelectValue placeholder="Entry Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="fund">Fund</SelectItem>
                  <SelectItem value="loan">Loan</SelectItem>
                  <SelectItem value="cash_in">Cash In</SelectItem>
                  <SelectItem value="cash_out">Cash Out</SelectItem>
                  <SelectItem value="bank_deposit">Deposit To Bank</SelectItem>
                  <SelectItem value="bank_withdraw">Withdraw From Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Bank Account</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-slate-500">
                        Loading entries...
                      </TableCell>
                    </TableRow>
                  ) : filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction._id || transaction.id}>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getTypeLabel(transaction.type)}</Badge>
                        </TableCell>
                        <TableCell>{transaction.bankAccountName || '-'}</TableCell>
                        <TableCell className={getAmountClass(transaction.type)}>
                          {getAmountPrefix(transaction.type)}$
                          {transaction.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{transaction.notes || '-'}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteTransaction(transaction._id || transaction.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-slate-500">
                        No entries found
                      </TableCell>
                    </TableRow>
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