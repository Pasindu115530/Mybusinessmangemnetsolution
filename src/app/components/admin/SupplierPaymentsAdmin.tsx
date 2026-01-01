import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { CreditCard } from 'lucide-react';

const payments = [
  { id: 'SPAY-001', invoiceId: 'SINV-001', supplier: 'Supplier A', amount: 15000, status: 'completed', date: '2024-01-15' },
  { id: 'SPAY-002', invoiceId: 'SINV-002', supplier: 'Supplier B', amount: 22000, status: 'pending', date: '2024-01-14' },
];

export function SupplierPaymentsAdmin() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 text-white shadow-modern-lg">
          <div className="relative">
            <h1 className="text-3xl mb-2">Supplier Payments</h1>
            <p className="text-blue-100">Track payments to suppliers</p>
          </div>
        </div>

        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Payment Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-slate-50/50">
                      <TableCell className="text-slate-900">{payment.id}</TableCell>
                      <TableCell className="text-slate-600">{payment.invoiceId}</TableCell>
                      <TableCell className="text-slate-900">{payment.supplier}</TableCell>
                      <TableCell className="text-slate-900">${payment.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={
                          payment.status === 'completed' 
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                        }>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">{payment.date}</TableCell>
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
