import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Bell, Sparkles, TrendingUp, Star, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { BottomNavigation } from '../components/BottomNavigation';

interface Notification {
  id: string;
  type: 'fortune' | 'market' | 'system';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'fortune',
      title: '오늘의 투자 운세가 도착했습니다',
      message: '새로운 투자 운세를 확인해보세요. 오늘의 투자 지수는 78점입니다.',
      date: '2024.03.18 09:00',
      isRead: false,
    },
    {
      id: '2',
      type: 'market',
      title: '추천 종목 급등 알림',
      message: '운세에서 추천한 AI 기술주 ETF가 전일 대비 +5.2% 상승했습니다.',
      date: '2024.03.17 14:30',
      isRead: false,
    },
    {
      id: '3',
      type: 'system',
      title: '월간 운세 리포트 준비 완료',
      message: '3월 투자 운세 종합 리포트를 확인하실 수 있습니다.',
      date: '2024.03.15 10:00',
      isRead: true,
    },
    {
      id: '4',
      type: 'fortune',
      title: '타로 카드 해석 업데이트',
      message: '새로운 타로 카드 해석이 추가되었습니다. 더욱 정확한 운세를 경험해보세요.',
      date: '2024.03.14 16:00',
      isRead: true,
    },
    {
      id: '5',
      type: 'market',
      title: '시장 변동성 주의 알림',
      message: '오늘 코스피 지수 변동성이 높습니다. 신중한 투자 결정을 권장합니다.',
      date: '2024.03.13 09:30',
      isRead: true,
    },
  ]);

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'fortune':
        return <Sparkles className="h-5 w-5" />;
      case 'market':
        return <TrendingUp className="h-5 w-5" />;
      case 'system':
        return <Star className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'fortune':
        return 'from-purple-500/20 to-violet-600/20 border-purple-500/30 fi-status-text-info';
      case 'market':
        return 'from-emerald-500/20 to-green-600/20 border-emerald-500/30 fi-status-text-success';
      case 'system':
        return 'from-amber-500/20 to-orange-600/20 border-amber-500/30 fi-status-text-warning';
      default:
        return 'from-white/10 to-white/5 border-white/10 text-white/60';
    }
  };

  const handleNotificationClick = (id: string) => {
    setNotifications(
      notifications.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="fi-page min-h-screen pb-24">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--app-accent-soft)' }} />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--glow-purple)' }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="sticky top-0 z-50 px-6 py-4 backdrop-blur-xl" style={{ background: 'linear-gradient(180deg, color-mix(in srgb, var(--bg-main) 94%, transparent) 0%, transparent 100%)' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/home')}
              className="fi-icon-button flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:opacity-90"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            
            <div className="flex-1">
              <h1 className="text-lg font-semibold fi-text-main">알림</h1>
              {unreadCount > 0 && (
                <p className="text-xs fi-text-accent">읽지 않은 알림 {unreadCount}개</p>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="fi-glass rounded-xl px-3 py-1.5 text-xs font-medium fi-text-muted transition-colors hover:opacity-90"
              >
                모두 읽음
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-6 pt-4">
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-20 text-center"
            >
              <div className="mb-4 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <Bell className="h-10 w-10 fi-text-subtle" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold fi-text-main">알림이 없습니다</h3>
              <p className="text-sm fi-text-muted">
                새로운 알림이 도착하면<br />
                여기에 표시됩니다
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <motion.button
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleNotificationClick(notification.id)}
                  className="fi-glass relative w-full overflow-hidden rounded-2xl p-4 text-left transition-all hover:opacity-95"
                  style={{
                    boxShadow: notification.isRead ? 'none' : '0 4px 24px rgba(0, 0, 0, 0.2)',
                    opacity: notification.isRead ? 0.76 : 1,
                  }}
                >
                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div className="absolute right-4 top-4 h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--point-gold)' }}>
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: 'var(--point-gold)' }}
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [1, 0, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent" />
                  
                  <div className="relative flex gap-3">
                    {/* Icon */}
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br backdrop-blur-xl ${getTypeColor(notification.type)}`}>
                      {getTypeIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="mb-1 text-sm font-semibold" style={{ color: notification.isRead ? 'var(--app-text-muted)' : 'var(--text-primary)' }}>
                        {notification.title}
                      </h3>
                      <p className="mb-2 text-xs leading-relaxed" style={{ color: notification.isRead ? 'var(--app-text-subtle)' : 'var(--app-text-muted)' }}>
                        {notification.message}
                      </p>
                      <p className="text-xs fi-text-subtle">{notification.date}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
