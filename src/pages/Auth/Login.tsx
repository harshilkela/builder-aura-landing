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
import { UserCircle, Mail, Lock, Users } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-600 p-3 rounded-full">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">SkillSwap</h1>
          <p className="text-gray-600 mt-2">Connect, Learn, and Share Skills</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              Sign In
            </CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Demo Logins */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Demo Accounts</CardTitle>
            <CardDescription className="text-xs">
              Try the platform with pre-configured accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => demoLogin("user")}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              Demo User (john@example.com)
            </Button>
            <Button
              onClick={() => demoLogin("admin")}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              Demo Admin (admin@skillswap.com)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
