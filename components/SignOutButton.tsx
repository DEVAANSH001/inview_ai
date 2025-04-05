"use client";

import { signOut } from "@/lib/actions/auth.action";

const SignOutButton = () => {
  return (
    <button
      onClick={signOut}
      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
    >
      Sign Out
    </button>
  );
};

export default SignOutButton;