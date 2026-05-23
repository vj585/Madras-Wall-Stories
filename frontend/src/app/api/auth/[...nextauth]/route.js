import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";
import Customer from "@/models/Customer";
import AuditLog from "@/models/AuditLog";
import { LRUCache } from "lru-cache";

// Rate limiter: max 5 failed attempts per hour per email
const rateLimit = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 60, // 1 hour
});

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const attempts = rateLimit.get(credentials.email) || 0;
        if (attempts >= 5) {
          throw new Error("Too many failed login attempts. Please try again later.");
        }

        await connectDB();
        
        let user = await AdminUser.findOne({ email: credentials.email.toLowerCase() });
        let isCustomer = false;

        if (!user) {
          // If not admin, check customer
          user = await Customer.findOne({ email: credentials.email.toLowerCase() });
          isCustomer = true;
        }

        if (!user) {
          rateLimit.set(credentials.email, attempts + 1);
          throw new Error("Invalid credentials");
        }

        if (isCustomer) {
          if (user.authProvider === 'google') {
            throw new Error("This account uses Google Login. Please sign in with Google.");
          }
          if (!user.emailVerified) {
            throw new Error("Please verify your email before logging in.");
          }
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        
        if (!isPasswordValid) {
          rateLimit.set(credentials.email, attempts + 1);
          throw new Error("Invalid credentials");
        }

        // Reset rate limit on success
        rateLimit.delete(credentials.email);

        // Audit Log for Admins
        if (!isCustomer) {
          try {
            await AuditLog.create({
              adminEmail: user.email,
              action: "ADMIN_LOGIN",
              details: { ip: "tracked-by-session" }
            });
          } catch (e) {
            console.error("Failed to write audit log:", e);
          }
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days (Remember me default)
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          await connectDB();
          let customer = await Customer.findOne({ email: user.email.toLowerCase() });
          if (!customer) {
            await Customer.create({
              name: user.name,
              email: user.email.toLowerCase(),
              authProvider: 'google',
              emailVerified: true,
              role: 'customer',
              avatar: user.image
            });
          }
          return true;
        } catch (error) {
          console.error('Google SignIn Error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // user object is only present on initial sign-in
      if (user) {
        if (account?.provider === 'google') {
          try {
            await connectDB();
            // Fetch the real ObjectId and role from DB for Google users
            let dbUser = await Customer.findOne({ email: user.email.toLowerCase() }).select('_id role');
            if (dbUser) {
              token.id = dbUser._id.toString();
              token.role = dbUser.role || 'customer';
            }
          } catch (err) {
            console.error("JWT Google User Fetch Error:", err);
          }
        } else {
          // For Credentials provider, user has id and role from authorize()
          token.id = user.id;
          token.role = user.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
