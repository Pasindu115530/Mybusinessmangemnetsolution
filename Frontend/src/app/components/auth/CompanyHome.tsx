import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Building2, Users, Truck, ArrowRight, Sparkles } from 'lucide-react';

export function CompanyHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-200 rounded-full blur-3xl opacity-10"></div>
      </div>

      <div className="w-full max-w-6xl mx-auto relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl text-slate-900">ABC Business</h1>
              <p className="text-blue-600 flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                Management Solutions
              </p>
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl text-slate-900 mb-4">
            Welcome to ABC Business
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Your comprehensive platform for managing business operations, suppliers, and customer relationships
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Customer Portal */}
          <Card 
            className="group relative overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 bg-white"
            onClick={() => navigate('/customer-login')}
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-amber-500/10 to-orange-500/10 group-hover:from-yellow-500/20 group-hover:via-amber-500/20 group-hover:to-orange-500/20 transition-all duration-500"></div>
            
            {/* Decorative Circle */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            
            <div className="relative p-10">
              {/* Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Users className="w-10 h-10 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-3xl text-slate-900 mb-3">Customer Portal</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Submit requirements, receive quotations, place orders, track deliveries, and manage invoices and payments.
              </p>

              {/* Features List */}
              <ul className="space-y-2 mb-6">
                {[
                  'Submit Requirements',
                  'View Quotations',
                  'Place Orders',
                  'Track Deliveries',
                  'Manage Payments'
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-slate-700">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <Button 
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-lg group-hover:shadow-xl transition-all duration-300 py-6 text-lg"
                onClick={() => navigate('/customer-login')}
              >
                Access Customer Portal
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>

          {/* Supplier Portal */}
          <Card 
            className="group relative overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 bg-white"
            onClick={() => navigate('/supplier-login')}
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 group-hover:from-green-500/20 group-hover:via-emerald-500/20 group-hover:to-teal-500/20 transition-all duration-500"></div>
            
            {/* Decorative Circle */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-green-400 to-teal-500 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            
            <div className="relative p-10">
              {/* Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Truck className="w-10 h-10 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-3xl text-slate-900 mb-3">Supplier Portal</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Receive customer requirements, submit quotations, manage orders, dispatch deliveries, and track payments.
              </p>

              {/* Features List */}
              <ul className="space-y-2 mb-6">
                {[
                  'View Requirements',
                  'Submit Quotations',
                  'Manage Orders',
                  'Dispatch Deliveries',
                  'Track Payments'
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-slate-700">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <Button 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-lg group-hover:shadow-xl transition-all duration-300 py-6 text-lg"
                onClick={() => navigate('/supplier-login')}
              >
                Access Supplier Portal
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-slate-600">
          <p className="mb-2">Streamline your business operations with our comprehensive management platform</p>
          <p className="text-sm">© 2024 ABC Business Solutions. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
