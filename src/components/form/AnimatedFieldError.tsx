// src/components/form/AnimatedFieldError.tsx

"use client";

import { AnimatePresence, motion } from "framer-motion";

/**
 * AnimatedFieldError
 * ------------------
 * Animates in/out a field error message.
 * - Uses framer-motion for smooth fade/slide
 * - Accessibility: role="alert" for screen readers
 */
interface AnimatedFieldErrorProps {
  message?: string; // The error message to display (if any)
}

export default function AnimatedFieldError({
  message,
}: AnimatedFieldErrorProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          className="text-xs text-red-500 mt-1"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          role="alert"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
