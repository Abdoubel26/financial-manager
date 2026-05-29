"use client"
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useRouter } from "next/navigation"

type Props = {
  transactions: Transaction[]
  categories: Category[]
  balanceHistories: BalanceHistory[]
  user: { name: string; email: string; image?: string; userId: string }
}

const COLORS = ["#6c5ce7","#1D9E75","#E24B4A","#EF9F27","#378ADD","#D4537E","#D85A30"]

export default function DashboardClient({ transactions, balanceHistories, user }: Props) {
  const router = useRouter()

  // stat calculations
  const currentBalance = transactions.length > 0
    ? [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].balance
    : 0

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  // balance line chart data
  const balanceChartData = [...balanceHistories]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(b => ({
      date: new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      balance: b.balance
    }))

  // income vs expense bar chart
  const barData = [
    { name: "Income", amount: totalIncome },
    { name: "Expenses", amount: totalExpenses }
  ]

  // category pie chart (expenses only)
  const categoryMap: Record<string, number> = {}
  transactions
    .filter(t => t.type === "expense" && t.category)
    .forEach(t => {
      categoryMap[t.category!] = (categoryMap[t.category!] || 0) + t.amount
    })
  const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }))

  // recent 5 transactions
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 p-6">

      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {user.image
            ? <img src={user.image} className="w-10 h-10 rounded-full object-cover" />
            : <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-medium">{initials}</div>
          }
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">{user.name}</p>
            <p className="text-xs text-neutral-500">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 transition-all"
        >
          Logout
        </button>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Current balance", value: currentBalance.toLocaleString(), color: "" },
          { label: "Total income", value: totalIncome.toLocaleString(), color: "text-emerald-600" },
          { label: "Total expenses", value: totalExpenses.toLocaleString(), color: "text-red-500" },
          { label: "Transactions", value: transactions.length.toString(), color: "" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-neutral-200/60 dark:bg-neutral-900 rounded-xl p-4">
            <p className="text-xs text-neutral-500 mb-1">{label}</p>
            <p className={`text-xl font-medium text-neutral-900 dark:text-white ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

        {/* balance line chart - full width */}
        <div className="md:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">Balance over time</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={balanceChartData}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={v => v.toLocaleString()} />
              <Tooltip formatter={(v: any) => v.toLocaleString()} />
              <Area type="monotone" dataKey="balance" stroke="#6c5ce7" strokeWidth={2} fill="url(#balanceGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* income vs expenses bar chart */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">Income vs expenses</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barSize={48}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={v => v.toLocaleString()} />
              <Tooltip formatter={(v: any) => v.toLocaleString()} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#1D9E75" : "#E24B4A"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* category pie chart */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">Spending by category</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => v.toLocaleString()} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-neutral-400 text-center mt-10">No expense data yet</p>
          )}
        </div>
      </div>

      {/* recent transactions table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">Recent transactions</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-neutral-800">
              <th className="text-left text-xs text-neutral-500 font-medium pb-3 w-[35%]">Description</th>
              <th className="text-left text-xs text-neutral-500 font-medium pb-3 w-[15%]">Type</th>
              <th className="text-left text-xs text-neutral-500 font-medium pb-3 w-[20%]">Category</th>
              <th className="text-left text-xs text-neutral-500 font-medium pb-3 w-[15%]">Date</th>
              <th className="text-right text-xs text-neutral-500 font-medium pb-3 w-[15%]">Amount</th>
            </tr>
          </thead>
          <tbody>
            {recent.map(t => (
              <tr key={t.id} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                <td className="py-3 text-neutral-800 dark:text-neutral-200 truncate pr-2">{t.description}</td>
                <td className="py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    t.type === "income"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
                  }`}>
                    {t.type}
                  </span>
                </td>
                <td className="py-3 text-neutral-500 truncate">{t.category ?? "—"}</td>
                <td className="py-3 text-neutral-500">{new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                <td className={`py-3 text-right font-medium ${t.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                  {t.type === "income" ? "+" : "-"}{t.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}