// actions/settings.actions.ts
'use server';

import { connectDB } from '@/lib/db';
import { User } from '@/models';
import { requireAuth } from '@/lib/auth';
import { ok, fail } from '@/lib/response';
import { hashPasscode, verifyPasscode } from '@/lib/hash';
import type { ActionResult, SafeUser } from '@/types';
import { mailEvent } from '@/utils/event/handler';

// ─── Update Profile ───────────────────────────────────────
export async function updateProfile(input: {
    name: string;
    address?: string;
}): Promise<ActionResult<SafeUser>> {
    try {
        await connectDB();
        const user = await requireAuth();

        const updated = await User.findByIdAndUpdate(
            user._id,
            { $set: { name: input.name, address: input.address ?? '' } },
            { new: true },
        )
            .select('-passcode -resetPinToken -resetPinExpires')
            .lean();

        return ok('Profile updated successfully', updated as unknown as SafeUser);
    } catch {
        return fail('Failed to update profile');
    }
}

// ─── Update Passcode ──────────────────────────────────────
export async function updatePasscode(input: {
    currentPasscode: string;
    newPasscode: string;
}): Promise<ActionResult> {
    try {
        await connectDB();
        const user = await requireAuth();

        const dbUser = await User.findById(user._id).select('+passcode');
        if (!dbUser) return fail('User not found');

        const isValid = await verifyPasscode(input.currentPasscode, dbUser.passcode);
        if (!isValid) return fail('Current passcode is incorrect');

        const hashed = await hashPasscode(input.newPasscode);
        await User.findByIdAndUpdate(user._id, { passcode: hashed });

        return ok('Passcode updated successfully');
    } catch {
        return fail('Failed to update passcode');
    }
}

// ─── Toggle Email Notification ────────────────────────────
export async function toggleEmailNotification(
    enabled: boolean,
): Promise<ActionResult<{ isSendEmail: boolean }>> {
    try {
        await connectDB();
        const user = await requireAuth();

        await User.findByIdAndUpdate(user._id, { isSendEmail: enabled });


            mailEvent.emit('sendMail', {
                to: user.email,
                subject: enabled ? 'Email Notifications Enabled' : 'Email Notifications Disabled',
                html: `<p>Dear ${user.name},</p>
        <p>Your email notifications have been ${enabled ? 'enabled' : 'disabled'}.</p>
        <p>Thank you for using our service!</p>
        <p>Best regards,<br/>The Team</p>`,
            });
        

        return ok(enabled ? 'Email notifications enabled' : 'Email notifications disabled', {
            isSendEmail: enabled,
        });
    } catch {
        return fail('Failed to update notification settings');
    }
}

// ─── Update Privacy ───────────────────────────────────────
export async function updatePrivacy(input: { currentPasscode: string }): Promise<ActionResult> {
    try {
        await connectDB();
        const user = await requireAuth();

        const dbUser = await User.findById(user._id).select('+passcode');
        if (!dbUser) return fail('User not found');

        const isValid = await verifyPasscode(input.currentPasscode, dbUser.passcode);
        if (!isValid) return fail('Incorrect passcode');

        return ok('Identity verified');
    } catch {
        return fail('Verification failed');
    }
}
