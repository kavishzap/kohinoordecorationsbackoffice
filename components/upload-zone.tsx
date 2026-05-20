"use client";

import { motion } from "framer-motion";
import { Upload, ImagePlus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => setIsDragging(false)}
      className={cn(
        "relative border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <motion.div
          animate={{ y: isDragging ? -8 : 0 }}
          transition={{ type: "spring", stiffness: 300 }}
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors",
            isDragging ? "bg-primary text-primary-foreground" : "bg-muted"
          )}
        >
          {isDragging ? (
            <ImagePlus className="w-8 h-8" />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground" />
          )}
        </motion.div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {isDragging ? "Drop your images here" : "Drag & Drop Images Here"}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4">
          or click to browse files
        </p>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="px-2 py-1 rounded-lg bg-muted">Maximum 10 images</span>
          <span className="px-2 py-1 rounded-lg bg-muted">Max size 5MB</span>
        </div>
      </div>
      
      <input
        type="file"
        multiple
        accept="image/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </motion.div>
  );
}
