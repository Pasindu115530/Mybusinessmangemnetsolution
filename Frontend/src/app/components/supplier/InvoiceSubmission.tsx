import { useState } from 'react';
import { SupplierLayout } from './SupplierLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Receipt,
  Upload,
  FileText,
  CheckCircle,
  Send,
  X,
  Calendar,
  Hash
} from 'lucide-react';

interface InvoiceItem {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
}

const invoiceItems: InvoiceItem[] = [
  { id: 1, name: 'Product A - Electronics', quantity: 500, unitPrice: 250 },
  { id: 2, name: 'Product B - Furniture', quantity: 300, unitPrice: 180 },
  { id: 3, name: 'Product C - Textiles', quantity: 200, unitPrice: 45 },
];

export function InvoiceSubmission() {
  const [selectedOrder, setSelectedOrder] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const subtotal = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    setShowSuccessModal(true);
  };

  const handleReset = () => {
    setSelectedOrder('');
    setInvoiceNumber('');
    setInvoiceDate('');
    setNotes('');
    setUploadedFile(null);
  };

  return (
    <SupplierLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-8 text-white shadow-modern-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="w-5 h-5" />
              <span className="text-green-100">Invoice Management</span>
            </div>
            <h1 className="text-3xl mb-2">Invoice Submission</h1>
            <p className="text-green-100">Create and submit invoices for completed orders</p>
          </div>
        </div>

        {/* Invoice Details */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Invoice Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Select Order *</Label>
                <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                  <SelectTrigger className="mt-2 border-slate-200">
                    <SelectValue placeholder="Choose order..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ORD-20240115">ORD-20240115 - Acme Corp</SelectItem>
                    <SelectItem value="ORD-20240114">ORD-20240114 - XYZ Industries</SelectItem>
                    <SelectItem value="ORD-20240113">ORD-20240113 - Tech Solutions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Invoice Number *</Label>
                <Input
                  placeholder="INV-XXXX"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="mt-2 border-slate-200"
                />
              </div>
              <div>
                <Label>Invoice Date *</Label>
                <Input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="mt-2 border-slate-200"
                />
              </div>
              <div>
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  className="mt-2 border-slate-200"
                />
              </div>
            </div>

            {selectedOrder && (
              <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Order ID</p>
                    <p className="text-slate-900">{selectedOrder}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Customer</p>
                    <p className="text-slate-900">XYZ Industries</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Itemized List */}
        {selectedOrder && (
          <Card className="modern-card border-0 shadow-modern-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-green-600" />
                Itemized List
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoiceItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-slate-900">{item.name}</TableCell>
                        <TableCell className="text-slate-900">{item.quantity}</TableCell>
                        <TableCell className="text-slate-900">${item.unitPrice}</TableCell>
                        <TableCell className="text-slate-900">${(item.quantity * item.unitPrice).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6 flex justify-end">
                <div className="bg-green-50 rounded-xl p-4 min-w-[300px]">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal:</span>
                      <span className="text-slate-900">${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Tax (10%):</span>
                      <span className="text-slate-900">${tax.toLocaleString()}</span>
                    </div>
                    <div className="border-t-2 border-green-200 pt-2 flex justify-between">
                      <span className="text-green-900">Total Amount:</span>
                      <span className="text-green-900 text-xl">${total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Invoice PDF */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-green-600" />
              Upload Invoice PDF
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-green-400 hover:bg-green-50/50 transition-all">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-700 mb-2">Upload your invoice PDF</p>
              <p className="text-sm text-slate-500 mb-4">PDF format only (Max 10MB)</p>
              <input
                type="file"
                id="invoice-upload"
                className="hidden"
                accept=".pdf"
                onChange={handleFileUpload}
              />
              <label htmlFor="invoice-upload">
                <Button type="button" variant="outline" className="cursor-pointer" onClick={() => document.getElementById('invoice-upload')?.click()}>
                  Choose File
                </Button>
              </label>
              {uploadedFile && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200 flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-900">{uploadedFile.name}</span>
                </div>
              )}
            </div>

            <div>
              <Label>Additional Notes</Label>
              <Textarea
                placeholder="Add any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2 border-slate-200"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 justify-end">
              <Button
                variant="outline"
                onClick={handleReset}
                className="border-slate-300 hover:bg-slate-50"
              >
                <X className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedOrder || !invoiceNumber || !invoiceDate || !uploadedFile}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="border-0 shadow-2xl max-w-md">
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <DialogTitle className="text-2xl mb-2">Invoice Submitted!</DialogTitle>
            <p className="text-slate-600 mb-6">
              Your invoice has been submitted successfully and sent to the customer.
            </p>
            <div className="bg-green-50 rounded-xl p-4 mb-6 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Invoice Number:</span>
                  <span className="text-slate-900">{invoiceNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Order ID:</span>
                  <span className="text-slate-900">{selectedOrder}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total Amount:</span>
                  <span className="text-slate-900">${total.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Status:</span>
                  <span className="text-yellow-700">Awaiting Payment</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              View Payment Status
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SupplierLayout>
  );
}
