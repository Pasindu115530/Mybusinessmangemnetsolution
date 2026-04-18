import { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Send,
  Save,
  X,
  CheckCircle,
  FileText,
  Package,
  ArrowLeft,
  ClipboardList,
  User,
  Building2,
  Hash,
  Calendar,
} from 'lucide-react';

interface PriceItem {
  id: number;
  itemName: string;
  quantity: number;
  unit: string;
  deliveryDate?: string;
  notes?: string;
  unitPrice: string;
  total: number;
}

export function AdminCreateQuotation() {
  const location = useLocation();
  const navigate = useNavigate();

  // Requirement passed from CustomerRequests page
  const requirement = (location.state as any)?.requirement;

  // Build price items from the requirement items
  const buildItems = (): PriceItem[] => {
    if (requirement?.items && requirement.items.length > 0) {
      return requirement.items.map((item: any, idx: number) => ({
        id: idx + 1,
        itemName: item.itemName || '',
        quantity: Number(item.quantity) || 1,
        unit: item.unit || 'pcs',
        deliveryDate: item.deliveryDate,
        notes: item.notes,
        unitPrice: '',
        total: 0,
      }));
    }
    return [];
  };

  const [items, setItems] = useState<PriceItem[]>(buildItems);

  const [quotationDetails, setQuotationDetails] = useState({
    quotationId: 'QT-' + Date.now().toString().slice(-6),
    creationDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    priority: 'medium',
  });

  const [generalNotes, setGeneralNotes] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Update unit price & recalculate total
  const updatePrice = (id: number, value: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const price = parseFloat(value) || 0;
        return { ...item, unitPrice: value, total: price * item.quantity };
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0.1;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

const handleSubmit = async (action: 'send' | 'draft') => {
  // 1. මූලික Validation
  if (items.some(item => !item.unitPrice || parseFloat(item.unitPrice) <= 0)) {
    alert('Please enter a unit price for all items');
    return;
  }
  if (!quotationDetails.expiryDate) {
    alert('Please set an expiry date');
    return;
  }

  // 2. Backend එකට අවශ්‍ය විදියට Data Object එක සකස් කිරීම
  const quotationData = {
    requirementId: requirement?.id || requirement?._id, // formatted as `id` from getAllRequirements
    items: items.map(item => ({
      itemName: item.itemName,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: parseFloat(item.unitPrice),
      totalPrice: item.total,
      description: item.notes || ""
    })),
    subtotal: subtotal,
    tax_amount: tax, // Backend එකේ නම tax_amount
    total_estimate: total, // Backend එකේ නම total_estimate
    currency: "LKR",
    notes: generalNotes,
    validUntil: quotationDetails.expiryDate,
    delivery_timeline: "3-5 Business Days", // අවශ්‍ය නම් මේවා input field වලින් ගන්න
    payment_terms: "Net 30",
    status: action === 'draft' ? 'draft' : 'pending'
  };

  try {
    // 3. API Call එක (ඔබේ API endpoint එක මෙතනට දාන්න)
    // සාමාන්‍යයෙන් ඔයාගේ backend එකේ route එක වෙන්නේ /api/quotations/create වගේ එකක්
    const token = localStorage.getItem('token'); // JWT Token එක තිබේ නම්
    
    const response = await axios.post('http://localhost:5900/api/quotations/create-supplier-quotation', quotationData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.data.success) {
      setShowSuccessModal(true);
    }
  } catch (error: any) {
    console.error("Submission Error:", error.response?.data || error.message);
    alert(error.response?.data?.message || "Something went wrong!");
  }
};

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-10">

        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-10 text-white shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-slate-900 to-slate-900" />
          <div className="relative z-10">
            <button
              onClick={() => navigate('/customer-requests')}
              className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Customer Requests
            </button>
            <span className="bg-violet-500/20 text-violet-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-violet-500/30 mb-3 inline-block">
              Admin Portal
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight">
              Create <span className="text-violet-400">Quotation</span>
            </h1>
            <p className="mt-2 text-slate-400 max-w-md">
              Set prices for the customer's requirement and send the quotation.
            </p>
          </div>
        </div>

        {/* Requirement Reference Card */}
        {requirement ? (
          <Card className="rounded-[24px] border-none shadow-xl overflow-hidden">
            <div className="bg-violet-600 px-8 py-4 flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-white" />
              <h3 className="text-white font-bold text-sm uppercase tracking-widest">Requirement Reference</h3>
            </div>
            <CardContent className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                    <Hash className="h-4 w-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Req ID</p>
                    <p className="text-sm font-black text-slate-900">{requirement.requirementId}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Customer</p>
                    <p className="text-sm font-black text-slate-900">{requirement.customerName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                    <Building2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Company</p>
                    <p className="text-sm font-black text-slate-900">{requirement.companyName || '—'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                    <Calendar className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Received On</p>
                    <p className="text-sm font-black text-slate-900">
                      {requirement.createdAt ? new Date(requirement.createdAt).toLocaleDateString() : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
            No requirement reference found. Please navigate from the Customer Requests page.
          </div>
        )}

        {/* Quotation Details */}
        <Card className="rounded-[24px] border-none shadow-xl overflow-hidden">
          <div className="bg-slate-900 px-8 py-4 flex items-center gap-3">
            <FileText className="h-5 w-5 text-violet-400" />
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">Quotation Details</h3>
          </div>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Quotation ID</Label>
                <Input
                  value={quotationDetails.quotationId}
                  disabled
                  className="mt-2 bg-slate-50 border-slate-200 font-bold text-slate-700"
                />
              </div>
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Creation Date</Label>
                <Input
                  type="date"
                  value={quotationDetails.creationDate}
                  disabled
                  className="mt-2 bg-slate-50 border-slate-200"
                />
              </div>
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Expiry Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={quotationDetails.expiryDate}
                  onChange={(e) => setQuotationDetails({ ...quotationDetails, expiryDate: e.target.value })}
                  className="mt-2 border-slate-200"
                  min={quotationDetails.creationDate}
                />
              </div>
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Priority</Label>
                <Select
                  value={quotationDetails.priority}
                  onValueChange={(value) => setQuotationDetails({ ...quotationDetails, priority: value })}
                >
                  <SelectTrigger className="mt-2 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Pricing Table */}
        <Card className="rounded-[24px] border-none shadow-xl overflow-hidden">
          <div className="bg-slate-900 px-8 py-4 flex items-center gap-3">
            <Package className="h-5 w-5 text-violet-400" />
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">Items — Enter Prices</h3>
          </div>
          <CardContent className="p-0">
            {items.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                No items found in this requirement.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="py-4 pl-8 text-[10px] font-black uppercase text-slate-400">#</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-slate-400">Item Name</TableHead>
                        <TableHead className="text-center text-[10px] font-black uppercase text-slate-400">Quantity</TableHead>
                        <TableHead className="text-center text-[10px] font-black uppercase text-slate-400">Unit</TableHead>
                        <TableHead className="text-center text-[10px] font-black uppercase text-slate-400">Delivery Date</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-slate-400">Notes</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-violet-600">Unit Price (Rs.) *</TableHead>
                        <TableHead className="text-right pr-8 text-[10px] font-black uppercase text-slate-400">Total (Rs.)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, idx) => (
                        <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="py-5 pl-8 font-bold text-slate-400">{idx + 1}</TableCell>

                          {/* Item Name — read-only */}
                          <TableCell>
                            <div className="text-sm font-bold text-slate-900">{item.itemName}</div>
                          </TableCell>

                          {/* Quantity — read-only */}
                          <TableCell className="text-center">
                            <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-3 py-1 text-sm font-black text-slate-700">
                              {item.quantity}
                            </span>
                          </TableCell>

                          {/* Unit — read-only */}
                          <TableCell className="text-center">
                            <span className="text-xs font-bold uppercase text-slate-500">{item.unit}</span>
                          </TableCell>

                          {/* Delivery Date — read-only */}
                          <TableCell className="text-center text-xs text-slate-500">
                            {item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString() : 'Immediate'}
                          </TableCell>

                          {/* Notes — read-only */}
                          <TableCell className="text-xs text-slate-400 max-w-[160px] truncate italic">
                            {item.notes || '—'}
                          </TableCell>

                          {/* Unit Price — EDITABLE */}
                          <TableCell>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">Rs.</span>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.unitPrice}
                                onChange={(e) => updatePrice(item.id, e.target.value)}
                                placeholder="0.00"
                                className="pl-9 border-violet-300 focus:border-violet-500 focus:ring-violet-200 font-bold w-36"
                              />
                            </div>
                          </TableCell>

                          {/* Total — calculated */}
                          <TableCell className="text-right pr-8">
                            <span className="font-black text-slate-900">
                              {item.total > 0 ? `Rs. ${item.total.toFixed(2)}` : '—'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Totals */}
                <div className="flex justify-end p-8 pt-4">
                  <div className="w-full md:w-80 space-y-3 rounded-2xl bg-slate-50 border border-slate-100 p-6">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-bold text-slate-900">Rs. {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Tax (VAT 10%)</span>
                      <span className="font-bold text-slate-900">Rs. {tax.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-slate-200" />
                    <div className="flex justify-between text-base">
                      <span className="font-black text-slate-900">Total</span>
                      <span className="font-black text-violet-600 text-lg">Rs. {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="rounded-[24px] border-none shadow-xl overflow-hidden">
          <div className="bg-slate-900 px-8 py-4 flex items-center gap-3">
            <FileText className="h-5 w-5 text-violet-400" />
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">Notes to Customer</h3>
          </div>
          <CardContent className="p-8">
            <Textarea
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Add any additional terms, delivery conditions, or special instructions..."
              className="min-h-32 border-slate-200 resize-none"
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => navigate('/customer-requests')}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl px-6"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={() => handleSubmit('draft')}
            className="bg-slate-700 hover:bg-slate-800 text-white rounded-xl px-6 shadow"
          >
            <Save className="w-4 h-4 mr-2" />
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSubmit('send')}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-6 shadow-lg shadow-violet-200"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Quotation
          </Button>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="border-0 shadow-2xl max-w-md rounded-3xl p-0 overflow-hidden">
          <div className="bg-slate-900 p-8 text-center">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-white text-2xl font-black">Quotation Sent!</DialogTitle>
            </DialogHeader>
            <p className="text-slate-400 text-sm mt-2">
              Quotation <span className="text-white font-bold">{quotationDetails.quotationId}</span> has been sent to{' '}
              <span className="text-white font-bold">{requirement?.customerName}</span>.
            </p>
          </div>
          <div className="p-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => { setShowSuccessModal(false); navigate('/customer-requests'); }}
              className="flex-1 rounded-xl"
            >
              Back to Requests
            </Button>
            <Button
              onClick={() => { setShowSuccessModal(false); navigate('/customer-quotations'); }}
              className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-700 text-white"
            >
              View Quotations
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
