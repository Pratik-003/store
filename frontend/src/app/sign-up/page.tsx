// src/app/signup/page.tsx (or wherever your sign-up page is)

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // 1. Import useRouter

// Reusable Error Message Component (remains the same)
const ErrorMessage = ({ message }: { message: string }) => (
  <div
    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative"
    role="alert"
  >
    <span className="block sm:inline">{message}</span>
  </div>
);

// The main Sign-up component for the page
const SignUp = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const [successMessage, setSuccessMessage] = useState(""); // 2. No longer needed here

  const router = useRouter(); // 3. Get the router instance

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    // setSuccessMessage(""); // No longer needed

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

      const response = await fetch(`${apiBaseUrl}/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: fullName, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Use the error message from the API, or a default one
        throw new Error(
          data.message || "Failed to create account. Please try again."
        );
      }

      // 4. On successful sign-up, redirect to the OTP verification page
      console.log(
        "Registration successful, redirecting to OTP verification.",
        data
      );
      router.push(`/otp-verify?email=${encodeURIComponent(email)}`);
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
            Create Your Account
          </h1>
          <p className="mt-2 text-gray-500">Join Baker's Pantry today!</p>
        </div>

        <form onSubmit={handleSignUp} className="mt-8 space-y-6">
          {error && <ErrorMessage message={error} />}

          {/* The success message div is removed from here */}

          {/* ... all your input fields (fullName, email, password, etc.) remain unchanged ... */}
          {/* The JSX for the form inputs is exactly the same as you provided */}

          <div className="space-y-4 rounded-md">
                 {" "}
            <div>
                    {" "}
              <label htmlFor="fullName" className="sr-only">
                        Full Name       {" "}
              </label>
                    {" "}
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-transparent"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
                   {" "}
            </div>
                 {" "}
            <div>
                    {" "}
              <label htmlFor="email" className="sr-only">
                        Email Address       {" "}
              </label>
                    {" "}
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
                   {" "}
            </div>
                 {" "}
            <div>
                    {" "}
              <label htmlFor="password" className="sr-only">
                        Password       {" "}
              </label>
                    {" "}
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-transparent"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
                   {" "}
            </div>
                 {" "}
            <div>
                    {" "}
              <label htmlFor="confirm-password" className="sr-only">
                        Confirm Password       {" "}
              </label>
                    {" "}
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-transparent"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
                   {" "}
            </div>
                {" "}
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-black bg-brand-brown hover:bg-brand-brown-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-brown transition-colors disabled:bg-brand-brown/50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/" // Assuming your login page is the root
            className="font-medium text-brand-brown hover:text-brand-brown-light"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </main>
  );
};

export default SignUp;
