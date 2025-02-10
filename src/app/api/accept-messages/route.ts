import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { authOptions } from "../auth/[...nextauth]/options";

// ✅ POST Handler: Update "Accept Messages" status
export async function POST(request: Request) {
  try {
    await dbConnect();

    // 1️⃣ Get session from NextAuth
    const session = await getServerSession(authOptions);
    console.log(session)
    if (!session || !session.user) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2️⃣ Extract user ID from the session
    const userId = session.user._id;

    // 3️⃣ Parse the request body and validate
    const { acceptMessages } = await request.json();
    if (typeof acceptMessages !== "boolean") {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid data format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4️⃣ Update user status in the database
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptMessages },
      { new: true }
    );

    if (!updatedUser) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found or update failed" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "User status updated successfully",
        updatedUser,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating user status:", error);
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

// ✅ GET Handler: Fetch user details
export async function GET(request: Request) {
  try {
    await dbConnect();

    // 1️⃣ Get session from NextAuth
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2️⃣ Extract user ID from the session
    const userId = session.user._id;

    // 3️⃣ Find the user in the database
    const user = await UserModel.findById(userId);
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4️⃣ Return user details
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          _id: user._id,
          email: user.email,
          username: user.username,
          isVerified: user.isVerified,
          isAcceptingMessage: user.isAcceptingMessage,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching user data:", error);
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
