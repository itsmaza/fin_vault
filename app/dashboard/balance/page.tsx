// app/dashboard/balance/page.tsx  (Overview — server component)
import { getBalanceOverview } from '@/actions/balance.actions';
import { getCurrentUser } from '@/lib/auth';
import { formatDateTime } from '@/utils';
import {
    ArrowDownLeft,
    ArrowUpRight,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Building2,
} from 'lucide-react';
import Datetime from './Components/Datetime';

function formatUSD(amount: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}



function getTxLabel(tx: any, userId: string) {
    if (tx.type === 'DEPOSIT') return { label: 'Card Deposit', isCredit: true };
    if (tx.type === 'WITHDRAWAL') return { label: 'Bank Withdrawal', isCredit: false };
    if (tx.type === 'PAYMENT') {
        return String(tx.senderId) === userId
            ? { label: 'FinVault Pay (sent)', isCredit: false }
            : { label: 'FinVault Pay (received)', isCredit: true };
    }
    return String(tx.receiverId) === userId
        ? { label: 'Money Received', isCredit: true }
        : { label: 'Money Sent', isCredit: false };
}

function getTxIcon(tx: any, userId: string) {
    if (tx.type === 'DEPOSIT')
        return { Icon: ArrowDownLeft, bg: 'bg-[#E1F5EE]', color: 'text-[#085041]' };
    if (tx.type === 'WITHDRAWAL')
        return { Icon: Building2, bg: 'bg-[#FAEEDA]', color: 'text-[#633806]' };
    if (tx.type === 'PAYMENT')
        return {
            Icon: CreditCard,
            bg: String(tx.senderId) === userId ? 'bg-[#FAEEDA]' : 'bg-[#E1F5EE]',
            color: String(tx.senderId) === userId ? 'text-[#633806]' : 'text-[#085041]',
        };
    return String(tx.receiverId) === userId
        ? { Icon: ArrowDownLeft, bg: 'bg-[#E1F5EE]', color: 'text-[#085041]' }
        : { Icon: ArrowUpRight, bg: 'bg-[#FAEEDA]', color: 'text-[#633806]' };
}

export default async function BalanceOverviewPage() {
    const [result, user] = await Promise.all([getBalanceOverview(), getCurrentUser()]);

    const data = result.data;
    const userId = user?._id?.toString() ?? '';

    return (
        <div className="max-w-[900px]">
            <div className="mb-6">
                <h1
                    className="text-[22px] font-bold text-[#0a3d2e] tracking-tight"
                    style={{ fontFamily: "'Fraunces', serif" }}
                >
                    Balance Overview
                </h1>
                <p className="text-[13px] text-[#5a7568] mt-0.5">Your financial summary</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#0a3d2e] rounded-[16px] p-5">
                    <p className="text-[11px] font-semibold text-[#6fa890] tracking-widest mb-2">
                        TOTAL BALANCE
                    </p>
                    <p
                        className="text-[28px] font-bold text-white"
                        style={{ fontFamily: "'Fraunces', serif" }}
                    >
                        {formatUSD(data?.balance ?? 0)}
                    </p>
                    <p className="text-[11px] text-[#6fa890] mt-1">Available funds</p>
                </div>

                <div className="bg-white border border-[#dde8e3] rounded-[16px] p-5">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[11px] font-semibold text-[#8a9e96] tracking-widest">
                            TOTAL INCOME
                        </p>
                        <div className="w-7 h-7 bg-[#E1F5EE] rounded-full flex items-center justify-center">
                            <TrendingUp size={13} className="text-[#085041]" />
                        </div>
                    </div>
                    <p
                        className="text-[22px] font-bold text-[#0a3d2e]"
                        style={{ fontFamily: "'Fraunces', serif" }}
                    >
                        {formatUSD(data?.totalIncome ?? 0)}
                    </p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041] mt-1 inline-block">
                        All time
                    </span>
                </div>

                <div className="bg-white border border-[#dde8e3] rounded-[16px] p-5">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[11px] font-semibold text-[#8a9e96] tracking-widest">
                            TOTAL SPENT
                        </p>
                        <div className="w-7 h-7 bg-[#FAEEDA] rounded-full flex items-center justify-center">
                            <TrendingDown size={13} className="text-[#633806]" />
                        </div>
                    </div>
                    <p
                        className="text-[22px] font-bold text-[#0a3d2e]"
                        style={{ fontFamily: "'Fraunces', serif" }}
                    >
                        {formatUSD(data?.totalSpent ?? 0)}
                    </p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#633806] mt-1 inline-block">
                        All time
                    </span>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white border border-[#dde8e3] rounded-[16px] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#f0f5f2]">
                    <h2
                        className="text-[14px] font-bold text-[#0a3d2e]"
                        style={{ fontFamily: "'Fraunces', serif" }}
                    >
                        Recent Transactions
                    </h2>
                </div>

                {!data?.recentTransactions?.length ? (
                    <p className="text-[13px] text-[#8a9e96] text-center py-10">
                        No transactions yet
                    </p>
                ) : (
                    data.recentTransactions.map((tx: any) => {
                        const { label, isCredit } = getTxLabel(tx, userId);
                        const { Icon, bg, color } = getTxIcon(tx, userId);
                        return (
                            <div
                                key={tx._id}
                                className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f5f2] last:border-0 hover:bg-[#f6faf8] transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}
                                    >
                                        <Icon size={14} className={color} />
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-semibold text-[#0a3d2e]">
                                            {label}
                                        </p>
                                        <Datetime date={tx.createdAt} />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p
                                        className={`text-[13px] font-bold ${isCredit ? 'text-[#085041]' : 'text-[#633806]'}`}
                                        style={{ fontFamily: "'Fraunces', serif" }}
                                    >
                                        {isCredit ? '+' : '-'}
                                        {formatUSD(tx.amount)}
                                    </p>
                                    <span
                                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                                            tx.status === 'COMPLETED'
                                                ? 'bg-[#E1F5EE] text-[#085041]'
                                                : tx.status === 'PENDING'
                                                  ? 'bg-[#FFF8E7] text-[#B45309]'
                                                  : 'bg-red-50 text-red-500'
                                        }`}
                                    >
                                        {tx.status}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
