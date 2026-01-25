"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";

import NavBar from "@/components/NavBar";

const ResetPasswordForm = () => {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [token, setToken] = useState<string | undefined>("");
  const [actor, setActor] = useState<string | undefined>("");
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    // Ensure the token and actor are coming from params
    if (
      params &&
      typeof params.token === "string" &&
      typeof params.actor === "string"
    ) {
      setToken(params.token);
      setActor(params.actor);
    }
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !actor) {
      return toast.error("Invalid reset link. Missing token or actor.");
    }

    if (password !== passwordConfirm) {
      return toast.error("Passwords don't match");
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/reset-password`,
        {
          // mode: "no-cors",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
            password_confirmation: passwordConfirm,
            actor,
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        return toast.error(data.message || "Password reset failed");
      }

      toast.success("Password reset successfully!");
      router.push("/");
    } catch (error) {
      toast.error("Failed to reset password. Please try again later.");
      console.error(error);
    }
  };

  return (
    <>
      <NavBar />
      <div className="flex flex-col mb-6 items-center rounded-lg border border-newColor p-4 font-default max-w-lg mx-auto md:max-w-2xl mt-16">
        <h2 className="text-3xl font-medium text-second my-6 py-4 mb-4">
          Update your password
        </h2>
        <form className="flex flex-col space-y-6 my-4" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "400px", margin: "auto", marginBottom: "30px" }}
            className="px-4 py-2 rounded border border-gray"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            style={{ width: "400px", margin: "auto", marginBottom: "30px" }}
            className="px-4 py-2 rounded border border-gray"
          />
          <button
            type="submit"
            className="py-2 px-8 m-12 rounded-full font-medium text-base text-white bg-primary"
          >
            Submit Password
          </button>
        </form>
      </div>
    </>
  );
};

export default ResetPasswordForm;
