import { Bell, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { InvestmentGauge } from '../components/InvestmentGauge';
import { StockAnalysisCard } from '../components/StockAnalysisCard';
import { AIStrategyButton } from '../components/AIStrategyButton';
import { BottomNavigation } from '../components/BottomNavigation';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950 pb-24">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative mx-auto max-w-md px-5 pt-6">
        {/* Top Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium text-white">Stock Oracle</h1>
            <p className="text-xs text-white/50">당신의 재운을 밝힙니다</p>
          </div>
          <button 
            onClick={() => navigate('/notifications')}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl transition-colors hover:bg-white/10"
          >
            <Bell className="h-5 w-5 text-white/60" />
            {/* Notification badge */}
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-indigo-950" />
          </button>
        </div>

        {/* Investment Gauge */}
        <div className="mb-8">
          <InvestmentGauge />
        </div>

        {/* Stock Analysis Cards */}
        <div className="mb-8">
          <StockAnalysisCard />
        </div>

        {/* AI Strategy Button */}
        <div className="mb-8">
          <AIStrategyButton />
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="home" />
    </div>
  );
}
