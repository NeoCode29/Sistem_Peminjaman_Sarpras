import Header from "@/components/header";
import Sidebar from "@/components/sidebar";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar></Sidebar>
      <Header></Header> 
    </div>
  );
}
