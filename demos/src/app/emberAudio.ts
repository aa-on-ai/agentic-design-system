export function playEmberChirp() {
  const WebAudioContext = window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!WebAudioContext) return;

  const context = new WebAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(330, now);
  oscillator.frequency.exponentialRampToValueAtTime(610, now + 0.09);
  oscillator.frequency.exponentialRampToValueAtTime(440, now + 0.16);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.19);
  oscillator.addEventListener("ended", () => void context.close(), { once: true });
}
