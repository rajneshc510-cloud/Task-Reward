export type ScreenType = 'home' | 'tasks' | 'wallet' | 'profile';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phoneNumber?: string;
  coins: number;
  totalEarned: number;
  createdAt: string;
}

export interface RewardTask {
  id: string;
  title: string;
  description: string;
  points: number;
  iconType: 'checkin' | 'bonus' | 'activity';
}

export interface TaskClaim {
  claimId: string;
  userId: string;
  taskId: string;
  dateKey: string; // YYYY-MM-DD
  claimedAt: string;
  pointsAwarded: number;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  title: string;
  description: string;
  points: number;
  type: 'reward_earned' | 'bonus';
  timestamp: string;
}
