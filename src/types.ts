export interface Team {
  id: number;
  name: string;
  slogan: string;
  icon: string;
  score: number;
  color: string;
}

export interface Fragment {
  id: number;
  name: string;
  verse: string;
  message: string;
}

export interface StageInfo {
  id: number | number; // 1, 2, 3, 3.5 (AI), 4, 5, 6
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  question: string;
  deepQuestion: string;
}

export interface AudioState {
  isPlaying: boolean;
  currentText: string;
  source: 'gemini' | 'browser' | 'none';
  rate: number;
  soundEnabled: boolean;
  voiceGender: 'male_north';
}
