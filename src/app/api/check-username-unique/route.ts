import UserModel from "@/model/User.model";
import { z } from 'zod';
import dbConnect from "@/lib/dbConnect";
import { usernameVAlidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
    username: usernameVAlidation
});

export async function GET(request: Request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(request.url);
        const queryParams = {
            username: searchParams.get('username') // ✅ Fixed the incorrect key
        };

        // Validate with Zod 
        const result = UsernameQuerySchema.safeParse(queryParams);
        console.log(result);

        if (!result.success) {
            const UserNameErrors = result.error.format().username?._errors || [];
            return Response.json({
                success: false,
                message: UserNameErrors.length > 0 ? UserNameErrors.join(', ') : 'Invalid query parameter'
            }, { status: 400 });
        }

        const { username } = result.data;
        const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true });

        if (existingVerifiedUser) {
            return Response.json({
                success: false,
                message: 'Username is already taken'
            }, { status: 400 });
        }

        return Response.json({
            success: true,
            message: 'Username is available. Great choice!'
        }, { status: 200 });

    } catch (error) {
        console.error("Error checking username:", error);
        return Response.json({
            success: false,
            message: "Error checking username"
        }, { status: 500 });
    }
}
