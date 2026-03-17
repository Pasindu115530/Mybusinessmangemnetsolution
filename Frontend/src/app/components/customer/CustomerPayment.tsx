import { useState } from 'react';
import { CustomerLayout } from './CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import {
  CreditCard,
  Upload,
  FileText,
  CheckCircle,
  X,
  DollarSign,
  Save,
  Send,
  AlertCircle
} from 'lucide-react';

interface PendingInvoice {
  id: string;
  orderRef: string;
  amount: number;
  dueDate: string;
}

const pendingInvoices: PendingInvoice[] = [
  { id: 'INV-20240114', orderRef: 'ORD-20240114', amount: 22000, dueDate: '2024-02-13' },
  { id: 'INV-20240112', orderRef: 'ORD-20240112', amount: 18000, dueDate: '2024-02-11' },
];

export function CustomerPayment() {
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    setShowSuccessModal(true);
  };

  const handleReset = () => {
    setSelectedInvoice('');
    setPaymentMethod('bank');
    setTransactionId('');
    setNotes('');
    setUploadedFile(null);
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
              <CreditCard className="w-5 h-5" />
              <span className="text-blue-100">Payment Processing</span>
            </div>
            <h1 className="text-3xl mb-2">Payment</h1>
            <p className="text-blue-100">Submit payments for your invoices</p>
          </div>
        </div>

        {/* Pending Invoices */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Pending Invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {pendingInvoices.map((invoice) => (
                <div key={invoice.id} className="p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200 flex items-center justify-between">
                  <div>
                    <p className="text-slate-900">{invoice.id}</p>
                    <p className="text-sm text-slate-600">Order: {invoice.orderRef}</p>
                    <p className="text-sm text-slate-600">Due: {invoice.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl text-yellow-900">${invoice.amount.toLocaleString()}</p>
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 mt-1">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Submit Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <Label>Select Invoice *</Label>
              <Select value={selectedInvoice} onValueChange={setSelectedInvoice}>
                <SelectTrigger className="mt-1 border-slate-200">
                  <SelectValue placeholder="Choose invoice to pay..." />
                </SelectTrigger>
                <SelectContent>
                  {pendingInvoices.map((invoice) => (
                    <SelectItem key={invoice.id} value={invoice.id}>
                      {invoice.id} - ${invoice.amount.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedInvoice && (
              <>
                <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Invoice ID</p>
                      <p className="text-slate-900">{selectedInvoice}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Amount to Pay</p>
                      <p className="text-2xl text-blue-900">
                        ${pendingInvoices.find(i => i.id === selectedInvoice)?.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Payment Method *</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="mt-1 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="credit">Credit Card</SelectItem>
                      <SelectItem value="online">Online Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Transaction ID *</Label>
                  <Input
                    placeholder="Enter transaction reference number"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="mt-1 border-slate-200"
                  />
                </div>

                <div>
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    placeholder="Add any additional notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 border-slate-200"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Upload Payment Proof *</Label>
                  <div className="mt-2 border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 mb-2">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500 mb-3">PDF, PNG, JPG (Max 5MB)</p>
                    <input
                      type="file"
                      id="payment-proof"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="payment-proof">
                      <Button type="button" variant="outline" size="sm" className="cursor-pointer" onClick={() => document.getElementById('payment-proof')?.click()}>
                        Choose File
                      </Button>
                    </label>
                    {uploadedFile && (
                      <div className="mt-3 flex items-center justify-center gap-2 text-sm text-blue-700">
                        <FileText className="w-4 h-4" />
                        {uploadedFile.name}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
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
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedInvoice || !transactionId || !uploadedFile}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Payment
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
            <DialogTitle className="text-2xl mb-2">Payment Submitted!</DialogTitle>
            <p className="text-slate-600 mb-6">
              Your payment has been submitted for verification. You will receive a confirmation shortly.
            </p>
            <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Invoice:</span>
                  <span className="text-slate-900">{selectedInvoice}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Amount:</span>
                  <span className="text-slate-900">
                    ${pendingInvoices.find(i => i.id === selectedInvoice)?.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Method:</span>
                  <span className="text-slate-900 capitalize">{paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Status:</span>
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                    Pending Verification
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                handleReset();
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
}
