import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import { authOptions } from "../../auth/[...nextauth]/options";
import UserModel from "@/model/User.model";

interface Context {
  params: { messageid: string };
}

// Use Context instead of destructuring directly
export async function DELETE(request: Request, context: Context) {
  const { messageid } = context.params;
  if (!messageid) {
    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
  }

  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  try {
    const updateResult = await UserModel.updateOne(
      { _id: session.user._id },
      { $pull: { messages: { _id: messageid } } }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ success: false, message: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Message deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
