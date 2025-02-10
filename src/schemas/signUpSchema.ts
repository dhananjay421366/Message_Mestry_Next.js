import { z } from 'zod';

export const usernameVAlidation = z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(50, "Username must be no more then 50")
    .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special character")

    
export const emailValidation = z
    .string()
    .min(5, "Email must be at least 5 characters")
    .max(100, "Email must be no more than 100 characters")
    .email("Invalid email format"); // Ensures it's a properly formatted email

export const signUpSchema = z.object({
    username: usernameVAlidation,
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least  8 characters" })
})