import { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  Package,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';

type StockItem = {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  brand: string;
  description: string;
  unit: string;
  location: string;
  quantity: number;
  minQuantity: number;
  cost: number;
  sellingPrice: number;
  discontinued: boolean;
  status?: string;
};

const API_BASE = 'http://localhost:5900/api/stocks';

const initialNewItem: StockItem = {
  name: '',
  category: '',
  brand: '',
  description: '',
  unit: 'Pieces',
  location: '',
  quantity: 0,
  minQuantity: 0,
  cost: 0,
  sellingPrice: 0,
  discontinued: false
};

const parseNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value) || 0;

  if (value && typeof value === 'object') {
    if ('$numberDecimal' in value) {
      return Number(value.$numberDecimal) || 0;
    }
  }

  return 0;
};
const mapFromBackend = (item: any) => ({
  _id: item._id,
  name: item.item_name,
  description: item.description,
  category: item.category,
  brand: item.brand,
  quantity: item.quantity,
  minQuantity: item.min_quantity,
  location: item.warehouse_location,
  unit: item.unit_of_measure,
  cost: item.buying_price,
  sellingPrice: item.selling_price,
  discontinued: item.discontinued || false
});

export function StockManagement() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);

  const [newItem, setNewItem] = useState<StockItem>(initialNewItem);

  useEffect(() => {
    fetchStockItems();
  }, []);

  const fetchStockItems = async () => {
    setLoading(true);
    try {
      // GET all stock items
      const response = await fetch(`${API_BASE}/getItems`);

      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.status}`);
      }

         const data = await response.json();
        console.log('API response:', data);

        const itemsArray =
          Array.isArray(data) ? data :
          Array.isArray(data.items) ? data.items :
          Array.isArray(data.data) ? data.data :
          Array.isArray(data.stocks) ? data.stocks :
          [];

        const mappedItems = itemsArray.map(mapFromBackend);
        setStockItems(mappedItems);
    } catch (error) {
      console.error('Error fetching stock items:', error);
      setStockItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim()) {
      alert('Item name is required');
      return;
    }

    if (!newItem.category.trim()) {
      alert('Category is required');
      return;
    }

    setSubmitLoading(true);

    try {
      const url = isEditing && editItemId ? `${API_BASE}/updateItem/${editItemId}` : `${API_BASE}/addItem`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            item_name: newItem.name,
            description: newItem.description,
            category: newItem.category,
            brand: newItem.brand,
            quantity: newItem.quantity,
            min_quantity: newItem.minQuantity,
            warehouse_location: newItem.location,
            unit_of_measure: newItem.unit,
            buying_price: newItem.cost,
            selling_price: newItem.sellingPrice
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Backend error:', errorData);
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'add'} item`);
      }

      await fetchStockItems();
      setIsDialogOpen(false);
      setNewItem(initialNewItem);
      setIsEditing(false);
      setEditItemId(null);
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} item:`, error);
      alert(`Failed to ${isEditing ? 'update' : 'add'} item. Check backend route and request body.`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditClick = (item: StockItem) => {
    setNewItem({
      name: item.name || '',
      category: item.category || '',
      brand: item.brand || '',
      description: item.description || '',
      unit: item.unit || 'Pieces',
      location: item.location || '',
      quantity: item.quantity || 0,
      minQuantity: item.minQuantity || 0,
      cost: item.cost || 0,
      sellingPrice: item.sellingPrice || 0,
      discontinued: item.discontinued || false,
    });
    setEditItemId(item._id || item.id || null);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteItem = async (id: string | undefined) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`${API_BASE}/deleteItem/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      await fetchStockItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item.');
    }
  };

  const getItemStatus = (item: StockItem) => {
    if (item.status) return item.status;
    if (item.quantity <= 0) return 'critical';
    if (item.quantity <= (item.minQuantity || 10)) return 'low';
    return 'in-stock';
  };

  const filteredItems = stockItems.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      (item.name || '').toLowerCase().includes(searchLower) ||
      (item.brand || '').toLowerCase().includes(searchLower) ||
      (item.category || '').toLowerCase().includes(searchLower);

    const matchesCategory =
      categoryFilter === 'all' || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const totalValue = stockItems.reduce(
    (sum, item) => sum + ((item.quantity || 0) * (item.cost || 0)),
    0
  );

  const lowStockCount = stockItems.filter((item) => {
    const status = getItemStatus(item);
    return status === 'low' || status === 'critical';
  }).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
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

            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setNewItem(initialNewItem);
                setIsEditing(false);
                setEditItemId(null);
              }
            }}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-white text-purple-700 hover:bg-purple-50 shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => {
                    setNewItem(initialNewItem);
                    setIsEditing(false);
                    setEditItemId(null);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stock Item
                </Button>
              </DialogTrigger>

              <DialogContent className="border-0 shadow-2xl max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">{isEditing ? 'Edit Stock Item' : 'Add New Stock Item'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Item Name</Label>
                    <Input
                      placeholder="Enter item name"
                      className="mt-1"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={newItem.category}
                        onValueChange={(val) => setNewItem({ ...newItem, category: val })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Electronics">Electronics</SelectItem>
                          <SelectItem value="Furniture">Furniture</SelectItem>
                          <SelectItem value="Textiles">Textiles</SelectItem>
                          <SelectItem value="Hardware">Hardware</SelectItem>
                          <SelectItem value="Clothing">Clothing</SelectItem>
                          <SelectItem value="Food">Food</SelectItem>
                          <SelectItem value="Beverages">Beverages</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Brand</Label>
                      <Input
                        placeholder="Enter brand"
                        className="mt-1"
                        value={newItem.brand}
                        onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Enter item description"
                      className="mt-1"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Unit of Measure</Label>
                      <Select
                        value={newItem.unit}
                        onValueChange={(val) => setNewItem({ ...newItem, unit: val })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Units">Units</SelectItem>
                          <SelectItem value="Kilograms">Kilograms</SelectItem>
                          <SelectItem value="Meters">Meters</SelectItem>
                          <SelectItem value="Boxes">Boxes</SelectItem>
                          <SelectItem value="Pieces">Pieces</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Warehouse Location</Label>
                      <Input
                        placeholder="e.g. A-12-03"
                        className="mt-1"
                        value={newItem.location}
                        onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        className="mt-1"
                        value={newItem.quantity}
                        onChange={(e) =>
                          setNewItem({ ...newItem, quantity: Number(e.target.value) || 0 })
                        }
                      />
                    </div>

                    <div>
                      <Label>Min. Quantity</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        className="mt-1"
                        value={newItem.minQuantity}
                        onChange={(e) =>
                          setNewItem({ ...newItem, minQuantity: Number(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Cost Price</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="mt-1"
                        value={newItem.cost}
                        onChange={(e) =>
                          setNewItem({ ...newItem, cost: Number(e.target.value) || 0 })
                        }
                      />
                    </div>

                    <div>
                      <Label>Selling Price</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="mt-1"
                        value={newItem.sellingPrice}
                        onChange={(e) =>
                          setNewItem({ ...newItem, sellingPrice: Number(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="discontinued"
                      checked={newItem.discontinued}
                      onCheckedChange={(val) =>
                        setNewItem({ ...newItem, discontinued: val })
                      }
                    />
                    <Label htmlFor="discontinued">Is Discontinued</Label>
                  </div>

                  <Button
                    className="w-full mt-2"
                    onClick={handleAddItem}
                    disabled={submitLoading}
                  >
                    {submitLoading ? 'Saving...' : isEditing ? 'Update Item' : 'Add Item'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

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
                  <SelectItem value="Clothing">Clothing</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Beverages">Beverages</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-slate-500">
                        Loading items...
                      </TableCell>
                    </TableRow>
                  ) : filteredItems.length > 0 ? (
                    filteredItems.map((item) => {
                      const cost = item.cost || 0;
                      const sellingPrice = item.sellingPrice || 0;
                      const profitMargin =
                        cost > 0 ? (((sellingPrice - cost) / cost) * 100).toFixed(1) : '0.0';
                      const sStatus = getItemStatus(item);

                      return (
                        <TableRow
                          key={item._id || item.id || item.name}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-purple-600" />
                              </div>
                              <span className="text-slate-900">{item.name}</span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge variant="outline" className="modern-badge">
                              {item.category}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-slate-900">
                            {item.quantity || 0} {item.unit || 'units'}
                          </TableCell>

                          <TableCell className="text-slate-900">${Number(cost).toFixed(2)}</TableCell>
                          <TableCell className="text-slate-900">${Number(sellingPrice).toFixed(2)}</TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1 text-green-600">
                              <TrendingUp className="w-3 h-3" />
                              {profitMargin}%
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant={sStatus === 'in-stock' ? 'default' : 'destructive'}
                              className={
                                sStatus === 'in-stock'
                                  ? 'bg-green-100 text-green-700 border-green-200'
                                  : sStatus === 'low'
                                  ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                  : 'bg-red-100 text-red-700 border-red-200'
                              }
                            >
                              {sStatus === 'in-stock' && 'In Stock'}
                              {sStatus === 'low' && 'Low Stock'}
                              {sStatus === 'critical' && 'Critical'}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 transition-all"
                                onClick={() => handleEditClick(item)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:bg-red-50 hover:border-red-300 transition-all"
                                onClick={() => handleDeleteItem(item._id || item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4 text-slate-500">
                        No items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}