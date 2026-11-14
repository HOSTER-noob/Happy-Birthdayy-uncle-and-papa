import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  CakeSlice,
  Clock3,
  Heart,
  LockKeyhole,
  Mic,
  Sparkles,
  Utensils,
  Volume2,
  X,
} from 'lucide-react';

// Deadline set to November 15, 2026 (Midnight / 15 November start)
const deadline = new Date('2026-11-15T00:00:00');
const vaultPassword = 'missal pav';

function App() {
  const [candlesOut, setCandlesOut] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [micBlocked, setMicBlocked] = useState(false);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [confettiBurst, setConfettiBurst] = useState(0);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micFrameRef = useRef<number | null>(null);

  const playChime = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = context;
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.001, context.currentTime + index * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + index * 0.12 + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + index * 0.12 + 0.45);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(context.currentTime + index * 0.12);
      oscillator.stop(context.currentTime + index * 0.12 + 0.5);
    });
  };

  const stopMicrophone = () => {
    if (micFrameRef.current) window.cancelAnimationFrame(micFrameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    analyserRef.current?.disconnect();
    analyserRef.current = null;
    streamRef.current = null;
    setMicActive(false);
  };

  const blowOutCandles = () => {
    if (candlesOut) return;
    setCandlesOut(true);
    setConfettiBurst((value) => value + 1);
    playChime();
    stopMicrophone();
  };

  const monitorMicrophone = () => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.fftSize);
    analyserRef.current.getByteTimeDomainData(data);
    const volume = data.reduce((total, value) => total + Math.abs(value - 128), 0) / data.length;
    if (volume > 18) {
      blowOutCandles();
      return;
    }
    micFrameRef.current = window.requestAnimationFrame(monitorMicrophone);
  };

  const requestMicrophone = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicBlocked(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error('Audio is not supported');
      const context = audioContextRef.current ?? new AudioContextClass();
      audioContextRef.current = context;
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      context.createMediaStreamSource(stream).connect(analyser);
      streamRef.current = stream;
      analyserRef.current = analyser;
      setMicBlocked(false);
      setMicActive(true);
      monitorMicrophone();
    } catch {
      setMicBlocked(true);
      stopMicrophone();
    }
  };

  const unlockVault = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.trim().toLowerCase() === vaultPassword) {
      setVaultOpen(true);
      setPasswordError(false);
      setConfettiBurst((value) => value + 1);
    } else {
      setPasswordError(true);
    }
  };

  useEffect(() => {
    return () => stopMicrophone();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, deadline.getTime() - Date.now());
      const totalSeconds = Math.floor(remaining / 1000);
      setCountdown({
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!confettiBurst) return;
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const pieces = Array.from({ length: 150 }, (_, index) => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      size: 5 + (index % 5),
      color: ['#cf3f4d', '#f6c83e', '#1e9ed1', '#f4f0d5'][index % 4],
      vx: (index % 2 ? 1 : -1) * (2 + (index % 7)),
      vy: -7 - (index % 8),
      rotation: index * 0.7,
    }));
    const startedAt = performance.now();
    const draw = (now: number) => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = now - startedAt;
      pieces.forEach((piece) => {
        piece.x += piece.vx;
        piece.vy += 0.18;
        piece.y += piece.vy;
        piece.rotation += 0.12;
        context.save();
        context.translate(piece.x, piece.y);
        context.rotate(piece.rotation);
        context.fillStyle = piece.color;
        context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 1.8);
        context.restore();
      });
      if (elapsed < 2300) window.requestAnimationFrame(draw);
      else context.clearRect(0, 0, canvas.width, canvas.height);
    };
    window.requestAnimationFrame(draw);
  }, [confettiBurst]);

  return (
    <main className="site-shell">
      <canvas className="confetti-canvas" ref={confettiCanvasRef} aria-hidden="true" />
      <div className="poster">
        <header className="hero-section" id="top">
          <div className="hero-topline">
            <span className="topline-mark">★</span>
            <span>MADE WITH LOVE</span>
          </div>
          <div className="hero-heading" aria-label="Happy Birthday Uncle and Papa, celebrating his 40th birthday">
            <div className="hero-word hero-word--happy">HAPPY</div>
            <div className="hero-word hero-word--birthday">BIRTHDAY!</div>
          </div>
          <div className="hero-middle-row">
            <div className="joystick-badge" aria-hidden="true">
              <div className="joystick-stick" />
              <div className="joystick-ball" />
              <div className="joystick-base" />
            </div>
            <div className="outlined-word">UNCLE</div>
          </div>
          <div className="hero-bottom-row">
            <div className="hero-word hero-word--uncle">&amp; PAPA</div>
            <div className="cake-sticker" aria-hidden="true"><CakeSlice size={46} strokeWidth={2.8} /><span>YAY!</span></div>
          </div>
          <div className="hero-message"><Heart size={14} fill="currentColor" /><span>HAPPY 40TH BIRTHDAY, UNCLE + PAPA</span><Heart size={14} fill="currentColor" /></div>
        </header>

        <section className="candle-section" aria-labelledby="cake-heading">
          <div className="pixel-divider pixel-divider--light" aria-hidden="true" />
          <div className="section-kicker">A LITTLE BIRTHDAY MAGIC</div>
          <div className="candle-layout">
            <div className="candle-copy">
              <h1 id="cake-heading">MAKE A<br />WISH, PAPA</h1>
              <p>Allow microphone access and blow toward the screen to put out the candles. No pressure — there is also a very easy button.</p>
              <button className="blue-button" type="button" onClick={candlesOut ? undefined : blowOutCandles} disabled={candlesOut}>
                <Mic size={15} /> {candlesOut ? 'WISH GRANTED!' : 'CLICK TO BLOW CANDLES'}
              </button>
              {!candlesOut && <button className="mic-button" type="button" onClick={requestMicrophone}><Volume2 size={14} /> {micActive ? 'LISTENING FOR A BLOW...' : 'USE THE MICROPHONE'}</button>}
              {micBlocked && <span className="helper-text">Microphone unavailable? The blue button still works perfectly.</span>}
            </div>
            <div className={`cake-illustration ${candlesOut ? 'cake-illustration--out' : ''}`}>
              <div className="candle-row">
                {[0, 1, 2, 3, 4].map((candle) => <div className="candle" key={candle}><span className="flame" /></div>)}
              </div>
              <div className="cake-top" />
              <div className="cake-body"><span>HAPPY</span><strong>♥</strong><span>PAPA</span></div>
              <div className="cake-plate" />
            </div>
          </div>
        </section>

        <section className="vault-section" aria-labelledby="vault-heading">
          <div className="vault-pixels" aria-hidden="true" />
          <div className="vault-card">
            <div className="lock-icon"><LockKeyhole size={30} /></div>
            <div className="section-kicker">CLASSIFIED FAMILY BUSINESS</div>
            <h2 id="vault-heading">THE SECRET<br />VAULT</h2>
            <p>There is one more surprise hiding in here. Hint: enter your favorite food name.</p>
            <form className="vault-form" onSubmit={unlockVault}>
              <input type="password" value={password} onChange={(event) => { setPassword(event.target.value); setPasswordError(false); }} placeholder="ENTER THE SECRET PASSWORD" aria-label="Secret password" />
              <button className="red-button" type="submit">UNLOCK <LockKeyhole size={14} /></button>
            </form>
            {passwordError && <span className="vault-error">NOT QUITE. TRY AGAIN, PAPA.</span>}
          </div>
        </section>

        {vaultOpen && (
          <div className="modal-overlay" style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div className="modal-content" style={{
              background: '#f4f0d5',
              padding: '2rem',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              position: 'relative',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              border: '4px solid #111'
            }}>
              <button 
                onClick={() => setVaultOpen(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={24} />
              </button>
              <div className="vault-unlocked" style={{ textAlign: 'center' }}>
                <div className="unlock-icon" style={{ display: 'inline-flex', padding: '10px', background: '#f6c83e', borderRadius: '50%', marginBottom: '1rem' }}><Sparkles size={28} /></div>
                <div className="section-kicker">ACCESS GRANTED! 🎉</div>
                <h2 style={{ fontSize: '1.8rem', margin: '0.5rem 0 1rem 0' }}>THE SECRET<br />STASH UNLOCKED</h2>
                <p style={{ marginBottom: '1.5rem', fontWeight: 500 }}>Arey Papa! Sahi pehchana — Misal Pav is ultimate! Yeh raha aapka special surprise message aur countdown:</p>
                
                <div className="countdown-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <Clock3 size={15} /> COUNTDOWN TO THE BIRTHDAY PARTY (NOV 15)
                </div>
                <div className="countdown" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', border: '2px solid #111', minWidth: '60px' }}><strong style={{ display: 'block', fontSize: '1.2rem' }}>{String(countdown.days).padStart(2, '0')}</strong><span style={{ fontSize: '0.7rem' }}>DAYS</span></div>
                  <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', border: '2px solid #111', minWidth: '60px' }}><strong style={{ display: 'block', fontSize: '1.2rem' }}>{String(countdown.hours).padStart(2, '0')}</strong><span style={{ fontSize: '0.7rem' }}>HOURS</span></div>
                  <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', border: '2px solid #111', minWidth: '60px' }}><strong style={{ display: 'block', fontSize: '1.2rem' }}>{String(countdown.minutes).padStart(2, '0')}</strong><span style={{ fontSize: '0.7rem' }}>MINUTES</span></div>
                  <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', border: '2px solid #111', minWidth: '60px' }}><strong style={{ display: 'block', fontSize: '1.2rem' }}>{String(countdown.seconds).padStart(2, '0')}</strong><span style={{ fontSize: '0.7rem' }}>SECONDS</span></div>
                </div>
                
                <p className="vault-note" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 'bold', color: '#cf3f4d' }}>
                  <Utensils size={14} /> Dinner is waiting. Keep November 15 free!
                </p>
              </div>
            </div>
          </div>
        )}

        <footer className="footer-section"><p>MADE BY VRISHANK + ADITYA</p></footer>
      </div>
    </main>
  );
}

export default App;

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
