import HeaderLogin from "@/components/headerlogin";
import ButtonGoogleLogin from "@/components/googlebutton";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-indigo-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-purple-100 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <section className="min-h-screen py-20 px-4 flex items-center justify-center relative">
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-6xl font-extrabold text-gray-800 mb-6 animate-fadeIn bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Sistem Informasi Sarana & Prasarana
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto animate-fadeIn delay-1s">
            Kelola dan monitor penggunaan sarana prasarana kampus dengan mudah dan efisien
          </p>
          <a href="/auth/signin" className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-lg transition duration-300 transform hover:scale-105 hover:shadow-lg">
            Masuk Sekarang
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 relative">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Fitur Utama
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg transform transition duration-500 hover:scale-105 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-blue-600 text-4xl mb-4">📋</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  Peminjaman Mudah
                </h3>
                <p className="text-gray-600">
                  Proses peminjaman sarana yang cepat dan mudah dengan sistem digital
                </p>
              </div>
            </div>
            <div className="p-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg transform transition duration-500 hover:scale-105 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-green-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-green-600 text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  Monitoring Real-time
                </h3>
                <p className="text-gray-600">
                  Pantau status dan penggunaan sarana secara real-time
                </p>
              </div>
            </div>
            <div className="p-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg transform transition duration-500 hover:scale-105 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-purple-600 text-4xl mb-4">📱</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  Akses Mobile
                </h3>
                <p className="text-gray-600">
                  Akses sistem dari mana saja menggunakan perangkat mobile
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 relative">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Cara Kerja
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 transform transition duration-300 group-hover:scale-110 group-hover:shadow-lg">
                <span className="text-2xl text-blue-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Login</h3>
              <p className="text-gray-600">Login dengan akun Google</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 transform transition duration-300 group-hover:scale-110 group-hover:shadow-lg">
                <span className="text-2xl text-green-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">Pilih Sarana</h3>
              <p className="text-gray-600">Pilih sarana yang tersedia</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 transform transition duration-300 group-hover:scale-110 group-hover:shadow-lg">
                <span className="text-2xl text-purple-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Ajukan</h3>
              <p className="text-gray-600">Ajukan peminjaman</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 transform transition duration-300 group-hover:scale-110 group-hover:shadow-lg">
                <span className="text-2xl text-indigo-600">4</span>
              </div>
              <h3 className="font-semibold mb-2">Konfirmasi</h3>
              <p className="text-gray-600">Tunggu konfirmasi admin</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">© 2024 Sistem Informasi Sarana & Prasarana</p>
          <p className="text-gray-400">Developed with ❤️ for better campus management</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
