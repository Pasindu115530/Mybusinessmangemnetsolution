import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SupplierLayout } from './SupplierLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { toast } from 'sonner';
import {
  Send,
  Save,
  X,
  CheckCircle,
  FileText,
  DollarSign,
  Calendar,
  Package,
  Loader2,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';

interface QuotationItem {
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: string;
  totalPrice: number;
}

export function QuotationCreation() {
  const location = useLocation();
  const navigate = useNavigate();
  const stateData = location.state as { 
    requirementId?: string; 
    requirementRef?: string; 
    items?: any[] 
  } || {};

  const [items, setItems] = useState<QuotationItem[]>(
    stateData.items?.map(item => ({
      itemName: item.itemName,
      quantity: item.quantity,
      unit: item.unit || 'units',
      unitPrice: '',
      totalPrice: 0
    })) || [{ itemName: '', quantity: 1, unit: 'units', unitPrice: '', totalPrice: 0 }]
  );

  const [requirementId] = useState(stateData.requirementId || null);
  const [requirementRef] = useState(stateData.requirementRef || null);
  
  const [deliveryTimeline, setDeliveryTimeline] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('net30');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  const addItem = () => {
    setItems([...items, { itemName: '', quantity: 1, unit: 'units', unitPrice: '', totalPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    if (field === 'unitPrice' || field === 'quantity') {
      const price = parseFloat(field === 'unitPrice' ? value : item.unitPrice) || 0;
      const qty = parseFloat(field === 'quantity' ? value : item.quantity) || 0;
      item.totalPrice = price * qty;
    }
    
    newItems[index] = item;
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * 0.1; // 10% VAT
  const grandTotal = subtotal + tax;

  const getAuthHeader = () => {
    const token = localStorage.getItem('supplierToken') || localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleSubmit = async (status: 'pending' | 'draft' = 'pending') => {
    try {
      setIsSubmitting(true);
      const headers = getAuthHeader();
      
      const payload = {
        requirementId,
        items,
        subtotal,
        tax_amount: tax,
        total_estimate: grandTotal,
        notes,
        validUntil,
        delivery_timeline: deliveryTimeline,
        payment_terms: paymentTerms,
        status,
        currency: 'LKR'
      };

      const res = await axios.post('http://localhost:5900/api/suppliers/quotations', payload, { headers });
      
      setSubmittedData(res.data.quotation);
      if (status === 'pending') {
        setShowSuccessModal(true);
      } else {
        toast.success('Draft saved successfully');
        navigate('/supplier/quotations');
      }
    } catch (err: any) {
      console.error('Submission failed:', err);
      toast.error(err.response?.data?.message || 'Failed to submit quotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SupplierLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-8 text-white shadow-modern-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Send className="w-5 h-5" />
              <span className="text-green-100 uppercase tracking-wider text-xs font-bold">Quotation Builder</span>
            </div>
            <h1 className="text-3xl mb-2 font-black">Prepare Quotation</h1>
            <p className="text-green-100 opacity-90">
              {requirementRef ? `Responding to Requirement: ${requirementRef}` : 'Prepare a custom quotation for customer review'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Quotation Items */}
            <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
              <CardHeader className="bg-slate-50/80 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-600" />
                  Line Items
                </CardTitle>
                <Button variant="outline" size="sm" onClick={addItem} className="h-8 border-green-200 text-green-600 hover:bg-green-50">
                  <Plus className="w-4 h-4 mr-1" /> Add Item
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-0">
                      <TableHead className="w-[40%] font-bold text-xs pl-6">Item Name</TableHead>
                      <TableHead className="w-[15%] font-bold text-xs text-center">Qty</TableHead>
                      <TableHead className="w-[20%] font-bold text-xs">Unit Price</TableHead>
                      <TableHead className="w-[20%] font-bold text-xs text-right pr-6">Total</TableHead>
                      <TableHead className="w-[5%]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, idx) => (
                      <TableRow key={idx} className="border-slate-100 group">
                        <TableCell className="pl-6 py-4">
                          <Input 
                            value={item.itemName}
                            onChange={(e) => updateItem(idx, 'itemName', e.target.value)}
                            placeholder="Enter item name..."
                            className="bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-green-500 font-medium px-0"
                          />
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex flex-col items-center gap-1">
                            <Input 
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                              className="w-20 text-center font-bold border-slate-200"
                            />
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{item.unit}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="relative">
                            <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                            <Input 
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                              placeholder="0.00"
                              className="pl-7 font-mono font-bold border-slate-200"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-right pr-6 font-black text-slate-900">
                          ${item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="py-4 pr-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeItem(idx)}
                            className="h-8 w-8 p-0 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {items.length === 0 && (
                  <div className="py-12 text-center text-slate-400 italic">No items added. Click 'Add Item' to begin.</div>
                )}
              </CardContent>
            </Card>

            {/* Additional Terms */}
            <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
              <CardHeader className="bg-slate-50/80 border-b border-slate-100">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  Notes & Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">General Notes / Terms & Conditions</Label>
                    <Textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Specify warranty, quality standards, or any specific conditions..."
                      className="min-h-[150px] border-slate-200 rounded-xl focus:border-green-400 transition-colors"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Delivery & Validity */}
            <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
              <CardHeader className="bg-slate-50/80 border-b border-slate-100">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  Timeline & Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Valid Until *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="pl-10 border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Expected Delivery *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      type="date"
                      value={deliveryTimeline}
                      onChange={(e) => setDeliveryTimeline(e.target.value)}
                      className="pl-10 border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Payment Terms *</Label>
                  <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                    <SelectTrigger className="border-slate-200 rounded-xl h-11">
                      <SelectValue placeholder="Select terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="net15">Net 15 Days</SelectItem>
                      <SelectItem value="net30">Net 30 Days</SelectItem>
                      <SelectItem value="net45">Net 45 Days</SelectItem>
                      <SelectItem value="advance">50% Advance</SelectItem>
                      <SelectItem value="cod">Cash on Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Price Summary */}
            <Card className="modern-card border-0 shadow-modern-lg overflow-hidden bg-slate-900 text-white">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="font-bold font-mono">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">VAT / Tax (10%)</span>
                  <span className="font-bold font-mono">${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black uppercase text-green-400 tracking-widest">Grand Total</p>
                    <p className="text-3xl font-black text-white">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">LKR</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                onClick={() => handleSubmit('pending')}
                disabled={isSubmitting || items.length === 0 || !validUntil || !deliveryTimeline}
                className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-green-100"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit Quotation <Send className="w-4 h-4 ml-2" /></>}
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting || items.length === 0}
                className="w-full h-14 border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
              >
                <Save className="w-4 h-4 mr-2" /> Save as Draft
              </Button>
              <Button 
                variant="ghost"
                onClick={() => navigate(-1)}
                className="w-full text-slate-400 hover:text-red-500 hover:bg-red-50"
              >
                Discard Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="border-0 shadow-2xl max-w-md p-0 overflow-hidden">
          <div className="text-center p-8 bg-green-50">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-green-200/50">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900">Submission Successful!</DialogTitle>
            <p className="text-slate-500 mt-2">
              Your quotation has been sent to the customer and is now awaiting review.
            </p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Quote Reference</span>
                <span className="text-slate-900 font-mono font-bold">SQ-NEW</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Total Amount</span>
                <span className="text-green-600 font-black">${grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Status</span>
                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 h-5 px-2">Awaiting Review</Badge>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-3">
              <AlertCircle className="w-5 h-5 text-slate-400 shrink-0" />
              <p className="text-xs text-slate-500 leading-relaxed italic">
                You will be notified once the customer accepts or requests revisions for this quotation. You can track its status in your Quotations list.
              </p>
            </div>

            <Button
              onClick={() => navigate('/supplier/quotations')}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
            >
              Go to Quotations
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SupplierLayout>
  );
}