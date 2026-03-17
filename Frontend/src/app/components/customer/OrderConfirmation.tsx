import { useState } from 'react';
import { CustomerLayout } from './CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import {
  CheckCircle,
  Package,
  AlertCircle,
  Send,
  Clock
} from 'lucide-react';

interface OrderItem {
  id: number;
  name: string;
  orderedQty: number;
  receivedQty: number;
  damagedQty: number;
  confirmed: boolean;
}

const orderItems: OrderItem[] = [
  { id: 1, name: 'Product A - Electronics', orderedQty: 500, receivedQty: 0, damagedQty: 0, confirmed: false },
  { id: 2, name: 'Product B - Furniture', orderedQty: 300, receivedQty: 0, damagedQty: 0, confirmed: false },
  { id: 3, name: 'Product C - Textiles', orderedQty: 200, receivedQty: 0, damagedQty: 0, confirmed: false },
];

export function OrderConfirmation() {
  const [selectedOrder, setSelectedOrder] = useState('ORD-20240115');
  const [items, setItems] = useState<OrderItem[]>(orderItems);
  const [notes, setNotes] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const updateItem = (id: number, field: keyof OrderItem, value: any) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleConfirm = () => {
    setShowSuccessModal(true);
  };

  const confirmedCount = items.filter(item => item.confirmed).length;
  const totalReceived = items.reduce((sum, item) => sum + (item.receivedQty || 0), 0);
  const totalDamaged = items.reduce((sum, item) => sum + (item.damagedQty || 0), 0);

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 text-white shadow-modern-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-blue-100">Order Verification</span>
            </div>
            <h1 className="text-3xl mb-2">Order Received & Confirmation</h1>
            <p className="text-blue-100">Confirm receipt of your order and report any issues</p>
          </div>
        </div>

        {/* Order Selection */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Select Order
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Select value={selectedOrder} onValueChange={setSelectedOrder}>
              <SelectTrigger className="border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ORD-20240115">ORD-20240115 - Delivered</SelectItem>
                <SelectItem value="ORD-20240114">ORD-20240114 - Delivered</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Confirmed Items</h3>
              <p className="text-2xl text-slate-900">{confirmedCount} / {items.length}</p>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Total Received</h3>
              <p className="text-2xl text-slate-900">{totalReceived} units</p>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Damaged/Missing</h3>
              <p className="text-2xl text-slate-900">{totalDamaged} units</p>
            </CardContent>
          </Card>
        </div>

        {/* Confirmation Table */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Confirm Goods Received
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">Verify each item and report any issues</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead>Confirm</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Ordered Qty</TableHead>
                    <TableHead>Received Qty</TableHead>
                    <TableHead>Damaged/Missing</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <Checkbox
                          checked={item.confirmed}
                          onCheckedChange={(checked) => 
                            updateItem(item.id, 'confirmed', checked)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-slate-900">{item.name}</TableCell>
                      <TableCell className="text-slate-900">{item.orderedQty}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.receivedQty}
                          onChange={(e) => updateItem(item.id, 'receivedQty', parseInt(e.target.value) || 0)}
                          className="w-24 border-slate-200"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.damagedQty}
                          onChange={(e) => updateItem(item.id, 'damagedQty', parseInt(e.target.value) || 0)}
                          className="w-24 border-slate-200"
                          placeholder="0"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Additional Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Label>Report any issues (damaged items, missing items, etc.)</Label>
            <Textarea
              placeholder="Describe any issues with the delivery..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2 border-slate-200"
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardContent className="pt-6">
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl mb-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900 mb-1">Before you confirm</p>
                  <p className="text-sm text-blue-700">
                    Please verify all quantities carefully. This confirmation will be sent to the supplier.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleConfirm}
                disabled={confirmedCount === 0}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                Confirm Receipt
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
            <DialogTitle className="text-2xl mb-2">Receipt Confirmed!</DialogTitle>
            <p className="text-slate-600 mb-6">
              Your order confirmation has been sent to the supplier successfully.
            </p>
            <div className="bg-green-50 rounded-xl p-4 mb-6 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Order:</span>
                  <span className="text-slate-900">{selectedOrder}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Items Confirmed:</span>
                  <span className="text-slate-900">{confirmedCount} / {items.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total Received:</span>
                  <span className="text-slate-900">{totalReceived} units</span>
                </div>
                {totalDamaged > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Issues Reported:</span>
                    <span className="text-red-600">{totalDamaged} units</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={() => setShowSuccessModal(false)}
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
