import { useEffect } from "react";

const LoginPage = () => {
  useEffect(() => {
    const authenticateWithGoogle = async () => {
      try {
        // Send a request to your Laravel backend to initiate Google OAuth
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/auth/google",
        );

        // Redirect the user to the Google login page
        const responseData = await response.json();
        window.location.href = responseData.redirect;
      } catch (error) {
        console.error("Error authenticating with Google:", error);
      }
    };

    authenticateWithGoogle();
  }, []);

  return (
    <div>
      <h1>Login Page</h1>
      <div>Redirecting to Google...</div>;
    </div>
  );
};

export default LoginPage;
