// src\components\form\AnimatedFieldError.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";

interface AnimatedFieldErrorProps {
  message?: string;
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
