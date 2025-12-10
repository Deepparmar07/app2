import { useEffect, useState } from 'react';
import { HardDrive } from 'lucide-react';

export default function LoadingPage() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 rounded-3xl blur-2xl animate-pulse" />
          <div className="relative bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20 shadow-2xl">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 rounded-2xl animate-pulse" />
              <HardDrive className="relative w-24 h-24 text-white drop-shadow-2xl animate-bounce" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">
            SecureBox
          </h1>
          <p className="text-xl text-white/90 drop-shadow-md font-medium">
            Secure Cloud File Storage
          </p>
        </div>

        <div className="w-64 space-y-3">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-white via-white/90 to-white/80 rounded-full transition-all duration-300 ease-out shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-white/80 font-medium">
            <span>Loading...</span>
            <span>{progress}%</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      <div className="absolute bottom-8 text-center text-white/60 text-sm">
        <p>Powered by Secure Technology</p>
      </div>
    </div>
  );
}
