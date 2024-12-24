"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Circles } from "react-loader-spinner";
import Cookies from "js-cookie";

function GoogleCallback() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google/callback?code=${code}`,
      {
        headers: new Headers({ accept: "application/json" }),
      },
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        sessionStorage.setItem("user", JSON.stringify(responseData.user));
        const userRole = sessionStorage.getItem("userRole");

        const { access_token } = responseData;

        Cookies.set("authToken", access_token, { expires: 7 });

        console.log("Access Token OAuth : ", access_token);
        

        if (userRole === "candidate") {
          router.push("/dashboard/candidat");
        } else if (userRole === "entreprise") {
          router.push("/dashboard/entreprise");
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error during authentication:", error);
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-220px)]">
        <Circles
          height={80}
          width={80}
          color="#4fa94d"
          ariaLabel="circles-loading"
          visible={true}
        />
      </div>
    );
  }

  return null;
}

export default GoogleCallback;
