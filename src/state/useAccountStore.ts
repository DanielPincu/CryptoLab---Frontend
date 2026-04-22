import { create } from 'zustand'
import type { IAccount } from '../interfaces/account.interface'

interface AccountState {
  account: IAccount | null
  setAccount: (account: IAccount | null) => void
  updateCash: (cashBalance: number) => void
  updateFavorites: (favorites: string[]) => void
  clearAccount: () => void
}

export const useAccountStore = create<AccountState>((set) => ({
  account: null,
  setAccount: (account) => set({ account }),
  updateCash: (cashBalance) =>
    set((state) => ({
      account: state.account
        ? { ...state.account, cashBalance }
        : state.account
    })),
  updateFavorites: (favorites) =>
    set((state) => ({
      account: state.account
        ? { ...state.account, favorites: [...favorites] }
        : state.account
    })),
  clearAccount: () => set({ account: null })
}))
