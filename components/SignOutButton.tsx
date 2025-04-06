"use client";

import { signOut } from "@/lib/actions/auth.action";

const SignOutButton = () => {
  return (
    <button
      onClick={signOut}
      className="bg-white text-black text- px-4 py-2 rounded-lg hover:bg-red-600 transition"
    >
      <b>Sign Out</b>
    </button>
  );
};

export default SignOutButton;