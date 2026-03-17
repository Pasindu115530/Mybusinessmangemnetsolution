import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Truck } from 'lucide-react';

const deliveries = [
  { id: 'PO-001', supplier: 'Supplier A', status: 'delivered', progress: '5/5', date: '2024-01-15' },
  { id: 'PO-002', supplier: 'Supplier B', status: 'in-transit', progress: '4/5', date: '2024-01-14' },
];

export function SupplierDeliveryTracking() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 text-white shadow-modern-lg">
          <div className="relative">
            <h1 className="text-3xl mb-2">Supplier Delivery Tracking</h1>
            <p className="text-blue-100">Track supplier deliveries and shipments</p>
          </div>
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
                    <TableHead>PO ID</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((delivery) => (
                    <TableRow key={delivery.id} className="hover:bg-slate-50/50">
                      <TableCell className="text-slate-900">{delivery.id}</TableCell>
                      <TableCell className="text-slate-900">{delivery.supplier}</TableCell>
                      <TableCell>
                        <Badge className={
                          delivery.status === 'delivered' 
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                        }>
                          {delivery.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">{delivery.progress}</TableCell>
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
