import { useState } from 'react';
import { SupplierLayout } from './SupplierLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import {
  Truck,
  CheckCircle2,
  Clock,
  Package,
  Send,
  Upload,
  FileText,
  CheckCircle
} from 'lucide-react';

interface TimelineStep {
  name: string;
  status: 'completed' | 'current' | 'pending';
  date?: string;
  notes?: string;
}

export function DeliveryDispatch() {
  const [selectedOrder, setSelectedOrder] = useState('ORD-20240114');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [timeline, setTimeline] = useState<TimelineStep[]>([
    { name: 'Order Received', status: 'completed', date: '2024-01-14 10:00 AM', notes: 'Order confirmed from customer' },
    { name: 'Goods Prepared', status: 'completed', date: '2024-01-14 02:30 PM', notes: 'All items packed and ready' },
    { name: 'Dispatched', status: 'current', notes: 'Enter dispatch details' },
    { name: 'In Transit', status: 'pending', notes: 'Awaiting dispatch' },
    { name: 'Delivered', status: 'pending', notes: 'Awaiting delivery confirmation' },
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    setShowSuccessModal(true);
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
              <Truck className="w-5 h-5" />
              <span className="text-green-100">Delivery Management</span>
            </div>
            <h1 className="text-3xl mb-2">Delivery & Dispatch</h1>
            <p className="text-green-100">Manage order dispatch and track delivery progress</p>
          </div>
        </div>

        {/* Order Selection */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              Select Order
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Select value={selectedOrder} onValueChange={setSelectedOrder}>
              <SelectTrigger className="border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ORD-20240114">ORD-20240114 - XYZ Industries</SelectItem>
                <SelectItem value="ORD-20240113">ORD-20240113 - Tech Solutions</SelectItem>
                <SelectItem value="ORD-20240112">ORD-20240112 - Global Enterprises</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Delivery Timeline */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-green-600" />
              Delivery Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="relative">
              {timeline.map((step, index) => (
                <div key={index} className="flex gap-4 pb-8 last:pb-0">
                  {index !== timeline.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-200"></div>
                  )}
                  
                  <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                    step.status === 'completed' 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                      : step.status === 'current'
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 animate-pulse'
                      : 'bg-slate-200'
                  }`}>
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    ) : step.status === 'current' ? (
                      <Clock className="w-6 h-6 text-white" />
                    ) : (
                      <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 pt-1">
                    <div className={`p-4 rounded-xl border-2 ${
                      step.status === 'completed'
                        ? 'bg-green-50 border-green-200'
                        : step.status === 'current'
                        ? 'bg-green-50 border-green-300 shadow-md'
                        : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={
                          step.status === 'completed'
                            ? 'text-green-900'
                            : step.status === 'current'
                            ? 'text-green-900'
                            : 'text-slate-600'
                        }>
                          {step.name}
                        </h4>
                        {step.date && (
                          <Badge variant="outline" className="text-xs">
                            {step.date}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{step.notes}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dispatch Details */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-green-600" />
              Dispatch Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Tracking Number *</Label>
                <Input
                  placeholder="Enter tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="mt-2 border-slate-200"
                />
              </div>
              <div>
                <Label>Vehicle Number *</Label>
                <Input
                  placeholder="Enter vehicle number"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="mt-2 border-slate-200"
                />
              </div>
              <div>
                <Label>Driver Name *</Label>
                <Input
                  placeholder="Enter driver name"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="mt-2 border-slate-200"
                />
              </div>
              <div>
                <Label>Dispatch Date *</Label>
                <Input
                  type="datetime-local"
                  className="mt-2 border-slate-200"
                />
              </div>
            </div>

            <div>
              <Label>Delivery Notes</Label>
              <Textarea
                placeholder="Add delivery instructions or special notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2 border-slate-200"
                rows={3}
              />
            </div>

            <div>
              <Label>Upload Delivery Note / Invoice</Label>
              <div className="mt-2 border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-green-400 hover:bg-green-50/50 transition-all">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 mb-2">Click to upload delivery documents</p>
                <input
                  type="file"
                  id="delivery-doc"
                  className="hidden"
                  accept=".pdf,.png,.jpg"
                  onChange={handleFileUpload}
                />
                <label htmlFor="delivery-doc">
                  <Button type="button" variant="outline" size="sm" className="cursor-pointer" onClick={() => document.getElementById('delivery-doc')?.click()}>
                    Choose File
                  </Button>
                </label>
                {uploadedFile && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-sm text-green-700">
                    <FileText className="w-4 h-4" />
                    {uploadedFile.name}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardContent className="pt-6">
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={!trackingNumber || !vehicleNumber || !driverName}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                Mark as Dispatched
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
            <DialogTitle className="text-2xl mb-2">Order Dispatched!</DialogTitle>
            <p className="text-slate-600 mb-6">
              Order has been marked as dispatched. Customer and admin have been notified.
            </p>
            <div className="bg-green-50 rounded-xl p-4 mb-6 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Order ID:</span>
                  <span className="text-slate-900">{selectedOrder}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Tracking Number:</span>
                  <span className="text-slate-900">{trackingNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Vehicle:</span>
                  <span className="text-slate-900">{vehicleNumber}</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SupplierLayout>
  );
}
