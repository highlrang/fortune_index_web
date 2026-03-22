import { motion } from 'motion/react';

export function WheelOfFortune() {
  return (
    <div className="relative flex h-48 items-center justify-center">
      {/* Outer glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="h-40 w-40 rounded-full bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-600/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main wheel */}
      <motion.div
        className="relative"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 120,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer circle */}
          <circle
            cx="80"
            cy="80"
            r="75"
            stroke="url(#goldGradient)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
          />
          
          {/* Middle circle */}
          <circle
            cx="80"
            cy="80"
            r="60"
            stroke="url(#goldGradient)"
            strokeWidth="1"
            fill="none"
            opacity="0.4"
          />
          
          {/* Inner circle */}
          <circle
            cx="80"
            cy="80"
            r="45"
            stroke="url(#goldGradient)"
            strokeWidth="1"
            fill="none"
            opacity="0.3"
          />

          {/* Spokes - 8 directions */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const radians = (angle * Math.PI) / 180;
            const x1 = 80 + 45 * Math.cos(radians);
            const y1 = 80 + 45 * Math.sin(radians);
            const x2 = 80 + 75 * Math.cos(radians);
            const y2 = 80 + 75 * Math.sin(radians);
            
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="url(#goldGradient)"
                strokeWidth="0.5"
                opacity="0.4"
              />
            );
          })}

          {/* Center ornament */}
          <circle
            cx="80"
            cy="80"
            r="8"
            fill="url(#goldGradient)"
            opacity="0.8"
          />
          
          {/* Decorative dots */}
          {[0, 90, 180, 270].map((angle, i) => {
            const radians = (angle * Math.PI) / 180;
            const x = 80 + 67.5 * Math.cos(radians);
            const y = 80 + 67.5 * Math.sin(radians);
            
            return (
              <circle
                key={`dot-${i}`}
                cx={x}
                cy={y}
                r="3"
                fill="url(#goldGradient)"
                opacity="0.6"
              />
            );
          })}

          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Subtle particle effects */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-yellow-500/60"
            style={{
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: [0, Math.cos((i * 60 * Math.PI) / 180) * 80],
              y: [0, Math.sin((i * 60 * Math.PI) / 180) * 80],
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
