import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import bcrypt from "bcryptjs";
import { z } from "zod";

const CheckPasswordSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export async function POST(request: Request) {
  await dbConnect();
  
  try {
    const body = await request.json();
    const parsedData = CheckPasswordSchema.safeParse(body);
    
    if (!parsedData.success) {
      return new Response(JSON.stringify({ success: false, message: "Invalid input" }), { status: 400 });
    }

    const { email, password } = parsedData.data;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return new Response(JSON.stringify({ success: false, message: "User not found" }), { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return new Response(JSON.stringify({ success: false, message: "Incorrect password" }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true, message: "Password is correct" }), { status: 200 });

  } catch (error) {
    console.error("Error checking password", error);
    return new Response(JSON.stringify({ success: false, message: "Server error" }), { status: 500 });
  }
}
