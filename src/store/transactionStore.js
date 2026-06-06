import { create } from 'zustand'

export const useTransactionStore = create((set, get) => ({
  // ── Estado ──────────────────────────────────────────────────────
  transactions: [],
  loading:      true,
  filters: {
    type:     'all',     // 'all' | 'income' | 'expense'
    category: 'all',
    search:   '', 
  },

  // ── Acciones básicas ────────────────────────────────────────────
  setTransactions: (transactions) => set({ transactions }),
  setLoading:      (loading)      => set({ loading }),

  // Agrega una transacción al inicio del array (más reciente primero)
  addTransaction: (tx) => set(state => ({
    transactions: [tx, ...state.transactions]
  })),

  // Elimina por id filtrando el array
  removeTransaction: (id) => set(state => ({
    transactions: state.transactions.filter(tx => tx.id !== id)
  })),

  // Reemplaza una transacción existente por la versión actualizada
updateTransaction: (updatedTx) => set(state => ({
  transactions: state.transactions.map(tx =>
    tx.id === updatedTx.id ? updatedTx : tx
  )
})),

  // ── Filtros ─────────────────────────────────────────────────────
  setFilter: (key, value) => set(state => ({
    filters: { ...state.filters, [key]: value }
  })),

  clearFilters: () => set({
    filters: { type: 'all', category: 'all', search: '' }
  }),

  // ── Selector: transacciones filtradas ───────────────────────────
  // get() accede al estado actual desde dentro del store
  // Esta función aplica todos los filtros activos de una vez
  getFiltered: () => {
    const { transactions, filters } = get()
    return transactions.filter(tx => {
      const matchType     = filters.type === 'all'     || tx.type === filters.type
      const matchCategory = filters.category === 'all' || tx.category === filters.category
      const matchSearch   = filters.search === ''      ||
        tx.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        tx.category.toLowerCase().includes(filters.search.toLowerCase())

      return matchType && matchCategory && matchSearch
    })
  },
}))