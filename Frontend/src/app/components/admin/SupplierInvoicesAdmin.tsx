import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Receipt } from 'lucide-react';

const invoices = [
  { id: 'SINV-001', poId: 'PO-001', supplier: 'Supplier A', amount: 15000, status: 'paid', date: '2024-01-15' },
  { id: 'SINV-002', poId: 'PO-002', supplier: 'Supplier B', amount: 22000, status: 'pending', date: '2024-01-14' },
];

export function SupplierInvoicesAdmin() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 text-white shadow-modern-lg">
          <div className="relative">
            <h1 className="text-3xl mb-2">Supplier Invoices</h1>
            <p className="text-blue-100">Manage supplier invoice submissions</p>
          </div>
        </div>

        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              Supplier Invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>PO ID</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-slate-50/50">
                      <TableCell className="text-slate-900">{invoice.id}</TableCell>
                      <TableCell className="text-slate-600">{invoice.poId}</TableCell>
                      <TableCell className="text-slate-900">{invoice.supplier}</TableCell>
                      <TableCell className="text-slate-900">${invoice.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                        }>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">{invoice.date}</TableCell>
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
