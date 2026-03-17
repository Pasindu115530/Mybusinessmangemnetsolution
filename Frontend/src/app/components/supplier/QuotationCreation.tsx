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
  Send,
  Save,
  X,
  CheckCircle,
  FileText,
  DollarSign,
  Calendar,
  Package
} from 'lucide-react';

interface QuotationItem {
  id: number;
  itemName: string;
  quantity: number;
  unitPrice: string;
  total: number;
}

export function QuotationCreation() {
  const [items, setItems] = useState<QuotationItem[]>([
    { id: 1, itemName: 'Product A - Electronics', quantity: 500, unitPrice: '', total: 0 },
    { id: 2, itemName: 'Product B - Furniture', quantity: 300, unitPrice: '', total: 0 },
    { id: 3, itemName: 'Product C - Textiles', quantity: 200, unitPrice: '', total: 0 },
  ]);
  const [deliveryTimeline, setDeliveryTimeline] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('net30');
  const [notes, setNotes] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const updateItemPrice = (id: number, price: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const unitPrice = parseFloat(price) || 0;
        return { ...item, unitPrice: price, total: unitPrice * item.quantity };
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleSubmit = () => {
    setShowSuccessModal(true);
  };

  const handleReset = () => {
    setItems(items.map(item => ({ ...item, unitPrice: '', total: 0 })));
    setDeliveryTimeline('');
    setPaymentTerms('net30');
    setNotes('');
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
              <Send className="w-5 h-5" />
              <span className="text-green-100">Quotation Management</span>
            </div>
            <h1 className="text-3xl mb-2">Create Quotation</h1>
            <p className="text-green-100">Prepare and submit quotation for customer requirement</p>
          </div>
        </div>

        {/* Requirement Info */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Requirement Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-green-50 rounded-xl border-2 border-green-200">
              <div>
                <p className="text-sm text-slate-600">Requirement ID</p>
                <p className="text-slate-900">REQ-20240115</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Customer</p>
                <p className="text-slate-900">Acme Corp</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Expected Delivery</p>
                <p className="text-slate-900">2024-02-15</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quotation Items */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              Quotation Items
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price ($)</TableHead>
                    <TableHead>Total Price ($)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/50">
                      <TableCell className="text-slate-900">{item.itemName}</TableCell>
                      <TableCell className="text-slate-900">{item.quantity} units</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={item.unitPrice}
                          onChange={(e) => updateItemPrice(item.id, e.target.value)}
                          className="w-32 border-slate-200"
                        />
                      </TableCell>
                      <TableCell className="text-slate-900">
                        ${item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Summary */}
            <div className="mt-6 flex justify-end">
              <div className="bg-green-50 rounded-xl p-4 min-w-[300px]">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="text-slate-900">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax (10%):</span>
                    <span className="text-slate-900">${tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="border-t-2 border-green-200 pt-2 flex justify-between">
                    <span className="text-green-900">Total:</span>
                    <span className="text-green-900 text-xl">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Additional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Delivery Timeline *</Label>
                <Input
                  type="date"
                  value={deliveryTimeline}
                  onChange={(e) => setDeliveryTimeline(e.target.value)}
                  className="mt-2 border-slate-200"
                />
              </div>
              <div>
                <Label>Payment Terms *</Label>
                <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                  <SelectTrigger className="mt-2 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="net15">Net 15 Days</SelectItem>
                    <SelectItem value="net30">Net 30 Days</SelectItem>
                    <SelectItem value="net45">Net 45 Days</SelectItem>
                    <SelectItem value="net60">Net 60 Days</SelectItem>
                    <SelectItem value="advance">Advance Payment</SelectItem>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Notes / Terms & Conditions</Label>
              <Textarea
                placeholder="Add any additional notes, terms, or conditions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2 border-slate-200"
                rows={5}
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
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={subtotal === 0 || !deliveryTimeline}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Quotation
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
            <DialogTitle className="text-2xl mb-2">Quotation Submitted!</DialogTitle>
            <p className="text-slate-600 mb-6">
              Your quotation has been submitted successfully and sent to the customer for review.
            </p>
            <div className="bg-green-50 rounded-xl p-4 mb-6 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Requirement ID:</span>
                  <span className="text-slate-900">REQ-20240115</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Customer:</span>
                  <span className="text-slate-900">Acme Corp</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total Amount:</span>
                  <span className="text-slate-900">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Status:</span>
                  <span className="text-yellow-700">Awaiting Approval</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              View Quotation Status
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SupplierLayout>
  );
}
