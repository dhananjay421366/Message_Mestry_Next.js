import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";


export async function POST(request: Request) {
    try {
        // Connect to the database
        await dbConnect();

        // Parse request body
        const { username, email, password } = await request.json();
        console.log(username, email, password);

        if (!username || !email || !password) {
            return Response.json(
                { success: false, message: "All fields are required" },
                { status: 400 }
            );
        }

        // Check if the username is already taken
        const existingUser = await UserModel.findOne({ username, isVerified: true });
        if (existingUser) {
            return Response.json(
                { success: false, message: "Username is already taken" },
                { status: 400 }
            );
        }

        // Check if the email is already in use
        const userByEmail = await UserModel.findOne({ email });
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(verifyCode);


        if (userByEmail) {
            if (userByEmail.isVerified) {
                return Response.json(
                    { success: false, message: "User already exists with this email" },
                    { status: 400 }
                );
            }

            // Update the existing unverified user
            userByEmail.password = await bcrypt.hash(password, 10);
            userByEmail.verifyCode = verifyCode;
            userByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000); // 1 hour expiry
            await userByEmail.save();
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const verifyCodeExpiry = new Date()
            verifyCodeExpiry.setHours(verifyCodeExpiry.getHours() + 1)
            // Create a new user
            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: verifyCodeExpiry,
                isVerified: false,
                isAcceptingMessage: true,
                messages: [],
            });
            await newUser.save();
        }

        // Send verification email
        const emailResponse = await sendVerificationEmail(email, username, verifyCode);
        console.log(emailResponse);
        if (!emailResponse.success) {
            return Response.json(
                { success: false, message: emailResponse?.message },
                { status: 500 }
            );
        }

        // Respond with success
        return Response.json(
            { success: true, message: "User registered successfully. Please verify your email." },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error registering user:", error);
        return Response.json(
            { success: false, message: "An error occurred while registering the user" },
            { status: 500 }
        );
    }
}
