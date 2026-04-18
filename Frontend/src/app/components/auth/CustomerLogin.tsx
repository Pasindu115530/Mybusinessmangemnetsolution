import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Users, ArrowLeft, Mail, Lock, AlertCircle } from 'lucide-react';

export function CustomerLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // handleLogin function එක component එක ඇතුළත නිවැරදිව සකස් කිරීම
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ඔබේ Backend API URL එක මෙතැනට ඇතුළත් කරන්න
      const response = await fetch("http://localhost:5900/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user.role !== 'Customer') {
          setError('Access denied. This portal is strictly for customers.');
          setLoading(false);
          return;
        }

        const userData = data.customer || data.user;

        // 1. Store token
        localStorage.setItem("token", data.token);

        // 2. Store full user object under 'user' key (used by all components)
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("userProfile", JSON.stringify(userData)); // backward compat

        // 3. Store role
        localStorage.setItem("userRole", "customer");

        // 4. Store customID separately for convenience
        const customID = userData?.customID || userData?.customerId;
        if (customID) localStorage.setItem("customID", customID);

        console.log("Customer Login Success! _id:", userData?._id, "customID:", customID);

        // 3. සාර්ථක වූ පසු Dashboard එකට යොමු කිරීම
        // window.location.href වෙනුවට navigate පාවිච්චි කිරීම වඩාත් සුදුසුයි
        navigate("/customer");
      } else {
        setError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center p-4">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-30"></div>
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
        <Card className="border-0 shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white p-8 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl mb-2">Customer Login</CardTitle>
            <p className="text-yellow-100">Welcome back! Please login to your account</p>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-900">{error}</p>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-yellow-500 focus:ring-yellow-500 h-12"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-yellow-500 focus:ring-yellow-500 h-12"
                  />
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-slate-300 data-[state=checked]:bg-yellow-500"
                  />
                  <Label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <Link to="/forgot-password" className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white h-12 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Logging in...</span>
                  </div>
                ) : (
                  'Login to Customer Portal'
                )}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500">New to our platform?</span>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                <p className="text-slate-600 mb-2">Don't have an account?</p>
                <Link to="/customer-register">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 hover:text-yellow-800"
                  >
                    Register as Customer
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-slate-600 mt-6">
          By logging in, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}