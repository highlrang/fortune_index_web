import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';

export function AIStrategyButton() {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Main button */}
      <motion.button
        onClick={() => navigate('/consultation')}
        className="group relative w-full overflow-hidden rounded-2xl border border-[#F1B45C]/40 bg-gradient-to-br from-[#BF702A] via-[#D4933F] to-[#F1B45C] px-6 py-5 shadow-2xl backdrop-blur-xl transition-all hover:border-[#F1B45C]/60"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.15] via-transparent to-white/[0.05]" />
        
        {/* Animated amber glow border effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            boxShadow: '0 0 20px rgba(241, 180, 92, 0.4), inset 0 0 20px rgba(241, 180, 92, 0.1)',
          }}
          animate={{
            boxShadow: [
              '0 0 20px rgba(241, 180, 92, 0.4), inset 0 0 20px rgba(241, 180, 92, 0.1)',
              '0 0 30px rgba(241, 180, 92, 0.6), inset 0 0 30px rgba(241, 180, 92, 0.2)',
              '0 0 20px rgba(241, 180, 92, 0.4), inset 0 0 20px rgba(241, 180, 92, 0.1)',
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Content - Single centered text */}
        <div className="relative flex items-center justify-center gap-2">
          <h2
            className="text-center text-base font-semibold text-white"
            style={{
              filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))',
            }}
          >
            오늘 당신의 투자 운세 물어보기
          </h2>
          <Sparkles 
            className="h-4 w-4 text-white" 
            style={{
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))',
            }}
          />
        </div>

        {/* Thin neon border accent */}
        <div className="absolute inset-0 rounded-2xl border border-[#F1B45C] opacity-60" />
      </motion.button>
    </div>
  );
}
