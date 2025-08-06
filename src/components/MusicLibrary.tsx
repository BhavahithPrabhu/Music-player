import React, { useState, useEffect } from 'react';
import { Play, Pause, Plus, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MusicPlayerService } from '@/services/MusicPlayerService';
import { Song, PlaybackState, PlaybackStatus, PlaybackObserver, MusicSource } from '@/types/music';

export const MusicLibrary: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [status, setStatus] = useState<PlaybackStatus>(MusicPlayerService.getInstance().getStatus());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLibrary();
    
    const player = MusicPlayerService.getInstance();
    const observer: PlaybackObserver = {
      onStateChanged: (newStatus: PlaybackStatus) => setStatus(newStatus),
      onProgressChanged: () => {},
      onSongChanged: () => {},
      onQueueChanged: () => {}
    };

    player.subscribe(observer);
    return () => player.unsubscribe(observer);
  }, []);

  const loadLibrary = async () => {
    try {
      const player = MusicPlayerService.getInstance();
      const allSongs = await player.loadMusicLibrary();
      setSongs(allSongs);
    } catch (error) {
      console.error('Failed to load music library:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = async (song: Song) => {
    const player = MusicPlayerService.getInstance();
    
    if (status.currentSong?.id === song.id && status.state === PlaybackState.PLAYING) {
      await player.pause();
    } else {
      // Set queue starting from this song
      const songIndex = songs.indexOf(song);
      const queue = songs.slice(songIndex);
      player.setQueue(queue);
      await player.play(song);
    }
  };

  const handleAddToQueue = (song: Song) => {
    MusicPlayerService.getInstance().addToQueue(song);
  };

  const getSourceColor = (source: MusicSource): string => {
    switch (source) {
      case MusicSource.LOCAL:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case MusicSource.SPOTIFY:
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case MusicSource.AUDIODB:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-secondary';
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading music library...</p>
        </div>
      </div>
    );
  }

  const groupedSongs = songs.reduce((acc, song) => {
    if (!acc[song.source]) {
      acc[song.source] = [];
    }
    acc[song.source].push(song);
    return acc;
  }, {} as Record<MusicSource, Song[]>);

  return (
    <div className="space-y-8 pb-32">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
          Music Library
        </h1>
        <p className="text-muted-foreground text-lg">
          Explore your music from multiple sources
        </p>
      </div>

      {Object.entries(groupedSongs).map(([source, sourceSongs]) => (
        <Card key={source} className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              {source.charAt(0).toUpperCase() + source.slice(1)} Music
              <Badge variant="secondary" className={getSourceColor(source as MusicSource)}>
                {sourceSongs.length} songs
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {sourceSongs.map((song) => {
                const isCurrentSong = status.currentSong?.id === song.id;
                const isPlaying = isCurrentSong && status.state === PlaybackState.PLAYING;

                return (
                  <div
                    key={song.id}
                    className={`group flex items-center gap-4 p-3 rounded-lg transition-all duration-200 hover:bg-muted/50 ${
                      isCurrentSong ? 'bg-primary/10 border border-primary/20' : ''
                    }`}
                  >
                    <div className="relative">
                      <div 
                        className={`w-12 h-12 rounded-lg bg-vinyl-gradient shadow-sm transition-transform duration-300 ${
                          isPlaying ? 'animate-spin-vinyl' : ''
                        }`}
                      >
                        {song.artwork && (
                          <img 
                            src={song.artwork} 
                            alt={song.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium truncate ${isCurrentSong ? 'text-primary' : 'text-foreground'}`}>
                        {song.title}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {song.artist} • {song.album}
                      </p>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {formatDuration(song.duration)}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddToQueue(song)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePlaySong(song)}
                        className="text-muted-foreground hover:text-primary"
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};