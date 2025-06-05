import Header from "@/components/AppHeader";
import Sidebar from "@/components/sidebar";
import Cardacara from "@/components/cardacara";
import CardLogin from "@/components/CardLogin";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar></Sidebar>
      <Header></Header>
      <div className="justify-center items-center h-[calc(100vh-64px)]">
        <CardLogin>
          
          <Cardacara></Cardacara>
        </CardLogin>
      </div>

    </div>
  );
}
