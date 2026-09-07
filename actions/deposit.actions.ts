// actions/deposit.actions.ts
'use server';

import { connectDB } from '@/lib/db';
import { User, Transaction } from '@/models';
import { requireAuth } from '@/lib/auth';
import { ok, fail } from '@/lib/response';
import mongoose from 'mongoose';
import type { ActionResult, SafeTransaction, DepositInput } from '@/types';
import { mailEvent, sendMail } from '@/utils/event/handler';
import { after } from 'next/server';

const PAGE_SIZE = 10;

const TEST_CARDS: Record<string, { valid: boolean; reason?: string }> = {
    '4242424242424242': { valid: true },
    '4000000000000002': { valid: true },
    '4000000000009995': { valid: false, reason: 'Insufficient funds on card' },
    '4000000000000069': { valid: false, reason: 'Card has expired' },
    '4000000000000119': { valid: false, reason: 'Card processing error' },
};

function validateCard(card: DepositInput['card']): { valid: boolean; reason?: string } {
    const rawNumber = card.number.replace(/\s/g, '');

    const testCard = TEST_CARDS[rawNumber];
    if (!testCard) return { valid: false, reason: 'Invalid card number' };
    if (!testCard.valid) return { valid: false, reason: testCard.reason };

    const [mm, yy] = card.expiry.split('/').map((v) => parseInt(v.trim()));
    if (!mm || !yy) return { valid: false, reason: 'Invalid expiry date' };

    const expiry = new Date(2000 + yy, mm - 1);
    if (expiry < new Date()) return { valid: false, reason: 'Card has expired' };

    if (!/^\d{3,4}$/.test(card.cvv)) return { valid: false, reason: 'Invalid CVV' };
    if (!card.name.trim()) return { valid: false, reason: 'Cardholder name is required' };

    return { valid: true };
}

export async function deposit(input: DepositInput): Promise<ActionResult<SafeTransaction>> {
    try {
        await connectDB();
        const user = await requireAuth();

        if (input.amount <= 0) return fail('Amount must be greater than 0');
        if (input.amount > 100000) return fail('Maximum deposit is $100,000');

        const cardCheck = validateCard(input.card);
        if (!cardCheck.valid) return fail(cardCheck.reason ?? 'Card validation failed');

        const userId = new mongoose.Types.ObjectId(user._id.toString());

        await User.findByIdAndUpdate(userId, { $inc: { balance: input.amount } });

        const transaction = await Transaction.create({
            amount: input.amount,
            type: 'DEPOSIT',
            status: 'COMPLETED',
            senderId: userId,
            receiverId: userId,
            note: input.note ?? 'Card deposit',
            reference: `DEP-${Date.now()}`,
        });

        const result = await Transaction.findById(transaction._id).lean();
after(async () => {
    if (user.isSendEmail) {
        await sendMail({
            to: user.email,
            subject: 'Deposit Successful',
            html: `<p>Dear ${user.name},</p>
      <p>Your deposit of $${input.amount.toFixed(2)} has been successfully processed.</p>
      <p>Transaction Reference: ${transaction.reference}</p>
      <p>Thank you for using our service!</p>
      <p>Best regards,<br/>The Team</p>`,
        });
    }
});

          
        return ok(
            `$${input.amount.toFixed(2)} deposited successfully`,
            result as unknown as SafeTransaction,
        );
    } catch (error) {
        console.error('Deposit error:', error);
        return fail('Deposit failed. Please try again.');
    }
}

type DepositFilters = {
    minAmount?: number;
    maxAmount?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: number;
};

export async function getDepositsFiltered(
    filters: DepositFilters,
): Promise<ActionResult<{ transactions: SafeTransaction[]; hasMore: boolean }>> {
    try {
        await connectDB();
        const user = await requireAuth();
        const userId = new mongoose.Types.ObjectId(user._id.toString());

        const query: Record<string, unknown> = {
            senderId: userId,
            type: 'DEPOSIT',
        };

        if (filters.status) query.status = filters.status;

        if (filters.minAmount || filters.maxAmount) {
            query.amount = {
                ...(filters.minAmount && { $gte: Number(filters.minAmount) }),
                ...(filters.maxAmount && { $lte: Number(filters.maxAmount) }),
            };
        }

        if (filters.startDate || filters.endDate) {
            query.createdAt = {
                ...(filters.startDate && { $gte: new Date(filters.startDate) }),
                ...(filters.endDate && {
                    $lte: new Date(new Date(filters.endDate).setHours(23, 59, 59, 999)),
                }),
            };
        }

        const skip = ((filters.page ?? 1) - 1) * PAGE_SIZE;
        const txs = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(PAGE_SIZE + 1)
            .lean();

        return ok('Deposits fetched', {
            transactions: txs.slice(0, PAGE_SIZE) as unknown as SafeTransaction[],
            hasMore: txs.length > PAGE_SIZE,
        });
    } catch (error) {
        console.error('getDepositsFiltered error:', error);
        return fail('Failed to fetch deposits');
    }
}
