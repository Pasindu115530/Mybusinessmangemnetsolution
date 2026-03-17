import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { FileText, Send } from 'lucide-react';

const requests = [
  { id: 'REQ-001', customer: 'Acme Corp', items: 3, suppliers: ['Supplier A', 'Supplier B'], status: 'pending', date: '2024-01-15' },
  { id: 'REQ-002', customer: 'XYZ Industries', items: 5, suppliers: ['Supplier C'], status: 'sent', date: '2024-01-14' },
  { id: 'REQ-003', customer: 'Tech Solutions', items: 2, suppliers: ['Supplier A'], status: 'completed', date: '2024-01-13' },
];

export function SupplierRequests() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 text-white shadow-modern-lg">
          <div className="relative">
            <h1 className="text-3xl mb-2">Customer Requirement Requests</h1>
            <p className="text-blue-100">Send customer requirements to suppliers for quotations</p>
          </div>
        </div>

        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Requirement Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead>Request ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Suppliers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-slate-50/50">
                      <TableCell className="text-slate-900">{request.id}</TableCell>
                      <TableCell className="text-slate-900">{request.customer}</TableCell>
                      <TableCell className="text-slate-600">{request.items} items</TableCell>
                      <TableCell className="text-slate-600">{request.suppliers.join(', ')}</TableCell>
                      <TableCell>
                        <Badge className={
                          request.status === 'completed' 
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : request.status === 'sent'
                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                            : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                        }>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">{request.date}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="hover:bg-blue-50">
                          <Send className="w-4 h-4" />
                        </Button>
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
