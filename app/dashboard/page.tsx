import { db } from "@/db";
import { transactions, categories, balance_histories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redirect } from "next/navigation";
import DashboardClient from "../../components/dashboardClient";

export default async function DashboardPage() {

  const cookieStore = await cookies()  

  const token = cookieStore.get("token")?.value

  if(!token) redirect("/login");
  
  let decoded: JwtPayload | null = null

  try {
      decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as JwtPayload
  } 
  catch (e) {
    console.log(e)
    redirect("login")
  }

  if(!decoded) redirect("/login")

  const { userId } = decoded

  const [userTransactions, userCategories, userBalanceHistories, userResponse] = await Promise.all([
    db.select().from(transactions).where(eq(transactions.user_id, userId)),
    db.select().from(categories),
    db.select().from(balance_histories).where(eq(balance_histories.user_id, userId)),
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/user/me`, {
        headers: { Cookie: `token=${token}` }  // forward the cookie
    }).then(r => r.json())
])

  return (
    <DashboardClient
        transactions={userTransactions as Transaction[]}
        categories={userCategories as Category[]}
        balanceHistories={userBalanceHistories as BalanceHistory[]}
        user={{ userId, ...userResponse }}
    />
  )
}

