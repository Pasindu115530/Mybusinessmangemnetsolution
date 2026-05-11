import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SupplierLayout } from './SupplierLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import {
  Receipt,
  FileText,
  CheckCircle,
  Send,
  X,
  Loader2,
  AlertCircle,
  Calendar,
  Package,
  Banknote,
  ArrowRight,
  History,
  RefreshCw
} from 'lucide-react';

interface InvoiceableOrder {
  id: string;
  po_id: string;
  customerName: string;
  label: string;
}

interface OrderDetail {
  _id: string;
  po_id: string;
  name: string;
  total: number;
  items: {
    name: string;
    receivedQuantity: number;
    price: number;
  }[];
}

export function InvoiceSubmission() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<InvoiceableOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedBillId, setSubmittedBillId] = useState('');
  const [submittedInvoices, setSubmittedInvoices] = useState<SupplierInvoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);

  const getAuthHeader = () => {
    const token = localStorage.getItem('supplierToken') || localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoadingOrders(true);
        const res = await axios.get('http://localhost:5900/api/supplier-orders/invoiceable-orders', {
          headers: getAuthHeader(),
        });
        setOrders(res.data.orders || []);
      } catch (err: any) {
        console.error('Failed to load orders:', err);
        toast.error(err.response?.data?.message || 'Failed to load available orders');
      } finally {
        setIsLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsLoadingInvoices(true);
      const res = await axios.get('http://localhost:5900/api/supplier-invoices/my', {
        headers: getAuthHeader(),
      });
      setSubmittedInvoices(res.data.invoices || []);
    } catch (err) {
      console.error('Failed to load submitted invoices:', err);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    if (!selectedOrder) {
      setSelectedOrderDetail(null);
      return;
    }
    const fetchDetail = async () => {
      try {
        setIsLoadingDetail(true);
        const found = orders.find(o => o.po_id === selectedOrder);
        if (!found) return;
        const res = await axios.get(`http://localhost:5900/api/supplier-orders/${found.id}`, {
          headers: getAuthHeader(),
        });
        setSelectedOrderDetail(res.data.order || res.data);
      } catch (err) {
        console.error('Failed to load order detail:', err);
      } finally {
        setIsLoadingDetail(false);
      }
    };
    fetchDetail();
  }, [selectedOrder, orders]);

  const computedItems = selectedOrderDetail?.items?.map(item => ({
    name: item.name,
    qty: item.receivedQuantity || 0,
    price: item.price || 0,
    total: (item.receivedQuantity || 0) * (item.price || 0),
  })) || [];

  const subtotal = computedItems.reduce((s, i) => s + i.total, 0);
  const tax = subtotal * 0.1;
  const grandTotal = subtotal + tax;

  const handleSubmit = async () => {
    if (!selectedOrder || !dueDate) {
      toast.error('Please select an order and set a due date');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        purchaseOrderRef: selectedOrder,
        items: computedItems.map(i => ({
          itemName: i.name,
          quantity: i.qty,
          unitPrice: i.price,
          totalPrice: i.total,
        })),
        subtotal,
        tax_amount: tax,
        total: grandTotal,
        due_date: dueDate,
        notes,
      };

      const res = await axios.post('http://localhost:5900/api/supplier-invoices', payload, {
        headers: getAuthHeader(),
      });

      setSubmittedBillId(res.data.invoice?.bill_id || 'N/A');
      setShowSuccessModal(true);
      fetchInvoices(); // Refresh the list
      // Also refresh orders to remove the one just invoiced
      const resOrders = await axios.get('http://localhost:5900/api/supplier-orders/invoiceable-orders', {
        headers: getAuthHeader(),
      });
      setOrders(resOrders.data.orders || []);
    } catch (err: any) {
      console.error('Submit error:', err);
      toast.error(err.response?.data?.message || 'Failed to submit invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedOrder('');
    setSelectedOrderDetail(null);
    setDueDate('');
    setNotes('');
  };

  return (
    <SupplierLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-8 text-white shadow-modern-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="w-5 h-5" />
              <span className="text-green-100 uppercase tracking-wider text-xs font-bold font-mono">Financials</span>
            </div>
            <h1 className="text-3xl mb-2 font-black">Invoice Submission</h1>
            <p className="text-green-100 opacity-90">Generate and submit bills for your successfully dispatched orders</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Selection */}
            <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
              <CardHeader className="bg-slate-50/80 border-b border-slate-100">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  Order Context
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select Purchase Order *</Label>
                    {isLoadingOrders ? (
                      <div className="flex items-center gap-2 text-slate-400 text-xs py-3">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading orders...
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-700 text-xs italic">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        No orders available for invoicing. Ensure orders are marked as 'Delivered' or 'Dispatched'.
                      </div>
                    ) : (
                      <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                        <SelectTrigger className="border-slate-200 h-12 rounded-xl">
                          <SelectValue placeholder="Choose a PO..." />
                        </SelectTrigger>
                        <SelectContent>
                          {orders.map(o => (
                            <SelectItem key={o.id} value={o.po_id}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Payment Due Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="date"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                        className="pl-10 border-slate-200 h-12 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {selectedOrder && selectedOrderDetail && (
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Package className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Verified Order Ref</p>
                      <p className="text-sm font-black text-slate-900">{selectedOrderDetail.po_id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Customer</p>
                      <p className="text-sm font-bold text-slate-700">{selectedOrderDetail.name || 'Hardware Admin'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Itemized List */}
            {selectedOrder && (
              <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
                <CardHeader className="bg-slate-50/80 border-b border-slate-100">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-green-600" />
                    Billable Line Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoadingDetail ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                      <p className="text-xs font-bold uppercase tracking-widest">Extracting order data...</p>
                    </div>
                  ) : computedItems.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 italic text-sm">No confirmed items found.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-0">
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 pl-6">Item Description</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 text-center">Qty Received</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 text-right">Unit Price</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 text-right pr-6">Subtotal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {computedItems.map((item, idx) => (
                            <TableRow key={idx} className="border-slate-100">
                              <TableCell className="pl-6 py-4 font-bold text-slate-700">{item.name}</TableCell>
                              <TableCell className="text-center font-black text-slate-400">{item.qty}</TableCell>
                              <TableCell className="text-right text-slate-600 text-xs">LKR {item.price.toLocaleString()}</TableCell>
                              <TableCell className="text-right font-black text-slate-900 pr-6">LKR {item.total.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
              <CardHeader className="bg-slate-50/80 border-b border-slate-100">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600">Administrative Notes</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  placeholder="Payment instructions, bank details, or delivery remarks..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="border-slate-200 min-h-[120px] rounded-xl focus:border-green-400 transition-colors"
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Financial Panel */}
            <Card className="modern-card border-0 shadow-modern-lg overflow-hidden bg-slate-900 text-white sticky top-6">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Invoice Totals</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="font-bold font-mono">LKR {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Estimated Tax (10%)</span>
                    <span className="font-bold font-mono">LKR {tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-white/10">
                  <p className="text-[10px] font-black uppercase text-green-400 tracking-widest mb-1">Grand Total</p>
                  <p className="text-4xl font-black text-white">LKR {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>

                <div className="pt-6 space-y-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedOrder || !dueDate || computedItems.length === 0 || isSubmitting}
                    className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-green-900/20 disabled:opacity-50 transition-all"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>Finalize & Submit <Send className="w-4 h-4 ml-2" /></>
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleReset} 
                    className="w-full text-slate-400 hover:text-white hover:bg-white/5 font-bold"
                  >
                    Reset Form
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex gap-3">
              <AlertCircle className="w-5 h-5 text-slate-400 shrink-0" />
              <p className="text-[10px] text-slate-500 leading-relaxed italic">
                Invoices can only be created for orders that have been successfully dispatched or delivered. Ensure the customer has acknowledged the items before billing.
              </p>
            </div>
          </div>
        </div>

        {/* Recently Submitted Table */}
        <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
          <CardHeader className="bg-slate-50/80 border-b border-slate-100 flex flex-row items-center justify-between py-4">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
              <History className="w-4 h-4 text-green-600" />
              Recent Invoice Submissions
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchInvoices} disabled={isLoadingInvoices}>
              <RefreshCw className={`w-4 h-4 ${isLoadingInvoices ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-0">
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 pl-6">Bill ID</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400">PO Ref</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Date</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 text-right">Amount</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingInvoices ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-green-600" />
                      </TableCell>
                    </TableRow>
                  ) : submittedInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-slate-400 italic">No previous submissions found.</TableCell>
                    </TableRow>
                  ) : (
                    submittedInvoices.slice(0, 5).map((inv) => (
                      <TableRow key={inv._id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <TableCell className="pl-6 py-4 font-mono text-[10px] font-bold text-slate-900">{inv.bill_id}</TableCell>
                        <TableCell className="text-xs font-medium text-slate-600">{inv.purchaseOrderRef}</TableCell>
                        <TableCell className="text-xs text-slate-500">{new Date(inv.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right font-black text-slate-900">LKR {inv.total.toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={`capitalize border ${
                            inv.payment_status === 'paid' ? 'bg-green-100 text-green-700 border-green-200' : 
                            'bg-yellow-100 text-yellow-700 border-yellow-200'
                          }`}>
                            {inv.payment_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {submittedInvoices.length > 5 && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <Button variant="link" className="text-xs font-bold text-green-600" onClick={() => navigate('/supplier/payments')}>
                  View All Submissions <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>


      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="border-0 shadow-2xl max-w-md p-0 overflow-hidden">
          <div className="text-center p-10 bg-green-50">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200/50">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <DialogTitle className="text-3xl font-black text-slate-900">Invoice Created!</DialogTitle>
            <p className="text-slate-500 mt-2">
              Your billing request has been processed and sent for administrative verification.
            </p>
          </div>
          
          <div className="p-10 space-y-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Invoice ID</span>
                <span className="font-mono font-bold text-slate-900">{submittedBillId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Total Bill</span>
                <span className="font-black text-green-600 text-lg">LKR {grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Status</span>
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 h-6">Awaiting Review</Badge>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl font-bold"
                onClick={() => { setShowSuccessModal(false); handleReset(); }}
              >
                Submit New
              </Button>
              <Button
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white h-12 rounded-xl font-bold shadow-lg"
                onClick={() => navigate('/supplier/payments')}
              >
                View History <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SupplierLayout>
  );
}
