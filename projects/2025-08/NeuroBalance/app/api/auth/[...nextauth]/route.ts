import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import dbConnect from '@/lib/dbConnect';
import UserRebalancer from '@/lib/models/user';
import { compare } from 'bcrypt';

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      walletAddress?: string | null;
    }
  }
  
  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    walletAddress?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    walletAddress?: string | null;
  }
}

const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        await dbConnect();

        const user = await UserRebalancer.findOne({ email: credentials.email });

        if (!user) {
          throw new Error('No user found with this email');
        }

        const isPasswordMatch = await compare(credentials.password, user.password);

        if (!isPasswordMatch) {
          throw new Error('Incorrect password');
        }

        // ✅ Update lastActiveAt on successful login
        user.lastActiveAt = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          walletAddress: user.walletAddress
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.walletAddress = user.walletAddress;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.walletAddress = token.walletAddress;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle custom redirects if needed
      if (url.startsWith('/auth/signup')) {
        return `${baseUrl}/auth/signup`;
      }
      return url;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
