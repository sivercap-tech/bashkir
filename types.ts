export type CategoryType = 'left' | 'right' | 'none';

export interface Stimulus {
  id: string;
  text: string;
  image?: string; // URL for image stimuli
  category: string; // The specific category (e.g., 'Flower', 'Insect')
  type: 'target' | 'attribute'; // Is it the main target or the attribute (Good/Bad)
}

export type BlockPairingType = 'learning' | 'target_switch' | 'Russian+Horse' | 'Russian+Cow';

export interface BlockConfig {
  id: number;
  name: string;
  leftCategories: string[];
  rightCategories: string[];
  trials: number;
  isPractice: boolean;
  instructions: string;
  pairingType: BlockPairingType; // Used for D-Score calculation regardless of block order
}

export interface TrialResult {
  blockId: number;
  trialIndex: number;
  stimulus: string;
  stimulusCategory: string;
  correctCategory: CategoryType;
  userCategory: CategoryType;
  isCorrect: boolean;
  reactionTime: number; // in milliseconds
  timestamp: number;
  pairingType: BlockPairingType; // Stored with result for analysis
}

export interface IATSessionData {
  sessionId: string;
  participantId: string; // Captured from URL or generated
  timestamp: string;
  results: TrialResult[];
  dScore?: number;
}

export enum AppState {
  WELCOME = 'WELCOME',
  INSTRUCTIONS = 'INSTRUCTIONS',
  RUNNING = 'RUNNING',
  FINISHED = 'FINISHED',
}