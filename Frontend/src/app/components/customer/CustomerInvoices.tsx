import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CustomerLayout } from './CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Receipt,
  Download,
  Eye,
  FileText,
  DollarSign,
  Calendar,
  Hash,
  Printer,
  CheckCircle,
  Loader2,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
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
  date: string;
  total: number;
  status: string;
  items: InvoiceItem[];
  subtotal?: number;
  tax_amount?: number;
}

interface Order {
  _id: string;
  orderID: string;
  status: string;
  orderDate: string;
  totalAmount: number;
  invoiced: boolean;
  items: any[];
}

export function CustomerInvoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const userDataString = localStorage.getItem('user');
  const userData = userDataString ? JSON.parse(userDataString) : null;
  const userEmail = userData?.email || localStorage.getItem('userEmail');
  const customerId = userData?.id || userData?._id || localStorage.getItem('customID') || localStorage.getItem('customerId');

  const fetchData = async () => {
    console.log("Fetching data for:", { userEmail, customerId });
    
    if (!customerId) {
      console.warn("Missing Customer ID identifier");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // 1. Fetch orders first (we can use ID)
      const orderResponse = await axios.get(`http://localhost:5900/api/orders/customer/${customerId}`);
      console.log("Orders received:", orderResponse.data);
      
      const orders = orderResponse.data;
      const deliveredNotInvoiced = orders.filter((o: Order) => 
        o.status.toLowerCase() === 'delivered' && !o.invoiced
      );
      setPendingOrders(deliveredNotInvoiced);

      // 2. Recover email if missing
      let effectiveEmail = userEmail;
      if (!effectiveEmail && orders.length > 0) {
        effectiveEmail = orders[0].email;
        console.log("Recovered email from orders:", effectiveEmail);
      }

      // 3. Fetch invoices if we have an email
      if (effectiveEmail) {
        const invResponse = await axios.get(`http://localhost:5900/api/invoices/customer/${effectiveEmail}`);
        console.log("Invoices received:", invResponse.data);
        setInvoices(invResponse.data);
      } else {
        console.warn("No email found to fetch invoices");
      }

    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load invoice data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userEmail, customerId]);

  const handleGenerateInvoice = async (orderId: string) => {
    try {
      setIsGenerating(orderId);
      await axios.post(`http://localhost:5900/api/invoices/create-from-order/${orderId}`);
      toast.success("Invoice generated successfully");
      fetchData(); // Refresh both lists
    } catch (err) {
      console.error("Error generating invoice:", err);
      toast.error("Failed to generate invoice");
    } finally {
      setIsGenerating(null);
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handleDownload = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'unpaid':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading && invoices.length === 0 && pendingOrders.length === 0) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 text-white shadow-modern-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="w-5 h-5" />
              <span className="text-blue-100">Billing Management</span>
            </div>
            <h1 className="text-3xl mb-2">Invoices</h1>
            <p className="text-blue-100">View and manage your billing history</p>
          </div>
          {/* Diagnostic info for debugging */}
          {(!userEmail || !customerId) && (
             <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-xs font-mono">
               Status: Missing User Info | Email: {userEmail || 'NULL'} | ID: {customerId || 'NULL'}
             </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Paid Invoices</h3>
              <p className="text-2xl font-bold text-slate-900">{invoices?.filter(i => i.status.toLowerCase() === 'paid').length || 0}</p>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Unpaid Invoices</h3>
              <p className="text-2xl font-bold text-slate-900">{invoices?.filter(i => i.status.toLowerCase() === 'unpaid').length || 0}</p>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Awaiting Generation</h3>
              <p className="text-2xl font-bold text-slate-900">{pendingOrders?.length || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Deliveries Awaiting Invoice */}
        {pendingOrders.length > 0 && (
          <Card className="modern-card border-0 shadow-modern-lg border-l-4 border-blue-500">
            <CardHeader className="bg-blue-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <PlusCircle className="w-5 h-5" />
                Deliveries Awaiting Invoice
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Order ID</TableHead>
                      <TableHead>Delivery Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">{order.orderID}</TableCell>
                        <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-700 border-green-200">Received</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            onClick={() => handleGenerateInvoice(order._id)}
                            disabled={isGenerating === order._id}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {isGenerating === order._id ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <FileText className="w-4 h-4 mr-2" />
                            )}
                            Generate Invoice
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Invoices Table */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              Invoice History
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Order Ref</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                        No invoices found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <TableRow key={invoice._id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-medium text-slate-900">{invoice.invoiceID}</TableCell>
                        <TableCell className="text-slate-600">{invoice.orderID}</TableCell>
                        <TableCell className="text-slate-600">{new Date(invoice.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-slate-900 font-bold">LKR {invoice.total.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="hover:bg-blue-50 hover:text-blue-600 border-slate-200"
                              onClick={() => handleViewInvoice(invoice)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            {invoice.status.toLowerCase() === 'unpaid' && (
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                onClick={() => navigate(`/customer/payment?invoiceId=${invoice.invoiceID}`)}
                              >
                                <DollarSign className="w-4 h-4 mr-1" />
                                Pay Now
                              </Button>
                            )}
                            <Button variant="outline" size="sm" className="hover:bg-slate-50 border-slate-200" onClick={handleDownload}>
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

      {/* Invoice Preview Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="border-0 shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <FileText className="w-6 h-6 text-blue-600" />
                Invoice Details
              </DialogTitle>
              <Button variant="outline" onClick={handleDownload} className="border-slate-200">
                <Printer className="w-4 h-4 mr-2" />
                Print Invoice
              </Button>
            </div>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="bg-white p-8 border border-slate-100 rounded-xl shadow-sm mt-4 print:p-0 print:border-0">
              <div className="flex justify-between items-start mb-10 pb-10 border-b border-slate-100">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">INVOICE</h2>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p className="flex gap-2"><span className="font-bold w-20 text-slate-900">Invoice #:</span> {selectedInvoice.invoiceID}</p>
                    <p className="flex gap-2"><span className="font-bold w-20 text-slate-900">Date:</span> {new Date(selectedInvoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="flex gap-2"><span className="font-bold w-20 text-slate-900">Order #:</span> {selectedInvoice.orderID}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-2 mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg">
                    <Receipt className="w-5 h-5" />
                    <span className="text-xl font-bold">Business Management Solution</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    <p>456 Enterprise Way</p>
                    <p>Colombo 07, Sri Lanka</p>
                    <p>Phone: +94 11 234 5678</p>
                    <p>Email: billing@bms.com</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="p-6 bg-slate-50 rounded-2xl">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">BILL TO:</h4>
                  <div className="text-slate-900">
                    <p className="font-bold text-lg">{userData?.name || "Valued Customer"}</p>
                    <p className="text-sm text-slate-600">{userData?.email}</p>
                    <p className="text-sm text-slate-600">{userData?.address || "Address on file"}</p>
                  </div>
                </div>
                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                  <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3">PAYMENT STATUS:</h4>
                  <div className="flex flex-col gap-2">
                    <Badge className={`w-fit text-base py-1 px-4 ${getStatusColor(selectedInvoice.status)}`}>
                      {selectedInvoice.status.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-slate-500 mt-1">Due Date: {new Date(new Date(selectedInvoice.date).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-100 mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left p-4 text-xs font-black text-slate-500 uppercase tracking-wider">DESCRIPTION</th>
                      <th className="text-center p-4 text-xs font-black text-slate-500 uppercase tracking-wider">QTY</th>
                      <th className="text-right p-4 text-xs font-black text-slate-500 uppercase tracking-wider">UNIT PRICE</th>
                      <th className="text-right p-4 text-xs font-black text-slate-500 uppercase tracking-wider">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{item.itemName}</p>
                        </td>
                        <td className="p-4 text-center text-slate-600">{item.quantity}</td>
                        <td className="p-4 text-right text-slate-600">LKR {item.unitPrice.toLocaleString()}</td>
                        <td className="p-4 text-right font-bold text-slate-900">LKR {item.totalPrice.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="w-80 space-y-3 p-6 bg-slate-50 rounded-2xl">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 font-medium">Subtotal</span>
                    <span className="text-slate-900 font-bold">LKR {selectedInvoice.subtotal?.toLocaleString() || selectedInvoice.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 font-medium">Tax (10%)</span>
                    <span className="text-slate-900 font-bold">LKR {selectedInvoice.tax_amount?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-lg font-black text-slate-900 uppercase">Grand Total</span>
                    <span className="text-2xl font-black text-blue-600">LKR {selectedInvoice.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                <p className="text-slate-900 font-bold mb-1">Thank you for your business!</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest">Please process payment within 30 days</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
}
