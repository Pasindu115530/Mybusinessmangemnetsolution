import { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { CreditCard, Loader2, Calendar, DollarSign, Search, Eye, CheckCircle, X, FileText, AlertCircle } from 'lucide-react';
import { Input } from '../ui/input';
import { toast } from 'sonner';

interface InvoiceItem {
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Invoice {
  _id: string;
  invoiceID: string;
  orderID: string;
  email: string;
  total: number;
  date: string;
  status: string;
  items: InvoiceItem[];
  subtotal?: number;
  tax_amount?: number;
  paymentMethod?: string;
  transactionID?: string;
  paymentProof?: string;
  notes?: string;
  updatedAt?: string;
}

export function CustomerPaymentsAdmin() {
  const [payments, setPayments] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5900/api/invoices');
      const paymentRecords = response.data.filter((i: any) => 
        i.invoiceType === 'customer' && (i.status === 'paid' || i.status === 'pending-verification' || i.transactionID)
      );
      setPayments(paymentRecords);
    } catch (err) {
      console.error("Error fetching payments:", err);
      toast.error("Failed to load payment transactions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleAcceptPayment = async (id: string) => {
    try {
      await axios.put(`http://localhost:5900/api/invoices/accept-payment/${id}`);
      toast.success("Payment accepted successfully");
      fetchPayments();
      setShowModal(false);
    } catch (err) {
      toast.error("Failed to accept payment");
    }
  };

  const handleRejectPayment = async (id: string) => {
    try {
      await axios.put(`http://localhost:5900/api/invoices/reject-payment/${id}`);
      toast.error("Payment rejected");
      fetchPayments();
      setShowModal(false);
    } catch (err) {
      toast.error("Failed to reject payment");
    }
  };

  const filteredPayments = payments.filter(p => 
    p.invoiceID.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.transactionID && p.transactionID.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>;
      case 'pending-verification':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200 animate-pulse">Pending Review</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Awaiting Proof</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-700 to-blue-800 p-8 text-white shadow-modern-lg">
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-indigo-100" />
              <span className="text-indigo-100 uppercase tracking-wider text-xs font-bold">Financial Records</span>
            </div>
            <h1 className="text-3xl mb-2">Payment Transactions</h1>
            <p className="text-indigo-100">Review and audit all customer payment history</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by Invoice, Email or TXN ID..." 
              className="pl-10 border-slate-200 h-12 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200" onClick={fetchPayments}>
            <Loader2 className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Log
          </Button>
        </div>

        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-slate-50/50 rounded-t-xl py-6">
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <DollarSign className="w-5 h-5 text-green-600" />
              Transaction Log
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="font-bold">Transaction Date</TableHead>
                    <TableHead className="font-bold">Invoice ID</TableHead>
                    <TableHead className="font-bold">Customer Email</TableHead>
                    <TableHead className="font-bold">Amount</TableHead>
                    <TableHead className="font-bold">TXN Ref</TableHead>
                    <TableHead className="font-bold text-center">Status</TableHead>
                    <TableHead className="text-right font-bold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-64 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                        <p className="text-slate-500 font-medium">Syncing transactions...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-slate-500 italic">
                        No transaction records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment._id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="text-slate-600 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {new Date(payment.updatedAt || payment.date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-slate-900">{payment.invoiceID}</TableCell>
                        <TableCell className="text-slate-900">{payment.email}</TableCell>
                        <TableCell className="text-slate-900 font-black">LKR {payment.total.toLocaleString()}</TableCell>
                        <TableCell className="font-mono text-xs text-blue-600 font-bold">{payment.transactionID || 'N/A'}</TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(payment.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="hover:bg-indigo-50 border-indigo-100 text-indigo-600 font-bold"
                            onClick={() => {
                              setSelectedInvoice(payment);
                              setShowModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" /> Verify
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

      {/* Verification Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
          <DialogHeader className="border-b pb-4 mb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
                <FileText className="w-8 h-8 text-blue-600" />
                Payment Verification
              </DialogTitle>
              <div className="flex gap-2">
                {selectedInvoice?.status === 'pending-verification' && (
                  <>
                    <Button 
                      variant="outline" 
                      className="border-red-200 text-red-600 hover:bg-red-50 font-bold"
                      onClick={() => handleRejectPayment(selectedInvoice._id)}
                    >
                      <X className="w-4 h-4 mr-2" /> Reject
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg"
                      onClick={() => handleAcceptPayment(selectedInvoice._id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Accept & Finalize
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>

          {selectedInvoice && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Payment Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Method</p>
                      <p className="font-bold text-slate-900 uppercase">{selectedInvoice.paymentMethod || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Reference ID</p>
                      <p className="font-mono font-bold text-blue-600">{selectedInvoice.transactionID || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Amount</p>
                      <p className="text-xl font-black text-slate-900">LKR {selectedInvoice.total.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Customer</p>
                      <p className="text-sm font-medium">{selectedInvoice.email}</p>
                    </div>
                  </div>
                  {selectedInvoice.notes && (
                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-xs text-slate-500 mb-1">Customer Notes</p>
                      <p className="text-sm italic text-slate-600">{selectedInvoice.notes}</p>
                    </div>
                  )}
                </div>

                <div className="border border-slate-100 rounded-3xl overflow-hidden">
                   <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="p-4 text-left">Item</th>
                          <th className="p-4 text-center">Qty</th>
                          <th className="p-4 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selectedInvoice.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-4 font-medium">{item.itemName}</td>
                            <td className="p-4 text-center">{item.quantity}</td>
                            <td className="p-4 text-right">LKR {item.totalPrice.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Submitted Proof</h3>
                {selectedInvoice.paymentProof ? (
                  <div className="aspect-auto min-h-[400px] bg-slate-100 rounded-3xl border-2 border-slate-200 overflow-hidden relative group">
                    <img 
                      src={`http://localhost:5900/${selectedInvoice.paymentProof.replace(/\\/g, '/')}`} 
                      alt="Proof" 
                      className="w-full h-full object-contain p-2"
                    />
                    <a 
                      href={`http://localhost:5900/${selectedInvoice.paymentProof.replace(/\\/g, '/')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold"
                    >
                      View Original Image
                    </a>
                  </div>
                ) : (
                  <div className="h-[400px] bg-slate-50 rounded-3xl flex flex-col items-center justify-center text-slate-400 italic">
                    <AlertCircle className="w-12 h-12 mb-2" />
                    No proof document uploaded
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
