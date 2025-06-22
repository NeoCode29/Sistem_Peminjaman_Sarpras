import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Constants
const NAVIGATION_LINKS = [
  { href: "#features", label: "Fitur" },
  { href: "#process", label: "Cara Kerja" },
  { href: "#about", label: "Tentang" },
];

const FEATURES = [
  {
    icon: "📋",
    title: "Peminjaman Digital",
    description: "Sistem peminjaman sarana yang mudah dan cepat dengan approval digital"
  },
  {
    icon: "📊",
    title: "Monitoring Real-time",
    description: "Pantau ketersediaan dan status penggunaan sarana secara real-time"
  },
  {
    icon: "📱",
    title: "Mobile Responsive",
    description: "Akses sistem dari berbagai perangkat dengan tampilan yang responsif"
  },
  {
    icon: "🔐",
    title: "Keamanan Data",
    description: "Sistem keamanan tinggi dengan autentikasi Google untuk melindungi data"
  },
  {
    icon: "📈",
    title: "Laporan Analitik",
    description: "Generate laporan penggunaan dan analisis data untuk pengambilan keputusan"
  },
  {
    icon: "⚡",
    title: "Notifikasi Otomatis",
    description: "Sistem notifikasi otomatis untuk pengingat dan update status peminjaman"
  }
];

const PROCESS_STEPS = [
  {
    number: 1,
    title: "Login",
    description: "Masuk dengan akun Google Anda untuk mengakses sistem"
  },
  {
    number: 2,
    title: "Pilih Sarana",
    description: "Browse dan pilih sarana atau prasarana yang tersedia"
  },
  {
    number: 3,
    title: "Ajukan",
    description: "Isi form peminjaman dan submit ke sistem"
  },
  {
    number: 4,
    title: "Konfirmasi",
    description: "Tunggu approval dari admin dan ambil sarana"
  }
];

const FOOTER_SECTIONS = [
  {
    title: "SarPras",
    content: "Sistem Informasi Sarana dan Prasarana Politeknik Negeri Banyuwangi",
    type: "description"
  },
  {
    title: "Fitur",
    type: "links",
    links: [
      { href: "#", label: "Peminjaman Digital" },
      { href: "#", label: "Monitoring Real-time" },
      { href: "#", label: "Laporan Analitik" }
    ]
  },
  {
    title: "Bantuan",
    type: "links",
    links: [
      { href: "#", label: "Panduan Penggunaan" },
      { href: "#", label: "FAQ" },
      { href: "#", label: "Kontak Support" }
    ]
  },
  {
    title: "Kontak",
    type: "contact",
    contact: [
      "Politeknik Negeri Banyuwangi",
      "Jl. Raya Jember Km 13",
      "Banyuwangi, Jawa Timur"
    ]
  }
];

const ABOUT_BENEFITS = [
  "Proses digital tanpa kertas",
  "Tracking real-time status peminjaman",
  "Laporan dan analisis penggunaan"
];

