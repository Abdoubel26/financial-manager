"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  categories: Category[]
  userId: string
  onClose: () => void
  isFirstTransaction: boolean  
}

type TransactionTypeType = "income" | "expense"


export default function AddTransactionModal({ categories, userId, onClose, isFirstTransaction }: Props) {
  const router = useRouter()

  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"income" | "expense">("income")
  const [date, setDate] = useState("")
  const [category, setCategory] = useState("")
  const [balance, setBalance] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      let finalCategory = category

      // if user is adding a new category, create it first
      if (isAddingCategory && newCategory) {
        const catRes = await fetch("/api/category/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newCategory, user_id: userId })
        })
        if (!catRes.ok) {
          setError("Failed to create category")
          const content = await catRes.json()
          console.log("category add res:", content)
          setLoading(false)
          return
        }
        finalCategory = newCategory
      }

      const res = await fetch("/api/transaction/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          amount: Number(amount),
          type,
          date,
          category: finalCategory || null,
          user_id: userId,
          balance: isFirstTransaction ? Number(balance) : undefined
        })
      })

      if (!res.ok) {
        setError("Failed to add transaction")
        const content = await res.json()
        console.log("transaction add res:", content)
        setLoading(false)
        return
      }

      router.refresh() // refresh server component data
      onClose()

    } catch (e) {
      setError("Something went wrong")
    }

    setLoading(false)
  }

  return (
    // backdrop
    <div className="fixed inset-0 text-white bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      
      {/* modal box — stop click from closing when clicking inside */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-neutral-200 dark:border-neutral-800" onClick={e => e.stopPropagation()}>
        
        <div className="flex items-center justify-between mb-5">
          <p className="text-base font-medium text-neutral-900 dark:text-white">Add transaction</p>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-neutral-500">Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)} required placeholder="e.g. Freelance payment"
              className="px-3.5 py-2.5 text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 transition-all" />
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm text-neutral-500">Amount</label>
              <input value={amount} onChange={e => setAmount(e.target.value)} required type="number" min="1" placeholder="0"
                className={`px-3.5 py-2.5 text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 transition-all ${ isFirstTransaction ? "w-35" : ""}`} />
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm text-neutral-500">Type</label>
              <select value={type} onChange={e => setType(e.target.value as TransactionTypeType)}
                className="px-3.5 py-2.5 text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 transition-all">
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            {isFirstTransaction && (
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-neutral-500">Current balance</label>
                    <input value={balance} onChange={e => setBalance(e.target.value)} type="number" placeholder="0"
                        className="px-3.5 py-2.5 text-sm w-25 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 transition-all" />
                </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-neutral-500">Date</label>
            <input value={date} onChange={e => setDate(e.target.value)} required type="datetime-local"
              className="px-3.5 py-2.5 text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-neutral-500">Category</label>
            {!isAddingCategory ? (
              <select value={category} onChange={e => {
                if (e.target.value === "__add__") {
                  setIsAddingCategory(true)
                  setCategory("")
                } else {
                  setCategory(e.target.value)
                }
              }} className="px-3.5 py-2.5 text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 transition-all">
                <option value="">No category</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                <option value="__add__">+ Add new category</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Category name" autoFocus
                  className="flex-1 px-3.5 py-2.5 text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 transition-all" />
                <button type="button" onClick={() => { setIsAddingCategory(false); setNewCategory("") }}
                  className="px-3 py-2 text-sm text-neutral-500 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  Cancel
                </button>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={loading}
            className="py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all">
            {loading ? "Adding..." : "Add transaction"}
          </button>

        </form>
      </div>
    </div>
  )
}