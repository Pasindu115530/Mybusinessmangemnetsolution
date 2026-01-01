import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Truck, CheckCircle, Clock, Package } from 'lucide-react';

const deliveries = [
  { id: 'ORD-001', customer: 'Acme Corp', status: 'delivered', currentStep: 5, date: '2024-01-15' },
  { id: 'ORD-002', customer: 'XYZ Industries', status: 'in-transit', currentStep: 4, date: '2024-01-14' },
  { id: 'ORD-003', customer: 'Tech Solutions', status: 'dispatched', currentStep: 3, date: '2024-01-13' },
];

export function CustomerDeliveryTracking() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 text-white shadow-modern-lg">
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-5 h-5" />
              <span className="text-blue-100">Customer Management</span>
            </div>
            <h1 className="text-3xl mb-2">Customer Delivery Tracking</h1>
            <p className="text-blue-100">Track order delivery status from dispatch to delivery</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Deliveries', count: deliveries.length, color: 'blue', icon: Truck },
            { label: 'In Transit', count: 1, color: 'yellow', icon: Clock },
            { label: 'Delivered', count: 1, color: 'green', icon: CheckCircle },
            { label: 'Dispatched', count: 1, color: 'purple', icon: Package },
          ].map((stat) => (
            <Card key={stat.label} className="modern-card border-0 shadow-modern-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
                <h3 className="text-sm text-slate-600 mb-1">{stat.label}</h3>
                <p className="text-2xl text-slate-900">{stat.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              Delivery Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((delivery) => (
                    <TableRow key={delivery.id} className="hover:bg-slate-50/50">
                      <TableCell className="text-slate-900">{delivery.id}</TableCell>
                      <TableCell className="text-slate-900">{delivery.customer}</TableCell>
                      <TableCell>
                        <Badge className={
                          delivery.status === 'delivered' 
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : delivery.status === 'in-transit'
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            : 'bg-blue-100 text-blue-700 border-blue-200'
                        }>
                          {delivery.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">Step {delivery.currentStep}/5</TableCell>
                      <TableCell className="text-slate-600">{delivery.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
