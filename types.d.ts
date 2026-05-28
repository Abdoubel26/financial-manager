type User = {
    id?: string,
    name: string,
    password: string,
    email: string,
    image?: string
}

type Transaction = {
    id?: string,
    description: string,
    type: "income" | "expense",
    amount: number,
    category: string | null,
    date: Date,
    user_id: string,
    balance: number,
}


type BalanceHistory = {
    id?: string,
    user_id: string,
    date: Date,
    transaction_id: string,
    balance: number
}

type Category = {
    id?: string,
    name: string,
}