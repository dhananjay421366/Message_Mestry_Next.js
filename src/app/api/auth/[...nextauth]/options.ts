

// import dbConnect from "@/lib/dbConnect";
// import UserModel from "@/model/User.model";
// import bcrypt from "bcryptjs";
// import { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GitHubProvider from "next-auth/providers/github";
// import GoogleProvider from "next-auth/providers/google";

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       id: "credentials",
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text", placeholder: "Email" },
//         password: { label: "Password", type: "password", placeholder: "Password" },
//       },
//       async authorize(credentials) {
//         await dbConnect();

//         if (!credentials?.email || !credentials?.password) {
//           throw new Error("Missing email or password");
//         }

//         const user = await UserModel.findOne({ email: credentials.email });
//         if (!user) {
//           throw new Error("No user found with this email");
//         }

//         if (!user.isVerified) {
//           throw new Error("Please verify your account before login");
//         }

//         const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
//         if (!isPasswordCorrect) {
//           throw new Error("Incorrect password");
//         }

//         return {
//           _id: user._id.toString(),
//           email: user.email,
//           username: user.username,
//           isVerified: user.isVerified,
//           isAcceptingMessage: user.isAcceptingMessage || false,
//         };
//       },
//     }),

//     GitHubProvider({
//       clientId: process.env.GITHUB_CLIENT_ID as string,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
//     }),

//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID as string,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//     }),
//   ],

//   callbacks: {
//     async signIn({ user, account, profile }) {
//       await dbConnect();

//       if (account?.provider === "google" || account?.provider === "github") {
//         let existingUser = await UserModel.findOne({ email: user.email });

//         if (!existingUser) {
//           existingUser = new UserModel({
//             email: user.email,
//             username: profile?.name || user.email.split("@")[0],
//             isVerified: true,
//             isAcceptingMessage: true,
//           });

//           await existingUser.save();
//         }

//         return true;
//       }

//       return true;
//     },

//     async jwt({ token, user }) {
//       if (user) {
//         token._id = user._id;  // ✅ Ensure `_id` is stored
//         token.email = user.email;
//         token.username = user.username;
//         token.isVerified = user.isVerified;
//         token.isAcceptingMessage = user.isAcceptingMessage;
//       }
//       return token;
//     },

//     async session({ session, token }) {
//       if (token._id) {
//         session.user = {
//           _id: token._id,  // ✅ Ensure `_id` is in session
//           email: token.email,
//           username: token.username,
//           isVerified: token.isVerified,
//           isAcceptingMessage: token.isAcceptingMessage,
//         };
//       }
//       return session;
//     },
//   },

//   session: {
//     strategy: "jwt",
//   },

//   secret: process.env.NEXTAUTH_SECRET,

//   pages: {
//     signIn: "/sign-in",
//   },
// };
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken"; // ✅ Import JWT

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Email" },
        password: { label: "Password", type: "password", placeholder: "Password" },
      },
      async authorize(credentials) {
        await dbConnect();

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await UserModel.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("No user found with this email");
        }

        if (!user.isVerified) {
          throw new Error("Please verify your account before login");
        }

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordCorrect) {
          throw new Error("Incorrect password");
        }

        return {
          _id: user._id.toString(),
          email: user.email,
          username: user.username,
          isVerified: user.isVerified,
          isAcceptingMessage: user.isAcceptingMessage || false,
        };
      },
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      await dbConnect();

      if (account?.provider === "google" || account?.provider === "github") {
        let existingUser = await UserModel.findOne({ email: user.email });

        if (!existingUser) {
          existingUser = new UserModel({
            email: user.email,
            username: profile?.name || user.email.split("@")[0],
            isVerified: true,
            isAcceptingMessage: true,
          });

          await existingUser.save();
        }

        return true;
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.email = user.email;
        token.username = user.username;
        token.isVerified = user.isVerified;
        token.isAcceptingMessage = user.isAcceptingMessage;

        // ✅ Generate an access token (valid for 7 days)
        token.accessToken = jwt.sign(
          { _id: user._id, email: user.email },
          process.env.NEXTAUTH_SECRET!,
          { expiresIn: "7d" }
        );
      }
      return token;
    },

    async session({ session, token }) {
      if (token._id) {
        session.user = {
          _id: token._id,
          email: token.email,
          username: token.username,
          isVerified: token.isVerified,
          isAcceptingMessage: token.isAcceptingMessage,
        };

        // ✅ Attach accessToken to session
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/sign-in",
  },
};
