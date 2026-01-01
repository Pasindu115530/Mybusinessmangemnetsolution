import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Send, CheckCircle, XCircle } from 'lucide-react';

const quotations = [
  { id: 'SQ-001', supplier: 'Supplier A', amount: 15000, status: 'pending', date: '2024-01-15' },
  { id: 'SQ-002', supplier: 'Supplier B', amount: 22000, status: 'approved', date: '2024-01-14' },
  { id: 'SQ-003', supplier: 'Supplier C', amount: 8500, status: 'rejected', date: '2024-01-13' },
];

export function SupplierQuotationsAdmin() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 text-white shadow-modern-lg">
          <div className="relative">
            <h1 className="text-3xl mb-2">Supplier Quotations</h1>
            <p className="text-blue-100">Review and manage supplier quotation submissions</p>
          </div>
        </div>

        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              Supplier Quotations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead>Quotation ID</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotations.map((quot) => (
                    <TableRow key={quot.id} className="hover:bg-slate-50/50">
                      <TableCell className="text-slate-900">{quot.id}</TableCell>
                      <TableCell className="text-slate-900">{quot.supplier}</TableCell>
                      <TableCell className="text-slate-900">${quot.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={
                          quot.status === 'approved' 
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : quot.status === 'rejected'
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                        }>
                          {quot.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">{quot.date}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="hover:bg-green-50">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="hover:bg-red-50">
                            <XCircle className="w-4 h-4" />
                          </Button>
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
