// app/dashboard/layout.tsx
import type { Metadata } from 'next';
import Sidebar from './components/Sidebar';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = {
    title: 'FinVault — AI Banking',
    description: 'AI-powered conversational fintech dashboard',
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const user = await getCurrentUser();

    const initials = user?.name
        ? user.name
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
        : 'FV';

    return (
        <div className="flex h-screen overflow-hidden bg-[#f6faf8] font-sans antialiased">
            {/* Sidebar */}
            <Sidebar />

            {/* Right side */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Top bar */}
                <header className="flex-shrink-0 sticky top-0 z-30 bg-[#f6faf8]/80 backdrop-blur-md border-b border-[#dde8e3] px-6 h-[52px] flex items-center justify-between">
                    {/* Left — greeting */}
                    <div className="flex items-center gap-2">
                        <p className="text-[13px] text-[#5a7568]">
                            Welcome back,{' '}
                            <span className="font-semibold text-[#0a3d2e]">
                                {user?.name ?? 'there'}
                            </span>
                        </p>
                    </div>

                    {/* Right — user info */}
                    <div className="flex items-center gap-3">
              
                

                        {/* Online dot + avatar */}
                        <div className="relative">
                            <div className="w-[32px] h-[32px] rounded-full bg-[#1d9e75] flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-[#1d9e75]/20">
                                {initials}
                            </div>
                            <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#1d9e75] rounded-full ring-2 ring-[#f6faf8]" />
                        </div>
                    </div>
                </header>

                {/* Scrollable page content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-[960px] mx-auto p-6">{children}</div>
                </main>
            </div>
        </div>
    );
}
