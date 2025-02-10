
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Moon, Sun } from "lucide-react";

// Schema Validation using Zod
const verificationSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  verifyCode: z.string().min(6, { message: "Verification code must be at least 6 characters" }),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

export default function Verification() {
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    typeof window !== "undefined" ? localStorage.getItem("darkMode") === "true" : false
  );
  const router = useRouter();

  // React Hook Form with Zod Resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
  });

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("darkMode", newMode.toString());
      document.body.classList.toggle("dark", newMode);
      return newMode;
    });
  };

  // Apply Dark Mode on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.classList.toggle("dark", isDarkMode);
    }
  }, [isDarkMode]);

  // Form Submission
  const onSubmit = async (data: VerificationFormData) => {
    try {
      setLoading(true);
      const response = await axios.post("/api/verify", data);

      if (response.data.success) {
        setMessage("User verified successfully!");
        setIsSuccess(true);

        // Redirect to login after success
        setTimeout(() => router.push("/sign-in"), 1500);
      } else {
        setMessage(response.data.message || "Verification failed.");
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage("An error occurred during verification.");
      console.error("Verification Error:", error.response?.data || error.message);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex justify-center items-center min-h-screen transition-all duration-300 ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <Card className={`w-full max-w-md p-6 rounded-lg shadow-md transition-all duration-300 ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>

        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleDarkMode} 
          className={`absolute top-4 right-4 p-2 rounded-full transition ${
            isDarkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-black"
          }`}
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <CardHeader className="text-center text-xl font-semibold">
          Verify Your Email
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Email Input */}
            <div>
              <label className="text-sm font-medium">Email Address:</label>
              <Input 
                type="email" 
                {...register("email")} 
                className="bg-transparent border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-300"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            {/* Verification Code Input */}
            <div>
              <label className="text-sm font-medium">Verification Code:</label>
              <Input 
                type="text" 
                {...register("verifyCode")} 
                className="bg-transparent border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-300"
              />
              {errors.verifyCode && <p className="text-red-500 text-sm">{errors.verifyCode.message}</p>}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition" disabled={loading}>
              {loading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          {/* Success/Error Message */}
          {message && (
            <Alert className={`mt-4 ${isSuccess ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
