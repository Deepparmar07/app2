import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowLeft, HardDrive, Shield, Lock, Cloud, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/db/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: 'Email Sent!',
        description: 'Check your inbox for password reset instructions',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send reset email',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden xl:flex xl:w-1/2 bg-gradient-to-br from-primary via-primary/95 to-secondary relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Floating icons */}
        <div className="absolute inset-0 pointer-events-none">
          <Shield className="absolute top-20 left-20 w-12 h-12 text-white/10 animate-float" />
          <Lock className="absolute top-40 right-32 w-10 h-10 text-white/10 animate-float" style={{ animationDelay: '1s' }} />
          <Cloud className="absolute bottom-32 left-40 w-14 h-14 text-white/10 animate-float" style={{ animationDelay: '2s' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <HardDrive className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">EpicBox</h1>
                <p className="text-white/80 text-sm">Enterprise File Storage</p>
              </div>
            </div>

            {/* Security Features */}
            <div className="space-y-6 mt-12">
              <h2 className="text-3xl font-bold">Account Security</h2>
              <p className="text-white/90 text-lg">
                We take your account security seriously. Reset your password securely.
              </p>

              <div className="space-y-4 mt-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Secure Reset Process</h3>
                    <p className="text-white/80 text-sm">Email verification ensures only you can reset your password</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Email Verification</h3>
                    <p className="text-white/80 text-sm">We'll send a secure link to your registered email</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Protected Access</h3>
                    <p className="text-white/80 text-sm">Your files remain secure during the reset process</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Reset Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="xl:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <HardDrive className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">EpicBox</h1>
              <p className="text-muted-foreground text-xs">Enterprise File Storage</p>
            </div>
          </div>

          <Card className="border-border shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold">
                {emailSent ? 'Check Your Email' : 'Reset Password'}
              </CardTitle>
              <CardDescription>
                {emailSent
                  ? 'We sent password reset instructions to your email'
                  : 'Enter your email to receive reset instructions'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emailSent ? (
                <div className="space-y-6">
                  {/* Success State */}
                  <div className="flex flex-col items-center text-center space-y-4 py-6">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Email Sent Successfully!</h3>
                      <p className="text-sm text-muted-foreground">
                        We've sent a password reset link to:
                      </p>
                      <p className="font-medium">{email}</p>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <h4 className="font-medium text-sm">Next Steps:</h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Check your email inbox</li>
                      <li>Click the reset link in the email</li>
                      <li>Create a new password</li>
                      <li>Sign in with your new password</li>
                    </ol>
                  </div>

                  {/* Resend Option */}
                  <div className="text-center text-sm text-muted-foreground">
                    Didn't receive the email?{' '}
                    <button
                      onClick={() => setEmailSent(false)}
                      className="text-secondary hover:underline font-medium"
                    >
                      Try again
                    </button>
                  </div>

                  {/* Back to Login */}
                  <Link to="/login">
                    <Button variant="outline" className="w-full h-11">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11"
                        disabled={loading}
                        autoComplete="email"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter the email associated with your account
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-medium"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Send Reset Link
                      </span>
                    )}
                  </Button>

                  {/* Back to Login */}
                  <div className="pt-4">
                    <Link to="/login">
                      <Button variant="ghost" className="w-full h-11" disabled={loading}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                      </Button>
                    </Link>
                  </div>
                </form>
              )}

              {/* Help Text */}
              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground">
                  Need help? Contact support at{' '}
                  <a href="mailto:support@epicbox.com" className="text-secondary hover:underline">
                    support@epicbox.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 EpicBox</p>
          </div>
        </div>
      </div>
    </div>
  );
}
