import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Receipt, Download, Eye } from 'lucide-react';

const invoices = [
  { id: 'INV-001', orderId: 'ORD-001', customer: 'Acme Corp', amount: 15000, status: 'paid', dueDate: '2024-01-20' },
  { id: 'INV-002', orderId: 'ORD-002', customer: 'XYZ Industries', amount: 22000, status: 'pending', dueDate: '2024-01-25' },
  { id: 'INV-003', orderId: 'ORD-003', customer: 'Tech Solutions', amount: 8500, status: 'overdue', dueDate: '2024-01-10' },
];

export function CustomerInvoicesAdmin() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 text-white shadow-modern-lg">
          <div className="relative">
            <h1 className="text-3xl mb-2">Customer Invoices</h1>
            <p className="text-blue-100">Manage and track customer invoices</p>
          </div>
        </div>

        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              All Invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-slate-50/50">
                      <TableCell className="text-slate-900">{invoice.id}</TableCell>
                      <TableCell className="text-slate-600">{invoice.orderId}</TableCell>
                      <TableCell className="text-slate-900">{invoice.customer}</TableCell>
                      <TableCell className="text-slate-900">${invoice.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-slate-600">{invoice.dueDate}</TableCell>
                      <TableCell>
                        <Badge className={
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : invoice.status === 'overdue'
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                        }>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm"><Eye className="w-4 h-4" /></Button>
                          <Button variant="outline" size="sm"><Download className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
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
