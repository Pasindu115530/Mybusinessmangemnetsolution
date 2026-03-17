import { UserRole } from '../App';
import { Button } from './ui/button';
import { Shield, Package, User, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/welcome')}
            className="text-slate-300 hover:text-white hover:bg-slate-700 flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
          <div className="w-px h-6 bg-slate-700"></div>
          <span className="text-slate-400 text-sm">Switch Role:</span>
          <div className="flex gap-2 bg-slate-800/50 p-1 rounded-lg backdrop-blur-sm">
            <Button
              variant={currentRole === 'admin' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onRoleChange('admin')}
              className={`flex items-center gap-2 transition-all duration-300 ${
                currentRole === 'admin'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin
            </Button>
            <Button
              variant={currentRole === 'supplier' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onRoleChange('supplier')}
              className={`flex items-center gap-2 transition-all duration-300 ${
                currentRole === 'supplier'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Package className="w-4 h-4" />
              Supplier
            </Button>
            <Button
              variant={currentRole === 'customer' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onRoleChange('customer')}
              className={`flex items-center gap-2 transition-all duration-300 ${
                currentRole === 'customer'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <User className="w-4 h-4" />
              Customer
            </Button>
          </div>
        </div>
        <div className="text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm">Business Management System</span>
        </div>
      </div>
    </div>
  );
}