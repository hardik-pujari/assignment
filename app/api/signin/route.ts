import { verifyPassword, verifyToken } from "@/lib/auth/auth";
import { connectToDB } from "@/lib/db/db";
import { User } from "@/lib/db/schema";
import { generateToken } from "@/lib/jwt-edge";
import { findUserByEmail } from "@/lib/services/userServices";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // connect to DB only after token is validated
    try {
      await connectToDB();
    } catch (dbErr) {
      console.error("DB connection error in signin GET precheck:", dbErr);
      // Return 500 for DB errors instead of 401
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const user = await User.findById(decoded.userId);
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ message: "User authenticated", user });
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

// POST /api/signin - user login
export async function POST(request: NextRequest) {
  await connectToDB();
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password)
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });

  const user = await findUserByEmail(email);
  if (!user)
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const valid = await verifyPassword(password, user.password);
  if (!valid)
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const userId = (user as any)?._id?.toString?.() ?? String((user as any)?._id);
  const token = generateToken(userId);
  // avoid returning hashed password
  const safeUser = { ...user.toObject() } as any;
  if (safeUser.password) delete safeUser.password;
  const response = NextResponse.json({ message: "Signed in", user: safeUser });
  response.cookies.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60,
  });
  return response;
}
