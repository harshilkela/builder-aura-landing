import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import {
  UserCircle,
  Mail,
  Lock,
  Users,
  Sparkles,
  Zap,
  Heart,
  Star,
  Rocket,
  Globe,
} from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate("/dashboard");
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role: "user" | "admin") => {
    setLoading(true);
    const demoEmail =
      role === "admin" ? "admin@skillswap.com" : "john@example.com";

    try {
      const success = await login(demoEmail, "demo");
      if (success) {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/30 to-blue-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header with modern branding */}
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-2xl shadow-xl">
                <div className="flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white mr-2" />
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold gradient-text-purple">
              SkillSwap
            </h1>
            <p className="text-gray-600 dark:text-purple-200 text-lg">
              Where passions meet and skills flourish ✨
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-red-400" />
                <span>Connect</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>Learn</span>
              </div>
              <div className="flex items-center gap-1">
                <Rocket className="h-4 w-4 text-blue-400" />
                <span>Grow</span>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form with glassmorphism */}
        <Card className="border-0 shadow-2xl shadow-purple-500/20 backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-3xl overflow-hidden transition-colors duration-300">
          <CardHeader className="text-center pb-6 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/30 dark:to-pink-900/30">
            <CardTitle className="flex items-center justify-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <UserCircle className="h-5 w-5 text-white" />
              </div>
              <span className="gradient-text-purple">Welcome Back!</span>
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-purple-200">
              Ready to continue your learning journey?
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 p-6">
              {error && (
                <Alert className="border-red-200 bg-red-50 rounded-2xl">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-100 font-medium"
                >
                  <Mail className="h-4 w-4 text-purple-500" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300 py-3"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-100 font-medium"
                >
                  <Lock className="h-4 w-4 text-purple-500" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300 py-3"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 p-6 pt-0">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02] group"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing you in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 group-hover:animate-bounce" />
                    Sign In
                  </div>
                )}
              </Button>

              <div className="text-center">
                <span className="text-gray-600 dark:text-purple-200">
                  New to SkillSwap?{" "}
                </span>
                <Link
                  to="/register"
                  className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors"
                >
                  Join the community
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Demo Accounts with modern styling */}
        <Card className="border-0 shadow-xl shadow-purple-500/10 backdrop-blur-lg bg-white/70 dark:bg-gray-800/70 rounded-3xl overflow-hidden transition-colors duration-300">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg gradient-text-purple flex items-center justify-center gap-2">
              <Globe className="h-5 w-5" />
              Try It Out
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-purple-200">
              Explore with our demo accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-6 pt-0">
            <Button
              onClick={() => demoLogin("user")}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium py-3 rounded-2xl shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-[1.02] group"
            >
              <UserCircle className="h-4 w-4 mr-2 group-hover:animate-pulse" />
              Demo User Experience
            </Button>
            <Button
              onClick={() => demoLogin("admin")}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium py-3 rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-[1.02] group"
            >
              <Users className="h-4 w-4 mr-2 group-hover:animate-pulse" />
              Admin Dashboard
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Built with 💜 for the community</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
