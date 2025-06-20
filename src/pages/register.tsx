import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registration successful!");
        navigate("/login");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden w-auto max-w-fit mx-auto flex flex-col md:flex-row shadow-violet-500">
        <div className="w-full md:w-1/2 h-48 md:h-auto">
          <img
            src="https://static.vecteezy.com/system/resources/previews/000/174/193/non_2x/online-job-searching-vector.jpg"
            alt="Register illustration"
            className="object-cover w-full h-full"
          />
        </div>

        <div className="w-full md:w-1/2 p-8">
          <div className="text-2xl font-bold text-black mb-6 text-center md:text-left">
            Register to get started
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
            </div>

            <div className="mb-6">
              <button
                type="submit"
                className="w-full bg-violet-500 text-white py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-violet-600 hover:drop-shadow-lg shadow-violet-950"
              >
                Register
              </button>
            </div>
          </form>

          <p className="text-center text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-violet-500 hover:underline hover:text-violet-800"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

