import { useEffect, useState } from 'react';
import { HardDrive, Shield, Lock, Cloud } from 'lucide-react';

export default function LoadingPage() {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing');

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1.5;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress < 30) {
      setLoadingText('Initializing secure connection');
    } else if (progress < 60) {
      setLoadingText('Verifying authentication');
    } else if (progress < 90) {
      setLoadingText('Loading your workspace');
    } else {
      setLoadingText('Almost ready');
    }
  }, [progress]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Floating security icons */}
      <div className="absolute inset-0 pointer-events-none">
        <Shield className="absolute top-20 left-20 w-8 h-8 text-white/10 animate-float" style={{ animationDelay: '0s' }} />
        <Lock className="absolute top-40 right-32 w-6 h-6 text-white/10 animate-float" style={{ animationDelay: '1s' }} />
        <Cloud className="absolute bottom-32 left-40 w-10 h-10 text-white/10 animate-float" style={{ animationDelay: '2s' }} />
        <Shield className="absolute bottom-20 right-20 w-7 h-7 text-white/10 animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full px-6">
        {/* Logo container with advanced animations */}
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 -m-8">
            <div className="w-full h-full rounded-full border-2 border-white/20 animate-ping" style={{ animationDuration: '3s' }} />
          </div>
          
          {/* Middle glow ring */}
          <div className="absolute inset-0 -m-4">
            <div className="w-full h-full rounded-full border border-white/30 animate-pulse" />
          </div>

          {/* Logo card */}
          <div className="relative bg-white/10 backdrop-blur-xl p-10 rounded-3xl border border-white/20 shadow-2xl">
            <div className="relative">
              {/* Rotating gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent rounded-2xl animate-spin-slow" />
              
              {/* Icon */}
              <div className="relative">
                <HardDrive className="w-20 h-20 text-white drop-shadow-2xl animate-pulse-slow" />
                
                {/* Small orbiting dots */}
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-white rounded-full animate-orbit" />
                <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-white/80 rounded-full animate-orbit-reverse" />
              </div>
            </div>
          </div>
        </div>

        {/* Brand name with gradient text */}
        <div className="text-center space-y-3">
          <h1 className="text-6xl font-bold text-white drop-shadow-2xl tracking-tight animate-fade-in">
            EpicBox
          </h1>
          <div className="flex items-center justify-center gap-2 text-white/90">
            <Shield className="w-4 h-4" />
            <p className="text-lg font-medium drop-shadow-md">
              Enterprise-Grade File Storage
            </p>
          </div>
        </div>

        {/* Progress section */}
        <div className="w-full space-y-4">
          {/* Progress bar */}
          <div className="relative">
            <div className="h-2.5 bg-white/15 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-white via-white to-white/90 rounded-full transition-all duration-500 ease-out shadow-lg relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
              </div>
            </div>
            
            {/* Progress percentage */}
            <div className="absolute -top-8 left-0 right-0 flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-1 rounded-full border border-white/20">
                <span className="text-sm font-bold text-white">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>

          {/* Loading text */}
          <div className="text-center">
            <p className="text-white/80 font-medium text-sm animate-pulse">
              {loadingText}
            </p>
          </div>
        </div>

        {/* Loading dots */}
        <div className="flex gap-2.5">
          <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0ms' }} />
          <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce shadow-lg" style={{ animationDelay: '150ms' }} />
          <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce shadow-lg" style={{ animationDelay: '300ms' }} />
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-3 gap-4 w-full mt-4">
          <div className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
            <Shield className="w-5 h-5 text-white/80" />
            <span className="text-xs text-white/70 font-medium">Encrypted</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
            <Lock className="w-5 h-5 text-white/80" />
            <span className="text-xs text-white/70 font-medium">Secure</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
            <Cloud className="w-5 h-5 text-white/80" />
            <span className="text-xs text-white/70 font-medium">Cloud</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-center">
        <p className="text-white/50 text-sm font-medium">
          Powered by Advanced Security Technology
        </p>
      </div>
    </div>
  );
}
