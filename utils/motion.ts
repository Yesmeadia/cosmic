// utils/motion.ts
import { Variants } from 'framer-motion';

export const createVariants = (variants: Variants): Variants => variants;

// Then use it like:
const itemVariants = createVariants({
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
});