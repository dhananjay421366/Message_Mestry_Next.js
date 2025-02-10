// 'use client';

// import { MessageCard } from '@/components/MessageCard';
// import { Button } from '@/components/ui/button';
// import { Separator } from '@/components/ui/separator';
// import { Switch } from '@/components/ui/switch';
// import { useToast } from '@/hooks/use-toast';
// import { Message } from '@/model/User.model';
// import { AcceptMessageSchema } from '@/schemas/acceptMessageSchema';
// import { ApiResponse } from '@/types/Apiesponse';
// import { zodResolver } from '@hookform/resolvers/zod';
// import axios, { AxiosError } from 'axios';
// import { Loader2, RefreshCcw } from 'lucide-react';
// import { User } from 'next-auth';
// import { useSession } from 'next-auth/react';
// import React, { useCallback, useEffect, useState } from 'react';
// import { useForm } from 'react-hook-form';

// function UserDashboard() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSwitchLoading, setIsSwitchLoading] = useState(false);

//   const { toast } = useToast();
//   const { data: session } = useSession();

//   const form = useForm({
//     resolver: zodResolver(AcceptMessageSchema),
//   });

//   const { register, watch, setValue } = form;
//   const acceptMessages = watch('acceptMessages');

//   const fetchAcceptMessages = useCallback(async () => {
//     if (!session) return;

//     setIsSwitchLoading(true);
//     try {
//       const response = await axios.get<ApiResponse>('/api/accept-messages', {
//         headers: {
//           Authorization: `Bearer ${session?.token || session?.user?.accessToken}`, // ✅ Fix token extraction
//         },
//       });
//       console.log(session?.user?.accessToken)
//       setValue('acceptMessages', response.data.isAcceptingMessages);
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description:
//           (error as AxiosError<ApiResponse>).response?.data.message ??
//           'Failed to fetch message settings',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsSwitchLoading(false);
//     }
//   }, [session, setValue, toast]);

//   const fetchMessages = useCallback(async (refresh: boolean = false) => {
//     if (!session) return;

//     setIsLoading(true);
//     try {
//       const response = await axios.get<ApiResponse>('/api/get-messages', {
//         headers: {
//           Authorization: `Bearer ${session?.token || session?.user?.accessToken}`, // ✅ Fix token extraction
//         },
//       });
//       setMessages(response.data.messages || []);
//       if (refresh) {
//         toast({
//           title: 'Refreshed Messages',
//           description: 'Showing latest messages',
//         });
//       }
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description:
//           (error as AxiosError<ApiResponse>).response?.data.message ??
//           'Failed to fetch messages',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }, [session, toast]);

//   useEffect(() => {
//     if (!session) return;

//     fetchMessages();
//     fetchAcceptMessages();
//   }, [session]);

//   const handleSwitchChange = async (checked: boolean) => {
//     try {
//       await axios.post<ApiResponse>('/api/accept-messages', {
//         acceptMessages: checked,
//       });
//       setValue('acceptMessages', checked);
//       toast({ title: 'Settings updated!', variant: 'default' });
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description:
//           (error as AxiosError<ApiResponse>).response?.data.message ??
//           'Failed to update settings',
//         variant: 'destructive',
//       });
//     }
//   };

//   const handleDeleteMessage = (messageId: string) => {
//     setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
//   };

//   if (!session) return <div className="text-center p-6">🔒 Please log in to access your dashboard.</div>;

//   const { username } = session.user as User;
//   const profileUrl = `${window.location.protocol}//${window.location.host}/u/${username}`;

//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(profileUrl);
//     toast({ title: 'URL Copied!', description: 'Profile URL copied to clipboard.' });
//   };

//   return (
//     <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
//       <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

//       {/* Copy Profile URL */}
//       <div className="mb-4">
//         <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
//         <div className="flex items-center">
//           <input type="text" value={profileUrl} disabled className="input input-bordered w-full p-2 mr-2" />
//           <Button onClick={copyToClipboard}>Copy</Button>
//         </div>
//       </div>

//       {/* Accept Messages Switch */}
//       <div className="mb-4 flex items-center">
//         <Switch
//           {...register('acceptMessages')}
//           checked={acceptMessages}
//           onCheckedChange={handleSwitchChange}
//           disabled={isSwitchLoading}
//         />
//         <span className="ml-2">Accept Messages: {acceptMessages ? 'On' : 'Off'}</span>
//       </div>
//       <Separator />

//       {/* Refresh Button */}
//       <Button className="mt-4" variant="outline" onClick={() => fetchMessages(true)} disabled={isLoading}>
//         {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
//       </Button>

//       {/* Messages List */}
//       <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
//         {messages.length > 0 ? (
//           messages.map((message) => <MessageCard key={message._id} message={message} onMessageDelete={handleDeleteMessage} />)
//         ) : (
//           <p>No messages to display.</p>
//         )}
//       </div>
//     </div>
//   );
// }

// export default UserDashboard;
"use client";

import { MessageCard } from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { AcceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/Apiesponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const { toast } = useToast();
  const { data: session, status } = useSession();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch("acceptMessages");

  useEffect(() => {
    if (status === "loading") return; // Wait for session to load
    if (!session) router.push("/login"); // Redirect if not logged in
  }, [session, status, router]);

  const fetchAcceptMessages = useCallback(async () => {
    if (!session) return;
    setIsSwitchLoading(true);
    try {
      const { data } = await axios.get<ApiResponse>("/api/accept-messages", {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
      });
      setValue("acceptMessages", data.isAcceptingMessages);
    } catch (error) {
      toast({
        title: "Error",
        description: (error as AxiosError<ApiResponse>).response?.data.message ?? "Failed to fetch settings",
        variant: "destructive",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [session, setValue, toast]);

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    if (!session) return;
    setIsLoading(true);
    try {
      const { data } = await axios.get<ApiResponse>("/api/get-messages", {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
      });
      setMessages(data.messages || []);
      if (refresh) toast({ title: "Refreshed Messages", description: "Showing latest messages" });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as AxiosError<ApiResponse>).response?.data.message ?? "Failed to fetch messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [session, toast]);

  useEffect(() => {
    if (!session) return;
    fetchMessages();
    fetchAcceptMessages();
  }, [session]);

  const handleSwitchChange = async (checked: boolean) => {
    try {
      await axios.post<ApiResponse>("/api/accept-messages", { acceptMessages: checked });
      setValue("acceptMessages", checked);
      toast({ title: "Settings updated!" });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as AxiosError<ApiResponse>).response?.data.message ?? "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
  };

  const profileUrl = `${window.location.origin}/u/${session?.user?.username}`;
  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({ title: "URL Copied!", description: "Profile URL copied to clipboard." });
  };

  if (!session) return <div className="text-center p-6">🔒 Redirecting to login...</div>;

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
        <div className="flex items-center">
          <input type="text" value={profileUrl} disabled className="input input-bordered w-full p-2 mr-2" />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4 flex items-center">
        <Switch {...register("acceptMessages")} checked={acceptMessages} onCheckedChange={handleSwitchChange} disabled={isSwitchLoading} />
        <span className="ml-2">Accept Messages: {acceptMessages ? "On" : "Off"}</span>
      </div>
      <Separator />

      <Button className="mt-4" variant="outline" onClick={() => fetchMessages(true)} disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
      </Button>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? messages.map((message) => <MessageCard key={message._id} message={message} onMessageDelete={handleDeleteMessage} />) : <p>No messages to display.</p>}
      </div>
    </div>
  );
}
