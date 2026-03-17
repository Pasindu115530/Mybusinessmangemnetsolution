import { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { FileText, Send, Package, CreditCard } from 'lucide-react';

const requests = [
  { id: 1, customer: 'ABC Corp', items: 'Electronics Set', quantity: 50, requestDate: '2024-01-16', status: 'pending', quotation: null },
  { id: 2, customer: 'XYZ Ltd', items: 'Office Furniture', quantity: 25, requestDate: '2024-01-15', status: 'quoted', quotation: 45000 },
  { id: 3, customer: 'Global Trade', items: 'Hardware Tools', quantity: 100, requestDate: '2024-01-14', status: 'accepted', quotation: 28000 },
  { id: 4, customer: 'Tech Solutions', items: 'Software Licenses', quantity: 30, requestDate: '2024-01-13', status: 'delivered', quotation: 18000 },
];

export function CustomerRequests() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-slate-900 mb-2">Customer Requests</h1>
          <p className="text-slate-600">Process customer orders and quotations</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="quoted">Quoted</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Quotation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests
                      .filter(req => activeTab === 'all' || req.status === activeTab)
                      .map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="text-slate-900">#{request.id}</TableCell>
                          <TableCell className="text-slate-900">{request.customer}</TableCell>
                          <TableCell className="text-slate-900">{request.items}</TableCell>
                          <TableCell className="text-slate-900">{request.quantity} units</TableCell>
                          <TableCell className="text-slate-600">{request.requestDate}</TableCell>
                          <TableCell className="text-slate-900">
                            {request.quotation ? `$${request.quotation.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                request.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                  : request.status === 'quoted'
                                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                                  : request.status === 'accepted'
                                  ? 'bg-green-100 text-green-700 border-green-200'
                                  : 'bg-purple-100 text-purple-700 border-purple-200'
                              }
                            >
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {request.status === 'pending' && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      <Send className="w-4 h-4 mr-1" />
                                      Send Quote
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Create Quotation</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 mt-4">
                                      <div>
                                        <Label>Total Amount</Label>
                                        <Input type="number" placeholder="0.00" />
                                      </div>
                                      <div>
                                        <Label>Delivery Timeline</Label>
                                        <Input placeholder="e.g., 7-10 business days" />
                                      </div>
                                      <div>
                                        <Label>Notes</Label>
                                        <Input placeholder="Additional notes" />
                                      </div>
                                      <Button className="w-full">Send Quotation</Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                              {request.status === 'accepted' && (
                                <Button size="sm" variant="outline">
                                  <Package className="w-4 h-4 mr-1" />
                                  Update Delivery
                                </Button>
                              )}
                              <Button size="sm" variant="outline">
                                <FileText className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
