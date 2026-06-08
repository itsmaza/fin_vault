// app/actions/auth.actions.ts
'use server';

import { connectDB } from '@/lib/db';

import { createSession, deleteSession } from '@/lib/session';
import { hashPasscode, verifyPasscode } from '@/lib/hash';
import { redirect } from 'next/navigation';
import { User } from '@/models';
import { ActionResult, LoginInput, RegisterInput, SafeUser, UpdatePasscodeInput, UpdateProfileInput } from '@/types';
import { fail, ok } from '@/lib/response';
import { requireAuth } from '@/lib/auth';

export async function register(input: RegisterInput): Promise<ActionResult<{ email: string }>> {
    try {
        await connectDB();

        const existing = await User.findOne({ email: input.email.toLowerCase() });
        if (existing) {
            return fail('Email already registered');
        }

        const hashedPasscode = await hashPasscode(input.passcode);

        const user = await User.create({
            name: input.name,
            email: input.email.toLowerCase(),
            passcode: hashedPasscode,
            address: input.address,
            status: 'PENDING',
        });

        await createSession(user._id.toString());

        return ok('Account created successfully', { email: user.email });
    } catch (error) {
        console.error('Register error:', error);
        return fail('Something went wrong. Please try again.');
    }
}

export async function login(input: LoginInput): Promise<ActionResult<{ name: string }>> {
    try {
        await connectDB();

        const user = await User.findOne({ email: input.email.toLowerCase() });
        if (!user) {
            return fail('Invalid email or passcode');
        }

        if (user.status === 'SUSPENDED') {
            return fail('Account suspended. Contact support.');
        }

        if (user.status === 'INACTIVE') {
            return fail('Account inactive. Please verify your email or contact support.');
        }

        const isValid = await verifyPasscode(input.passcode, user.passcode);
        if (!isValid) {
            return fail('Invalid email or passcode');
        }

        if (user.status === 'PENDING') {
            await User.findByIdAndUpdate(user._id, { status: 'ACTIVE' });
        }

        await createSession(user._id.toString());

        return ok('Login successful', { name: user.name });
    } catch (error) {
        console.error('Login error:', error);
        return fail('Something went wrong. Please try again.');
    }
}

export async function logout(): Promise<void> {
    await deleteSession();
    redirect('/login');
}



export async function getProfile(): Promise<ActionResult<SafeUser>> {
  try {
    await connectDB()
    const user = await requireAuth() ;
    return ok("Profile fetched", user)
  } catch {
    return fail("Unauthorized")
  }
}

export async function getBalance(): Promise<ActionResult<{ balance: number }>> {
  try {
    await connectDB()
    const user = await requireAuth()
    return ok("Balance fetched", { balance: user.balance })
  } catch {
    return fail("Unauthorized")
  }
}

export async function updateProfile(
  input: UpdateProfileInput
): Promise<ActionResult<SafeUser>> {
  try {
    await connectDB()
    const user = await requireAuth()

    const updated = await User.findByIdAndUpdate(
      user._id,
      { $set: input },
      { new: true }
    ).select("-passcode -resetPinToken -resetPinExpires") .lean()

    if (!updated) return fail("User not found");

    return ok("Profile updated", { ...updated, _id: updated._id.toString() })
  } catch {
    return fail("Failed to update profile")
  }
}

export async function updatePasscode(
  input: UpdatePasscodeInput
): Promise<ActionResult> {
  try {
    await connectDB()
    const user = await requireAuth()

    const dbUser = await User.findById(user._id)
    if (!dbUser) return fail("User not found")

    const isValid = await verifyPasscode(input.currentPasscode, dbUser.passcode)
    if (!isValid) return fail("Current passcode is incorrect")

    const hashed = await hashPasscode(input.newPasscode)
    await User.findByIdAndUpdate(user._id, { passcode: hashed })

    return ok("Passcode updated successfully")
  } catch {
    return fail("Failed to update passcode")
  }
}