// Components
const Header = () => (
  <header className="sticky top-0 z-50 h-20 bg-white border-b border-gray-200 px-8">
    <nav className="flex items-center justify-between h-full max-w-6xl mx-auto">
      <div className="text-2xl font-bold text-blue-500">
        SarPras
      </div>
      <div className="hidden md:flex items-center gap-8">
        {NAVIGATION_LINKS.map((link) => (
          <Link 
            key={link.href}
            href={link.href} 
            className="text-sm font-medium text-gray-700 hover:text-blue-500 px-4 py-2 rounded-md transition-all duration-200 hover:bg-gray-100"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <Link href="/auth/signin">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white border-none rounded-lg px-6 py-3 text-sm font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40">
          Masuk
        </Button>
      </Link>
    </nav>
  </header>
);

const HeroSection = () => (
  <section className="py-24 px-8 bg-white flex items-center justify-center min-h-[600px] max-w-6xl mx-auto">
    <div className="text-center max-w-4xl">
      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mb-6">
        Sistem Manajemen Kampus
      </div>
      <h1 className="text-6xl font-extrabold leading-tight text-gray-900 mb-6">
        Kelola Sarana & Prasarana dengan
        <span className="text-blue-500"> Mudah</span>
          </h1>
      <p className="text-xl text-gray-600 leading-relaxed mb-8">
        Platform digital untuk mengelola peminjaman sarana dan prasarana kampus secara efisien dan terorganisir.
      </p>
      <div className="flex justify-center">
        <Link href="/auth/signin">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white border-none rounded-lg px-8 py-4 text-lg font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/40">
            Mulai Sekarang
          </Button>
        </Link>
      </div>
        </div>
      </section>
);

const FeatureCard = ({ feature }: { feature: typeof FEATURES[0] }) => (
  <Card className="bg-white rounded-2xl p-8 border border-gray-100 min-h-[200px] flex flex-col transition-all duration-300 hover:border-blue-500 hover:-translate-y-2 hover:shadow-lg">
    <CardContent className="p-0 flex flex-col h-full">
      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
        <span className="text-2xl">{feature.icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {feature.title}
      </h3>
      <p className="text-gray-600 leading-relaxed flex-grow">
        {feature.description}
      </p>
    </CardContent>
  </Card>
);

const FeaturesSection = () => (
  <section id="features" className="py-20 px-8 bg-white">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Fitur Unggulan
          </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          Platform lengkap untuk mengelola sarana dan prasarana kampus dengan teknologi modern
                </p>
              </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {FEATURES.map((feature, index) => (
          <FeatureCard key={index} feature={feature} />
        ))}
      </div>
    </div>
  </section>
);

const ProcessStep = ({ step }: { step: typeof PROCESS_STEPS[0] }) => (
  <div className="text-center p-8 relative">
    <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold mx-auto mb-4">
      {step.number}
            </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
    <p className="text-gray-600 leading-relaxed">
      {step.description}
                </p>
              </div>
);

const ProcessSection = () => (
  <section id="process" className="py-20 px-8 bg-gray-50">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Cara Menggunakan Sistem
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          Proses peminjaman sarana dan prasarana yang mudah dalam 4 langkah sederhana
                </p>
              </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {PROCESS_STEPS.map((step) => (
          <ProcessStep key={step.number} step={step} />
        ))}
          </div>
        </div>
      </section>
);

const BenefitItem = ({ benefit }: { benefit: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
      <span className="text-white text-sm">✓</span>
    </div>
    <span className="text-gray-700">{benefit}</span>
  </div>
);

const AboutSection = () => (
  <section id="about" className="py-20 px-8 bg-white">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Tentang Sistem SarPras
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Sistem Informasi Sarana dan Prasarana (SarPras) adalah platform digital yang dikembangkan untuk Politeknik Negeri Banyuwangi guna mengoptimalkan pengelolaan aset kampus.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            Dengan fitur-fitur modern dan antarmuka yang user-friendly, sistem ini memungkinkan mahasiswa, dosen, dan staff untuk melakukan peminjaman sarana prasarana dengan mudah dan efisien.
          </p>
          <div className="space-y-4">
            {ABOUT_BENEFITS.map((benefit, index) => (
              <BenefitItem key={index} benefit={benefit} />
            ))}
              </div>
            </div>
        <div className="relative">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-8 h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl mb-4">🏛️</div>
              <div className="text-xl font-semibold text-gray-800">Politeknik Negeri Banyuwangi</div>
              <div className="text-gray-600">Kampus Digital & Modern</div>
            </div>
          </div>
            </div>
          </div>
        </div>
      </section>
);

const FooterSection = ({ section }: { section: typeof FOOTER_SECTIONS[0] }) => {
  if (section.type === "description") {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4 text-white">{section.title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          {section.content}
        </p>
      </div>
    );
  }

  if (section.type === "links" && section.links) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4 text-white">{section.title}</h3>
        <div className="space-y-2">
          {section.links.map((link, index) => (
            <Link 
              key={index}
              href={link.href} 
              className="text-gray-400 hover:text-white text-sm block transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (section.type === "contact" && section.contact) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4 text-white">{section.title}</h3>
        <div className="space-y-2 text-sm text-gray-400">
          {section.contact.map((info, index) => (
            <p key={index}>{info}</p>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

const Footer = () => (
  <footer className="bg-gray-800 text-white py-12 px-8">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {FOOTER_SECTIONS.map((section, index) => (
          <FooterSection key={index} section={section} />
        ))}
      </div>
      <div className="border-t border-gray-700 pt-8 text-center">
        <p className="text-gray-400 text-sm">
          © 2024 Sistem Informasi Sarana & Prasarana. Developed with ❤️ for better campus management
        </p>
      </div>
        </div>
      </footer>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <ProcessSection />
      <AboutSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
