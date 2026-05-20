"use client";

import { motion } from "framer-motion";
import { Pencil, Trash2, Calendar, HardDrive } from "lucide-react";
import { DecorationImage } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

interface ImageCardProps {
  image: DecorationImage;
  index: number;
}

export function ImageCard({ image, index }: ImageCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <motion.img
          src={image.url}
          alt={image.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Button
            size="sm"
            variant="secondary"
            className="h-9 w-9 p-0 rounded-xl bg-card/90 backdrop-blur-sm hover:bg-card border-0"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-9 w-9 p-0 rounded-xl bg-card/90 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground border-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-card-foreground text-lg mb-2">{image.title}</h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {image.uploadDate}
          </span>
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5" />
            {image.size}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
