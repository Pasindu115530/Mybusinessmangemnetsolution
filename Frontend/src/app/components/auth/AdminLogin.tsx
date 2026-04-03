import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { ShieldCheck, ArrowLeft, Mail, Lock, AlertCircle } from 'lucide-react';

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // මූලික පරීක්ෂාව
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      // Backend Login API එකට සම්බන්ධ වීම (ඔබේ API URL එක මෙතැනට දාන්න)
      const response = await fetch("http://localhost:5900/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // ආරක්ෂාව සඳහා: ලොගින් වන පරිශීලකයා Admin කෙනෙක්දැයි පරීක්ෂා කිරීම
        if (data.user.role !== 'Admin') {
          setError('Access denied. This portal is strictly for administrators.');
          setLoading(false);
          return;
        }

        // 1. Store token
        localStorage.setItem("token", data.token);

        // 2. Store full user object under 'user' key (used by all components)
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userProfile", JSON.stringify(data.user)); // backward compat

        // 3. Role and customID
        localStorage.setItem("userRole", data.user.role.toLowerCase());
        localStorage.setItem("customID", data.user.customID);

        console.log("Admin Login Success! _id:", data.user._id, "customID:", data.user.customID);
        
        // 3. Admin Dashboard එකට යොමු කිරීම
        navigate('/admin'); 
      } else {
        setError(data.message || "Invalid admin credentials");
      }
    } catch (err) {
      console.error("Admin Login Error:", err);
      setError("Connection to admin server failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl overflow-hidden border-t-4 border-indigo-600">
          {/* Header with Admin Theme */}
          <CardHeader className="bg-gradient-to-r from-slate-800 to-indigo-900 text-white p-8 text-center">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
              <ShieldCheck className="w-8 h-8 text-indigo-300" />
            </div>
            <CardTitle className="text-3xl mb-2 font-bold tracking-tight">Admin Portal</CardTitle>
            <p className="text-indigo-200 text-sm">Secure Management Access</p>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-semibold">Admin Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="admin@system.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-indigo-500 h-12"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-semibold">Master Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-indigo-500 h-12"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-slate-300 data-[state=checked]:bg-indigo-600"
                  />
                  <Label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">
                    Keep me logged in
                  </Label>
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-lg font-bold shadow-lg transition-all active:scale-[0.98]"
              >
                {loading ? 'Verifying...' : 'Access Dashboard'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-8 uppercase tracking-widest font-bold">
          System Security Level: High
        </p>
      </div>
    </div>
  );
}