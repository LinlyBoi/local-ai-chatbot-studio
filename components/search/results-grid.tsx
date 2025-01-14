import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rule34Post } from '@/types/api';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Download, 
  Heart, 
  Tag, 
  Video, 
  Image as ImageIcon,
  FastForward,
  Rewind
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface ResultsGridProps {
  results: Rule34Post[];
  loading: boolean;
  error: string | null;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

const VideoPlayer = ({ url, onClose }: { url: string; onClose: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.5);

  // Use a ref to track the latest play state to prevent race conditions
  const playStateRef = useRef(isPlaying);
  playStateRef.current = isPlaying;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set initial state
    video.volume = volume;
    
    // Only try to play if we're supposed to be playing
    if (playStateRef.current) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Video play error:', error);
          setIsPlaying(false);
        });
      }
    }

    return () => {
      // Cleanup: ensure video is paused when component unmounts
      video.pause();
    };
  }, [url]); // Only run when URL changes

  const togglePlayPause = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (video.paused) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
        }
      } else {
        video.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
      setIsPlaying(video.paused);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogTitle className="sr-only">Video Player</DialogTitle>
        <div className="relative">
          <video
            ref={videoRef}
            src={url}
            className="w-full"
            playsInline
            controls={false}
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlayPause}
                className="text-white hover:text-white/80"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>
              <div className="flex-1">
                <Slider
                  value={[volume * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([value]) => handleVolumeChange(value / 100)}
                  className="w-32"
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export function ResultsGrid({ results, loading, error }: ResultsGridProps) {
  const [selectedPost, setSelectedPost] = useState<Rule34Post | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showAllTags, setShowAllTags] = useState(false);
  
  // Media type filters
  const [showVideos, setShowVideos] = useState(true);
  const [showImages, setShowImages] = useState(true);
  const [showGifs, setShowGifs] = useState(true);

  // Filtered results
  const [filteredResults, setFilteredResults] = useState(results);

  // Add these new state variables inside the ResultsGrid component
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferedRanges, setBufferedRanges] = useState<{ start: number; end: number }[]>([]);

  useEffect(() => {
    const filtered = results.filter(post => {
      const isVideo = post.file_url.endsWith('.mp4') || post.file_url.endsWith('.webm');
      const isGif = post.file_url.endsWith('.gif');
      const isImage = !isVideo && !isGif;

      return (
        (isVideo && showVideos) ||
        (isGif && showGifs) ||
        (isImage && showImages)
      );
    });

    setFilteredResults(filtered);
    
    // Reset selected post if it's filtered out
    if (selectedPost && !filtered.find(p => p.id === selectedPost.id)) {
      setSelectedPost(null);
    }
  }, [results, showVideos, showImages, showGifs, selectedPost]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % results.length);
    setSelectedPost(results[(currentIndex + 1) % results.length]);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + results.length) % results.length);
    setSelectedPost(results[(currentIndex - 1 + results.length) % results.length]);
  };

  const handleMediaClick = (post: Rule34Post, index: number) => {
    setSelectedPost(post);
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const handleClose = () => {
    setSelectedPost(null);
    setIsPlaying(true);
    setIsMuted(true);
    setIsFullscreen(false);
  };

  const isVideo = (url: string) => {
    return url.endsWith('.mp4') || url.endsWith('.webm');
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFullscreen = () => {
    const element = document.querySelector('.media-viewer');
    if (!element) return;

    if (!isFullscreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const groupTags = (tags: string[]) => {
    const groups: { [key: string]: string[] } = {
      character: [],
      artist: [],
      copyright: [],
      general: [],
      meta: []
    };

    tags.forEach(tag => {
      if (tag.includes('character:') || tag.includes('_character')) {
        groups.character.push(tag);
      } else if (tag.includes('artist:') || tag.includes('drawn_by')) {
        groups.artist.push(tag);
      } else if (tag.includes('copyright:') || tag.includes('_series')) {
        groups.copyright.push(tag);
      } else if (tag.includes('rating:') || tag.includes('score:')) {
        groups.meta.push(tag);
      } else {
        groups.general.push(tag);
      }
    });

    return groups;
  };

  // Add these new functions inside the ResultsGrid component
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video || !(video instanceof HTMLVideoElement)) return;
    
    const newTime = value[0];
    setCurrentTime(newTime);
    
    // Create multiple seek points around the target time
    const seekPoints = [
      Math.max(0, newTime - 5), // Pre-buffer 5 seconds before
      newTime,                  // Target time
      Math.min(duration, newTime + 5)  // Pre-buffer 5 seconds after
    ];
    
    // Request buffering for each point
    seekPoints.forEach(time => {
      try {
        video.currentTime = time;
      } catch (error) {
        console.warn('Seeking error:', error);
      }
    });
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
    }
  };

  // Add this effect to handle play/pause state
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Add this effect to handle video initialization and playback
  useEffect(() => {
    if (videoRef.current && selectedPost) {
      // Start playing when a new video is loaded
      videoRef.current.play().catch(error => {
        console.log('Autoplay prevented:', error);
        setIsPlaying(false);
      });
    }
  }, [selectedPost]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleWaiting = () => {
    setIsBuffering(true);
  };

  const handleCanPlay = () => {
    setIsBuffering(false);
  };

  const updateBufferedRanges = () => {
    if (videoRef.current) {
      const ranges: { start: number; end: number }[] = [];
      const buffered = videoRef.current.buffered;
      
      for (let i = 0; i < buffered.length; i++) {
        ranges.push({
          start: buffered.start(i),
          end: buffered.end(i)
        });
      }
      
      setBufferedRanges(ranges);
    }
  };

  // Add this effect after other useEffects
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('progress', updateBufferedRanges);
      return () => video.removeEventListener('progress', updateBufferedRanges);
    }
  }, [selectedPost]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current || !selectedPost) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward();
          break;
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'm':
          e.preventDefault();
          setIsMuted(!isMuted);
          break;
        case 'f':
          e.preventDefault();
          handleFullscreen();
          break;
      }
    };

    if (selectedPost) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedPost, isMuted]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 animate-pulse">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="aspect-square bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Media type toggles */}
      <div className="flex items-center gap-6 p-2 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4" />
          <span className="text-sm font-medium">Videos</span>
          <Switch 
            checked={showVideos}
            onCheckedChange={setShowVideos}
            className="data-[state=checked]:bg-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Images</span>
          <Switch 
            checked={showImages}
            onCheckedChange={setShowImages}
            className="data-[state=checked]:bg-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          <span className="text-sm font-medium">GIFs</span>
          <Switch 
            checked={showGifs}
            onCheckedChange={setShowGifs}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        <div className="ml-auto text-sm text-muted-foreground">
          Showing {filteredResults.length} of {results.length} results
        </div>
      </div>

      {/* Grid view */}
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
        variants={container}
        initial="hidden"
        animate="show"
        key={`${showVideos}-${showImages}-${showGifs}`}
      >
        {filteredResults.map((post, index) => (
          <motion.div
            key={post.id}
            variants={item}
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
          >
            <Card 
              className="relative group cursor-pointer overflow-hidden aspect-square bg-muted/50 rounded-lg transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg"
              onClick={() => handleMediaClick(post, index)}
            >
              {isVideo(post.file_url) ? (
                <div className="relative w-full h-full">
                  <video
                    src={post.preview_url || post.file_url}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    poster={post.preview_url}
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => e.currentTarget.pause()}
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors">
                    <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-white opacity-90" />
                  </div>
                </div>
              ) : (
                <img
                  src={post.preview_url || post.file_url}
                  alt={post.tags.join(', ')}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              )}
              
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/50 to-transparent"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-red-400" />
                        <span className="text-xs text-white">{post.score}</span>
                      </div>
                      {isVideo(post.file_url) ? (
                        <span className="text-xs text-white bg-black/50 px-2 py-0.5 rounded-full">
                          Video
                        </span>
                      ) : post.file_url.endsWith('.gif') ? (
                        <span className="text-xs text-white bg-black/50 px-2 py-0.5 rounded-full">
                          GIF
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-white/90 line-clamp-2">
                      {post.tags.slice(0, 5).join(', ')}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Dialog open={!!selectedPost} onOpenChange={() => handleClose()}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-background/95 backdrop-blur-sm">
          <DialogTitle className="sr-only">
            {selectedPost ? `Viewing ${selectedPost.tags.slice(0, 3).join(', ')}` : 'Media Viewer'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Media viewer for Rule34 content
          </DialogDescription>

          <div className="relative w-full h-full flex items-center justify-center media-viewer">
            {/* Top controls */}
            <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between z-50 bg-gradient-to-b from-black/80 via-black/50 to-transparent">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => handleDownload(selectedPost?.file_url || '')}
                >
                  <Download className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={handleFullscreen}
                >
                  <Maximize2 className="w-5 h-5" />
                </Button>
                {selectedPost && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-white">{selectedPost.score}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 gap-1"
                      onClick={() => setShowAllTags(!showAllTags)}
                    >
                      <Tag className="w-4 h-4" />
                      <span className="text-sm">{selectedPost.tags.length} Tags</span>
                    </Button>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleClose}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Media content */}
            {selectedPost && isVideo(selectedPost.file_url) ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={selectedPost.file_url}
                  className="max-h-[80vh] max-w-[90vw] object-contain"
                  controls={false}
                  loop
                  muted={isMuted}
                  autoPlay
                  playsInline
                  preload="auto"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onWaiting={handleWaiting}
                  onCanPlay={handleCanPlay}
                />
                
                {/* Buffering indicator */}
                {isBuffering && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  </div>
                )}
                
                {/* Video Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  {/* Progress Bar with buffered regions */}
                  <div className="mb-4 relative">
                    <div className="absolute inset-y-0 w-full">
                      {bufferedRanges.map((range, index) => (
                        <div
                          key={index}
                          className="absolute h-full bg-white/10"
                          style={{
                            left: `${(range.start / duration) * 100}%`,
                            width: `${((range.end - range.start) / duration) * 100}%`
                          }}
                        />
                      ))}
                    </div>
                    
                    <Slider
                      value={[currentTime]}
                      max={duration}
                      step={0.1}
                      onValueChange={handleSeek}
                      className="w-full relative z-10"
                    />
                    
                    <div className="flex justify-between text-xs text-white mt-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => skipBackward()}
                        className="text-white hover:bg-white/20"
                      >
                        <Rewind className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={togglePlayPause}
                        className="text-white hover:bg-white/20"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => skipForward()}
                        className="text-white hover:bg-white/20"
                      >
                        <FastForward className="w-4 h-4" />
                      </Button>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsMuted(!isMuted)}
                          className="text-white hover:bg-white/20"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>
                        <div className="w-24">
                          <Slider
                            value={[volume]}
                            max={1}
                            step={0.01}
                            onValueChange={handleVolumeChange}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={handleFullscreen}
                      >
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={selectedPost?.file_url}
                alt={selectedPost?.tags.join(', ')}
                className="max-h-[80vh] max-w-[90vw] object-contain"
                loading="lazy"
              />
            )}

            {/* Navigation buttons */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={handlePrevious}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={handleNext}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>

            {/* Tags panel */}
            <AnimatePresence>
              {selectedPost && showAllTags && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/80 to-transparent max-h-[50vh] overflow-y-auto"
                >
                  {Object.entries(groupTags(selectedPost.tags)).map(([group, tags]) => tags.length > 0 && (
                    <div key={group} className="mb-4">
                      <h3 className="text-white/80 text-sm font-medium mb-2 capitalize">{group}</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white hover:bg-white/20 transition-colors cursor-pointer"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 