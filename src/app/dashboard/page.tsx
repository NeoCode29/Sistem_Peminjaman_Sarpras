import { auth } from "@/auth";

export default async function Home() {
  const session = await auth()
  return (
    <div className="flex min-h-screen bg-gray-50">
      {session?.user?.email}
    </div>
  );
}
