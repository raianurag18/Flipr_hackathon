import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';

const client = new MongoClient(process.env.MONGODB_URI);
const clientPromise = client.connect();

const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        await dbConnect();
        
        const user = await User.findOne({ 
          email: credentials.email,
          isActive: true 
        });
        
        if (!user) {
          throw new Error('No user found with this email');
        }

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > Date.now()) {
          throw new Error('Account is temporarily locked. Please try again later');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        
        if (!isPasswordValid) {
          // Increment login attempts
          user.loginAttempts = (user.loginAttempts || 0) + 1;
          
          // Lock account after 5 failed attempts
          if (user.loginAttempts >= 5) {
            user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
          }
          
          await user.save();
          throw new Error('Invalid password');
        }

        // Reset login attempts on successful login
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        user.lastLogin = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          avatar: user.avatar,
          department: user.department
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24 hours
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.permissions = user.permissions;
        token.avatar = user.avatar;
        token.department = user.department;
      }
      
      // Handle session updates
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }
      
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.permissions = token.permissions;
      session.user.avatar = token.avatar;
      session.user.department = token.department;
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup'
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // Log successful sign in
      console.log(`User ${user.email} signed in successfully`);
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST, authOptions };