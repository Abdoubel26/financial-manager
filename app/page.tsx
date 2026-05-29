import Image from "next/image";
import Link  from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans">
     <pre>Go to 
     <Link className="hover:underline text-blue-500" href={"/login"}>Login</Link>if not logged in
     <Link className="hover:underline text-blue-500" href={"/dashboard"}>Dashboard</Link> if logged in
     </pre>
    </div>
  );
}
