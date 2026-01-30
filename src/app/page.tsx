import { SignedIn, SignedOut, SignUpButton, SignOutButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <SignedOut>
        <SignUpButton>
          <button>
            signUp
          </button>
        </SignUpButton>
      
      </SignedOut>

      <UserButton></UserButton>
      <SignedIn>
        <SignOutButton>
          <button>
            Sign out
          </button>
        </SignOutButton>
      </SignedIn>
    </div>
  );
}
