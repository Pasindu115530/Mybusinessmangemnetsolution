import { useState, useEffect } from 'react';
import axios from 'axios';
import { CustomerLayout } from './CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  ShoppingBag,
  Search,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  Package,
  Send,
  Loader2
} from 'lucide-react';

interface Order {
  _id: string;
  orderID: string;
  quotationRef: string;
  orderDate: string;
  totalItems: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'dispatched' | 'in-transit' | 'delivered';
  customerID: string; // userEmail wenuwata
}

export function CustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrderData, setSelectedOrderData] = useState<Order | null>(null);

  const userDataString = localStorage.getItem('user');
  const userData = userDataString ? JSON.parse(userDataString) : null;
  const customID = userData?.id || userData?._id || localStorage.getItem('customID');

  const [stats, setStats] = useState({
    pending: 0,
    processing: 0,
    dispatched: 0,
    inTransit: 0,
    delivered: 0
  });

  const fetchOrdersAndStats = async () => {
    if (!customID) return; // customID nathnam mukuth karanna epa

    try {
      setLoading(true);
      
      // 1. Fetch Orders (ID eka anuwa filter karala ganna)
      const ordersRes = await axios.get(`http://localhost:5900/api/orders/customer/${customID}`);
      setOrders(ordersRes.data);
      console.log(ordersRes.data);

      // 2. Fetch Stats using customID
      const [pending, processing, dispatched, inTransit, delivered] = await Promise.all([
        axios.get(`http://localhost:5900/api/orders/pending-count/${customID}`),
        axios.get(`http://localhost:5900/api/orders/processing-count/${customID}`),
        axios.get(`http://localhost:5900/api/orders/dispatched-count/${customID}`),
        axios.get(`http://localhost:5900/api/orders/in-transit-count/${customID}`),
        axios.get(`http://localhost:5900/api/orders/delivered-count/${customID}`),
      ]);

      setStats({
        pending: pending.data.count || 0,
        processing: processing.data.count || 0,
        dispatched: dispatched.data.count || 0,
        inTransit: inTransit.data.count || 0,
        delivered: delivered.data.count || 0
      });

    } catch (error) {
      console.error("Error fetching customer data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndStats();
  }, [customID]); // customID wenas weddi ayeth fetch wenawa

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-transit': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'dispatched': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'processing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'pending': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'in-transit': return <Truck className="w-3 h-3 mr-1" />;
      case 'dispatched': return <Send className="w-3 h-3 mr-1" />;
      case 'processing': return <Package className="w-3 h-3 mr-1" />;
      case 'pending': return <Clock className="w-3 h-3 mr-1" />;
      default: return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderID?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 p-8 text-white shadow-lg">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <ShoppingBag className="w-5 h-5" />
              <span>Customer Portal</span>
            </div>
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="mt-2 text-indigo-100">Tracking for Customer ID: <span className="font-mono font-bold">{customID}</span></p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Pending', count: stats.pending, icon: Clock },
            { label: 'Processing', count: stats.processing, icon: Package },
            { label: 'Dispatched', count: stats.dispatched, icon: Send },
            { label: 'In Transit', count: stats.inTransit, icon: Truck },
            { label: 'Delivered', count: stats.delivered, icon: CheckCircle },
          ].map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <stat.icon className="w-5 h-5 text-slate-400 mb-2" />
                <p className="text-2xl font-bold">{stat.count}</p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Table Card */}
        <Card className="border-none shadow-xl">
          <CardHeader className="border-b bg-slate-50/50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <CardTitle className="text-xl">Recent Orders</CardTitle>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Search ID..." 
                    className="pl-9 bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] bg-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-slate-500 animate-pulse">Syncing orders...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Order ID</TableHead>
                    <TableHead>Quotation</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order._id} className="group">
                      <TableCell className="pl-6 font-semibold">{order.orderID}</TableCell>
                      <TableCell className="text-slate-500">{order.quotationRef}</TableCell>
                      <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">LKR {order.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setSelectedOrderData(order);
                            setShowDetailsModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Order Information</DialogTitle>
            </DialogHeader>
            {selectedOrderData && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Order Reference:</span>
                    <span className="font-bold">{selectedOrderData.orderID}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer ID:</span>
                    <span>{selectedOrderData.customerID}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-slate-500">Total Bill:</span>
                    <span className="text-lg font-bold text-blue-600">LKR {selectedOrderData.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
                <Button className="w-full" onClick={() => setShowDetailsModal(false)}>Close View</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </CustomerLayout>
  );
}