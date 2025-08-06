import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Shuffle, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { MusicPlayerService } from '@/services/MusicPlayerService';
import { PlaybackObserver, PlaybackStatus, PlaybackState, Song } from '@/types/music';

export const MusicPlayer: React.FC = () => {
  const [status, setStatus] = useState<PlaybackStatus>(MusicPlayerService.getInstance().getStatus());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const player = MusicPlayerService.getInstance();
    
    const observer: PlaybackObserver = {
      onStateChanged: (newStatus: PlaybackStatus) => {
        setStatus(newStatus);
        setIsLoading(newStatus.state === PlaybackState.LOADING);
      },
      onProgressChanged: (currentTime: number, duration: number) => {
        setStatus(prev => ({ ...prev, currentTime, duration }));
      },
      onSongChanged: (song: Song | null) => {
        setStatus(prev => ({ ...prev, currentSong: song }));
      },
      onQueueChanged: (queue: Song[]) => {
        setStatus(prev => ({ ...prev, queue }));
      }
    };

    player.subscribe(observer);
    return () => player.unsubscribe(observer);
  }, []);

  const handlePlayPause = async () => {
    const player = MusicPlayerService.getInstance();
    
    if (status.state === PlaybackState.PLAYING) {
      await player.pause();
    } else {
      await player.play();
    }
  };

  const handleNext = async () => {
    await MusicPlayerService.getInstance().next();
  };

  const handlePrevious = async () => {
    await MusicPlayerService.getInstance().previous();
  };

  const handleVolumeChange = (value: number[]) => {
    MusicPlayerService.getInstance().setVolume(value[0] / 100);
  };

  const handleSeek = (value: number[]) => {
    MusicPlayerService.getInstance().seek(value[0]);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!status.currentSong) {
    return null;
  }

  const isPlaying = status.state === PlaybackState.PLAYING;

  return (
    <Card className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border/50 rounded-none">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center gap-4">
          
          {/* Album Art & Song Info */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="relative">
              <div 
                className={`w-16 h-16 rounded-xl bg-vinyl-gradient shadow-lg transition-transform duration-500 ${
                  isPlaying ? 'animate-spin-vinyl' : ''
                }`}
              >
                {status.currentSong.artwork && (
                  <img 
                    src={status.currentSong.artwork} 
                    alt={status.currentSong.title}
                    className="w-full h-full object-cover rounded-xl"
                  />
                )}
              </div>
              {isPlaying && (
                <div className="absolute inset-0 rounded-xl animate-pulse-glow" />
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate">
                {status.currentSong.title}
              </h3>
              <p className="text-muted-foreground text-sm truncate">
                {status.currentSong.artist}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Shuffle className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handlePrevious}
                disabled={status.currentIndex <= 0}
                className="text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <SkipBack className="w-5 h-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={handlePlayPause}
                disabled={isLoading}
                className="w-12 h-12 rounded-full bg-primary hover:bg-primary-glow border-primary text-primary-foreground hover:scale-105 transition-all duration-200"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" />
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleNext}
                disabled={status.currentIndex >= status.queue.length - 1}
                className="text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <SkipForward className="w-5 h-5" />
              </Button>
              
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Repeat className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-2 w-80">
              <span className="text-xs text-muted-foreground w-10 text-right">
                {formatTime(status.currentTime)}
              </span>
              <Slider
                value={[status.currentTime]}
                max={status.duration}
                step={1}
                onValueChange={handleSeek}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10">
                {formatTime(status.duration)}
              </span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 min-w-32">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[status.volume * 100]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="flex-1"
            />
          </div>

        </div>
      </div>
    </Card>
  );
};