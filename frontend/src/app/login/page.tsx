"use client";

import { useState } from "react";

const ErrorMessage = ({ message }: { message: string }) => (
  <div
    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative"
    role="alert"
  >
    <span className="block sm:inline">{message}</span>
  </div>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      const response = await fetch(`${apiBaseUrl}api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid credentials. Please try again."
        );
      }

      console.log("Login successful!", data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-brand-cream font-sans">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-brown-dark">
            Welcome to Baker's Pantry!
          </h1>
          <p className="mt-2 text-gray-500">Sign in to access your account</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          {error && <ErrorMessage message={error} />}

          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="email" className="sr-only">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-transparent"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-transparent"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-black bg-brand-brown hover:bg-brand-brown-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-brown transition-colors disabled:bg-brand-brown/50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Not a member yet?{" "}
          <a
            href="/sign-up"
            className="font-medium text-brand-brown hover:text-brand-brown-light"
          >
            Sign up here
          </a>
        </p>
      </div>
    </main>
  );
};

export default Login;
