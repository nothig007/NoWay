import { Account, NextAuthOptions, Profile, User } from 'next-auth';
import CredentialsProvider, { CredentialInput } from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import { OTPModel, TempEmailModel, UserModel } from '@/model/user';
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import {MongoDBAdapter} from "@next-auth/mongodb-adapter"
import clientPromise from '@/lib/db';
export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
     CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });
          if (!user) {
            throw new Error('No user found with this email');
          }
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error('Incorrect password');
          }
        } catch (err: any) {
          throw new Error(err);
        }
      },
    }),
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
    }
  }),
  GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    authorization: {
    params: {
      scope: "read:user user:email",
    },
  },
      
    }
  
  )

  ],
  
  callbacks: {
    async jwt({ token, user, account }) {

      console.log("Google User Data:", JSON.stringify(user, null, 2))
      console.log("Google account Data:", JSON.stringify(account, null, 2))
      if (account && user) {
        if(account.provider==="github"){
          // console.log("account.provider "+ account.provider)
          // console.log("GitHub User Data:", JSON.stringify(user, null, 2))
          const email = await TempEmailModel.findOne({userId: user.id})
          token.provider = account.provider || email?.provider;
          token.email = email?.email || user.email || token.email || "Missing Email";
          // console.log("✅ Setting email from user object during sign in:", token.email);
          token.image = user.image;   
          token._id = user._id?.toString(); // Convert ObjectId to string
          token.username = user.username||"";
          // console.log("JWT Token:");
          console.log("token.username"+ token.username)
          if (!token.username) {
            console.log("inside !token.username")
            const dbUser = await UserModel.findOne({
              email: token.email,
              provider: token.provider
            });
            if (dbUser) {console.log("yes dbuser is true")}
            token.username = dbUser?.username || "";
            if (dbUser) {console.log("token.username" + token.username)}
          }
        }
        else if (account.provider==="google"){
          console.log("Google User Data:", JSON.stringify(user, null, 2))
          console.log("Google account Data:", JSON.stringify(account, null, 2))
          
          token.email = user.email || token.email || "Missing Email";
          token.image = user.image;  
          token.id = user.id 
          token._id = user._id?.toString(); // Convert ObjectId to string
          token.username = user.username||"";
          console.log("Google Token Data: ", JSON.stringify(token, null, 2))
          // console.log("JWT Token:");
          token.provider = account.provider
          const dbUser = await UserModel.findOne({
            email: token.email,
            provider: token.provider
          });
          if (token.username!==dbUser?.username && dbUser?.username) {
            token.username = dbUser?.username || "";
            console.log("inside !token.username")
            if (dbUser) {console.log("yes dbuser is true")}
            if (dbUser) {console.log("token.username" + token.username)}
          }
        }
        else if (account.provider==="credentials") {
          if (user) {
            console.log("GitHub User Data:", JSON.stringify(user, null, 2))
            token._id = user._id?.toString(); // Convert ObjectId to string
            token.username = user.username;
            token.email = user.email
          }

        }

      }
      else{
        
      }
      token.email = token.email ?? "Missing Email";
      token.provider = token.provider ?? "username not selected"
      token.username = token.username??"no idea"
      console.log("JWT Token:", JSON.stringify(token, null, 2));
      return token;
    },
    async session({ session, token }) {
      // console.log("session: "+session)
      // console.log("session: "+session.user)
      // console.log("session: "+session.user.username)
      if (token) {
        session.user._id = token._id;
        session.user.id = token.id
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.provider = token.provider
        session.user.image = token.image;
      }
      return session;
    },
    async signIn({ user, account }) {
    if (!account) {
      console.error("Account is null, skipping GitHub email fetch.");
      return false; // ✅ Explicitly return false instead of undefined
    }
    
    if (account.provider === "github") {
      const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `token ${account.access_token}`,

        },
      });
      const emails = await emailRes.json();
      console.log("emails"+ emails)
      const primaryEmail = Array.isArray(emails) ? emails.find((e) => e.primary)?.email : null;
      if (primaryEmail) {
        console.log("userId: "+user.id)
        console.log("user._id: "+user._id)
        console.log("email: "+primaryEmail)
      const tempEmail = new TempEmailModel({
        userId: user.id,
        email: primaryEmail,
        provider: account.provider
      })
      try {
        await tempEmail.save()
      } catch (error) {
        console.log("error in saving temp email: "+ error)
      }
    }
      user.email = primaryEmail || user.email;
      console.log("user.email: "+ user.email)
    }
    console.log("user :", JSON.stringify(user, null, 2))
    if(account.provider==="google"){
      console.log("ye we got google acc")
    }

    return true



  }
  ,

},
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/sign-in',
  },
};