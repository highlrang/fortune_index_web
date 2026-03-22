import { Home, Sparkles, TrendingUp, MessageCircle, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router';

interface BottomNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active tab from route if not provided
  const getActiveTab = () => {
    if (activeTab) return activeTab;
    
    if (location.pathname === '/home') return 'home';
    if (location.pathname.includes('consultation-history')) return 'consult';
    if (location.pathname.includes('consultation')) return 'oracle';
    if (location.pathname.includes('investment')) return 'oracle';
    if (location.pathname.includes('/my')) return 'my';
    
    return 'home';
  };
  
  const currentTab = getActiveTab();
  
  const tabs = [
    { id: 'home', label: '홈', icon: Home, path: '/home' },
    { id: 'oracle', label: '운세', icon: Sparkles, path: '/consultation' },
    { id: 'stocks', label: '주식', icon: TrendingUp, path: '/home' },
    { id: 'consult', label: '상담', icon: MessageCircle, path: '/consultation-history' },
    { id: 'my', label: '마이', icon: User, path: '/my' },
  ];

  const handleTabClick = (tab: typeof tabs[0]) => {
    if (onTabChange) {
      onTabChange(tab.id);
    } else {
      navigate(tab.path);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-md">
        <div className="relative overflow-hidden rounded-t-3xl border-t border-x border-white/10 bg-indigo-950/95 backdrop-blur-xl">
          {/* Top glow line */}
          <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
          
          <div className="flex items-center justify-around px-2 py-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className="relative flex flex-col items-center gap-1 px-4 py-2"
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  {/* Active glow */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-amber-500/20 blur-lg"
                      animate={{
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                  
                  <div className="relative">
                    <Icon
                      className={`h-5 w-5 transition-colors ${
                        isActive ? 'text-amber-400' : 'text-white/40'
                      }`}
                    />
                  </div>
                  
                  <span
                    className={`relative text-xs transition-colors ${
                      isActive ? 'text-amber-300' : 'text-white/40'
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
