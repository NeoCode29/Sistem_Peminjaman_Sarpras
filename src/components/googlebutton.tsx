'use client';

const ButtonGoogleLogin = () => {

  return (
    <button
      className="flex items-center justify-center gap-2 border rounded px-4 py-2 mt-4 bg-blue-600 hover:bg-blue-400 transition w-full"
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google icon"
        className="w-5 h-5"
      />
      <span className="text-white">Melanjutkan dengan Google</span>
    </button>
  );
};

export default ButtonGoogleLogin;

