"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface FlagImageProps {
  src: string;
  alt: string;
}

export default function FlagImage({ src, alt }: FlagImageProps) {
  // Convert "vlaggen/xx.png" to "/vlaggen/xx.png"
  const imageSrc = src.startsWith("/") ? src : `/${src}`;

  return (
    <motion.div
      key={src}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="w-full"
    >
      <Image
        src={imageSrc}
        alt={alt}
        width={600}
        height={400}
        className="w-full rounded-2xl shadow-lg"
        priority
      />
    </motion.div>
  );
}
