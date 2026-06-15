// app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"
import { getSession } from "@/lib/session"
import { connectDB } from "@/lib/db"
import { User, Transaction, Beneficiary } from "@/models"
import mongoose from "mongoose"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

const SYSTEM_PROMPT = `You are FinVault's AI banking assistant. Analyze the user's message and respond ONLY with a valid JSON object. No markdown, no extra text.

Response format:
{
  "intent": "send_money" | "check_balance" | "get_transactions" | "get_spending" | "get_beneficiaries" | "general",
  "data": {},
  "reply": "friendly response to show user",
  "needsConfirm": false
}

Rules:
- send_money: extract receiverEmail and amount from message. Set needsConfirm: true
- check_balance: just show balance info. needsConfirm: false
- get_transactions: show recent transactions. needsConfirm: false
- get_spending: show spending summary. needsConfirm: false
- get_beneficiaries: list saved contacts. needsConfirm: false
- general: for greetings or unclear messages. needsConfirm: false

For send_money, data must be: { "receiverEmail": "email", "amount": number }
For get_transactions, data can be: { "limit": number }
Always reply in English. Be concise and friendly.`

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { message, history } = await req.json()
    if (!message) {
      return NextResponse.json({ success: false, message: "Message is required" }, { status: 400 })
    }

    await connectDB()
    const userId = new mongoose.Types.ObjectId(session.userId)

    // ─── Fetch user context ───────────────────────────
    const [user, recentTxs, beneficiaries] = await Promise.all([
      User.findById(userId).select("name email balance").lean(),
      Transaction.find({ $or: [{ senderId: userId }, { receiverId: userId }] })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Beneficiary.find({ userId }).lean(),
    ])

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    const contextMessage = `
User context:
- Name: ${user.name}
- Email: ${user.email}
- Balance: $${Number(user.balance).toFixed(2)} USD
- Recent transactions: ${recentTxs.length} found
- Saved beneficiaries: ${beneficiaries.map((b) => `${b.name} (${b.email})`).join(", ") || "none"}

User message: "${message}"
`

    // ─── Sanitize history (supports old {role, parts} and new {role, content}) ───
    const sanitizedHistory = (Array.isArray(history) ? history : [])
      .map((h: any) => {
        let role = h?.role
        if (role === "model") role = "assistant"

        let content = h?.content
        if (content == null && Array.isArray(h?.parts)) {
          content = h.parts.map((p: any) => p?.text ?? "").join("")
        }

        return { role, content }
      })
      .filter(
        (h: any) =>
          ["system", "user", "assistant", "tool"].includes(h.role) &&
          typeof h.content === "string" &&
          h.content.trim().length > 0
      )

    // ─── Groq call ──────────────────────────────────
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "assistant",
          content: '{"intent":"general","data":{},"reply":"Hello! I am FinVault AI. How can I help you today?","needsConfirm":false}',
        },
        ...sanitizedHistory,
        { role: "user", content: contextMessage },
      ],
      response_format: { type: "json_object" },
    })

    const text = (completion.choices[0]?.message?.content ?? "").trim()

    // ─── Parse JSON ───────────────────────────────────
    let parsed
    try {
      const clean = text.replace(/```json|```/g, "").trim()
      parsed = JSON.parse(clean)
    } catch {
      parsed = {
        intent:       "general",
        data:         {},
        reply:        text,
        needsConfirm: false,
      }
    }

    // ─── Fetch real data based on intent ─────────────
    if (parsed.intent === "check_balance") {
      parsed.reply = `Your current balance is **$${Number(user.balance).toFixed(2)} USD**.`
      parsed.contextData = { balance: user.balance }
    }

    if (parsed.intent === "get_transactions") {
      const limit = parsed.data?.limit ?? 5
      const txs   = await Transaction.find({
        $or: [{ senderId: userId }, { receiverId: userId }],
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()

      parsed.contextData = { transactions: txs.map((tx) => ({
        _id:       tx._id.toString(),
        amount:    tx.amount,
        type:      tx.type,
        status:    tx.status,
        note:      tx.note,
        createdAt: tx.createdAt,
        isCredit:  tx.receiverId.toString() === userId.toString(),
      })) }
    }

    if (parsed.intent === "get_beneficiaries") {
      parsed.contextData = {
        beneficiaries: beneficiaries.map((b) => ({
          _id:   b._id.toString(),
          name:  b.name,
          email: b.email,
        })),
      }
    }

    if (parsed.intent === "get_spending") {
      const spentAgg = await Transaction.aggregate([
        {
          $match: {
            senderId: userId,
            type:     { $in: ["TRANSFER", "WITHDRAWAL", "PAYMENT"] },
            status:   "COMPLETED",
            createdAt: { $gte: new Date(new Date().setDate(1)) }, // this month
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      const monthlySpent = spentAgg[0]?.total ?? 0
      parsed.reply = `You've spent **$${Number(monthlySpent).toFixed(2)} USD** this month.`
      parsed.contextData = { monthlySpent }
    }

    return NextResponse.json({ success: true, data: parsed })
  } catch (error) {
    console.error("AI chat error:", error)
    return NextResponse.json(
      { success: false, message: "AI service unavailable" },
      { status: 500 }
    )
  }
}