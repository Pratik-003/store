// src/app/otp-verify/page.tsx

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// You can reuse the ErrorMessage component from the sign-up page
const ErrorMessage = ({ message }: { message: string }) => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative" role="alert">
        <span className="block sm:inline">{message}</span>
    </div>
);

const OTPVerifyComponent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userEmail = searchParams.get("email");

    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (!userEmail) {
            // If no email is in the URL, redirect to sign-up
            setError("No email provided. Please sign up first.");
            setTimeout(() => router.push("/signup"), 3000);
        }
    }, [userEmail, router]);

    const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        if (!userEmail) {
            setError("Could not find user email. Please try signing up again.");
            setIsLoading(false);
            return;
        }

        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
            const response = await fetch(`${apiBaseUrl}/api/auth/verify-otp/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // Sending the email and the entered OTP
                body: JSON.stringify({ email: userEmail, otp }),
            });

            const data = await response.json();

            if (!response.ok || !data.is_verified) {
                throw new Error(data.message || "Invalid or expired OTP. Please try again.");
            }
            
            setSuccessMessage("Email verified successfully! Redirecting to login...");
            console.log("OTP Verification successful!", data);

            // Redirect to the login page after a short delay
            setTimeout(() => {
                router.push("/"); // Assuming "/" is your login page
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex items-center justify-center min-h-screen bg-brand-cream font-sans">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-brand-brown-dark">Verify Your Email</h1>
                    <p className="mt-2 text-gray-500">
                        We've sent a verification code to <br />
                        <strong className="text-brand-brown">{userEmail || "your email"}</strong>
                    </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="mt-8 space-y-6">
                    {error && <ErrorMessage message={error} />}
                    {successMessage && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative" role="alert">
                            <span className="block sm:inline">{successMessage}</span>
                        </div>
                    )}

                    <div className="space-y-4 rounded-md">
                        <div>
                            <label htmlFor="otp" className="sr-only">Verification Code</label>
                            <input
                                id="otp"
                                name="otp"
                                type="text"
                                inputMode="numeric"
                                required
                                className="w-full px-4 py-3 text-center text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-transparent tracking-[0.5em]"
                                placeholder="------"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-black bg-brand-brown hover:bg-brand-brown-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-brown transition-colors disabled:bg-brand-brown/50 disabled:cursor-not-allowed"
                            disabled={isLoading || !userEmail}
                        >
                            {isLoading ? "Verifying..." : "Verify"}
                        </button>
                    </div>
                </form>
                
                <p className="mt-6 text-center text-sm text-gray-600">
                    Didn't receive a code?{" "}
                    <Link
                        href="/signup" // Or a resend-otp link
                        className="font-medium text-brand-brown hover:text-brand-brown-light"
                    >
                        Resend or sign up again
                    </Link>
                </p>
            </div>
        </main>
    );
};

// Use Suspense to handle the initial render while searchParams are read
const OTPVerifyPage = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <OTPVerifyComponent />
    </Suspense>
);


export default OTPVerifyPage;