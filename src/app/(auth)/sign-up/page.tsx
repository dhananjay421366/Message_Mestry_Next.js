
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema } from '@/schemas/signUpSchema';
import useDebounce from "@/hooks/useDebounce";
import { Button } from '@/components/ui/button';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import * as z from 'zod';

export default function SignUpForm() {
    const [username, setUsername] = useState('');
    const [usernameMessage, setUsernameMessage] = useState('');
    const [email, setEmail] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(() =>
        typeof window !== 'undefined' ? localStorage.getItem('darkMode') === 'true' : false
    );

    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const debouncedUsername = useDebounce(username, 200);
    const debouncedEmail = useDebounce(email, 200);

    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
        },
    });

    // Toggle Dark Mode
    const toggleDarkMode = () => {
        setIsDarkMode((prev) => {
            localStorage.setItem('darkMode', !prev ? 'true' : 'false');
            return !prev;
        });
    };

    // Check if the username is unique
    useEffect(() => {
        const checkUsernameUnique = async () => {
            if (!debouncedUsername.trim()) return;

            setIsCheckingUsername(true);
            setUsernameMessage('');

            try {
                const { data } = await axios.get(`/api/check-username-unique?username=${debouncedUsername}`);
                console.log(data);
                setUsernameMessage(data.message);
            } catch (error) {
                const axiosError = error as AxiosError;
                console.log(axiosError);
                setUsernameMessage(axiosError.response?.data?.message);
            } finally {
                setIsCheckingUsername(false);
            }
        };

        checkUsernameUnique();
    }, [debouncedUsername]);

    // Check if the email is unique
    useEffect(() => {
        const checkEmailUnique = async () => {
            if (!debouncedEmail.trim()) return;

            setIsCheckingEmail(true);
            setEmailMessage('');

            try {
                const { data } = await axios.get(`/api/check-email-unique?email=${debouncedEmail}`);
                setEmailMessage(data.message);
            } catch (error) {
                const axiosError = error as AxiosError;
                setEmailMessage(axiosError.response?.data?.message ?? 'Error checking email');
            } finally {
                setIsCheckingEmail(false);
            }
        };

        checkEmailUnique();
    }, [debouncedEmail]);

    const usernameMessageColor = useMemo(() => {
        return usernameMessage.includes("available") ? "text-green-500" : "text-red-500";
    }, [usernameMessage]);

    const emailMessageColor = useMemo(() => {
        return emailMessage.includes("available") ? "text-green-500" : "text-red-500";
    }, [emailMessage]);

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true);
        try {
            const response = await axios.post('/api/signup', data);

            toast({
                title: 'Success',
                description: response.data.message,
            });

            setTimeout(() => router.replace('/verifyUser'), 1500);
        } catch (error) {
            console.error('Error during sign-up:', error);

            const axiosError = error as AxiosError;
            const errorMessage = axiosError.response?.data?.message ?? 'Sign-up failed. Please try again.';

            toast({
                title: 'Sign Up Failed',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`flex justify-center items-center min-h-screen transition-all duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <div className={`relative w-full max-w-md p-8 space-y-8 rounded-lg shadow-md transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>

                {/* Dark Mode Toggle */}
                <button onClick={toggleDarkMode} className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                    {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>

                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Join True Feedback
                    </h1>
                    <p className="mb-4">Sign up to start your anonymous adventure</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Username Field */}
                        <FormField
                            name="username"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <Input
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            setUsername(e.target.value);
                                        }}
                                        className="bg-transparent border border-gray-300 p-2 rounded-md"
                                    />
                                    {isCheckingUsername ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        usernameMessage && (
                                            <p className={`text-sm ${usernameMessageColor}`}>
                                                {usernameMessage}
                                            </p>
                                        )
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Email Field */}
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <Input
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            setEmail(e.target.value);
                                        }}
                                        className="bg-transparent border border-gray-300 p-2 rounded-md"
                                    />
                                    {isCheckingEmail ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        emailMessage && (
                                            <p className={`text-sm ${emailMessageColor}`}>
                                                {emailMessage}
                                            </p>
                                        )
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Password Field */}
                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <Input type="password" {...field} className="bg-transparent border border-gray-300 p-2 rounded-md" />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Submit Button */}
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign Up'}
                        </Button>
                    </form>
                </Form>

                <div className="text-center mt-4">
                    <p>Already a member? <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">Sign in</Link></p>
                </div>
            </div>
        </div>
    );
}
