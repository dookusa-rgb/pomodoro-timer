// 外部の音声ファイルを使わず、Web Audio APIで完了通知音を生成する
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) audioContext = new AudioContext();
  return audioContext;
}

export function playCompleteSound(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // 2音の短いチャイム（ポーン、ポーン）を鳴らす
  [0, 0.18].forEach((offset, i) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = i === 0 ? 880 : 1046.5;

    const start = now + offset;
    const end = start + 0.16;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.3, start + 0.02);
    gain.gain.linearRampToValueAtTime(0, end);

    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(end);
  });
}
