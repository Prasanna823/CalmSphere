import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUserStore = create(
  persist(
    (set, get) => ({
      // User state
      user: null,
      token: null,
      isAuthenticated: false,
      
      // Preferences
      language: 'en',
      mode: 'text',
      
      // Chat state
      chatHistory: [],
      moodLog: [],
      sessionCount: 0,
      streakCount: 1,
      
      // Actions
      setUser: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true 
      }),
      
      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        chatHistory: [],
        moodLog: [],
        sessionCount: 0,
        streakCount: 1
      }),
      
      setPreferences: (preferences) => set({
        language: preferences.language || 'en',
        mode: preferences.mode || 'text'
      }),
      
      addChatMessage: (message) => set((state) => ({
        chatHistory: [...state.chatHistory, message]
      })),
      
      addMoodLog: (moodEntry) => set((state) => ({
        moodLog: [...state.moodLog, moodEntry]
      })),
      
      incrementSessionCount: () => set((state) => ({
        sessionCount: state.sessionCount + 1
      })),
      
      updateStreak: (newStreak) => set({ streakCount: newStreak })
    }),
    {
      name: 'calmsphere-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        language: state.language,
        mode: state.mode,
        chatHistory: state.chatHistory,
        moodLog: state.moodLog,
        sessionCount: state.sessionCount,
        streakCount: state.streakCount
      })
    }
  )
)
