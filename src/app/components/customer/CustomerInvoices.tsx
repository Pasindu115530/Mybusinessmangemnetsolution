import { useState } from 'react';
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
  CheckCircle
} from 'lucide-react';

interface Invoice {
  id: string;
  orderRef: string;
  date: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'overdue';
}

const invoices: Invoice[] = [
  { id: 'INV-20240115', orderRef: 'ORD-20240115', date: '2024-01-15', amount: 15000, status: 'paid' },
  { id: 'INV-20240114', orderRef: 'ORD-20240114', date: '2024-01-14', amount: 22000, status: 'unpaid' },
  { id: 'INV-20240113', orderRef: 'ORD-20240113', date: '2024-01-13', amount: 8500, status: 'paid' },
  { id: 'INV-20240112', orderRef: 'ORD-20240112', date: '2024-01-12', amount: 18000, status: 'overdue' },
];

const invoiceItems = [
  { id: 1, name: 'Product A - Electronics', quantity: 500, unitPrice: 250 },
  { id: 2, name: 'Product B - Furniture', quantity: 300, unitPrice: 180 },
  { id: 3, name: 'Product C - Textiles', quantity: 200, unitPrice: 45 },
];

export function CustomerInvoices() {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  const handleViewInvoice = (id: string) => {
    setSelectedInvoice(id);
    setShowInvoiceModal(true);
  };

  const handleDownload = () => {
    alert('Invoice downloaded successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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
            <p className="text-blue-100">View and download your invoices</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Paid</h3>
              <p className="text-2xl text-slate-900">{invoices.filter(i => i.status === 'paid').length}</p>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Unpaid</h3>
              <p className="text-2xl text-slate-900">{invoices.filter(i => i.status === 'unpaid').length}</p>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Overdue</h3>
              <p className="text-2xl text-slate-900">{invoices.filter(i => i.status === 'overdue').length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Invoices Table */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              All Invoices
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="text-slate-900">{invoice.id}</TableCell>
                      <TableCell className="text-slate-600">{invoice.orderRef}</TableCell>
                      <TableCell className="text-slate-600">{invoice.date}</TableCell>
                      <TableCell className="text-slate-900">${invoice.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => handleViewInvoice(invoice.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="hover:bg-green-50 hover:text-green-600"
                            onClick={handleDownload}
                          >
                            <Download className="w-4 h-4" />
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
      </div>

      {/* Invoice Preview Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="border-0 shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Invoice Preview
              </DialogTitle>
              <Button variant="outline" onClick={handleDownload}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </DialogHeader>
          
          {/* Invoice Template */}
          <div className="bg-white p-8 border border-slate-200 rounded-lg">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl text-slate-900 mb-2">INVOICE</h2>
                <div className="text-sm text-slate-600">
                  <p>Invoice #: INV-20240114</p>
                  <p>Date: January 14, 2024</p>
                  <p>Order #: ORD-20240114</p>
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-xl text-slate-900 mb-2">Supplier Company</h3>
                <div className="text-sm text-slate-600">
                  <p>456 Supplier Avenue</p>
                  <p>New York, NY 10002</p>
                  <p>Phone: +1 234 567 8901</p>
                </div>
              </div>
            </div>

            <div className="mb-8 p-4 bg-slate-50 rounded-lg">
              <h4 className="text-sm text-slate-600 mb-2">BILL TO:</h4>
              <div className="text-slate-900">
                <p className="font-medium">Your Company Name</p>
                <p className="text-sm">123 Business Street, Suite 400</p>
                <p className="text-sm">New York, NY 10001</p>
              </div>
            </div>

            <table className="w-full mb-8">
              <thead>
                <tr className="border-b-2 border-slate-300">
                  <th className="text-left py-3 text-sm text-slate-600">ITEM</th>
                  <th className="text-right py-3 text-sm text-slate-600">QTY</th>
                  <th className="text-right py-3 text-sm text-slate-600">UNIT PRICE</th>
                  <th className="text-right py-3 text-sm text-slate-600">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.map((item) => (
                  <tr key={item.id} className="border-b border-slate-200">
                    <td className="py-3 text-sm text-slate-900">{item.name}</td>
                    <td className="py-3 text-sm text-slate-900 text-right">{item.quantity}</td>
                    <td className="py-3 text-sm text-slate-900 text-right">${item.unitPrice}</td>
                    <td className="py-3 text-sm text-slate-900 text-right">${(item.quantity * item.unitPrice).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-8">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="text-slate-900">$134,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax (10%):</span>
                  <span className="text-slate-900">$13,400</span>
                </div>
                <div className="border-t-2 border-slate-300 pt-2 flex justify-between">
                  <span className="text-slate-900">TOTAL:</span>
                  <span className="text-slate-900 text-xl">$147,400</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 text-sm text-slate-600 text-center">
              <p>Thank you for your business!</p>
              <p className="mt-2">Payment due within 30 days.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
}
