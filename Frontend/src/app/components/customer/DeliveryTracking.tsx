import { useState } from 'react';
import { CustomerLayout } from './CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Truck,
  CheckCircle2,
  Clock,
  Package,
  Send,
  MapPin,
  Calendar,
  Upload,
  FileText
} from 'lucide-react';

interface TimelineStep {
  name: string;
  status: 'completed' | 'current' | 'pending';
  date?: string;
  notes?: string;
}

const timeline: TimelineStep[] = [
  { name: 'Quotation Accepted', status: 'completed', date: '2024-01-14 10:00 AM', notes: 'Quotation accepted and order created' },
  { name: 'Order Created', status: 'completed', date: '2024-01-14 10:15 AM', notes: 'Order confirmed by supplier' },
  { name: 'Dispatched', status: 'completed', date: '2024-01-15 09:00 AM', notes: 'Package dispatched from warehouse' },
  { name: 'In Transit', status: 'current', date: '2024-01-15 03:00 PM', notes: 'Package in transit - ETA 1 day' },
  { name: 'Delivered', status: 'pending', notes: 'Awaiting delivery' },
];

export function DeliveryTracking() {
  const [selectedOrder, setSelectedOrder] = useState('ORD-20240114');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
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
              <Truck className="w-5 h-5" />
              <span className="text-blue-100">Delivery Management</span>
            </div>
            <h1 className="text-3xl mb-2">Delivery Tracking</h1>
            <p className="text-blue-100">Track your order delivery status in real-time</p>
          </div>
        </div>

        {/* Order Selection */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Select Order to Track
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Select value={selectedOrder} onValueChange={setSelectedOrder}>
              <SelectTrigger className="border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ORD-20240114">ORD-20240114 - In Transit</SelectItem>
                <SelectItem value="ORD-20240113">ORD-20240113 - Dispatched</SelectItem>
                <SelectItem value="ORD-20240112">ORD-20240112 - Processing</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Delivery Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="modern-card border-0 shadow-modern-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Delivery Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div>
                <p className="text-sm text-slate-600">Tracking Number</p>
                <p className="text-slate-900">TRK-2024-5678</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Estimated Delivery</p>
                <p className="text-slate-900">January 17, 2024</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Delivery Address</p>
                <p className="text-slate-900">123 Business Street, Suite 400<br />New York, NY 10001</p>
              </div>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div>
                <p className="text-sm text-slate-600">Order ID</p>
                <p className="text-slate-900">{selectedOrder}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Items</p>
                <p className="text-slate-900">5 items</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Order Amount</p>
                <p className="text-slate-900">$22,000</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tracking Timeline */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              Delivery Timeline
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">Track your order progress from quotation to delivery</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="relative">
              {timeline.map((step, index) => (
                <div key={index} className="flex gap-4 pb-8 last:pb-0">
                  {/* Timeline line */}
                  {index !== timeline.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-200"></div>
                  )}
                  
                  {/* Status icon */}
                  <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                    step.status === 'completed' 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                      : step.status === 'current'
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-600 animate-pulse'
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

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className={`p-4 rounded-xl border-2 ${
                      step.status === 'completed'
                        ? 'bg-green-50 border-green-200'
                        : step.status === 'current'
                        ? 'bg-blue-50 border-blue-300 shadow-md'
                        : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={
                          step.status === 'completed'
                            ? 'text-green-900'
                            : step.status === 'current'
                            ? 'text-blue-900'
                            : 'text-slate-600'
                        }>
                          {step.name}
                        </h4>
                        {step.date && (
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
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

        {/* Upload Proof (Optional) */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Upload Delivery Proof (Optional)
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">If you received partial delivery or have concerns</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600 mb-2">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-500 mb-3">PDF, PNG, JPG (Max 5MB)</p>
              <input
                type="file"
                id="proof-upload"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
              />
              <label htmlFor="proof-upload">
                <Button type="button" variant="outline" size="sm" className="cursor-pointer" onClick={() => document.getElementById('proof-upload')?.click()}>
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
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}
