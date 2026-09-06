// lib/mailer.ts
import { EventEmitter } from "events"
import nodemailer, { type Transporter } from "nodemailer"

interface MailData {
  to: string
  subject: string
  html: string
}

export const mailEvent = new EventEmitter()

let transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (transporter) return transporter

  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port:  587,
    secure:false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  return transporter
}

 const sendMail = async ({ to, subject, html }: MailData): Promise<void> => {
  try {
    console.log("Sending mail...")

    await getTransporter().sendMail({
      from: process.env.SMTP_FROM ?? `"FinVault" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    })

    console.log("Mail sent to:", to)
  } catch (error) {
    console.error("Failed to send mail:")
  }
}


mailEvent.on("sendMail", async (mailData: MailData) => {
  await sendMail(mailData)
})
