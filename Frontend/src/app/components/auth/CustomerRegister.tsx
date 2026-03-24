import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // Axios එක් කරන ලදී
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Users, ArrowLeft, Mail, Lock, User, Phone, Building2, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export function CustomerRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    vatNumber: '',
    email: '',
    contactNumber: '',
    address: '', // ලිපිනය අනිවාර්ය නිසා මෙය එක් කරන ලදී
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [serverMsg, setServerMsg] = useState(''); // Backend එකෙන් එන වැරදි පෙන්වීමට

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.address.trim()) newErrors.address = 'Physical address is required';
    
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerMsg('');
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Backend API එකට සම්බන්ධ වීම (ඔබේ URL එක මෙතැනට දාන්න)
      const response = await axios.post('http://localhost:5900/api/users/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: 'Customer', // Role එක ස්වයංක්‍රීයව පවරයි
        contactNumber: formData.contactNumber,
        address: formData.address,
        companyName: formData.companyName,
        vatNumber: formData.vatNumber
      });

      if (response.status === 201) {
        setLoading(false);
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      setLoading(false);
      setServerMsg(error.response?.data?.message || 'Registration failed. Try again.');
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
    navigate('/customer-login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 py-8 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="w-full max-w-2xl mx-auto relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate('/customer-login')}
          className="mb-6 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Button>

        <Card className="border-0 shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white p-8 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl mb-2">Customer Registration</CardTitle>
            <p className="text-yellow-100">Create your account to get started</p>
          </CardHeader>

          <CardContent className="p-8">
            {serverMsg && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {serverMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className={`pl-10 h-12 ${errors.fullName ? 'border-red-300' : 'border-slate-200'}`}
                  />
                </div>
                {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name (Optional)</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input id="companyName" value={formData.companyName} onChange={(e) => handleChange('companyName', e.target.value)} className="pl-10 h-12 border-slate-200" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vatNumber">VAT Number (Optional)</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input id="vatNumber" value={formData.vatNumber} onChange={(e) => handleChange('vatNumber', e.target.value)} className="pl-10 h-12 border-slate-200" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Physical Address <span className="text-red-500">*</span></Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className={`h-12 ${errors.address ? 'border-red-300' : 'border-slate-200'}`}
                />
                {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className={`pl-10 h-12 ${errors.email ? 'border-red-300' : 'border-slate-200'}`} />
                  </div>
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input id="contactNumber" type="tel" value={formData.contactNumber} onChange={(e) => handleChange('contactNumber', e.target.value)} className={`pl-10 h-12 ${errors.contactNumber ? 'border-red-300' : 'border-slate-200'}`} />
                  </div>
                  {errors.contactNumber && <p className="text-sm text-red-600">{errors.contactNumber}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input id="password" type="password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} className={`pl-10 h-12 ${errors.password ? 'border-red-300' : 'border-slate-200'}`} />
                  </div>
                  {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} className={`pl-10 h-12 ${errors.confirmPassword ? 'border-red-300' : 'border-slate-200'}`} />
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 h-12 text-lg shadow-lg">
                {loading ? 'Creating Account...' : 'Create Customer Account'}
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
          <p className="text-slate-600 mb-6">Your customer account has been created. Your unique ID will be displayed in your dashboard.</p>
          <Button onClick={handleSuccessClose} className="w-full bg-yellow-500">Continue to Login</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}