export interface AutoEQProfile {
  id: string;
  name: string;
  brand: string;
  type: 'Over-Ear' | 'In-Ear' | 'True Wireless';
  target: 'Harman 2020' | 'Diffusal Neutral' | 'Optimum Bass';
  gains: number[]; // 5-band gains [60Hz, 250Hz, 1kHz, 4kHz, 12kHz]
  description: string;
}

export const AUTO_EQ_PROFILES: AutoEQProfile[] = [
  {
    id: 'airpods-pro-2',
    name: 'Apple AirPods Pro 2 / Max',
    brand: 'Apple',
    type: 'True Wireless',
    target: 'Harman 2020',
    gains: [1.5, -0.5, 0.8, 2.2, 1.0],
    description: 'Calibrated to elevate vocal air and tame slight mid-bass bloom for AirPods Pro 2 & AirPods Max.'
  },
  {
    id: 'sony-wh1000xm5',
    name: 'Sony WH-1000XM5 / XM4',
    brand: 'Sony',
    type: 'Over-Ear',
    target: 'Harman 2020',
    gains: [-3.0, -1.8, 1.5, 3.2, 2.0],
    description: 'Cleans up Sony muddy low-end bass bloat and brings out crisp midrange vocals and acoustic transients.'
  },
  {
    id: 'sennheiser-hd600',
    name: 'Sennheiser HD 600 / 650',
    brand: 'Sennheiser',
    type: 'Over-Ear',
    target: 'Harman 2020',
    gains: [4.5, 1.2, -0.5, 0.5, 2.0],
    description: 'Adds sub-bass extension to legendary open-back cans while preserving pristine vocal intimacy.'
  },
  {
    id: 'ath-m50x',
    name: 'Audio-Technica ATH-M50x',
    brand: 'Audio-Technica',
    type: 'Over-Ear',
    target: 'Harman 2020',
    gains: [-2.0, -0.8, 0.5, -1.5, -2.5],
    description: 'Tames aggressive 4kHz/10kHz treble spikes for smooth, non-fatiguing studio mastering listening.'
  },
  {
    id: 'bose-qc45',
    name: 'Bose QuietComfort 45 / Ultra',
    brand: 'Bose',
    type: 'Over-Ear',
    target: 'Harman 2020',
    gains: [1.2, 0.5, 0.0, -1.2, 1.5],
    description: 'Smooths out upper treble peaks and balances bass response for Bose QuietComfort headphones.'
  },
  {
    id: 'moondrop-chu',
    name: 'Moondrop Chu / Aria / Blessing 3',
    brand: 'Moondrop',
    type: 'In-Ear',
    target: 'Harman 2020',
    gains: [2.5, 1.0, 0.0, 0.5, 1.2],
    description: 'Compensates sub-bass punch on VDSF target curves for warm, impactful bass slam.'
  },
  {
    id: 'galaxy-buds-2-pro',
    name: 'Samsung Galaxy Buds 2 Pro / FE',
    brand: 'Samsung',
    type: 'True Wireless',
    target: 'Harman 2020',
    gains: [0.5, -0.5, 1.0, 1.2, -1.0],
    description: 'Refines upper treble brilliance for balanced acoustic reproduction.'
  }
];
