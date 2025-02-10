import UserModel from "@/model/User.model";
import dbConnect from "@/lib/dbConnect";
import { Message } from "@/model/User.model";

export async function POST(request: Request) {
    try {
        // Connect to the database
        await dbConnect();

        // Parse the incoming request data
        const { username, content } = await request.json();

        // Validate the required fields
        if (!username || !content) {
            return new Response(
                JSON.stringify({ success: false, message: "Username and content are required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Find the user by username
        const user = await UserModel.findOne({ username });
        if (!user) {
            return new Response(
                JSON.stringify({ success: false, message: "User not found" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        // Check if the user is accepting messages
        if (!user.isAcceptingMessage) {
            return new Response(
                JSON.stringify({ success: false, message: `${username} is not accepting messages` }),
                { status: 403, headers: { "Content-Type": "application/json" } }
            );
        }

        // Create a new message and add it to the user's messages
        const newMessage: Message = { content, createdAt: new Date() };
        user.messages.push(newMessage);

        // Save the updated user document
        await user.save();

        // Return a success response
        return new Response(
            JSON.stringify({ success: true, message: "Message sent successfully" }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error: unknown) {
        // Handle unexpected errors and return a server error response
        console.error("Error sending message:", error.message);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Internal Server Error",
                error: error.message,
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
