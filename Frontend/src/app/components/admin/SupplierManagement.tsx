import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Truck, Package, CheckCircle, Clock } from 'lucide-react';

const suppliers = [
  { id: 1, name: 'Tech Supplies Inc', contact: 'supplier@techsupplies.com', products: 25, totalOrders: 45, totalValue: 225000, status: 'active', lastDelivery: '3 days ago' },
  { id: 2, name: 'Global Parts Ltd', contact: 'sales@globalparts.com', products: 18, totalOrders: 32, totalValue: 168000, status: 'active', lastDelivery: '1 week ago' },
  { id: 3, name: 'Quality Materials Co', contact: 'info@qualitymaterials.com', products: 12, totalOrders: 28, totalValue: 142000, status: 'pending', lastDelivery: '2 weeks ago' },
];

export function SupplierManagement() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-slate-900 mb-2">Supplier Management</h1>
          <p className="text-slate-600">Manage suppliers and track deliveries</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm text-slate-600">Total Suppliers</CardTitle>
              <Truck className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-slate-900">{suppliers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm text-slate-600">Total Products</CardTitle>
              <Package className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-slate-900">{suppliers.reduce((sum, s) => sum + s.products, 0)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm text-slate-600">Total Orders</CardTitle>
              <CheckCircle className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-slate-900">{suppliers.reduce((sum, s) => sum + s.totalOrders, 0)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm text-slate-600">Pending</CardTitle>
              <Clock className="w-4 h-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-slate-900">{suppliers.filter(s => s.status === 'pending').length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Supplier List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Last Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="text-slate-900">{supplier.name}</TableCell>
                    <TableCell className="text-slate-600">{supplier.contact}</TableCell>
                    <TableCell className="text-slate-900">{supplier.products}</TableCell>
                    <TableCell className="text-slate-900">{supplier.totalOrders}</TableCell>
                    <TableCell className="text-slate-900">${supplier.totalValue.toLocaleString()}</TableCell>
                    <TableCell className="text-slate-600">{supplier.lastDelivery}</TableCell>
                    <TableCell>
                      <Badge variant={supplier.status === 'active' ? 'default' : 'outline'} className={
                        supplier.status === 'active'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                      }>
                        {supplier.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
