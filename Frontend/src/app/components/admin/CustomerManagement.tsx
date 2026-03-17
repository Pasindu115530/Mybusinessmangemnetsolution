import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Users, ShoppingCart, Clock, CheckCircle } from 'lucide-react';

const customers = [
  { id: 1, name: 'ABC Corp', email: 'contact@abccorp.com', orders: 12, totalSpent: 125000, status: 'active', lastOrder: '2 days ago' },
  { id: 2, name: 'XYZ Ltd', email: 'info@xyzltd.com', orders: 8, totalSpent: 89000, status: 'pending', lastOrder: '5 days ago' },
  { id: 3, name: 'Global Trade', email: 'hello@globaltrade.com', orders: 15, totalSpent: 156000, status: 'active', lastOrder: '1 day ago' },
  { id: 4, name: 'Tech Solutions', email: 'contact@techsolutions.com', orders: 6, totalSpent: 67000, status: 'active', lastOrder: '1 week ago' },
];

export function CustomerManagement() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-slate-900 mb-2">Customer Management</h1>
          <p className="text-slate-600">Manage customers and track their activities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm text-slate-600">Total Customers</CardTitle>
              <Users className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-slate-900">{customers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm text-slate-600">Total Orders</CardTitle>
              <ShoppingCart className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-slate-900">{customers.reduce((sum, c) => sum + c.orders, 0)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm text-slate-600">Revenue</CardTitle>
              <CheckCircle className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-slate-900">${customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm text-slate-600">Pending</CardTitle>
              <Clock className="w-4 h-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-slate-900">{customers.filter(c => c.status === 'pending').length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="text-slate-900">{customer.name}</TableCell>
                    <TableCell className="text-slate-600">{customer.email}</TableCell>
                    <TableCell className="text-slate-900">{customer.orders}</TableCell>
                    <TableCell className="text-slate-900">${customer.totalSpent.toLocaleString()}</TableCell>
                    <TableCell className="text-slate-600">{customer.lastOrder}</TableCell>
                    <TableCell>
                      <Badge variant={customer.status === 'active' ? 'default' : 'outline'} className={
                        customer.status === 'active'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                      }>
                        {customer.status}
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
