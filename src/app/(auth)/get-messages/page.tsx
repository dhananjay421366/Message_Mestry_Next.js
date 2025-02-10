
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface Message {
  _id: string;
  content: string;
  createdAt: string;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    if (status === "loading") return; // ✅ Ensure session is ready

    if (!session?.user) {
      setError("❌ User not authenticated.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await axios.get("/api/get-messages", {
        headers: {
          Authorization: `Bearer ${session?.token || session?.user?.accessToken}`, // ✅ Fix token extraction
        },
      });

      setMessages(res.data.messages || []);
    } catch (err) {
      setError("⚠️ Failed to fetch messages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [session, status]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <Card className="w-full max-w-2xl shadow-lg rounded-lg">
        <CardHeader>
          <h2 className="text-center text-2xl font-semibold">📩 Your Messages</h2>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 bg-red-500 text-white p-3 rounded-lg">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            variant="outline"
            className="flex items-center gap-2 mb-4"
            onClick={fetchMessages}
            disabled={loading}
          >
            <RefreshCw size={16} /> Refresh
          </Button>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full rounded-md" />
              <Skeleton className="h-8 w-4/5 rounded-md" />
              <Skeleton className="h-8 w-3/4 rounded-md" />
            </div>
          ) : (
            <ul className="space-y-3">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <li key={msg._id} className="p-4 bg-white border rounded-md shadow-sm">
                    <p className="font-medium">{msg.content}</p>
                    <p className="text-gray-500 text-sm">{new Date(msg.createdAt).toLocaleString()}</p>
                  </li>
                ))
              ) : (
                <p className="text-gray-500 text-center">📭 No messages found.</p>
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
