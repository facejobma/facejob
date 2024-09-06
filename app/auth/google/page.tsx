"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation"; // For redirection

function GoogleCallback() {
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    // Fetch the user data using the Google OAuth callback
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google/callback?code=${code}`, {
      headers: new Headers({ accept: "application/json" }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        // Redirect the user to the appropriate dashboard based on their role
        const userRole = sessionStorage.getItem("userRole");
        if (userRole === "candidat") {
          router.push("/dashboard/candidat");
        } else if (userRole === "entreprise") {
          router.push("/dashboard/entreprise");
        }
      })
      .catch((error) => {
        console.error("Error during authentication:", error);
      });
  }, [router]);

  // Do not render any content, as the redirection happens immediately
  return null;
}

export default GoogleCallback;
