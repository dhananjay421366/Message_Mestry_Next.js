'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const userInfo = useMemo(() => session?.user, [session]);

    const handleLogin = () => {
        setLoading(true);
        router.push('/sign-in');
    };

    return (
        <nav className="p-4 md:p-6 shadow-md bg-gray-900 text-white">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                <Link href="/" className="text-xl font-bold mb-4 md:mb-0">
                    True Feedback
                </Link>
                {status === 'loading' ? (
                    <Skeleton className="w-24 h-10 rounded-md bg-gray-700" />
                ) : session ? (
                    <div className="flex items-center mr-4 space-x-4">
                        <span onClick={()=> router.push('/dashboard')} className="text-sm">{userInfo?.username || userInfo?.email}</span>
                        <Button 
                            onClick={() => signOut()} 
                            className="w-full md:w-auto bg-slate-100 text-black" 
                            variant="outline"
                        >
                            Logout
                        </Button>
                    </div>
                ) : (
                    <>
                        {loading ? (
                            <Skeleton className="w-24 h-10 rounded-md bg-gray-700" />
                        ) : (
                            <Button
                                onClick={handleLogin}
                                className="w-full md:w-auto bg-slate-100 mr-26 text-black"
                                variant="outline"
                            >
                                Login
                            </Button>
                        )}
                    </>
                )}
            </div>
        </nav>
    );
}
