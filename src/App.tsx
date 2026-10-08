import { useState, useEffect } from 'react';
import { ScreenType, UserProfile, RewardTask, TransactionRecord } from './types';
import { AndroidFrame } from './components/AndroidFrame';
import { BottomNavBar } from './components/BottomNavBar';
import { HomeScreen } from './components/HomeScreen';
import { TasksScreen } from './components/TasksScreen';
import { WalletScreen } from './components/WalletScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { AuthScreen } from './components/AuthScreen';
import { CodeInspectorModal } from './components/CodeInspectorModal';

const DAILY_TASKS: RewardTask[] = [
  {
    id: 'daily_checkin',
    title: 'Daily Check-in',
    description: 'Check in daily to claim your bonus points',
    points: 10,
    iconType: 'checkin',
  },
  {
    id: 'daily_bonus',
    title: 'Daily Bonus',
    description: 'Special daily reward for active members',
    points: 20,
    iconType: 'bonus',
  },
  {
    id: 'complete_activity',
    title: 'Complete Activity',
    description: 'Complete your daily featured task',
    points: 30,
    iconType: 'activity',
  },
];

const STORAGE_KEYS = {
  USER: 'taskreward_user',
  CLAIMS: 'taskreward_claims',
  TRANSACTIONS: 'taskreward_transactions',
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>(['home']);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  // Today's date key for daily claim enforcement: YYYY-MM-DD
  const todayKey = new Date().toISOString().split('T')[0];

  // Map of claimed task IDs for today
  const [claimedTaskIds, setClaimedTaskIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEYS.CLAIMS}_${todayKey}`);
      if (saved) return new Set(JSON.parse(saved));
    } catch {
      // ignore
    }
    return new Set<string>();
  });

  // Transaction history
  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Initial demo transaction records
    return [
      {
        id: 'tx_init_1',
        userId: 'demo_user_01',
        title: 'Welcome Bonus',
        description: 'New account onboarding bonus',
        points: 50,
        type: 'bonus',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'tx_init_2',
        userId: 'demo_user_01',
        title: 'Daily Check-in',
        description: 'Claimed daily reward (Daily Check-in)',
        points: 10,
        type: 'reward_earned',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
  });

  // Sync state to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_KEYS.CLAIMS}_${todayKey}`,
      JSON.stringify(Array.from(claimedTaskIds))
    );
  }, [claimedTaskIds, todayKey]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  // Screen navigation with back stack
  const navigateTo = (screen: ScreenType) => {
    if (screen === currentScreen) return;
    setScreenHistory((prev) => [...prev, screen]);
    setCurrentScreen(screen);
  };

  // Android back button handling
  const handleAndroidBack = () => {
    if (screenHistory.length > 1) {
      const updatedHistory = [...screenHistory];
      updatedHistory.pop();
      const prevScreen = updatedHistory[updatedHistory.length - 1];
      setScreenHistory(updatedHistory);
      setCurrentScreen(prevScreen);
    } else if (currentScreen !== 'home') {
      setCurrentScreen('home');
      setScreenHistory(['home']);
    }
  };

  // Secure Task Claiming Logic (Enforces 1 claim per calendar day)
  const handleClaimTask = (task: RewardTask): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: 'Please sign in to claim rewards.' };
    }

    if (claimedTaskIds.has(task.id)) {
      return {
        success: false,
        message: `Already claimed today! You can claim ${task.title} again tomorrow.`,
      };
    }

    // Update claimed set
    const nextClaimed = new Set(claimedTaskIds);
    nextClaimed.add(task.id);
    setClaimedTaskIds(nextClaimed);

    // Update user balance safely
    const updatedUser: UserProfile = {
      ...currentUser,
      coins: currentUser.coins + task.points,
      totalEarned: currentUser.totalEarned + task.points,
    };
    setCurrentUser(updatedUser);

    // Record new transaction
    const newTx: TransactionRecord = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser.uid,
      title: task.title,
      description: `Claimed daily reward (${task.title})`,
      points: task.points,
      type: 'reward_earned',
      timestamp: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    return {
      success: true,
      message: `Success! Claimed +${task.points} demo points.`,
    };
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentScreen('home');
    setScreenHistory(['home']);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('home');
    setScreenHistory(['home']);
  };

  return (
    <>
      <AndroidFrame
        canGoBack={screenHistory.length > 1 || currentScreen !== 'home'}
        onBackPress={handleAndroidBack}
        onOpenCodeInspector={() => setIsCodeModalOpen(true)}
      >
        {!currentUser ? (
          <AuthScreen onLogin={handleLogin} />
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
            {/* STRICT SCREEN SEPARATION:
                Home must show ONLY Home.
                Tasks must show ONLY Tasks.
                Wallet must show ONLY Wallet.
                Profile must show ONLY Profile.
                Never stack multiple screens.
            */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {currentScreen === 'home' && (
                <HomeScreen
                  userProfile={currentUser}
                  tasks={DAILY_TASKS}
                  onNavigateToTasks={() => navigateTo('tasks')}
                />
              )}

              {currentScreen === 'tasks' && (
                <TasksScreen
                  tasks={DAILY_TASKS}
                  claimedTaskIds={claimedTaskIds}
                  onClaimTask={handleClaimTask}
                />
              )}

              {currentScreen === 'wallet' && (
                <WalletScreen
                  userProfile={currentUser}
                  transactions={transactions}
                />
              )}

              {currentScreen === 'profile' && (
                <ProfileScreen
                  userProfile={currentUser}
                  onNavigateToWallet={() => navigateTo('wallet')}
                  onLogout={handleLogout}
                />
              )}
            </div>

            {/* Bottom Navigation Bar */}
            <BottomNavBar
              currentScreen={currentScreen}
              onSelectScreen={(screen) => navigateTo(screen)}
            />
          </div>
        )}
      </AndroidFrame>

      {/* Code Inspector Modal to examine all native Kotlin Jetpack Compose files */}
      <CodeInspectorModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />
    </>
  );
}
