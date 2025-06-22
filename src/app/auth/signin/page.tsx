import CardLogin from "@/components/auth/CardLogin";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        <CardLogin />
      </div>
    </div>
  );
}

