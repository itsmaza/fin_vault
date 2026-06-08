import z from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  passcode: z
    .string()
    .length(4, "Passcode must be exactly 4 digits")
    .regex(/^\d{4}$/, "Digits only"),
})

export type LoginForm = z.infer<typeof loginSchema>



// ─── Schema ───────────────────────────────────────────────
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name too long")
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters"),
    email: z.string().email("Invalid email address"),
    address: z
      .string()
      .min(5, "Address too short")
      .max(200, "Address too long")
      .optional()
      .or(z.literal("")),
    passcode: z
      .string()
      .length(4, "Passcode must be exactly 4 digits")
      .regex(/^\d{4}$/, "Digits only"),
    confirmPasscode: z.string().length(4, "Confirm passcode must be 4 digits"),
  })
  .refine((data) => data.passcode === data.confirmPasscode, {
    message: "Passcodes do not match",
    path: ["confirmPasscode"],
  })

export type RegisterForm = z.infer<typeof registerSchema>