import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Truck, ArrowLeft, Mail, Lock, User, Phone, Building2, FileText, CheckCircle, AlertCircle, MapPin } from 'lucide-react';

export function SupplierRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    vatNumber: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
    address: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [serverError, setServerError] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    
    // VAT Number format check (Optional but recommended)
    if (!formData.vatNumber.trim()) {
      newErrors.vatNumber = 'VAT number is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.address.trim()) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Backend එකේ createUser function එකට දත්ත යැවීම
      const response = await axios.post('http://localhost:5900/api/users/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: 'Supplier', // Role එක මෙතැනින් ස්ථාවරව යවයි
        contactNumber: formData.contactNumber,
        address: formData.address,
        companyName: formData.companyName,
        vatNumber: formData.vatNumber
      });

      if (response.status === 201) {
        setLoading(false);
        setShowSuccessModal(true);
      }
    } catch (err: any) {
      setLoading(false);
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/supplier-login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="w-full max-w-2xl mx-auto relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate('/supplier-login')}
          className="mb-6 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Button>

        <Card className="border-0 shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-8 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl mb-2">Supplier Registration</CardTitle>
            <p className="text-green-100">Join our network of trusted suppliers</p>
          </CardHeader>

          <CardContent className="p-8">
            {serverError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input id="fullName" placeholder="John Doe" value={formData.fullName} onChange={(e) => handleChange('fullName', e.target.value)} className={`pl-10 h-12 ${errors.fullName ? 'border-red-300' : 'border-slate-200'}`} />
                </div>
                {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input id="companyName" placeholder="ABC Suppliers Ltd" value={formData.companyName} onChange={(e) => handleChange('companyName', e.target.value)} className={`pl-10 h-12 ${errors.companyName ? 'border-red-300' : 'border-slate-200'}`} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vatNumber">VAT Number <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input id="vatNumber" placeholder="GB123456789" value={formData.vatNumber} onChange={(e) => handleChange('vatNumber', e.target.value)} className={`pl-10 h-12 ${errors.vatNumber ? 'border-red-300' : 'border-slate-200'}`} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input id="email" type="email" placeholder="supplier@company.com" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className={`pl-10 h-12 ${errors.email ? 'border-red-300' : 'border-slate-200'}`} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input id="contactNumber" type="tel" placeholder="+1 234..." value={formData.contactNumber} onChange={(e) => handleChange('contactNumber', e.target.value)} className={`pl-10 h-12 ${errors.contactNumber ? 'border-red-300' : 'border-slate-200'}`} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Company Address <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <Textarea id="address" placeholder="Full address" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} className={`pl-10 min-h-24 ${errors.address ? 'border-red-300' : 'border-slate-200'}`} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input id="password" type="password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} className={`pl-10 h-12 ${errors.password ? 'border-red-300' : 'border-slate-200'}`} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} className={`pl-10 h-12 ${errors.confirmPassword ? 'border-red-300' : 'border-slate-200'}`} />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-green-600 to-emerald-700 h-12 text-lg shadow-lg">
                {loading ? 'Creating Account...' : 'Create Supplier Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="text-center">
          <DialogHeader>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <DialogTitle className="text-2xl">Registration Successful!</DialogTitle>
          </DialogHeader>
          <p className="text-slate-600 mb-6">Your supplier account has been created. Use your credentials to login to the portal.</p>
          <Button onClick={handleSuccessClose} className="w-full bg-green-600">Continue to Login</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}