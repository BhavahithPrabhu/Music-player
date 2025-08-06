import React, { useState, useEffect } from 'react';
import { X, GripVertical, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MusicPlayerService } from '@/services/MusicPlayerService';
import { Song, PlaybackStatus, PlaybackObserver } from '@/types/music';

export const PlayQueue: React.FC = () => {
  const [status, setStatus] = useState<PlaybackStatus>(MusicPlayerService.getInstance().getStatus());

  useEffect(() => {
    const player = MusicPlayerService.getInstance();
    
    const observer: PlaybackObserver = {
      onStateChanged: (newStatus: PlaybackStatus) => setStatus(newStatus),
      onProgressChanged: () => {},
      onSongChanged: () => {},
      onQueueChanged: (queue: Song[]) => setStatus(prev => ({ ...prev, queue }))
    };

    player.subscribe(observer);
    return () => player.unsubscribe(observer);
  }, []);

  const handleRemoveFromQueue = (index: number) => {
    MusicPlayerService.getInstance().removeFromQueue(index);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (status.queue.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Play Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No songs in queue</p>
            <p className="text-sm text-muted-foreground">Add songs from the library to start playing</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="w-5 h-5" />
          Play Queue
          <span className="text-sm font-normal text-muted-foreground">
            ({status.queue.length} songs)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {status.queue.map((song, index) => {
            const isCurrentSong = index === status.currentIndex;
            
            return (
              <div
                key={`${song.id}-${index}`}
                className={`group flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
                  isCurrentSong 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="text-xs text-muted-foreground w-6 text-center">
                  {index + 1}
                </div>
                
                <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                
                <div className="w-8 h-8 rounded bg-vinyl-gradient shadow-sm flex-shrink-0">
                  {song.artwork && (
                    <img 
                      src={song.artwork} 
                      alt={song.title}
                      className="w-full h-full object-cover rounded"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium truncate ${
                    isCurrentSong ? 'text-primary' : 'text-foreground'
                  }`}>
                    {song.title}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {song.artist}
                  </p>
                </div>

                <div className="text-xs text-muted-foreground">
                  {formatDuration(song.duration)}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFromQueue(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};