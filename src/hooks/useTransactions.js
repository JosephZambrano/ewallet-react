import { useEffect } from 'react'
import { useTransactionStore } from '../store/transactionStore'
import { getTransactions } from '../services/transactions.service'

export function useTransactions() {
  const {
    transactions, loading,
    setTransactions, setLoading,
    addTransaction, removeTransaction, updateTransaction,
    filters, setFilter, clearFilters, getFiltered,
  } = useTransactionStore()

  useEffect(() => {
    if (transactions.length > 0) {
      setLoading(false)
      return
    }

    async function load() {
      try {
        const data = await getTransactions()
        setTransactions(data)
      } catch (err) {
        console.error('Error cargando transacciones:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return {
    transactions,
    filtered: getFiltered(),
    loading,
    filters,
    setFilter,
    clearFilters,
    addTransaction,
    removeTransaction,
    updateTransaction,
  }
}