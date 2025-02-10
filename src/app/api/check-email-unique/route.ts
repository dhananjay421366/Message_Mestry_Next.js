import UserModel from "@/model/User.model";
import { z } from 'zod';
import dbConnect from "@/lib/dbConnect";
import { emailValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
    email: emailValidation
})


export async function GET(request: Request) {

    await dbConnect();
    try {
        const { searchParams } = new URL(request.url)
        const queryParams = {
            email: searchParams.get('email')
        }

        // validate with zod 
        const result = UsernameQuerySchema.safeParse(queryParams)
        console.log(result);
        if (!result.success) {
            const UserNameErrors = result.error.format().email?._errors || []
            return Response.json({
                success: false,
                message: UserNameErrors?.length > 0 ? UserNameErrors.join(',') : 'Invalid query parameter'
            }, { status: 400 })
        }

        const { email } = result.data;
        const existingVerifiedUser = await UserModel.findOne({ email, isVerified: true });
        if (existingVerifiedUser) {
            return Response.json({
                success: false,
                message: 'email is already taken'
            }, { status: 400 })
        }
        return Response.json({
            success: true,
            message: 'email is available Great Choise !'
        }, { status: 200 })

    } catch (error) {
        console.error("Error checking email", error);
        return Response.json({
            success: false,
            message: "Error checking email"
        },
            { status: 500 }
        )
    }

}