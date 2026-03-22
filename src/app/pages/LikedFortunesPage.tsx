import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Heart, TrendingUp, Sparkles, Eye, Calendar, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { BottomNavigation } from '../components/BottomNavigation';

interface Fortune {
  id: string;
  type: '투자 운세' | '투자 타로 운세' | '투자 사주 운세' | '투자 종합 운세';
  score: number;
  date: string;
  summary: string;
}

export function LikedFortunesPage() {
  const navigate = useNavigate();
  const [fortunes, setFortunes] = useState<Fortune[]>([
    {
      id: '1',
      type: '투자 종합 운세',
      score: 78,
      date: '2024.03.15',
      summary: 'AI 기술주와 바이오 섹터가 강세를 보일 전망. 오전 시간대 투자 결정이 길함.',
    },
    {
      id: '2',
      type: '투자 타로 운세',
      score: 85,
      date: '2024.03.10',
      summary: '별, 태양 카드가 나타나 매우 긍정적인 흐름. 새로운 투자 기회에 주목.',
    },
    {
      id: '3',
      type: '투자 사주 운세',
      score: 72,
      date: '2024.03.05',
      summary: '금(金) 기운이 강하여 재물운 상승. 분산 투자로 리스크 관리 필요.',
    },
  ]);

  const getTypeIcon = (type: Fortune['type']) => {
    switch (type) {
      case '투자 타로 운세':
        return <Eye className="h-5 w-5" />;
      case '투자 사주 운세':
        return <Sparkles className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: Fortune['type']) => {
    switch (type) {
      case '투자 타로 운세':
        return 'from-purple-500/20 to-violet-600/20 border-purple-500/30 text-purple-400';
      case '투자 사주 운세':
        return 'from-amber-500/20 to-orange-600/20 border-amber-500/30 text-amber-400';
      default:
        return 'from-emerald-500/20 to-green-600/20 border-emerald-500/30 text-emerald-400';
    }
  };

  const handleDelete = (id: string) => {
    setFortunes(fortunes.filter(f => f.id !== id));
  };

  const handleFortuneClick = (fortune: Fortune) => {
    navigate(`/investment-result?type=${encodeURIComponent(fortune.type)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950 pb-24">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-gradient-to-b from-indigo-950/95 via-indigo-900/90 to-transparent px-6 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/my')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl transition-colors hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 text-white/60" />
            </button>
            
            <div className="flex-1 text-center">
              <h1 className="text-lg font-semibold text-white">좋아요한 운세</h1>
              <p className="text-xs text-[#D4AF37]/70">Liked Fortunes</p>
            </div>

            <div className="w-10" />
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-6 pt-4">
          {fortunes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-20 text-center"
            >
              <div className="mb-4 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <Heart className="h-10 w-10 text-white/30" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">좋아요한 운세가 없습니다</h3>
              <p className="text-sm text-white/50">
                운세 결과에서 하트 버튼을 눌러<br />
                저장해보세요
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {fortunes.map((fortune, index) => (
                <motion.div
                  key={fortune.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 p-5 backdrop-blur-xl transition-all hover:border-white/20"
                  style={{
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />
                  
                  <div className="relative">
                    {/* Header */}
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border bg-gradient-to-br backdrop-blur-xl ${getTypeColor(fortune.type)}`}>
                          {getTypeIcon(fortune.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{fortune.type}</h3>
                          <div className="mt-1 flex items-center gap-2 text-xs text-white/50">
                            <Calendar className="h-3 w-3" />
                            {fortune.date}
                          </div>
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className="flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1">
                        <span className="text-lg font-bold text-[#D4AF37]">{fortune.score}</span>
                        <span className="text-xs text-white/60">점</span>
                      </div>
                    </div>

                    {/* Summary */}
                    <p className="mb-4 text-sm leading-relaxed text-white/70">
                      {fortune.summary}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFortuneClick(fortune)}
                        className="flex-1 rounded-xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#D4AF37]/20 to-amber-600/10 py-2.5 text-sm font-medium text-white transition-all hover:border-[#D4AF37]/60 hover:shadow-lg hover:shadow-[#D4AF37]/20"
                      >
                        자세히 보기
                      </button>
                      <button
                        onClick={() => handleDelete(fortune.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-colors hover:border-red-500/50 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4 text-white/60 group-hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
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
