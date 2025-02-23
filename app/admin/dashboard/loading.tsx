"use client";

import { motion } from "framer-motion";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-24 h-24 border-4 border-black rounded-full mx-auto mb-8"
        />
        <h1 className="text-3xl font-light">Museo de Kerli</h1>
        <p className="text-gray-500 mt-2">Verifying admin access...</p>
      </motion.div>
    </div>
  );
}