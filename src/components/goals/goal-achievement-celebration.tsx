import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Trophy, TrendingUp, Sparkles, Clock } from 'lucide-react';

interface GoalAchievementCelebrationProps {
  show: boolean;
  onComplete: () => void;
  goalType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  wordsWritten: number;
  target: number;
  percentage: number;
}

export function GoalAchievementCelebration({
  show,
  onComplete,
  goalType = 'daily',
  wordsWritten,
  target,
  percentage,
}: GoalAchievementCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const DURATION = 6000; // 6 seconds - perfect for corner celebration

  useEffect(() => {
    if (!show) {
      setIsVisible(false);
      setProgress(0);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    // Start the celebration
    setIsVisible(true);
    setProgress(0);
    startTimeRef.current = Date.now();

    // Animate progress
    const animate = () => {
      const elapsed = Date.now() - (startTimeRef.current || 0);
      const newProgress = Math.min((elapsed / DURATION) * 100, 100);
      
      setProgress(newProgress);
      
      if (newProgress < 100) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Complete
        setTimeout(() => {
          setIsVisible(false);
          onComplete();
        }, 100);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [show, onComplete]);

  if (!isVisible) {
    return null;
  }

  const messages = {
    daily: 'Daily Goal! 🔥',
    weekly: 'Weekly Goal! ⚡',
    monthly: 'Monthly Goal! 🚀',
    yearly: 'Yearly Goal! 🌟',
  };

  // Calculate stroke dasharray for circular progress
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[9999] pointer-events-auto max-w-sm">
      {/* Premium celebration card with backdrop blur */}
      <div
        className={cn(
          'relative overflow-hidden',
          'bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95',
          'backdrop-blur-xl border border-orange-500/30',
          'rounded-2xl shadow-2xl',
          'animate-celebration-entrance'
        )}
        style={{
          backdropFilter: 'blur(20px) saturate(1.2)',
          boxShadow: [
            '0 20px 40px rgba(0, 0, 0, 0.4)',
            '0 0 60px rgba(249, 115, 22, 0.3)',
            'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            'inset 0 0 20px rgba(249, 115, 22, 0.1)'
          ].join(', ')
        }}
      >
        {/* Premium SVG flame background */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <svg
            className="absolute -bottom-4 -left-4 w-32 h-32 opacity-40"
            viewBox="0 0 120 120"
            fill="none"
          >
            {/* Main flame with realistic curves */}
            <path
              d="M25 115 C25 115 15 100 20 85 C25 70 35 60 30 45 C25 30 15 25 25 15 C35 5 50 10 55 25 C60 40 50 50 60 65 C70 80 85 75 90 90 C95 105 80 115 65 115 C50 115 35 115 25 115 Z"
              fill="url(#premiumFlame1)"
              className="animate-premium-flame"
            />
            
            {/* Inner flame for depth */}
            <path
              d="M35 105 C35 105 30 95 32 85 C34 75 40 70 38 60 C36 50 32 47 36 40 C40 33 48 36 50 45 C52 54 48 58 52 68 C56 78 65 76 67 85 C69 94 62 105 52 105 C42 105 35 105 35 105 Z"
              fill="url(#premiumFlame2)"
              className="animate-premium-flame-inner"
            />
            
            {/* Flame tip */}
            <ellipse
              cx="42"
              cy="25"
              rx="8"
              ry="15"
              fill="url(#premiumFlame3)"
              className="animate-flame-tip"
            />
            
            {/* Premium gradient definitions */}
            <defs>
              <linearGradient id="premiumFlame1" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stopColor="#dc2626" stopOpacity="0.9" />
                <stop offset="30%" stopColor="#ea580c" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="premiumFlame2" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stopColor="#b91c1c" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#fef3c7" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="premiumFlame3" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#fef3c7" stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Floating sparks */}
          <div className="absolute inset-0">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-spark-float"
                style={{
                  left: `${15 + (i % 3) * 25}%`,
                  bottom: `${10 + (i % 4) * 15}%`,
                  animationDelay: `${i * 0.6}s`,
                  animationDuration: `${3 + Math.random()}s`,
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Elegant timeout indicator - top right */}
        <div className="absolute -top-2 -right-2">
          <div className="relative w-8 h-8">
            <svg width="32" height="32" className="transform -rotate-90">
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="2"
                fill="none"
              />
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="url(#timeGradient)"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 14}`}
                strokeDashoffset={`${2 * Math.PI * 14 * (progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[9px] text-orange-300 font-bold">
                {Math.ceil((100 - progress) * DURATION / 100 / 1000)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400 animate-trophy-pulse" />
            <div>
              <h3 className="text-lg font-bold text-white">
                {messages[goalType]}
              </h3>
              <p className="text-xs text-orange-300 font-medium">
                Achievement Unlocked
              </p>
            </div>
          </div>

          {/* Progress visualization */}
          <div className="space-y-3">
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full relative"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-progress-sweep" />
              </div>
            </div>
            
            <div className="text-center">
              <span className="text-orange-200 text-sm font-semibold">
                {Math.round(percentage)}% Complete
              </span>
            </div>
          </div>

          {/* Word count */}
          <div className="flex items-center justify-center gap-3 text-white/90">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-sparkle-gentle" />
            <span className="text-base font-bold">
              {wordsWritten.toLocaleString()}
            </span>
            <span className="text-sm text-white/70">words</span>
            {percentage > 100 && (
              <div className="flex items-center gap-1 text-green-400">
                <TrendingUp className="w-3 h-3" />
                <span className="text-xs font-medium">+{Math.round(percentage - 100)}%</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Ambient glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/5 via-transparent to-yellow-500/5 animate-glow-pulse" />
      </div>
      
      {/* Gradient definitions */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="timeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
      </svg>
    </div>,
    document.body
  );
}