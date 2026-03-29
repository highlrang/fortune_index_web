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
    <div className="fi-page min-h-screen pb-24">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--app-accent-soft)' }} />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--glow-purple)' }} />
      </div>

      {/* Main content */}
      <div className="relative mx-auto max-w-md px-5 pt-6">
        {/* Top Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium fi-text-main">Stock Oracle</h1>
            <p className="text-xs fi-text-muted">당신의 재운을 밝힙니다</p>
          </div>
          <button 
            onClick={() => navigate('/notifications')}
            className="fi-icon-button relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:opacity-90"
          >
            <Bell className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--point-gold)', boxShadow: '0 0 0 2px var(--bg-main)' }} />
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
