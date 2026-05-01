import { useState, useEffect, useMemo } from 'react';
import { CustomerLayout } from './CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  FileText,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Package,
  AlertCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import axios from 'axios';

interface QuotationItem {
  name: string;
  productID?: string;
  quantity: number;
  unitPrice?: number;
  price?: number;
  totalPrice?: number;
  description?: string;
  unit?: string;
}

interface Quotation {
  _id: string;
  quotationID: string;
  sq_id?: string;
  requirementId?: string;
  date: string;
  createdAt?: string;
  validUntil?: string;
  items: QuotationItem[];
  total: number;
  total_estimate?: number;
  subtotal?: number;
  tax_amount?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | string;
}

const BACKEND = 'http://localhost:5900';

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function ViewQuotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'reject'>('accept');

  // Order Details Form State
  const [address, setAddress] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  const [notes, setNotes] = useState('');

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const customerId = user._id || user.id;
      if (!customerId) return;
      
      const res = await axios.get(`${BACKEND}/api/quotations/customer/${customerId}`);
      if (res.data.success) {
        setQuotations(res.data.quotations);
      }
    } catch (err) {
      console.error("Error fetching quotations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'expired': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'pending': return <Clock className="w-3 h-3 mr-1" />;
      case 'rejected': return <XCircle className="w-3 h-3 mr-1" />;
      case 'expired': return <AlertCircle className="w-3 h-3 mr-1" />;
      default: return null;
    }
  };

  const filteredQuotations = useMemo(() => quotations.filter(quotation => {
    const query = searchQuery.toLowerCase();
    const idStr = quotation.quotationID || quotation.sq_id || '';
    const matchesSearch = idStr.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'all' || quotation.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  }), [quotations, searchQuery, statusFilter]);

  const handleAccept = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setActionType('accept');
    setShowAcceptModal(true);
  };

  const handleReject = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setActionType('reject');
    setShowRejectModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedQuotation) return;
    
    // Address & Phone required for accept order creation
    if (actionType === 'accept' && (!address || !phonenumber)) {
      alert("Please provide both delivery address and phone number.");
      return;
    }

    try {
      if (actionType === 'accept') {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const token = user.token || localStorage.getItem('token');
        console.log(user);
        console.log(token);
        
        // 1. Create Order Payload
        const customID = localStorage.getItem('customID');
        const orderPayload = {
          name: user.fullName || user.name || "Customer",
          customerId: customID || user.id || user._id,   // Use customID if available, fallback to user id
          address: address,
          phonenumber: phonenumber,
          notes: notes,
          items: selectedQuotation.items.map(item => ({
            productID: item.productID || item.name || "CUSTOM",
            name: item.name || item.productID || "Quotation Item",
            price: item.unitPrice || item.price || 0,
            quantity: item.quantity || 1,
            image: item.image || "https://images.unsplash.com/photo-1542385151-efd9000785a0?w=500&auto=format&fit=crop&q=60" // Added placeholder image for custom order items
          })),
          quotationId: selectedQuotation._id,
        };
        
        // 2. HTTP POST to Orders
        await axios.post(`${BACKEND}/api/orders`, orderPayload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // 3. Update Quotation Status
        await axios.put(`${BACKEND}/api/quotations/accept/${selectedQuotation._id}`);
      } else {
        await axios.put(`${BACKEND}/api/quotations/reject/${selectedQuotation._id}`);
      }
      setShowAcceptModal(false);
      setShowRejectModal(false);
      setShowSuccessModal(true);
      fetchQuotations();
    } catch(err) {
      console.error(err);
      alert(`Error updating quotation status`);
    }
  };

  const handleViewDetails = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setShowDetailsModal(true);
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
              <FileText className="w-5 h-5" />
              <span className="text-blue-100">Quotation Management</span>
            </div>
            <h1 className="text-3xl mb-2">My Quotations</h1>
            <p className="text-blue-100">Review and respond to quotations received from suppliers</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Pending</h3>
              <p className="text-2xl text-slate-900">{quotations.filter(q => q.status?.toLowerCase() === 'pending').length}</p>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Accepted</h3>
              <p className="text-2xl text-slate-900">{quotations.filter(q => q.status?.toLowerCase() === 'accepted').length}</p>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Rejected</h3>
              <p className="text-2xl text-slate-900">{quotations.filter(q => q.status?.toLowerCase() === 'rejected').length}</p>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-gray-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-slate-600" />
                </div>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Expired</h3>
              <p className="text-2xl text-slate-900">{quotations.filter(q => q.status?.toLowerCase() === 'expired').length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quotations Table */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                All Quotations
                {!loading && (
                  <span className="text-sm font-normal text-slate-500">({filteredQuotations.length})</span>
                )}
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search quotations ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64 border-slate-200"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 border-slate-200">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-3 text-slate-500">Loading quotations...</span>
              </div>
            ) : filteredQuotations.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <FileText className="w-12 h-12 mb-3 opacity-40" />
                <p className="text-lg">No quotations found</p>
              </div>
            ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead>Quotation ID</TableHead>
                    <TableHead>Requirement Ref</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations.map((quotation) => (
                    <TableRow key={quotation._id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="text-slate-900 font-mono text-sm">{quotation.quotationID || quotation.sq_id}</TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {quotation.requirementId ? `REQ` : '—'}
                      </TableCell>
                      <TableCell className="text-slate-600 whitespace-nowrap">{formatDate(quotation.date || quotation.createdAt || '')}</TableCell>
                      <TableCell className="text-slate-600 whitespace-nowrap">{formatDate(quotation.validUntil || '')}</TableCell>
                      <TableCell className="text-slate-900">{quotation.items?.length || 0} items</TableCell>
                      <TableCell className="text-slate-900 font-semibold">Rs. {(quotation.total || quotation.total_estimate || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(quotation.status)} style={{ textTransform: 'capitalize' }}>
                          {getStatusIcon(quotation.status)}
                          {quotation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => handleViewDetails(quotation)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {quotation.status?.toLowerCase() === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="hover:bg-green-50 hover:text-green-600"
                                onClick={() => handleAccept(quotation)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => handleReject(quotation)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="border-0 shadow-2xl max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Quotation Details
            </DialogTitle>
          </DialogHeader>
          {selectedQuotation && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-xl">
              <div>
                <p className="text-sm text-slate-600">Quotation ID</p>
                <p className="text-slate-900 font-mono font-semibold">{selectedQuotation.quotationID || selectedQuotation.sq_id}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Date</p>
                <p className="text-slate-900">{formatDate(selectedQuotation.date || selectedQuotation.createdAt || '')}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Expiry Date</p>
                <p className="text-slate-900">{formatDate(selectedQuotation.validUntil || '')}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <Badge className={getStatusColor(selectedQuotation.status)} style={{ textTransform: 'capitalize' }}>
                  {getStatusIcon(selectedQuotation.status)}
                  {selectedQuotation.status}
                </Badge>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedQuotation.items?.map((item, idx) => {
                    const price = item.unitPrice || item.price || 0;
                    const total = item.totalPrice || (price * item.quantity);
                    return (
                    <TableRow key={idx}>
                      <TableCell className="text-slate-900">
                        {item.name || item.productID}
                        {item.description && <div className="text-xs text-slate-500 mt-0.5">{item.description}</div>}
                      </TableCell>
                      <TableCell className="text-slate-900">{item.quantity} {item.unit || ''}</TableCell>
                      <TableCell className="text-slate-900">Rs. {price.toLocaleString()}</TableCell>
                      <TableCell className="text-slate-900 font-bold text-right">Rs. {total.toLocaleString()}</TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end">
              <div className="bg-blue-50 rounded-xl p-4 min-w-[300px]">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="text-slate-900 font-medium">Rs. {(selectedQuotation.subtotal || selectedQuotation.total || selectedQuotation.total_estimate || 0).toLocaleString()}</span>
                  </div>
                  {selectedQuotation.tax_amount !== undefined && selectedQuotation.tax_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax:</span>
                    <span className="text-slate-900">Rs. {selectedQuotation.tax_amount.toLocaleString()}</span>
                  </div>
                  )}
                  <div className="border-t-2 border-blue-200 pt-2 flex justify-between">
                    <span className="text-blue-900 font-bold">Total:</span>
                    <span className="text-blue-900 font-bold text-lg">Rs. {(selectedQuotation.total || selectedQuotation.total_estimate || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>Close</Button>
            </div>
          </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Accept Modal */}
      <Dialog open={showAcceptModal} onOpenChange={setShowAcceptModal}>
        <DialogContent className="border-0 shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Accept Quotation
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 mb-4">
              Are you sure you want to accept quotation <span className="text-blue-600 font-medium">{selectedQuotation?.quotationID || selectedQuotation?.sq_id}</span>? Please provide delivery details to generate your order.
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="address">Delivery Address <span className="text-red-500">*</span></Label>
                <Textarea 
                  id="address" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="Enter your full delivery address" 
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phonenumber">Phone Number <span className="text-red-500">*</span></Label>
                <Input 
                  id="phonenumber" 
                  value={phonenumber} 
                  onChange={(e) => setPhonenumber(e.target.value)} 
                  placeholder="e.g. 0712345678" 
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <Textarea 
                  id="notes" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Any special delivery instructions..." 
                  className="mt-1"
                />
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-4 mb-4">
              <h4 className="text-green-900 mb-2 font-semibold">After acceptance:</h4>
              <ul className="space-y-1 text-sm text-green-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>The supplier will be notified</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>You have agreed to the terms of the quotation</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowAcceptModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleConfirmAction} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0">
              Accept Quotation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="border-0 shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Reject Quotation
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 mb-4">
              Are you sure you want to reject quotation <span className="text-red-600 font-medium">{selectedQuotation?.quotationID || selectedQuotation?.sq_id}</span>?
            </p>
            <div className="bg-red-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-red-700">
                This action cannot be undone. The supplier will be notified of your rejection.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowRejectModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleConfirmAction} className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white border-0">
              Reject Quotation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="border-0 shadow-2xl max-w-md">
          <div className="text-center py-6">
            <div className={`w-20 h-20 bg-gradient-to-br ${actionType === 'accept' ? 'from-green-100 to-emerald-100' : 'from-red-100 to-rose-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {actionType === 'accept' ? (
                <CheckCircle className="w-10 h-10 text-green-600" />
              ) : (
                <XCircle className="w-10 h-10 text-red-600" />
              )}
            </div>
            <DialogTitle className="text-2xl mb-2 text-center">
              {actionType === 'accept' ? 'Quotation Accepted!' : 'Quotation Rejected'}
            </DialogTitle>
            <p className="text-slate-600 mb-6 text-center">
              {actionType === 'accept' 
                ? 'Your order has been created and the supplier has been notified.' 
                : 'The supplier has been notified of your decision.'}
            </p>
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
}
