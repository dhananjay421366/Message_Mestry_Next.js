import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEnail";
import { ApiResponse } from "@/types/Apiesponse";


export async function sendVerificationEmail(email: string, username: string, verifyCode: string): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "hello wold",
            react: VerificationEmail({ username, otp: verifyCode }),
        })
        return {
            success: true,
            message: "verification email send successfully "
        }
    } catch (error) {
        console.error("Error sending verification email",error);
        return {
            success: false,
            message: "Failed to send verification email "
        }
    }

}