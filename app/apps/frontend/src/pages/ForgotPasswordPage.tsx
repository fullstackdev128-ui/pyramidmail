import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OTPInput } from "@/components/ui/otp-input";
import logo from "@/assets/logo.png";

type Step = 1 | 2 | 3 | 4;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setStep(2);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 5) setStep(3);
  };

  const handleStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === confirmPassword && password.length >= 8) {
      setStep(4);
    } else if (password.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caractères");
    } else {
      setError("Les mots de passe ne correspondent pas");
    }
  };

  return (
    <div className="min-h-screen bg-[#EDF3F6] flex flex-col items-center justify-center p-6 font-sans">
      <div className="mb-12">
        <img src={logo} alt="Pyramid Mail" className="h-14 w-auto object-contain" />
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden">
        {/* Step 1: Forgot Password */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold text-[#162A42]">Forgot password?</h1>
              <p className="text-slate-500 font-medium">
                Please enter your email to reset the password
              </p>
            </div>

            <form onSubmit={handleStep1} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#162A42] uppercase tracking-wider">
                  Enter your email
                </label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="bg-[#EDF3F6] border-none h-12 rounded-xl px-4"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-[#0087CA] hover:bg-[#0087CA]/90 rounded-xl font-semibold text-lg shadow-lg shadow-[#0087CA]/20"
              >
                Reset Password
              </Button>
            </form>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-[#091D35] font-semibold hover:text-[#0087CA] transition-colors"
            >
              <ArrowLeft size={18} />
              Back to log in
            </Link>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-[#9ACEE8]/30 rounded-full flex items-center justify-center text-[#0087CA]">
                <Mail size={32} />
              </div>
            </div>
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold text-[#162A42]">Password reset</h1>
              <p className="text-slate-500 font-medium">
                We sent a code to <span className="text-[#162A42] font-semibold">{email}</span>
              </p>
            </div>

            <form onSubmit={handleStep2} className="space-y-8">
              <OTPInput value={otp} onChange={setOtp} length={5} />

              <Button
                type="submit"
                className="w-full h-12 bg-[#0087CA] hover:bg-[#0087CA]/90 rounded-xl font-semibold text-lg"
              >
                Continue
              </Button>
            </form>

            <div className="text-center text-sm font-medium">
              Didn't receive the email?{" "}
              <button className="text-[#0087CA] font-semibold hover:underline">Click here</button>
            </div>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-[#091D35] font-semibold hover:text-[#0087CA] transition-colors"
            >
              <ArrowLeft size={18} />
              Back to log in
            </Link>
          </div>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold text-[#162A42]">Set new password</h1>
              <p className="text-slate-500 font-medium">Must be at least 8 characters</p>
            </div>

            <form onSubmit={handleStep3} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#162A42] uppercase tracking-wider">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="bg-[#EDF3F6] border-none h-12 rounded-xl px-4"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#162A42] uppercase tracking-wider">
                  Confirm password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="bg-[#EDF3F6] border-none h-12 rounded-xl px-4"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

              <Button
                type="submit"
                className="w-full h-12 bg-[#0087CA] hover:bg-[#0087CA]/90 rounded-xl font-semibold text-lg"
              >
                Reset Password
              </Button>
            </form>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-[#091D35] font-semibold hover:text-[#0087CA] transition-colors"
            >
              <ArrowLeft size={18} />
              Back to log in
            </Link>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="space-y-8 text-center py-4">
            <div className="flex justify-center">
              <CheckCircle2 size={80} className="text-green-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-[#162A42]">Success!</h1>
              <p className="text-slate-500 font-medium">
                Your password has been reset successfully.
              </p>
            </div>
            <Button
              onClick={() => navigate("/login")}
              className="w-full h-12 bg-[#0087CA] hover:bg-[#0087CA]/90 rounded-xl font-semibold text-lg"
            >
              Back to login
            </Button>
          </div>
        )}

        {/* Logo Pyramid Mail Bottom */}
        <div className="mt-12 flex flex-col items-center opacity-40">
          <span className="text-[#162A42] font-semibold text-lg tracking-tight">
            PYRAM<span className="text-[#0087CA] font-semibold">ID</span>
          </span>
          <span className="text-[#0087CA] text-[8px] font-semibold -mt-1 self-end italic">Mail</span>
        </div>
      </div>
    </div>
  );
}
