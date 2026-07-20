import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5050"
).replace(/\/$/, "");

function GoogleSignInButton({
  setMessage,
  setMessageType,
}) {
  const navigate = useNavigate();

  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  if (!googleClientId) {
    return null;
  }

  const handleGoogleSuccess = async (
    googleResponse
  ) => {
    try {
      setMessage("");
      setMessageType("");

      const response = await fetch(
        `${API_URL}/api/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            credential:
              googleResponse.credential,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Google login failed."
        );
        setMessageType("error");
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );

      setMessage(
        "Google login successful. Opening your dashboard..."
      );
      setMessageType("success");

      setTimeout(() => {
        navigate("/dashboard");
      }, 600);
    } catch (error) {
      setMessage(
        "Cannot connect to the server. Please try again later."
      );
      setMessageType("error");
    }
  };

  const handleGoogleError = () => {
    setMessage(
      "Google login was cancelled or failed."
    );
    setMessageType("error");
  };

  return (
    <>
      <div className="auth-divider">
        <span>Or continue with Google</span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap={false}
          theme="filled_black"
          size="large"
          shape="rectangular"
          text="continue_with"
          width="320"
        />
      </div>
    </>
  );
}

export default GoogleSignInButton;
