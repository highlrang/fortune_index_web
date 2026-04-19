import type { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

type BenefitCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  index: number;
};

export function BenefitCard({ icon: Icon, title, description, gradient, index }: BenefitCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
    >
      <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient}`}>
        <Icon className="h-7 w-7 text-amber-200" />
      </div>
      <h3 className="mb-3 text-xl font-medium text-white">{title}</h3>
      <p className="text-sm leading-6 text-white/65">{description}</p>
    </motion.div>
  );
}
