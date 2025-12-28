"use client";

import useAuth from "../../../utils/useAuth";
import { useEffect } from "react";

export default function Logout() {
  const { signOut } = useAuth();

  useEffect(() => {
    handleSignOut();
  }, []);

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/account/signin",
      redirect: true,
    });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white font-['Instrument_Sans']">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
      `}</style>

      <div className="text-center">
        <div className="w-16 h-16 rounded-full border-4 border-[#2962FF] mx-auto mb-4 animate-spin"></div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Signing out...
        </h1>
        <p className="text-gray-500">Please wait</p>
      </div>
    </div>
  );
}
