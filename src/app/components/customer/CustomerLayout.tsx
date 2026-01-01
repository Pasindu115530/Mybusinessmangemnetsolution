import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Send,
  FileText,
  ShoppingBag,
  Truck,
  Receipt,
  CreditCard,
  CheckCircle
} from 'lucide-react';

interface CustomerLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Send Requirements', href: '/send-requirements', icon: Send },
  { name: 'Quotations', href: '/quotations', icon: FileText },
  { name: 'My Orders', href: '/orders', icon: ShoppingBag },
  { name: 'Delivery Tracking', href: '/delivery-tracking', icon: Truck },
  { name: 'Invoices', href: '/invoices', icon: Receipt },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Order Confirmation', href: '/order-confirmation', icon: CheckCircle },
];

export function CustomerLayout({ children }: CustomerLayoutProps) {
  const location = useLocation();

  return (
    <div className="flex h-[calc(100vh-57px)]">
      {/* Modern Sidebar with gradient */}
      <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 border-r border-blue-700 flex-shrink-0 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white">Customer Portal</div>
              <div className="text-xs text-blue-300">Order Management</div>
            </div>
          </div>
          
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-blue-100 hover:bg-blue-800 hover:text-white hover:shadow-md'
                  }`}
                >
                  <item.icon className={`w-5 h-5 transition-transform duration-300 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  }`} />
                  <span className="text-sm">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content with subtle background */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
