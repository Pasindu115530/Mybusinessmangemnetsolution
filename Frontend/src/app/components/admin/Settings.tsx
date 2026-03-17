import { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import {
  Settings as SettingsIcon,
  Building,
  Users,
  Bell,
  Palette,
  Shield,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  FileText
} from 'lucide-react';

const auditLogs = [
  { id: 1, action: 'Stock Updated', user: 'Admin User', date: '2024-01-15 14:30', status: 'success' },
  { id: 2, action: 'Payment Received', user: 'Finance Manager', date: '2024-01-15 12:15', status: 'success' },
  { id: 3, action: 'Order Created', user: 'Admin User', date: '2024-01-15 10:20', status: 'success' },
  { id: 4, action: 'Login Attempt', user: 'Unknown', date: '2024-01-14 23:45', status: 'failed' },
];

const users = [
  { id: 1, name: 'Admin User', email: 'admin@company.com', role: 'Admin', status: 'active' },
  { id: 2, name: 'Finance Manager', email: 'finance@company.com', role: 'Finance', status: 'active' },
  { id: 3, name: 'Stock Manager', email: 'stock@company.com', role: 'Stock', status: 'active' },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'General Settings', icon: Building },
    { id: 'users', name: 'Users & Roles', icon: Users },
    { id: 'preferences', name: 'System Preferences', icon: SettingsIcon },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'backup', name: 'Backup & Export', icon: Download },
    { id: 'audit', name: 'Audit Logs', icon: FileText },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 text-white shadow-modern-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <SettingsIcon className="w-5 h-5" />
              <span className="text-blue-100">System Configuration</span>
            </div>
            <h1 className="text-3xl mb-2">Settings</h1>
            <p className="text-blue-100">Configure system preferences, users, and security settings</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 whitespace-nowrap' 
                : 'whitespace-nowrap'}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
            </Button>
          ))}
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Company Name</Label>
                    <Input defaultValue="ABC Business Solutions" className="mt-1 border-slate-200" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" defaultValue="contact@abc.com" className="mt-1 border-slate-200" />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input defaultValue="+1 234 567 8900" className="mt-1 border-slate-200" />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input defaultValue="www.abc.com" className="mt-1 border-slate-200" />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Address</Label>
                    <Textarea defaultValue="123 Business St, New York, NY 10001" className="mt-1 border-slate-200" />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Company Logo</Label>
                    <div className="mt-1 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-all">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Click to upload logo</p>
                    </div>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users & Roles */}
        {activeTab === 'users' && (
          <Card className="modern-card border-0 shadow-modern-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  User Management
                </CardTitle>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-slate-50/50">
                        <TableCell className="text-slate-900">{user.name}</TableCell>
                        <TableCell className="text-slate-600">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="hover:bg-blue-50">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
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
        )}

        {/* System Preferences */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-slate-900">Email Notifications</p>
                    <p className="text-sm text-slate-600">Receive email alerts for important events</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-slate-900">SMS Notifications</p>
                    <p className="text-sm text-slate-600">Get SMS alerts for critical updates</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-slate-900">In-app Notifications</p>
                    <p className="text-sm text-slate-600">Show notifications within the application</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-blue-600" />
                  Theme & Display
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Theme Mode</Label>
                  <Select defaultValue="light">
                    <SelectTrigger className="mt-1 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light Mode</SelectItem>
                      <SelectItem value="dark">Dark Mode</SelectItem>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Primary Color</Label>
                  <Select defaultValue="blue">
                    <SelectTrigger className="mt-1 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date Format</Label>
                  <Select defaultValue="mdy">
                    <SelectTrigger className="mt-1 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Security */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-slate-900">Two-Factor Authentication (2FA)</p>
                    <p className="text-sm text-slate-600">Add an extra layer of security</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-slate-900">Session Timeout</p>
                    <p className="text-sm text-slate-600">Auto logout after inactivity</p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-blue-900 mb-2">Password Policy</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Minimum 8 characters</li>
                    <li>• Must include uppercase and lowercase letters</li>
                    <li>• Must include at least one number</li>
                    <li>• Must include at least one special character</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Backup & Export */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-600" />
                  Data Export
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 text-center">
                    <Download className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="text-blue-900 mb-2">Export CSV</h3>
                    <p className="text-sm text-blue-700 mb-4">Export data as CSV file</p>
                    <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                      Download CSV
                    </Button>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 text-center">
                    <FileText className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <h3 className="text-green-900 mb-2">Export PDF</h3>
                    <p className="text-sm text-green-700 mb-4">Generate PDF reports</p>
                    <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                      Download PDF
                    </Button>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 text-center">
                    <Download className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="text-purple-900 mb-2">Full Backup</h3>
                    <p className="text-sm text-purple-700 mb-4">Complete database backup</p>
                    <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                      Create Backup
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="modern-card border-0 shadow-modern-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
                <CardTitle>Automatic Backup Schedule</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-slate-900">Enable Automatic Backup</p>
                    <p className="text-sm text-slate-600">Schedule regular backups</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div>
                  <Label>Backup Frequency</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger className="mt-1 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-900">Last Backup: 2024-01-15 03:00 AM</p>
                  <p className="text-sm text-green-700">Status: Successful</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Audit Logs */}
        {activeTab === 'audit' && (
          <Card className="modern-card border-0 shadow-modern-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Audit Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead>Action</TableHead>
                      <TableHead>Performed By</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-slate-50/50">
                        <TableCell className="text-slate-900">{log.action}</TableCell>
                        <TableCell className="text-slate-600">{log.user}</TableCell>
                        <TableCell className="text-slate-600">{log.date}</TableCell>
                        <TableCell>
                          <Badge className={
                            log.status === 'success' 
                              ? 'bg-green-100 text-green-700 border-green-200' 
                              : 'bg-red-100 text-red-700 border-red-200'
                          }>
                            {log.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
