// actions/beneficiary.actions.ts
"use server"

import { connectDB } from "@/lib/db"

import { requireAuth } from "@/lib/auth"
import { ok, fail } from "@/lib/response"

import { Beneficiary, User } from "@/models"
import { ActionResult, AddBeneficiaryInput, SafeBeneficiary } from "@/types"

export async function addBeneficiary(
  input: AddBeneficiaryInput
): Promise<ActionResult<SafeBeneficiary>> {
  try {
    await connectDB()
    const user = await requireAuth()

    if (input.email.toLowerCase() === user.email) {
      return fail("Cannot add yourself as beneficiary")
    }

    const exists = await User.findOne({ email: input.email.toLowerCase() })
    if (!exists) return fail("No user found with this email")

    const duplicate = await Beneficiary.findOne({
      userId: user._id,
      email: input.email.toLowerCase(),
    })
    if (duplicate) return fail("Beneficiary already added")

    const beneficiary = await Beneficiary.create({
      userId: user._id,
      name: input.name,
      email: input.email.toLowerCase(),
    })

    return ok("Beneficiary added", {
      _id: beneficiary._id.toString(),
      userId: beneficiary.userId.toString(),
      name: beneficiary.name,
      email: beneficiary.email,
    } as SafeBeneficiary)
  } catch {
    return fail("Failed to add beneficiary")
  }
}
export async function getBeneficiaries(): Promise<ActionResult<SafeBeneficiary[]>> {
  try {
    await connectDB()
    const user = await requireAuth()

    const beneficiaries = await Beneficiary.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean()

    // FIX: ObjectId গুলো string এ convert করতে হবে
    // .lean() দিলেও ObjectId plain object না, তাই Client Component এ pass করলে error আসে
    const serialized = beneficiaries.map((b) => ({
      ...b,
      _id: b._id.toString(),
      userId: b.userId.toString(),
      createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
    }))

    return ok("Beneficiaries fetched", serialized as unknown as SafeBeneficiary[])
  } catch {
    return fail("Failed to fetch beneficiaries")
  }
}

export async function deleteBeneficiary(
  id: string
): Promise<ActionResult> {
  try {
    await connectDB()
    const user = await requireAuth()

    const beneficiary = await Beneficiary.findOne({ _id: id, userId: user._id })
    if (!beneficiary) return fail("Beneficiary not found")

    await Beneficiary.findByIdAndDelete(id)
    return ok("Beneficiary removed")
  } catch {
    return fail("Failed to delete beneficiary")
  }
}