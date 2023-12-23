import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";

type ForgetPasswordFormProps = {
  onSubmit: (formData: any) => void;
};

const ResetPasswordForm = () => {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [token, setToken] = useState("");
  const router = useRouter();

  useEffect(() => {
    const { token } = router.query;

    if (token) {
      setToken(Array.isArray(token) ? token[0] : token);
      console.log("Token from query:", token);
    }
  }, [router.query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      return toast.error("Passwords doesn't match");
      // return;
    }

    try {
      // console.log("test token v2", token);

      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + `/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
            password_confirmation: passwordConfirm,
          }),
        }
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
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            style={{ width: "400px", margin: "auto", marginBottom: "30px" }}
            className="px-4 py-2 rounded border border-gray"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={passwordConfirm}
            onChange={(e) => {
              setPasswordConfirm(e.target.value);
            }}
            style={{ width: "400px", margin: "auto", marginBottom: "30px" }}
            className="px-4 py-2 rounded border border-gray"
          />
          <button
            type="submit"
            className="py-2 px-8 m-12 rounded-full font-medium text-base text-white bg-primary"
          >
            Submit Password
          </button>
          {/* </div> */}
        </form>
      </div>
    </>
  );
};

export default ResetPasswordForm;
