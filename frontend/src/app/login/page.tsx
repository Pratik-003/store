'use client'; 

import { useState } from 'react';

// A simple component for the error message
const ErrorMessage = ({ message }: { message: string }) => (
  <div
    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative"
    role="alert"
  >
    <span className="block sm:inline">{message}</span>
  </div>
);

const Login = () => {
  // State for email, password, and any error messages from the API
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle form submission
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent the default form refresh
    setIsLoading(true);
    setError(''); // Clear previous errors

    try {
      const apiBaseUrl = process.env.API_BASE_URL;
      const response = await fetch(`http://127.0.0.1:8000/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials. Please try again.');
      }

      // --- LOGIN SUCCESSFUL ---
      console.log('Login successful!', data);
      // TODO: Save the token and redirect.
      // Example: localStorage.setItem('authToken', data.token);
      //         window.location.href = '/dashboard';

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-brand-cream font-sans">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-brown-dark">
            Welcome to Baker's Pantry!
          </h1>
          <p className="mt-2 text-gray-500">Sign in to access your account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          {/* Display error message if it exists */}
          {error && <ErrorMessage message={error} />}

          <div className="space-y-4 rounded-md">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="sr-only">Email Address</label>
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
            {/* Password Input */}
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
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

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-black bg-brand-brown hover:bg-brand-brown-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-brown transition-colors disabled:bg-brand-brown/50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Footer Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Not a member yet?{' '}
          <a href="/signup" className="font-medium text-brand-brown hover:text-brand-brown-light">
            Sign up here
          </a>
        </p>
      </div>
    </main>
  );
};

export default Login;