"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type Props = {
  transaction: Transaction
  categories: Category[]
  userId: string
  onClose: () => void
}

export default function EditTransactionModal({ transaction, categories, userId, onClose }: Props) {
  const router = useRouter()

  const [description, setDescription] = useState(transaction.description)
  const [amount, setAmount] = useState(transaction.amount.toString())
  const [type, setType] = useState<"income" | "expense">(transaction.type)
  const [date, setDate] = useState(new Date(transaction.date).toISOString().slice(0, 16))
  const [category, setCategory] = useState(transaction.category || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/transaction/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: transaction.id,
          description,
          amount: Number(amount),
          type,
          date: new Date(date),
          category: category || null,
          user_id: userId,
        })
      })

      if (!res.ok) {
        setError("Failed to update transaction")
        return
      }

      router.refresh()
      onClose()
    } catch (e) {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-medium">Edit Transaction</h2>
          <button onClick={onClose} className="text-xl text-neutral-400 hover:text-neutral-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-neutral-500">Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)} required
              className="px-3.5 py-2.5 text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg" />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm text-neutral-500">Amount</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required
                className="px-3.5 py-2.5 text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg w-full" />
            </div>
            <div className="flex-1">
              <label className="text-sm text-neutral-500">Type</label>
              <select value={type} onChange={e => setType(e.target.value as "income" | "expense")}
                className="px-3.5 py-2.5 text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg w-full">
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-neutral-500">Date</label>
            <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required
              className="px-3.5 py-2.5 text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-neutral-500">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="px-3.5 py-2.5 text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <option value="">No category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium disabled:opacity-50">
            {loading ? "Updating..." : "Update Transaction"}
          </button>
        </form>
      </div>
    </div>
  )
}