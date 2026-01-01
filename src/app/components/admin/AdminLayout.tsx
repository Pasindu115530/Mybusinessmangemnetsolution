import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Package,
  DollarSign,
  CreditCard,
  Users,
  Truck,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  FileText,
  Send,
  ShoppingBag,
  Receipt,
  Home
} from 'lucide-react';
import { Button } from '../ui/button';

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Stock Management', href: '/stock', icon: Package },
  { name: 'Finance & Funds', href: '/finance', icon: DollarSign },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  {
    name: 'Customers',
    href: '/customers',
    icon: Users,
    children: [
      { name: 'Requirements', href: '/customer-requests', icon: FileText },
      { name: 'Quotations', href: '/customer-quotations', icon: Send },
      { name: 'Create Quotation', href: '/create-quotation', icon: Send },
      { name: 'Orders', href: '/customer-orders', icon: ShoppingBag },
      { name: 'Delivery Tracking', href: '/customer-delivery', icon: Truck },
      { name: 'Invoices', href: '/customer-invoices', icon: Receipt },
      { name: 'Payments', href: '/customer-payments', icon: CreditCard },
    ],
  },
  {
    name: 'Suppliers',
    href: '/suppliers',
    icon: Truck,
    children: [
      { name: 'Customer Requirement Requests', href: '/supplier-requirements', icon: FileText },
      { name: 'Supplier Quotations', href: '/supplier-quotations', icon: Send },
      { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingBag },
      { name: 'Delivery Tracking', href: '/supplier-delivery', icon: Truck },
      { name: 'Invoices', href: '/supplier-invoices', icon: Receipt },
      { name: 'Payments', href: '/supplier-payments', icon: CreditCard },
    ],
  },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Customers', 'Suppliers']);

  const toggleExpanded = (name: string) => {
    setExpandedItems(prev =>
      prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const isParentActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some(child => isActive(child.href));
    }
    return false;
  };

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', href: '/' }];

    navigation.forEach(item => {
      if (isActive(item.href) && item.href !== '/') {
        breadcrumbs.push({ name: item.name, href: item.href });
        
        if (item.children) {
          const activeChild = item.children.find(child => isActive(child.href));
          if (activeChild) {
            breadcrumbs[breadcrumbs.length - 1] = { name: item.name, href: item.href };
            breadcrumbs.push({ name: activeChild.name, href: activeChild.href });
          }
        }
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex h-[calc(100vh-57px)]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:relative inset-y-0 left-0 z-50 ${
          collapsedSidebar ? 'lg:w-20' : 'lg:w-72'
        } w-72 bg-gradient-to-b from-blue-900 to-blue-800 border-r border-blue-700 flex-shrink-0 shadow-2xl transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 flex items-center justify-between">
            {!collapsedSidebar && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <LayoutDashboard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white">Admin Portal</div>
                  <div className="text-xs text-blue-300">Business Management</div>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsedSidebar(!collapsedSidebar)}
              className="text-white hover:bg-blue-800 hidden lg:flex"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:bg-blue-800 lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 pb-4 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => {
                const active = isActive(item.href);
                const parentActive = isParentActive(item);
                const expanded = expandedItems.includes(item.name);
                const hasChildren = item.children && item.children.length > 0;

                return (
                  <div key={item.name}>
                    {hasChildren ? (
                      <button
                        onClick={() => toggleExpanded(item.name)}
                        className={`w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          parentActive
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                            : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                        }`}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsedSidebar && (
                          <>
                            <span className="text-sm flex-1 text-left">{item.name}</span>
                            {expanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </>
                        )}
                      </button>
                    ) : (
                      <Link
                        to={item.href}
                        className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          active
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                            : 'text-blue-100 hover:bg-blue-800 hover:text-white hover:shadow-md'
                        }`}
                      >
                        <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                          active ? 'scale-110' : 'group-hover:scale-110'
                        }`} />
                        {!collapsedSidebar && (
                          <>
                            <span className="text-sm">{item.name}</span>
                            {active && (
                              <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
                            )}
                          </>
                        )}
                      </Link>
                    )}

                    {/* Children */}
                    {hasChildren && expanded && !collapsedSidebar && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children?.map((child) => {
                          const childActive = isActive(child.href);
                          return (
                            <Link
                              key={child.name}
                              to={child.href}
                              className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 ${
                                childActive
                                  ? 'bg-blue-700 text-white shadow-md'
                                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                              }`}
                            >
                              <child.icon className="w-4 h-4 flex-shrink-0" />
                              <span className="text-sm">{child.name}</span>
                              {childActive && (
                                <div className="ml-auto w-1 h-1 bg-white rounded-full"></div>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center gap-2">
                    {index > 0 && <ChevronRight className="w-4 h-4 text-slate-400" />}
                    {index === 0 ? (
                      <Link to={crumb.href} className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        <Home className="w-4 h-4" />
                        <span>{crumb.name}</span>
                      </Link>
                    ) : index === breadcrumbs.length - 1 ? (
                      <span className="text-slate-900">{crumb.name}</span>
                    ) : (
                      <Link to={crumb.href} className="text-slate-600 hover:text-blue-600">
                        {crumb.name}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-600">Admin User</div>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white">
                A
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}