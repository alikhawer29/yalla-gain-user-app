import { useEffect, useRef, useState } from 'react';
import Sound from 'react-native-sound';

type Track = {
    id: string;
    url: string; // This will be the Spotify preview_url
    title: string;
    artist: string;
    artwork?: string;
};

const usePlayer = () => {
    
    const [isReady, setIsReady] = useState(false);
    const [playlist, setPlaylist] = useState<Track[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const soundRef = useRef<Sound | null>(null);
    const shuffledRef = useRef(false);

    useEffect(() => {
        Sound.setCategory('Playback');
        setIsReady(true);

        return () => {
            soundRef.current?.release();
        };
    }, []);

    const loadTrack = (track: Track) => {
        return new Promise<void>((resolve, reject) => {
            soundRef.current?.release();
            const sound = new Sound(track.url, Sound.MAIN_BUNDLE, error => {
                if (error) {
                    console.error('Failed to load sound', error);
                    reject(error);
                } else {
                    soundRef.current = sound;
                    resolve();
                }
            });
        });
    };

    const loadPlaylist = async (tracks: Track[], shuffle = false) => {
        let list = tracks.filter(t => !!t.url);
        if (shuffle) {
            list = list.sort(() => Math.random() - 0.5);
            shuffledRef.current = true;
        }

        setPlaylist(list);
        setCurrentTrackIndex(0);

        await loadTrack(list[0]);
        play();
    };

    const play = () => {
        const sound = soundRef.current;
        if (sound) {
            sound.play(success => {
                if (success) {
                    next(); // auto-play next
                } else {
                    console.warn('Playback failed due to audio decoding errors');
                }
            });
            setIsPlaying(true);
        }
    };

    const pause = () => {
        soundRef.current?.pause();
        setIsPlaying(false);
    };

    const next = async () => {
        if (currentTrackIndex < playlist.length - 1) {
            const nextIndex = currentTrackIndex + 1;
            setCurrentTrackIndex(nextIndex);
            await loadTrack(playlist[nextIndex]);
            play();
        }
    };

    const previous = async () => {
        if (currentTrackIndex > 0) {
            const prevIndex = currentTrackIndex - 1;
            setCurrentTrackIndex(prevIndex);
            await loadTrack(playlist[prevIndex]);
            play();
        }
    };

    const togglePlayback = () => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    };

    return {
        isReady,
        loadPlaylist,
        play,
        pause,
        next,
        previous,
        togglePlayback,
        isPlaying,
        currentTrack: playlist[currentTrackIndex] || null,
    };
};

export default usePlayer;
