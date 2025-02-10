"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // ✅ Import useToast

// ✅ Define schema using Zod for validation
const messageSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  content: z.string().min(1, "Message cannot be empty"),
});

// ✅ Define TypeScript type based on schema
type MessageFormData = z.infer<typeof messageSchema>;

export default function SendMessage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast(); // ✅ Initialize toast
  const router = useRouter();

  // ✅ Use React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset, // ✅ Add reset function
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
  });

  const onSubmit = async (data: MessageFormData) => {
    setError(null);
    setLoading(true);

    try {
      const res = await axios.post<{ success: boolean; message: string }>(
        "/api/send-message",
        data
      );

      if (res.data.success) {
        toast({
          title: "Message Sent ✅",
          description: "Your message has been sent successfully!",
          variant: "default", // Can be 'destructive' for errors
        });
        reset(); // ✅ Reset form inputs after successful submission

        // ✅ Delay success message by 2 seconds
        setTimeout(() => {

          // ✅ Show another toast with navigation instruction
          toast({
            title: "Check Your Messages 📩",
            description: "Click on your name in the top-right corner to view all your messages.",
            variant: "default",
          });
        }, 4000); // 2-second delay
      } else {
        setError(res.data.message);
      }
    } catch (error: string) {
      setError(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <Card className="w-full max-w-md shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            📩 Send Message
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Error Message */}
          {error && (
            <Alert className="mb-4 border-red-500 bg-red-100 text-red-700 p-3 rounded-lg">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading Skeleton */}
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full mb-3" />
              <Skeleton className="h-10 w-full mb-3" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {/* Username Input */}
              <div>
                <Input
                  type="text"
                  placeholder="Enter username"
                  {...register("username")}
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Message Input */}
              <div>
                <Input
                  type="text"
                  placeholder="Enter your message"
                  {...register("content")}
                  className={errors.content ? "border-red-500" : ""}
                />
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.content.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                  </div>
                ) : (
                  "Send Message"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
