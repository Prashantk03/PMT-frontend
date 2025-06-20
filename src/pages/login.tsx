import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("access_token", data.access_token);
        alert("Login successful");
        navigate("/dashboard");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-xl overflow-hidden w-full max-w-4xl mx-auto flex flex-col md:flex-row">
        {/* Left side - Image */}
        <div className="w-full md:w-1/2 h-48 md:h-auto">
          <img
            src=""
            alt="Job search illustration"
            className="object-cover w-full h-full"
          />
        </div>

        {/* Right side - Form */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-black mb-6 text-center md:text-left">
            Login to continue
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-800 mb-1"
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-800 mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="text-right mt-1">
                <a
                  href="#"
                  className="text-sm text-violet-500 hover:underline hover:text-violet-700"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-violet-500 text-white font-semibold py-2 rounded-lg hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-400 shadow-md"
              >
                Login
              </button>
            </div>
          </form>

          <p className="text-center text-gray-600 mt-4">
            Not a member?{" "}
            <Link
              to="/register"
              className="text-violet-500 hover:underline hover:text-violet-800"
            >
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

