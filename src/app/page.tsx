import HeaderLogin from "@/components/headerlogin";
import CardLogin from "@/components/CardLogin";
import ButtonGoogleLogin from "@/components/googlebutton";
import Sidebar from "@/components/sidebar";

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderLogin />
      <Sidebar></Sidebar>
      <main className="flex justify-center items-center h-[calc(100vh-64px)]">
        <CardLogin>
          <h2 className="text-lg font-semibold mb-1 text-black">Selamat Datang!</h2>
          <p className="text-sm text-gray-400 mb-4">Login untuk melanjutkan</p>
          <ButtonGoogleLogin />
        </CardLogin>
      </main>
    </div>
  );
};

export default LoginPage;
