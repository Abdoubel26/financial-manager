"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type AuthStateType = "login" | "signup"
type ResponseMessageType = { ok: boolean; message: string; show: boolean }

function LoginPage() {
  const router = useRouter()
  
  const [authState, setAuthState] = useState<AuthStateType>("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [image, setImage] = useState("")
  const [responseMessage, setResponseMessage] = useState<ResponseMessageType>({ ok: true, message: "", show: false })

  useEffect(() => { setImage("") }, [authState])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setResponseMessage({ show: false, message: "", ok: false})
    if(authState === "login"){
      const res = await fetch("https://finances-trackr.netlify.app/api/user/login", {
        method: "POST",
        headers:{ "Content-Type": "application/json"},
        body: JSON.stringify({
         email, password, 
        })
      })
      const content = await res.json().catch(() => null)
      console.log(content)
      switch(res.status){
        case 404:
          setResponseMessage({ ok: false, show: true, message: "This Email is not registered. Please signup"});
        case 401:
          setResponseMessage({ ok: false, show: true, message: "Wrong Email or password"})
        case 200: 
        router.push("/dashboard")
        break
      }
    }
    else if(authState === "signup"){
      const res = await fetch("https://finances-trackr.netlify.app/api/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({
          name, email, password, image
        })
      });
      const content = await res.json().catch(() => null)
      console.log(content)
      switch(res.status){
        case 409:
          setResponseMessage({ ok: false, show: true, message: "This Email is already registered. Please login"});
        case 201:
          router.push("/dashboard")
        break
      }
    };
  };

  const switchAuth = (state: AuthStateType) => {
    setAuthState(state)
    setResponseMessage({ show: false, message: "", ok: false })
  }

  return (
    <div className="w-screen h-screen bg-[#0f0f11] flex justify-center items-center">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-10 pb-3 pt-2 w-full max-w-md">
        
        <div className="w-9 h-9 bg-violet-600 rounded-lg flex items-center justify-center mb-3">
          <span className="text-white text-lg">$</span>
        </div>

        <h1 className="text-2xl font-medium text-neutral-900 dark:text-white">
          {authState === "login" ? "Welcome back" : "Create an account"}
        </h1>
        <p className="text-sm text-neutral-500 mt-1 mb-3">
          {authState === "login" ? "Sign in to your account to continue" : ""}
        </p>

        <form onSubmit={handleSubmit} className="flex transition-all flex-col text-white gap-4">
          {authState === "signup" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Your name"
                className="px-3.5 py-2.5 text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all" />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com"
              className="px-3.5 py-2.5 text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••"
              className="px-3.5 py-2.5 text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all" />
          </div>

          {authState === "signup" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Profile image URL <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <input value={image} onChange={(e) => setImage(e.target.value)} type="url" placeholder="https://..."
                className="px-3.5 py-2.5 text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all" />
            </div>
          )}

          {responseMessage.show && (
            <p className={`text-sm px-3.5 py-2.5 rounded-lg ${responseMessage.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {responseMessage.message}
            </p>
          )}

          <button type="submit" className="mt-1 py-2.5 bg-violet-600 cursor-pointer hover:bg-violet-700 active:scale-[0.98] text-white text-sm font-medium rounded-lg transition-all">
            {authState === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="border-t border-neutral-200 dark:border-neutral-800 mt-5 pt-5 text-center text-sm text-neutral-500">
          {authState === "login"
            ? <>Don't have an account? <span onClick={() => switchAuth("signup")} className="text-violet-600 font-medium cursor-pointer hover:underline">Sign up</span></>
            : <>Already have an account? <span onClick={() => switchAuth("login")} className="text-violet-600 font-medium cursor-pointer hover:underline">Sign in</span></>
          }
        </div>
      </div>
    </div>
  )
}

export default LoginPage