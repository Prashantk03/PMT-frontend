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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden w-auto max-w-fit mx-auto flex flex-col md:flex-row shadow-violet-500">

        <div className="w-full md:w-1/2 p-8">
          <div className="text-2xl font-bold text-black mb-6 text-center md:text-left">
            Login to continue
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-900 text-sm font-bold mb-2"
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 hover:drop-shadow-lg"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-gray-900 text-sm font-bold mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 hover:drop-shadow-lg"
              />
              <a
                href="#"
                className="text-sm text-violet-500 hover:underline hover:text-violet-800 mt-2 inline-block"
              >
                Forgot password?
              </a>
            </div>

            <div className="mb-6">
              <button
                type="submit"
                className="w-full bg-violet-500 text-white py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-violet-600 hover:drop-shadow-lg shadow-violet-950"
              >
                Login
              </button>
            </div>
          </form>

          <p className="text-center text-gray-600">
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