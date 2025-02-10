import { z } from 'zod'
import { usernameVAlidation } from './signUpSchema'
export const signInSchema = z.object({
    username: usernameVAlidation,
    email: z.string(),
    password: z.string()
})