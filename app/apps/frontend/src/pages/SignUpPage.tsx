import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth.service";
import logo from "@/assets/logo.png";
import loginImage from "@/assets/pymail-login.gif";

export function SignUpPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({
        email,
        password,
        displayName: fullName,
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
      });
      navigate("/login");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Erreur lors de la création du compte";
      setError(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-white font-sans text-[#091D35]">
      {/* Colonne Gauche - Illustration */}
      <div className="hidden md:block md:w-1/2 h-full">
        <img src={loginImage} alt="Pyramid Mail" className="w-full h-full object-cover" />
      </div>

      {/* Colonne Droite - Formulaire */}
      <div className="w-full md:w-1/2 h-full flex flex-col items-center p-6 md:p-24 relative overflow-y-auto">
        {/* <div className="absolute top-8 right-8 hidden md:block">
          <img src={logo} alt="Pyramid Mail" className="h-10 w-auto object-contain" />
        </div> */}

        <div className="w-full max-w-md space-y-8">
          <img src={logo} alt="Pyramid Mail" className="h-10 lg:h-16 w-auto object-contain mb-4" />
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-[#162A42]">Create your account</h1>
            <p className="text-slate-500 font-medium">Precision Curator account</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#162A42]">Full name</label>
              <Input
                placeholder="John Doe"
                className="bg-[#EDF3F6] border-none h-12 rounded px-4"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#162A42]">Email address</label>
              <Input
                type="email"
                placeholder="name@pyramid.com"
                className="bg-[#EDF3F6] border-none h-12 rounded px-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#162A42]">
                Téléphone <span className="font-normal text-slate-400">(optionnel)</span>
              </label>
              <Input
                type="tel"
                placeholder="+237 6XX XXX XXX"
                className="bg-[#EDF3F6] border-none h-12 rounded px-4"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#162A42]">
                Ville <span className="font-normal text-slate-400">(optionnel)</span>
              </label>
              <Input
                placeholder="Douala, Yaoundé..."
                className="bg-[#EDF3F6] border-none h-12 rounded px-4"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#162A42]">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#162A42]">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="bg-[#EDF3F6] border-none h-12 rounded px-4 pr-12"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0087CA]"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-500 text-xs font-semibold rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#0087CA] hover:bg-[#0087CA]/90 rounded font-semibold text-lg shadow-lg shadow-[#0087CA]/20 disabled:opacity-60"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Create account"}
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-slate-500 text-sm font-medium">
              Already have an account?{" "}
              <Link to="/login" className="text-[#0087CA] font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
