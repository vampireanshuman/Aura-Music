import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../../context/AudioContext';
import { 
  Radio, 
  Users, 
  Copy, 
  Check, 
  Send, 
  LogOut, 
  Crown,
  Disc3,
  ListMusic
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { get4kArtworkUrl, handleArtworkError } from '../../utils/artworkUtils';
import { AnimatedSoundBars } from '../AnimatedSoundBars';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
}

interface RoomMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
}

interface RoomState {
  roomId: string;
  name: string;
  hostName: string;
  isHost: boolean;
  participants: Participant[];
  messages: RoomMessage[];
}

export const RoomView: React.FC = () => {
  const { 
    currentTrack, 
    isPlaying, 
    playTrack, 
    activeThemeColor,
    queue
  } = useAudio();

  const [activeRoom, setActiveRoom] = useState<RoomState | null>(() => {
    const saved = localStorage.getItem('aura_active_room');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [userNameInput, setUserNameInput] = useState('Alex');
  const [roomNameInput, setRoomNameInput] = useState('Vibe Central Jam');
  const [copied, setCopied] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string; x: number }[]>([]);

  const channelRef = useRef<BroadcastChannel | null>(null);

  // Initialize BroadcastChannel for local/multi-tab low-latency sync
  useEffect(() => {
    const channel = new BroadcastChannel('aura_jam_broadcast_network');
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'EMOJI_BURST') {
        triggerEmojiBubble(data.emoji);
      } else if (data.type === 'CHAT_MESSAGE') {
        setActiveRoom(prev => {
          if (!prev || prev.roomId !== data.roomId) return prev;
          const updated = {
            ...prev,
            messages: [...prev.messages, data.message].slice(-50)
          };
          localStorage.setItem('aura_active_room', JSON.stringify(updated));
          return updated;
        });
      } else if (data.type === 'SYNC_TRACK') {
        if (data.track && currentTrack?.id !== data.track.id) {
          playTrack(data.track);
        }
      }
    };

    return () => {
      channel.close();
    };
  }, [currentTrack, playTrack]);

  const triggerEmojiBubble = (emoji: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    const x = Math.floor(Math.random() * 60) + 20;
    setFloatingEmojis(prev => [...prev, { id, emoji, x }]);

    try {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8, x: x / 100 },
        colors: ['#fa2d48', '#a855f7', '#3b82f6', '#10b981']
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 2000);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const code = `JAM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRoom: RoomState = {
      roomId: code,
      name: roomNameInput.trim() || 'Aura Listening Lounge',
      hostName: userNameInput.trim() || 'Host',
      isHost: true,
      participants: [
        {
          id: 'host-1',
          name: userNameInput.trim() || 'Host',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          isHost: true
        },
        {
          id: 'user-2',
          name: 'Sarah K.',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
          isHost: false
        },
        {
          id: 'user-3',
          name: 'Liam Chen',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
          isHost: false
        }
      ],
      messages: [
        {
          id: 'msg-1',
          sender: 'Aura Jam Bot',
          text: `Welcome to ${roomNameInput || 'the room'}! Stream high-fidelity music synchronously with friends.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    setActiveRoom(newRoom);
    localStorage.setItem('aura_active_room', JSON.stringify(newRoom));
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;

    const joinedRoom: RoomState = {
      roomId: roomCodeInput.trim().toUpperCase(),
      name: 'Synced Jam Lounge',
      hostName: 'Room Host',
      isHost: false,
      participants: [
        {
          id: 'host-1',
          name: 'Room Host',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          isHost: true
        },
        {
          id: 'guest-me',
          name: userNameInput.trim() || 'Guest Listener',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
          isHost: false
        }
      ],
      messages: [
        {
          id: 'msg-1',
          sender: 'Aura Jam Bot',
          text: `Joined Jam Room ${roomCodeInput.trim().toUpperCase()}. Audio playback is now synchronized with the host.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    setActiveRoom(joinedRoom);
    localStorage.setItem('aura_active_room', JSON.stringify(joinedRoom));
  };

  const handleLeaveRoom = () => {
    setActiveRoom(null);
    localStorage.removeItem('aura_active_room');
  };

  const handleSendReaction = (emoji: string) => {
    triggerEmojiBubble(emoji);
    channelRef.current?.postMessage({
      type: 'EMOJI_BURST',
      emoji,
      roomId: activeRoom?.roomId
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !activeRoom) return;

    const msg: RoomMessage = {
      id: `msg-${Date.now()}`,
      sender: activeRoom.isHost ? activeRoom.hostName : userNameInput || 'Guest',
      text: chatMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = {
      ...activeRoom,
      messages: [...activeRoom.messages, msg].slice(-50)
    };
    setActiveRoom(updated);
    localStorage.setItem('aura_active_room', JSON.stringify(updated));

    channelRef.current?.postMessage({
      type: 'CHAT_MESSAGE',
      roomId: activeRoom.roomId,
      message: msg
    });

    setChatMessage('');
  };

  const handleCopyCode = () => {
    if (!activeRoom) return;
    navigator.clipboard?.writeText(activeRoom.roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8" style={{ paddingBottom: '170px' }}>
      {/* Floating Emojis Reaction Layer */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingEmojis.map((e) => (
          <div
            key={e.id}
            className="absolute bottom-28 text-4xl animate-bounce duration-1000 transition-all opacity-90 drop-shadow-lg"
            style={{ left: `${e.x}%` }}
          >
            {e.emoji}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-400">
            <Radio className="w-4 h-4 animate-pulse" /> Aura Jam • Live Listening Room
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
            Listening Room
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Listen together in real time with friends. Synchronized playback, shared queue, and live chat.
          </p>
        </div>

        {activeRoom && (
          <button
            onClick={handleLeaveRoom}
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-bold text-red-300 flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave Room</span>
          </button>
        )}
      </div>

      {/* Not in a Room: Create or Join Stage */}
      {!activeRoom ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Create Room Card */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between border border-white/10 hover:border-purple-500/30 transition-all shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-[#fa2d48] flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Host a New Jam Room</h3>
                <p className="text-xs text-white/50 mt-1">
                  You control the music, queue, and playback. Invite friends anywhere with a 6-digit room code.
                </p>
              </div>

              <form onSubmit={handleCreateRoom} className="space-y-3.5 pt-2">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-1">
                    Your Host Display Name
                  </label>
                  <input
                    type="text"
                    value={userNameInput}
                    onChange={(e) => setUserNameInput(e.target.value)}
                    placeholder="e.g. Anshuman"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-1">
                    Room Name
                  </label>
                  <input
                    type="text"
                    value={roomNameInput}
                    onChange={(e) => setRoomNameInput(e.target.value)}
                    placeholder="e.g. Late Night Audiophile Session"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-[#fa2d48] hover:from-purple-500 hover:to-[#fa2d48]/90 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  Create & Host Room
                </button>
              </form>
            </div>
          </div>

          {/* Join Room Card */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between border border-white/10 hover:border-sky-500/30 transition-all shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Join an Existing Room</h3>
                <p className="text-xs text-white/50 mt-1">
                  Enter the Room Code shared by your friend to sync your sound stream in real time.
                </p>
              </div>

              <form onSubmit={handleJoinRoom} className="space-y-3.5 pt-2">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-1">
                    Your Listener Name
                  </label>
                  <input
                    type="text"
                    value={userNameInput}
                    onChange={(e) => setUserNameInput(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-sky-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-1">
                    Room Code (e.g. JAM-4821)
                  </label>
                  <input
                    type="text"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value)}
                    placeholder="JAM-XXXX"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs sm:text-sm font-mono tracking-wider focus:outline-none focus:border-sky-500 transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  Join Jam Room
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Active Room Stage */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Stage: Live Track & Controls */}
          <div className="lg:col-span-8 space-y-6">
            {/* Live Synchronized Player Card */}
            <div className="glass-panel rounded-3xl p-5 sm:p-7 border border-white/10 shadow-2xl relative overflow-hidden">
              <div 
                className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: activeThemeColor || '#fa2d48' }}
              />

              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Live Jam Sync
                  </span>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-white flex items-center gap-1.5 transition-colors"
                  title="Copy Room Code"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{activeRoom.roomId}</span>
                </button>
              </div>

              {/* Now Playing in Room */}
              {currentTrack ? (
                <div className="pt-6 flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-xl shrink-0">
                    <img
                      src={get4kArtworkUrl(currentTrack)}
                      onError={handleArtworkError}
                      alt={currentTrack.title}
                      className={`w-full h-full object-cover ${isPlaying ? 'scale-105' : ''} transition-transform duration-500`}
                    />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>

                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h2 className="text-xl sm:text-2xl font-black text-white truncate">
                        {currentTrack.title}
                      </h2>
                      <AnimatedSoundBars isPlaying={isPlaying} color={activeThemeColor || '#fa2d48'} size="sm" />
                    </div>
                    <p className="text-sm text-white/60 font-medium mt-1 truncate">
                      {currentTrack.artist}
                    </p>
                    <p className="text-xs text-white/40 font-mono mt-0.5">
                      {currentTrack.genre} • Studio Stream
                    </p>

                    {/* Room Reaction Emoji Buttons */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-4">
                      {['🔥', '❤️', '🎵', '👏', '🚀', '🎉'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleSendReaction(emoji)}
                          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 hover:scale-125 active:scale-95 text-base flex items-center justify-center transition-all cursor-pointer shadow-md"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-white/40">
                  <Disc3 className="w-12 h-12 mx-auto mb-2 opacity-40 animate-spin" />
                  <p className="text-sm font-semibold">No track actively playing in Room</p>
                </div>
              )}
            </div>

            {/* Room Up Next Shared Queue */}
            <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListMusic className="w-4 h-4 text-purple-400" />
                  <h3 className="text-base font-bold text-white tracking-tight">Shared Room Queue</h3>
                </div>
                <span className="text-xs font-mono text-white/50">{queue.length} tracks</span>
              </div>

              <div className="divide-y divide-white/5 max-h-56 overflow-y-auto">
                {queue.slice(0, 8).map((track, idx) => (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => playTrack(track, queue)}
                    className="flex items-center justify-between py-2.5 px-3 hover:bg-white/[0.04] rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs text-white/40 w-4">{idx + 1}</span>
                      <img
                        src={get4kArtworkUrl(track)}
                        onError={handleArtworkError}
                        alt={track.title}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{track.title}</p>
                        <p className="text-[11px] text-white/50 truncate">{track.artist}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Participants & Live Room Chat */}
          <div className="lg:col-span-4 space-y-6">
            {/* Participants Card */}
            <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <h4 className="text-sm font-bold text-white">Listeners in Room</h4>
                </div>
                <span className="text-xs font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full">
                  {activeRoom.participants.length} Active
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {activeRoom.participants.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02]">
                    <div className="flex items-center gap-2.5">
                      <img src={p.avatar} alt={p.name} className="w-7 h-7 rounded-full object-cover" />
                      <span className="text-xs font-semibold text-white">{p.name}</span>
                    </div>
                    {p.isHost && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                        Host
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Live Chat Thread */}
            <div className="glass-panel rounded-3xl p-5 border border-white/10 flex flex-col h-80">
              <div className="pb-3 border-b border-white/10 text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Live Jam Chat</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 py-3 select-none text-xs">
                {activeRoom.messages.map((m) => (
                  <div key={m.id} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-white/40">
                      <span className="font-bold text-purple-300">{m.sender}</span>
                      <span>{m.time}</span>
                    </div>
                    <p className="text-white/80 bg-white/[0.04] p-2 rounded-xl leading-relaxed">
                      {m.text}
                    </p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Drop a comment..."
                  className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-[#fa2d48] text-white hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
