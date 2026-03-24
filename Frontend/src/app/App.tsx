import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useState } from 'react';

// Auth Components
import { CompanyHome } from './components/auth/CompanyHome';
import { CustomerLogin } from './components/auth/CustomerLogin';
import { CustomerRegister } from './components/auth/CustomerRegister';
import { SupplierLogin } from './components/auth/SupplierLogin';
import { SupplierRegister } from './components/auth/SupplierRegister';
import { AdminLogin } from './components/auth/AdminLogin';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StockManagement } from './components/admin/StockManagement';
import { FinanceManagement } from './components/admin/FinanceManagement';
import { CustomerManagement } from './components/admin/CustomerManagement';
import { SupplierManagement } from './components/admin/SupplierManagement';
import { CustomerRequests } from './components/admin/CustomerRequests';
import { RequestQuotation } from './components/admin/RequestQuotation';
import { PurchaseOrders } from './components/admin/PurchaseOrders';
import { PaymentsTransactions } from './components/admin/PaymentsTransactions';
import { CustomerOrders as AdminCustomerOrders } from './components/admin/CustomerOrders';
import { CustomerQuotations } from './components/admin/CustomerQuotations';
import { CustomerDeliveryTracking } from './components/admin/CustomerDeliveryTracking';
import { CustomerInvoicesAdmin } from './components/admin/CustomerInvoicesAdmin';
import { CustomerPaymentsAdmin } from './components/admin/CustomerPaymentsAdmin';
import { AdminCreateQuotation } from './components/admin/AdminCreateQuotation';
import { SupplierRequests } from './components/admin/SupplierRequests';
import { SupplierQuotationsAdmin } from './components/admin/SupplierQuotationsAdmin';
import { SupplierDeliveryTracking } from './components/admin/SupplierDeliveryTracking';
import { SupplierInvoicesAdmin } from './components/admin/SupplierInvoicesAdmin';
import { SupplierPaymentsAdmin } from './components/admin/SupplierPaymentsAdmin';
import { Settings } from './components/admin/Settings';

// Supplier Components
import { SupplierDashboard } from './components/supplier/SupplierDashboard';
import { CustomerRequirements } from './components/supplier/CustomerRequirements';
import { QuotationCreation } from './components/supplier/QuotationCreation';
import { QuotationStatus } from './components/supplier/QuotationStatus';
import { SupplierOrders } from './components/supplier/SupplierOrders';
import { DeliveryDispatch } from './components/supplier/DeliveryDispatch';
import { InvoiceSubmission } from './components/supplier/InvoiceSubmission';
import { PaymentStatus } from './components/supplier/PaymentStatus';

// Customer Components
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { SendRequirements } from './components/customer/SendRequirements';
import { ViewQuotations } from './components/customer/ViewQuotations';
import { CustomerOrders } from './components/customer/CustomerOrders';
import { DeliveryTracking } from './components/customer/DeliveryTracking';
import { CustomerInvoices } from './components/customer/CustomerInvoices';
import { CustomerPayment } from './components/customer/CustomerPayment';
import { OrderConfirmation } from './components/customer/OrderConfirmation';

export type UserRole = 'admin' | 'supplier' | 'customer';

const ProtectedRoute = ({ allowedRole }: { allowedRole: UserRole }) => {
  const role = localStorage.getItem('userRole');
  if (role !== allowedRole) {
    if (allowedRole === 'admin') return <Navigate to="/admin-login" replace />;
    if (allowedRole === 'supplier') return <Navigate to="/supplier-login" replace />;
    if (allowedRole === 'customer') return <Navigate to="/customer-login" replace />;
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/" element={<CompanyHome />} />
          <Route path="/customer-login" element={<CustomerLogin />} />
          <Route path="/customer-register" element={<CustomerRegister />} />
          <Route path="/supplier-login" element={<SupplierLogin />} />
          <Route path="/supplier-register" element={<SupplierRegister />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRole="admin" />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/stock" element={<StockManagement />} />
            <Route path="/finance" element={<FinanceManagement />} />
            <Route path="/payments" element={<PaymentsTransactions />} />
            <Route path="/customers" element={<CustomerManagement />} />
            <Route path="/customer-requests" element={<CustomerRequests />} />
            <Route path="/customer-quotations" element={<CustomerQuotations />} />
            <Route path="/customer-orders" element={<AdminCustomerOrders />} />
            <Route path="/customer-delivery" element={<CustomerDeliveryTracking />} />
            <Route path="/customer-invoices" element={<CustomerInvoicesAdmin />} />
            <Route path="/customer-payments" element={<CustomerPaymentsAdmin />} />
            <Route path="/suppliers" element={<SupplierManagement />} />
            <Route path="/supplier-requirements" element={<SupplierRequests />} />
            <Route path="/supplier-quotations" element={<SupplierQuotationsAdmin />} />
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/supplier-delivery" element={<SupplierDeliveryTracking />} />
            <Route path="/supplier-invoices" element={<SupplierInvoicesAdmin />} />
            <Route path="/supplier-payments" element={<SupplierPaymentsAdmin />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/request-quotation" element={<RequestQuotation />} />
            <Route path="/create-quotation" element={<AdminCreateQuotation />} />
          </Route>
          
          {/* Supplier Routes */}
          <Route element={<ProtectedRoute allowedRole="supplier" />}>
            <Route path="/supplier" element={<SupplierDashboard />} />
            <Route path="/supplier/requirements" element={<CustomerRequirements />} />
            <Route path="/supplier/create-quotation" element={<QuotationCreation />} />
            <Route path="/supplier/quotation-status" element={<QuotationStatus />} />
            <Route path="/supplier/orders" element={<SupplierOrders />} />
            <Route path="/supplier/delivery" element={<DeliveryDispatch />} />
            <Route path="/supplier/invoices" element={<InvoiceSubmission />} />
            <Route path="/supplier/payments" element={<PaymentStatus />} />
          </Route>
          
          {/* Customer Routes */}
          <Route element={<ProtectedRoute allowedRole="customer" />}>
            <Route path="/customer" element={<CustomerDashboard />} />
            <Route path="/customer/send-requirements" element={<SendRequirements />} />
            <Route path="/customer/quotations" element={<ViewQuotations />} />
            <Route path="/customer/orders" element={<CustomerOrders />} />
            <Route path="/customer/delivery-tracking" element={<DeliveryTracking />} />
            <Route path="/customer/invoices" element={<CustomerInvoices />} />
            <Route path="/customer/payments" element={<CustomerPayment />} />
            <Route path="/customer/order-confirmation" element={<OrderConfirmation />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}