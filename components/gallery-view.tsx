"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Plus, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageCard } from "@/components/image-card";
import { UploadZone } from "@/components/upload-zone";
import { DecorationImage } from "@/lib/mock-data";

interface GalleryViewProps {
  title: string;
  description: string;
  images: DecorationImage[];
}

export function GalleryView({ title, description, images }: GalleryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const filteredImages = images.filter((img) =>
    img.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">{title}</h1>
        <p className="text-muted-foreground max-w-2xl">{description}</p>
      </motion.div>

      {/* Actions bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Filter */}
          <Button variant="outline" className="rounded-xl h-11">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Add images button */}
        <Button
          onClick={() => setShowUpload(!showUpload)}
          className="rounded-xl h-11 bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Images
        </Button>
      </motion.div>

      {/* Upload zone */}
      {showUpload && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <UploadZone />
        </motion.div>
      )}

      {/* Image count indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <ImageIcon className="w-4 h-4" />
        <span>
          {filteredImages.length} of 10 images uploaded
        </span>
      </motion.div>

      {/* Gallery grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImages.map((image, index) => (
          <ImageCard key={image.id} image={image} index={index} />
        ))}
      </div>

      {/* Empty state */}
      {filteredImages.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No images found
          </h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? "Try adjusting your search query"
              : "Start by uploading your first image"}
          </p>
        </motion.div>
      )}
    </div>
  );
}
