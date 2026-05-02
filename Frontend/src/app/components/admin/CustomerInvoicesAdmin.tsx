import { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Receipt, Download, Eye, Loader2, Printer, Search, FileText, CheckCircle, X, CreditCard, AlertCircle } from 'lucide-react';
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
  date: string;
  total: number;
  status: string;
  items: InvoiceItem[];
  subtotal?: number;
  tax_amount?: number;
  paymentProof?: string;
  paymentMethod?: string;
  transactionID?: string;
  notes?: string;
}

export function CustomerInvoicesAdmin() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5900/api/invoices');
      setInvoices(response.data.filter((i: any) => i.invoiceType === 'customer'));
    } catch (err) {
      console.error("Error fetching invoices:", err);
      toast.error("Failed to load invoices");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceID.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.orderID.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'unpaid': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
      case 'pending-verification': return 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleAcceptPayment = async (id: string) => {
    try {
      await axios.put(`http://localhost:5900/api/invoices/accept-payment/${id}`);
      toast.success("Payment accepted successfully");
      fetchInvoices();
      setShowInvoiceModal(false);
    } catch (err) {
      toast.error("Failed to accept payment");
    }
  };

  const handleRejectPayment = async (id: string) => {
    try {
      await axios.put(`http://localhost:5900/api/invoices/reject-payment/${id}`);
      toast.error("Payment rejected");
      fetchInvoices();
      setShowInvoiceModal(false);
    } catch (err) {
      toast.error("Failed to reject payment");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 text-white shadow-modern-lg">
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="w-5 h-5 text-blue-100" />
              <span className="text-blue-100 uppercase tracking-wider text-xs font-bold">Billing Control</span>
            </div>
            <h1 className="text-3xl mb-2">Customer Invoices</h1>
            <p className="text-blue-100">Monitor and manage all customer billing records</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by ID, Order or Email..." 
              className="pl-10 border-slate-200 h-12 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-slate-200 h-12 rounded-xl px-6" onClick={fetchInvoices}>
            <Loader2 className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl py-6">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              Invoice Registry
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="font-bold">Invoice ID</TableHead>
                    <TableHead className="font-bold">Order ID</TableHead>
                    <TableHead className="font-bold">Customer Email</TableHead>
                    <TableHead className="font-bold">Amount</TableHead>
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="font-bold text-center">Status</TableHead>
                    <TableHead className="text-right font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-64 text-center text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                        Syncing with database...
                      </TableCell>
                    </TableRow>
                  ) : filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-slate-500 italic">
                        No billing records found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice._id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-slate-900">{invoice.invoiceID}</TableCell>
                        <TableCell className="text-slate-600">{invoice.orderID}</TableCell>
                        <TableCell className="text-slate-900">{invoice.email}</TableCell>
                        <TableCell className="text-slate-900 font-black">LKR {invoice.total.toLocaleString()}</TableCell>
                        <TableCell className="text-slate-600 text-sm">{new Date(invoice.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${getStatusColor(invoice.status)} capitalize border-2`}>
                            {invoice.status.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="hover:bg-blue-600 hover:text-white border-slate-200 transition-all"
                              onClick={() => handleViewInvoice(invoice)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Details
                            </Button>
                            <Button variant="outline" size="sm" className="hover:bg-slate-900 hover:text-white border-slate-200" onClick={handlePrint}>
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

      {/* Invoice Details Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="border-0 shadow-2xl max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
                <FileText className="w-8 h-8 text-blue-600" />
                Invoice #{selectedInvoice?.invoiceID}
              </DialogTitle>
              <div className="flex gap-2">
                {selectedInvoice?.status === 'pending-verification' && (
                  <>
                    <Button 
                      variant="outline" 
                      className="border-red-200 text-red-600 hover:bg-red-50 font-bold"
                      onClick={() => handleRejectPayment(selectedInvoice._id)}
                    >
                      <X className="w-4 h-4 mr-2" /> Reject Payment
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-200"
                      onClick={() => handleAcceptPayment(selectedInvoice._id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Accept Payment
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={handlePrint} className="border-slate-200">
                  <Printer className="w-4 h-4 mr-2" /> Print
                </Button>
              </div>
            </div>
          </DialogHeader>

          {selectedInvoice && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-6">
              <div className="lg:col-span-2 bg-white p-8 border border-slate-100 rounded-3xl shadow-sm print:p-0 print:border-0">
                {/* Visual Invoice Body */}
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter italic">INVOICE</h2>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p><span className="font-bold text-slate-900 uppercase text-xs tracking-widest">Order Reference:</span> {selectedInvoice.orderID}</p>
                      <p><span className="font-bold text-slate-900 uppercase text-xs tracking-widest">Issue Date:</span> {new Date(selectedInvoice.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-blue-600 text-xl mb-2">BMS Solutions</p>
                    <div className="text-xs text-slate-500 uppercase tracking-widest leading-loose">
                      <p>456 Enterprise Way</p>
                      <p>Colombo 07, Sri Lanka</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="p-5 bg-slate-50 rounded-2xl">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Billing To</h4>
                    <p className="font-bold text-slate-900">{selectedInvoice.email}</p>
                  </div>
                  <div className="p-5 bg-blue-50/50 rounded-2xl">
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Current Status</h4>
                    <Badge className={`${getStatusColor(selectedInvoice.status)} border-0`}>
                      {selectedInvoice.status}
                    </Badge>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-100 mb-8">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Item Description</th>
                        <th className="text-center p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Qty</th>
                        <th className="text-right p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Price</th>
                        <th className="text-right p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedInvoice.items && selectedInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-4 font-bold text-slate-900">{item.itemName}</td>
                          <td className="p-4 text-center">{item.quantity}</td>
                          <td className="p-4 text-right">LKR {item.unitPrice.toLocaleString()}</td>
                          <td className="p-4 text-right font-black">LKR {item.totalPrice.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <div className="w-64 space-y-2 pt-4">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Subtotal</span>
                      <span>LKR {selectedInvoice.subtotal?.toLocaleString() || selectedInvoice.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Tax (10%)</span>
                      <span>LKR {selectedInvoice.tax_amount?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-900">
                      <span className="font-black uppercase text-xs tracking-widest">Total Amount</span>
                      <span className="text-2xl font-black text-blue-600">LKR {selectedInvoice.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="modern-card border-0 shadow-lg bg-slate-50">
                  <CardHeader>
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Payment Proof
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedInvoice.paymentProof ? (
                      <div className="space-y-4">
                        <div className="aspect-square bg-white rounded-2xl border border-slate-200 overflow-hidden group relative">
                          <img 
                            src={`http://localhost:5900/${selectedInvoice.paymentProof.replace(/\\/g, '/')}`} 
                            alt="Payment Proof" 
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                              (e.target as any).src = 'https://via.placeholder.com/400?text=Payment+Proof+Document';
                            }}
                          />
                          <a 
                            href={`http://localhost:5900/${selectedInvoice.paymentProof.replace(/\\/g, '/')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold"
                          >
                            Open Full Size
                          </a>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500 italic">Method:</span>
                            <span className="font-bold text-slate-900 uppercase">{selectedInvoice.paymentMethod || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 italic">Transaction ID:</span>
                            <span className="font-mono font-bold text-blue-600">{selectedInvoice.transactionID || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-10 text-center text-slate-400 italic text-sm">
                        No payment proof has been uploaded yet for this invoice.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selectedInvoice.status === 'unpaid' && (
                   <Card className="border-0 shadow-lg bg-yellow-50">
                     <CardContent className="pt-6">
                        <div className="flex items-center gap-3 text-yellow-800">
                          <AlertCircle className="w-5 h-5 shrink-0" />
                          <p className="text-xs font-medium italic">Awaiting customer to upload payment documents.</p>
                        </div>
                     </CardContent>
                   </Card>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
