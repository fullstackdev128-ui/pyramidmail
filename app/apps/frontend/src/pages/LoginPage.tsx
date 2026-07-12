import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { AUTH_QUERY_KEY } from "@/hooks/useAuth";
import { LoginAd } from "@/components/ads/LoginAd";
import logo from "@/assets/logo.png";
import loginImage from "@/assets/pymail-login.gif";

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginAd, setShowLoginAd] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authService.login(email, password);
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      navigate("/inbox");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Email ou mot de passe incorrect";
      setError(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdDismiss = () => {
    setShowLoginAd(false);
    navigate("/inbox");
  };

  return (
    <div className="h-screen flex bg-white font-sans text-[#091D35]">
      {/* Colonne Gauche - Illustration (Visible uniquement sur Desktop) */}
      <div className="hidden md:block md:w-1/2 h-full">
        <img src={loginImage} alt="Pyramid Mail" className="w-full h-full object-cover" />
      </div>

      {/* Colonne Droite - Formulaire */}
      <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center p-6 md:p-24 relative overflow-y-auto">
        {/* Logo Mobile / Top Right Desktop */}
        <div className="absolute top-8 right-8 hidden md:block">
          <img src={logo} alt="Pyramid Mail" className="h-10 w-auto object-contain" />
        </div>

        <div className="md:hidden mb-12">
          <img src={logo} alt="Pyramid Mail" className="h-14 w-auto object-contain mx-auto" />
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-[#162A42]">Nice to see you again</h1>
            <p className="text-slate-500 font-medium">Login</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#162A42]">Email or phone number</label>
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-[#EDF3F6] border-none h-12 rounded px-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#162A42]">Enter password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="bg-[#EDF3F6] border-none h-12 rounded px-4 pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0087CA]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <label htmlFor="remember" className="text-sm font-medium text-slate-500">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                title="Mot de passe oublié ?"
                className="text-sm font-semibold text-[#0087CA] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#0087CA] hover:bg-[#0087CA]/90 rounded font-semibold text-lg shadow-md shadow-[#0087CA]/20 disabled:opacity-60"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-slate-500 font-medium">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#0087CA] font-semibold hover:underline">
              Sign up now
            </Link>
          </p>
        </div>

        {/* Mobile Logo Bottom */}
        <div className="md:hidden mt-12">
          <div className="flex flex-col items-center opacity-50">
            <span className="text-[#162A42] font-semibold text-lg tracking-tight">
              PYRAM<span className="text-[#0087CA] font-semibold">ID</span>
            </span>
            <span className="text-[#0087CA] text-[8px] font-semibold -mt-1 self-end italic">Mail</span>
          </div>
        </div>
      </div>

      {/* Login Ad Overlay - Temporairement désactivé pour stabilisation */}
      {/* {showLoginAd && <LoginAd onDismiss={handleAdDismiss} />} */}
    </div>
  );
}
