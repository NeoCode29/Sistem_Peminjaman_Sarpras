import { ReactNode } from "react";

interface CardLoginProps {
  children: ReactNode;
}

const CardLogin = ({ children }: CardLoginProps) => {
  return (
    <div className="bg-white border rounded-md shadow-md px-4 py-8 w-[300px] text-center">
      {children}
    </div>
  );
};

export default CardLogin;
