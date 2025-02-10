
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import useDebounce from "@/hooks/useDebounce"; // Ensure this hook exists

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignIn() {
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  // Load Dark Mode Preference
  useEffect(() => {
    setIsDarkMode(localStorage.getItem("darkMode") === "true");
  }, []);

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      localStorage.setItem("darkMode", !prev ? "true" : "false");
      return !prev;
    });
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const email = watch("email");
  const password = watch("password");
  const debouncedPassword = useDebounce(password, 500);

  // **Live Password Checking**
  useEffect(() => {
    if (!debouncedPassword || !email) {
      setPasswordMessage(null);
      return;
    }

    const checkPassword = async () => {
      try {
        const { data } = await axios.post(`/api/check-password`, {
          email,
          password: debouncedPassword,
        });
        setPasswordMessage(data.success ? "✅ Password is correct" : "❌ Incorrect password");
      } catch (error) {
        const axiosError = error as AxiosError;
        setPasswordMessage(axiosError.response?.data?.message ?? "Error checking password");
      }
    };

    checkPassword();
  }, [debouncedPassword, email]);

  // **Final Form Submission**
  const onSubmit = async (data: SignInFormData) => {
    if (passwordMessage?.includes("❌")) return; // Prevent login on incorrect password

    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (res?.error) {
      setPasswordMessage("❌ Incorrect email or password");
    } else {
      router.push("/");
    }
  };

  const handleOAuthSignIn = (provider: "google" | "github") => {
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <div className={`flex justify-center items-center min-h-screen px-4 transition-all duration-300 ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      {/* Dark Mode Toggle */}
      <button onClick={toggleDarkMode} className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300">
        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      {/* Sign-In Card */}
      <Card className={`w-full max-w-md p-6 shadow-lg rounded-lg transition-all duration-300 ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
        <CardHeader className="text-center text-2xl font-semibold">Welcome Back!</CardHeader>
        <CardContent>
          {passwordMessage && (
            <Alert className={`mb-4 p-3 rounded-lg ${passwordMessage.includes("❌") ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>
              <AlertDescription>{passwordMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="text-sm font-medium">Email Address:</label>
              <Input type="email" {...register("email")} className="mt-1 block w-full p-2 rounded-md border" />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Password:</label>
              <Input type="password" {...register("password")} className="mt-1 block w-full p-2 rounded-md border" />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Log In"}
            </Button>
          </form>

          {/* Separator */}
          <div className="flex items-center justify-between my-6">
            <Separator />
            <span className="text-sm">OR</span>
          </div>

          {/* OAuth Sign-In Options */}
          <div className="flex flex-col gap-4">
            <Button onClick={() => handleOAuthSignIn("google")} className="w-full bg-gray-200 hover:bg-gray-300 text-black flex items-center gap-2 p-2 rounded-md">
              <FcGoogle size={24} /> Sign in with Google
            </Button>
            <Button onClick={() => handleOAuthSignIn("github")} className="w-full bg-gray-700 hover:bg-gray-800 text-white flex items-center gap-2 p-2 rounded-md">
              <FaGithub size={24} /> Sign in with GitHub
            </Button>
          </div>

          {/* Signup Link */}
          <p className="text-sm text-center mt-6">
            Don&apos;t have an account? <Link href="/sign-up" className="text-blue-500 font-medium hover:underline">Sign up</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
