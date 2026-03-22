import { motion } from 'motion/react';

export function CelestialSphere() {
  return (
    <div className="relative flex h-56 items-center justify-center">
      {/* Outer glow layers */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="h-48 w-48 rounded-full bg-gradient-to-r from-amber-500/30 via-yellow-400/30 to-amber-600/30 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Secondary glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="h-32 w-32 rounded-full bg-gradient-to-r from-yellow-300/40 to-amber-400/40 blur-2xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>

      {/* Main sphere */}
      <motion.div
        className="relative"
        animate={{
          rotateY: 360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer sphere ring */}
          <circle
            cx="70"
            cy="70"
            r="65"
            stroke="url(#sphereGradient)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.8"
          />
          
          {/* Middle rings */}
          <ellipse
            cx="70"
            cy="70"
            rx="65"
            ry="40"
            stroke="url(#sphereGradient)"
            strokeWidth="1"
            fill="none"
            opacity="0.5"
          />
          
          <ellipse
            cx="70"
            cy="70"
            rx="65"
            ry="25"
            stroke="url(#sphereGradient)"
            strokeWidth="1"
            fill="none"
            opacity="0.4"
          />

          {/* Vertical meridians */}
          <ellipse
            cx="70"
            cy="70"
            rx="30"
            ry="65"
            stroke="url(#sphereGradient)"
            strokeWidth="0.8"
            fill="none"
            opacity="0.4"
          />
          
          <ellipse
            cx="70"
            cy="70"
            rx="50"
            ry="65"
            stroke="url(#sphereGradient)"
            strokeWidth="0.8"
            fill="none"
            opacity="0.3"
          />

          {/* Central core */}
          <circle
            cx="70"
            cy="70"
            r="12"
            fill="url(#coreGradient)"
            opacity="0.9"
          />
          
          {/* Inner glow */}
          <circle
            cx="70"
            cy="70"
            r="8"
            fill="url(#innerGlow)"
          />

          {/* Decorative stars */}
          {[
            { x: 70, y: 15, size: 2 },
            { x: 70, y: 125, size: 2 },
            { x: 15, y: 70, size: 2 },
            { x: 125, y: 70, size: 2 },
          ].map((star, i) => (
            <g key={i}>
              <circle
                cx={star.x}
                cy={star.y}
                r={star.size}
                fill="#FCD34D"
                opacity="0.8"
              />
              {/* Star rays */}
              <line x1={star.x} y1={star.y - 6} x2={star.x} y2={star.y + 6} stroke="#FCD34D" strokeWidth="0.5" opacity="0.6" />
              <line x1={star.x - 6} y1={star.y} x2={star.x + 6} y2={star.y} stroke="#FCD34D" strokeWidth="0.5" opacity="0.6" />
            </g>
          ))}

          <defs>
            <radialGradient id="sphereGradient">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </radialGradient>
            
            <radialGradient id="coreGradient">
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="50%" stopColor="#FCD34D" />
              <stop offset="100%" stopColor="#F59E0B" />
            </radialGradient>
            
            <radialGradient id="innerGlow">
              <stop offset="0%" stopColor="#FFFBEB" opacity="1" />
              <stop offset="100%" stopColor="#FCD34D" opacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-yellow-400/80"
            style={{
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: [0, Math.cos((i * 45 * Math.PI) / 180) * 100],
              y: [0, Math.sin((i * 45 * Math.PI) / 180) * 100],
              opacity: [0, 0.8, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 4,
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
