import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CustomerLayout } from './CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import {
  CreditCard,
  Upload,
  FileText,
  CheckCircle,
  X,
  DollarSign,
  Save,
  Send,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Invoice {
  _id: string;
  invoiceID: string;
  orderID: string;
  total: number;
  date: string;
  due_date?: string;
  status: string;
}

export function CustomerPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedInvoiceID, setSelectedInvoiceID] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const email = userData.email || localStorage.getItem('userEmail');
        
        if (!email) {
          toast.error("User email not found. Please log in again.");
          return;
        }

        const res = await axios.get(`http://localhost:5900/api/invoices/customer/${email}`);
        const unpaid = res.data.filter((i: Invoice) => i.status.toLowerCase() === 'unpaid');
        setInvoices(unpaid);

        // Check for invoiceId in URL
        const queryParams = new URLSearchParams(location.search);
        const urlInvoiceId = queryParams.get('invoiceId');
        if (urlInvoiceId && unpaid.some((i: Invoice) => i.invoiceID === urlInvoiceId)) {
          setSelectedInvoiceID(urlInvoiceId);
        }
      } catch (err) {
        console.error("Error fetching invoices:", err);
        toast.error("Failed to load pending invoices");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [location.search]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    console.log("Submit clicked", { selectedInvoiceID, transactionId, hasFile: !!uploadedFile });
    
    if (!selectedInvoiceID || !transactionId || !uploadedFile) {
      toast.error("Please fill all required fields and upload proof");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('paymentMethod', paymentMethod);
      formData.append('transactionID', transactionId);
      formData.append('notes', notes);
      formData.append('paymentProof', uploadedFile);

      console.log("Sending request to backend...");
      const response = await axios.post(`http://localhost:5900/api/invoices/${selectedInvoiceID}/payment`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log("Backend response:", response.data);

      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Payment submission error:", err);
      toast.error(err.response?.data?.message || "Failed to submit payment details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedInvoiceID('');
    setPaymentMethod('online');
    setTransactionId('');
    setNotes('');
    setUploadedFile(null);
  };

  const selectedInvoiceData = invoices.find(i => i.invoiceID === selectedInvoiceID);

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 text-white shadow-modern-lg">
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5" />
              <span className="text-blue-100 uppercase tracking-wider text-xs font-bold">Secure Settlement</span>
            </div>
            <h1 className="text-3xl mb-2">Complete Payment</h1>
            <p className="text-blue-100">Upload your proof of payment for verification</p>
          </div>
        </div>

        {/* Pending Invoices Quick View */}
        {!isLoading && invoices.length > 0 && !selectedInvoiceID && (
          <Card className="modern-card border-0 shadow-modern-lg">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest">Awaiting Payment</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {invoices.map((inv) => (
                <div 
                  key={inv._id} 
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-all"
                  onClick={() => setSelectedInvoiceID(inv.invoiceID)}
                >
                  <p className="font-bold text-slate-900">{inv.invoiceID}</p>
                  <p className="text-2xl font-black text-blue-600 my-2">LKR {inv.total.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">Order: {inv.orderID}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="border-b border-slate-50">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">Select Invoice to Pay</Label>
                  <Select value={selectedInvoiceID} onValueChange={setSelectedInvoiceID}>
                    <SelectTrigger className="border-slate-200 h-12">
                      <SelectValue placeholder="Choose an unpaid invoice..." />
                    </SelectTrigger>
                    <SelectContent>
                      {invoices.map((inv) => (
                        <SelectItem key={inv._id} value={inv.invoiceID}>
                          {inv.invoiceID} — LKR {inv.total.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="border-slate-200 h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online Bank Transfer</SelectItem>
                        <SelectItem value="cheque">Cheque Deposit</SelectItem>
                        <SelectItem value="other">Other Method</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">Transaction/Reference ID</Label>
                    <Input
                      placeholder="e.g. TXN123456789"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="border-slate-200 h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">Notes</Label>
                  <Textarea
                    placeholder="Any additional information about this payment..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="border-slate-200 min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="border-b border-slate-50">
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  Proof of Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div 
                  className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                    uploadedFile ? 'border-green-300 bg-green-50/30' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*,.pdf"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {uploadedFile ? (
                      <div className="space-y-2">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="font-bold text-slate-900">{uploadedFile.name}</p>
                        <Button variant="outline" size="sm" onClick={(e) => { e.preventDefault(); setUploadedFile(null); }}>
                          Change File
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                          <Upload className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-slate-900">Upload Receipt or Cheque Photo</p>
                          <p className="text-slate-500">Drag and drop or click to browse</p>
                        </div>
                        <p className="text-xs text-slate-400">JPG, PNG or PDF up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="modern-card border-0 shadow-modern-lg bg-slate-900 text-white sticky top-6">
              <CardHeader>
                <CardTitle className="text-slate-400 text-xs uppercase tracking-widest">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedInvoiceData ? (
                  <>
                    <div className="pb-6 border-b border-white/10">
                      <p className="text-sm text-slate-400 mb-1">Total Amount</p>
                      <p className="text-4xl font-black">LKR {selectedInvoiceData.total.toLocaleString()}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Invoice ID</span>
                        <span className="font-mono">{selectedInvoiceData.invoiceID}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Order Ref</span>
                        <span>{selectedInvoiceData.orderID}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Due Date</span>
                        <span>{selectedInvoiceData.due_date ? new Date(selectedInvoiceData.due_date).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-10 text-center">
                    <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400 italic">Select an invoice to view payment summary</p>
                  </div>
                )}
                
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-lg font-bold shadow-xl"
                  disabled={!selectedInvoiceID || !transactionId || !uploadedFile || isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</>
                  ) : (
                    <><Send className="w-5 h-5 mr-2" /> Submit Payment Proof</>
                  )}
                </Button>
                <p className="text-[10px] text-center text-slate-500">
                  By clicking submit, you confirm that the attached proof is authentic and matches the transaction details provided.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="border-0 shadow-2xl max-w-md">
          <div className="text-center py-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <DialogTitle className="text-3xl font-black text-slate-900 mb-2">Success!</DialogTitle>
            <p className="text-slate-600 mb-8">
              Your payment proof has been submitted successfully. Our team will verify it and update your invoice status shortly.
            </p>
            <Button 
              className="w-full bg-slate-900 hover:bg-slate-800 h-12 text-lg"
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/customer/invoices');
              }}
            >
              Back to Invoices
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
}
