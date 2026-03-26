import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Send,
  FileText,
  ShoppingBag,
  Truck,
  Receipt,
  CreditCard,
  CheckCircle,
  LogOut
} from 'lucide-react';

interface CustomerLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/customer', icon: LayoutDashboard },
  { name: 'Send Requirements', href: '/customer/send-requirements', icon: Send },
  { name: 'Quotations', href: '/customer/quotations', icon: FileText },
  { name: 'My Orders', href: '/customer/orders', icon: ShoppingBag },
  { name: 'Delivery Tracking', href: '/customer/delivery-tracking', icon: Truck },
  { name: 'Invoices', href: '/customer/invoices', icon: Receipt },
  { name: 'Payments', href: '/customer/payments', icon: CreditCard },
  { name: 'Order Confirmation', href: '/customer/order-confirmation', icon: CheckCircle },
];

export function CustomerLayout({ children }: CustomerLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all auth data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("customer");
    localStorage.removeItem("customerId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("customID");

    console.log("Logged out successfully. Local storage cleared.");

    // Redirect to login page
    navigate("/customer-login");
  };

  return (
    <div className="flex h-[calc(100vh-57px)]">
      {/* Modern Sidebar with gradient */}
      <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 border-r border-blue-700 flex-shrink-0 shadow-2xl flex flex-col">
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white">Customer Portal</div>
              <div className="text-xs text-blue-300">Order Management</div>
            </div>
          </div>
          
          <nav className="space-y-1 flex-1">
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

          {/* Logout Button */}
          <div className="mt-4 pt-4 border-t border-blue-700">
            <button
              onClick={handleLogout}
              className="group flex items-center gap-3 w-full px-4 py-3 rounded-xl text-blue-100 hover:bg-red-600 hover:text-white transition-all duration-300 hover:shadow-md"
            >
              <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
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
