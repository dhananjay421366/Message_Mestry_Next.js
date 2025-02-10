import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";


export async function POST(request: Request) {
    try {
        // Connect to the database
        await dbConnect();

        // Parse the request body
        const { email, verifyCode } = await request.json();

        if (!email || !verifyCode) {
            return Response.json(
                { success: false, message: "Email and verification code are required" },
                { status: 400 }
            );
        }

        // Find the user by email
        const user = await UserModel.findOne({ email });
        console.log(user);

        if (!user) {
            return Response.json(
                { success: false, message: "No user found with this email" },
                { status: 404 }
            );
        }

        // Check if the verification code matches and is still valid
        if (user.verifyCode !== verifyCode) {
            return Response.json(
                { success: false, message: "Invalid verification code" },
                { status: 400 }
            );
        }

        // Check if the verification code has expired
        if (new Date() > user.verifyCodeExpiry) {
            return Response.json(
                { success: false, message: "Verification code has expired" },
                { status: 400 }
            );
        }

        // Mark the user as verified
        user.isVerified = true;
        user.verifyCode = verifyCode; // Remove the verification code

        // Set the new expiry time (1-2 minutes from now)
        const newExpiryTime = new Date(Date.now() + Math.floor(Math.random() * 60 + 60) * 1000); // Random between 1 and 2 minutes
        user.verifyCodeExpiry = newExpiryTime;

        await user.save();

        // Respond with success
        return Response.json(
            { success: true, message: "User verified successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error verifying user:", error);
        return Response.json(
            { success: false, message: "An error occurred during verification" },
            { status: 500 }
        );
    }
}
