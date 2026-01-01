import { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertCircle,
  Package,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

const stockItems = [
  { 
    id: 1, 
    name: 'Product A - Electronics', 
    category: 'Electronics',
    quantity: 45, 
    cost: 250, 
    sellingPrice: 350, 
    status: 'low',
    lastUpdated: '2024-01-15'
  },
  { 
    id: 2, 
    name: 'Product B - Furniture', 
    category: 'Furniture',
    quantity: 150, 
    cost: 180, 
    sellingPrice: 280, 
    status: 'in-stock',
    lastUpdated: '2024-01-14'
  },
  { 
    id: 3, 
    name: 'Product C - Textiles', 
    category: 'Textiles',
    quantity: 23, 
    cost: 45, 
    sellingPrice: 75, 
    status: 'critical',
    lastUpdated: '2024-01-16'
  },
  { 
    id: 4, 
    name: 'Product D - Electronics', 
    category: 'Electronics',
    quantity: 320, 
    cost: 85, 
    sellingPrice: 125, 
    status: 'in-stock',
    lastUpdated: '2024-01-13'
  },
  { 
    id: 5, 
    name: 'Product E - Hardware', 
    category: 'Hardware',
    quantity: 78, 
    cost: 120, 
    sellingPrice: 185, 
    status: 'low',
    lastUpdated: '2024-01-15'
  },
];

export function StockManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalValue = stockItems.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
  const lowStockCount = stockItems.filter(item => item.status === 'low' || item.status === 'critical').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Modern Header with gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 p-8 text-white shadow-modern-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5" />
                <span className="text-purple-100">Inventory</span>
              </div>
              <h1 className="text-3xl mb-2">Stock Management</h1>
              <p className="text-purple-100">Manage your inventory and track stock levels</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-white text-purple-700 hover:bg-purple-50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stock Item
                </Button>
              </DialogTrigger>
              <DialogContent className="border-0 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">Add New Stock Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Item Name</Label>
                    <Input placeholder="Enter item name" className="mt-1" />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="furniture">Furniture</SelectItem>
                        <SelectItem value="textiles">Textiles</SelectItem>
                        <SelectItem value="hardware">Hardware</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Quantity</Label>
                      <Input type="number" placeholder="0" className="mt-1" />
                    </div>
                    <div>
                      <Label>Min. Quantity</Label>
                      <Input type="number" placeholder="0" className="mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Cost Price</Label>
                      <Input type="number" placeholder="0.00" className="mt-1" />
                    </div>
                    <div>
                      <Label>Selling Price</Label>
                      <Input type="number" placeholder="0.00" className="mt-1" />
                    </div>
                  </div>
                  <Button className="w-full mt-2">Add Item</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Modern Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="modern-card border-0 shadow-modern-lg bg-gradient-to-br from-blue-50 to-cyan-50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm text-blue-700">Total Stock Value</CardTitle>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-blue-900">${totalValue.toLocaleString()}</div>
              <p className="text-sm text-blue-600 mt-2">{stockItems.length} total items</p>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg bg-gradient-to-br from-yellow-50 to-amber-50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm text-yellow-700">Low Stock Items</CardTitle>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-yellow-900">{lowStockCount}</div>
              <p className="text-sm text-yellow-600 mt-2">Requires attention</p>
            </CardContent>
          </Card>

          <Card className="modern-card border-0 shadow-modern-lg bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm text-green-700">Stock Turnover</CardTitle>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-green-900">24 days</div>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">-3 days from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Inventory Table */}
        <Card className="modern-card border-0 shadow-modern-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
            <CardTitle>Inventory Items</CardTitle>
            <p className="text-sm text-slate-600 mt-1">Manage and track all your products</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48 border-slate-200">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Furniture">Furniture</SelectItem>
                  <SelectItem value="Textiles">Textiles</SelectItem>
                  <SelectItem value="Hardware">Hardware</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Cost Price</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Profit Margin</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const profitMargin = ((item.sellingPrice - item.cost) / item.cost * 100).toFixed(1);
                    return (
                      <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="text-slate-900">{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="modern-badge">{item.category}</Badge>
                        </TableCell>
                        <TableCell className="text-slate-900">{item.quantity} units</TableCell>
                        <TableCell className="text-slate-900">${item.cost}</TableCell>
                        <TableCell className="text-slate-900">${item.sellingPrice}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-green-600">
                            <TrendingUp className="w-3 h-3" />
                            {profitMargin}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={item.status === 'in-stock' ? 'default' : 'destructive'}
                            className={
                              item.status === 'in-stock'
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : item.status === 'low'
                                ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                : 'bg-red-100 text-red-700 border-red-200'
                            }
                          >
                            {item.status === 'in-stock' && 'In Stock'}
                            {item.status === 'low' && 'Low Stock'}
                            {item.status === 'critical' && 'Critical'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 transition-all">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:border-red-300 transition-all">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}