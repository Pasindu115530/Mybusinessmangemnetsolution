import { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import {
  Receipt,
  Search,
  Eye,
  Loader2,
  Printer,
  CheckCircle,
  X,
  FileText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface InvoiceItem {
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface SupplierInvoice {
  _id: string;
  invoiceID: string;
  bill_id: string;
  orderID: string;
  supplierEmail: string;
  purchaseOrderRef: string;
  date: string;
  due_date?: string;
  total: number;
  subtotal?: number;
  tax_amount?: number;
  status: string;
  payment_status: string;
  items: InvoiceItem[];
  notes?: string;
}

export function SupplierInvoicesAdmin() {
  const [invoices, setInvoices] = useState<SupplierInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SupplierInvoice | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank'>('bank');
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('');

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const headers = getAuthHeader();
      const res = await axios.get('http://localhost:5900/api/supplier-invoices', { headers });
      setInvoices(res.data.invoices || []);
    } catch (err) {
      console.error('Error fetching supplier invoices:', err);
      toast.error('Failed to load supplier invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const res = await axios.get('http://localhost:5900/api/bankAccounts/getBankAccounts', { headers: getAuthHeader() });
      const accounts = Array.isArray(res.data) ? res.data : (res.data.bankAccounts || []);
      setBankAccounts(accounts);
      if (accounts.length > 0) setSelectedBankId(accounts[0]._id || accounts[0].id);
    } catch (err) {
      console.error('Error fetching bank accounts:', err);
    }
  };

  useEffect(() => { 
    fetchInvoices(); 
    fetchBankAccounts();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':     return 'bg-green-100 text-green-700 border-green-200';
      case 'unpaid':   return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'overdue':  return 'bg-red-100 text-red-700 border-red-200';
      default:         return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleAccept = async (id: string) => {
    try {
      setIsProcessing(true);
      const headers = getAuthHeader();
      
      const selectedBank = bankAccounts.find(b => (b._id || b.id) === selectedBankId);
      
      const payload = {
        paymentMethod,
        bankAccountId: paymentMethod === 'bank' ? selectedBankId : null,
        bankAccountName: paymentMethod === 'bank' && selectedBank ? `${selectedBank.bank_name} - ${selectedBank.account_number}` : ''
      };

      await axios.put(`http://localhost:5900/api/supplier-invoices/accept-payment/${id}`, payload, { headers });
      toast.success('Invoice marked as paid — finance records updated');
      fetchInvoices();
      setShowInvoiceModal(false);
    } catch (err) {
      toast.error('Failed to accept invoice');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setIsProcessing(true);
      const headers = getAuthHeader();
      await axios.put(`http://localhost:5900/api/supplier-invoices/reject-payment/${id}`, {}, { headers });
      toast.error('Invoice rejected — supplier notified to review');
      fetchInvoices();
      setShowInvoiceModal(false);
    } catch (err) {
      toast.error('Failed to reject invoice');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredInvoices = invoices.filter(inv =>
    (inv.bill_id || inv.invoiceID || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.purchaseOrderRef || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.supplierEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 p-8 text-white shadow-modern-lg">
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="w-5 h-5 text-emerald-100" />
              <span className="text-emerald-100 uppercase tracking-wider text-xs font-bold">Supplier Billing</span>
            </div>
            <h1 className="text-3xl mb-2">Supplier Invoices</h1>
            <p className="text-emerald-100">Review and process supplier bill submissions</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by Bill ID, PO or Supplier Email..."
              className="pl-10 border-slate-200 h-12 rounded-xl"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-slate-200 h-12 rounded-xl px-6" onClick={fetchInvoices}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl py-6">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              Supplier Bill Registry ({filteredInvoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="font-bold">Bill ID</TableHead>
                    <TableHead className="font-bold">PO Reference</TableHead>
                    <TableHead className="font-bold">Supplier Email</TableHead>
                    <TableHead className="font-bold">Amount</TableHead>
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="font-bold">Due Date</TableHead>
                    <TableHead className="font-bold text-center">Status</TableHead>
                    <TableHead className="text-right font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-64 text-center text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
                        Syncing with database...
                      </TableCell>
                    </TableRow>
                  ) : filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center text-slate-500 italic">
                        No supplier invoices found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map(inv => (
                      <TableRow key={inv._id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-slate-900">{inv.bill_id || inv.invoiceID}</TableCell>
                        <TableCell className="text-slate-700 font-medium">{inv.purchaseOrderRef}</TableCell>
                        <TableCell className="text-slate-900 text-sm">{inv.supplierEmail}</TableCell>
                        <TableCell className="font-black text-slate-900">LKR {inv.total.toLocaleString()}</TableCell>
                        <TableCell className="text-slate-600 text-sm">{new Date(inv.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-slate-600 text-sm">
                          {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${getStatusColor(inv.payment_status)} capitalize border-2`}>
                            {inv.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-emerald-600 hover:text-white border-slate-200 transition-all"
                              onClick={() => { setSelectedInvoice(inv); setShowInvoiceModal(true); }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-slate-900 hover:text-white border-slate-200"
                              onClick={() => window.print()}
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
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

      {/* Invoice Detail Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="border-0 shadow-2xl max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
                <FileText className="w-8 h-8 text-emerald-600" />
                Supplier Bill #{selectedInvoice?.bill_id || selectedInvoice?.invoiceID}
              </DialogTitle>
              <div className="flex gap-2">
                {selectedInvoice?.payment_status === 'unpaid' && (
                  <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200 mr-4">
                    <div className="flex flex-col gap-1">
                      <Label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Method</Label>
                      <Select value={paymentMethod} onValueChange={(val: any) => setPaymentMethod(val)}>
                        <SelectTrigger className="w-32 h-9 border-0 bg-transparent font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank">Bank</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {paymentMethod === 'bank' && (
                      <div className="flex flex-col gap-1 min-w-[200px] border-l pl-4">
                        <Label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Bank Account</Label>
                        <Select value={selectedBankId} onValueChange={setSelectedBankId}>
                          <SelectTrigger className="h-9 border-0 bg-transparent font-bold">
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent>
                            {bankAccounts.map(acc => (
                              <SelectItem key={acc._id || acc.id} value={acc._id || acc.id}>
                                {acc.bank_name} - {acc.account_number}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div className="border-l pl-4 flex gap-2">
                      <Button
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50 font-bold h-9"
                        onClick={() => handleReject(selectedInvoice._id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />} Reject
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-200 h-9"
                        onClick={() => handleAccept(selectedInvoice._id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />} Mark as Paid
                      </Button>
                    </div>
                  </div>
                )}
                <Button variant="outline" onClick={() => window.print()} className="border-slate-200">
                  <Printer className="w-4 h-4 mr-2" /> Print
                </Button>
              </div>
            </div>
          </DialogHeader>

          {selectedInvoice && (
            <div className="py-6 space-y-8">
              {/* Invoice Body */}
              <div className="bg-white p-8 border border-slate-100 rounded-3xl shadow-sm">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter italic">BILL</h2>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p><span className="font-bold text-slate-900 uppercase text-xs tracking-widest">PO Reference:</span> {selectedInvoice.purchaseOrderRef}</p>
                      <p><span className="font-bold text-slate-900 uppercase text-xs tracking-widest">Issue Date:</span> {new Date(selectedInvoice.date).toLocaleDateString()}</p>
                      {selectedInvoice.due_date && (
                        <p><span className="font-bold text-slate-900 uppercase text-xs tracking-widest">Due Date:</span> {new Date(selectedInvoice.due_date).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-emerald-600 text-xl mb-2">Supplier Portal</p>
                    <div className="text-xs text-slate-500 uppercase tracking-widest leading-loose">
                      <p>From: {selectedInvoice.supplierEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="p-5 bg-slate-50 rounded-2xl">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Bill From</h4>
                    <p className="font-bold text-slate-900">{selectedInvoice.supplierEmail}</p>
                  </div>
                  <div className="p-5 bg-emerald-50/50 rounded-2xl">
                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">Payment Status</h4>
                    <Badge className={`${getStatusColor(selectedInvoice.payment_status)} border-0 capitalize`}>
                      {selectedInvoice.payment_status}
                    </Badge>
                  </div>
                </div>

                {/* Items */}
                <div className="overflow-hidden rounded-2xl border border-slate-100 mb-8">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Item Description</th>
                        <th className="text-center p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Qty</th>
                        <th className="text-right p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Unit Price</th>
                        <th className="text-right p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                        selectedInvoice.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-4 font-bold text-slate-900">{item.itemName}</td>
                            <td className="p-4 text-center">{item.quantity}</td>
                            <td className="p-4 text-right">LKR {item.unitPrice.toLocaleString()}</td>
                            <td className="p-4 text-right font-black">LKR {item.totalPrice.toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-slate-400 italic">No items listed</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <div className="w-64 space-y-2 pt-4">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Subtotal</span>
                      <span>LKR {(selectedInvoice.subtotal || selectedInvoice.total).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Tax (10%)</span>
                      <span>LKR {(selectedInvoice.tax_amount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-900">
                      <span className="font-black uppercase text-xs tracking-widest">Total Amount</span>
                      <span className="text-2xl font-black text-emerald-600">LKR {selectedInvoice.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes / Rejection messages */}
              {selectedInvoice.notes && (
                <Card className="border-0 bg-amber-50 shadow-sm">
                  <CardContent className="pt-5">
                    <div className="flex items-start gap-3 text-amber-800">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-xs uppercase tracking-wider mb-1">Notes</p>
                        <p className="text-sm whitespace-pre-wrap">{selectedInvoice.notes}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
