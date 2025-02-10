// import { getServerSession } from "next-auth";
// import { authOptions } from "../auth/[...nextauth]/options";
// import dbConnect from "@/lib/dbConnect";
// import UserModel from "@/model/User.model";
// import mongoose from "mongoose";

// export async function GET(req: Request) {
//   try {
//     await dbConnect();

//     // ✅ Ensure session is fetched correctly
//     const session = await getServerSession({ req, ...authOptions });

//     console.log("Session Debug:", session); // 🔍 Log session

//     if (!session || !session.user) {
//       return new Response(JSON.stringify({ success: false, message: "Not Authenticated" }), {
//         status: 401,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     const userId = session.user._id;
//     if (!userId) {
//       return new Response(JSON.stringify({ success: false, message: "Invalid session data" }), {
//         status: 401,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     const objectId = new mongoose.Types.ObjectId(userId);

//     // 🔍 Check if user exists
//     const user = await UserModel.findById(objectId);
//     if (!user) {
//       return new Response(JSON.stringify({ success: false, message: "User not found" }), {
//         status: 404,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     // 🔍 Fetch last 10 messages using aggregation
//     const userMessages = await UserModel.aggregate([
//       { $match: { _id: objectId } },
//       {
//         $project: {
//           _id: 0,
//           messages: { $slice: ["$messages", -10] }, // Get last 10 messages
//         },
//       },
//     ]);

//     return new Response(JSON.stringify({ success: true, messages: userMessages[0]?.messages || [] }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Error fetching messages:", error);
//     return new Response(JSON.stringify({ success: false, message: "Internal Server Error" }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    console.log(session)
    if (!session || !session.user) {
      return new Response(JSON.stringify({ success: false, message: "Not Authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return new Response(JSON.stringify({ success: false, message: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, messages: user.messages || [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error fetching messages:", error);
    return new Response(JSON.stringify({ success: false, message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
