import { hashPassword } from "@/lib/auth/auth";
import { generateToken } from "@/lib/jwt-edge";
import { connectToDB } from "@/lib/db/db";
import { createUser, findUserByEmail } from "@/lib/services/userServices";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  await connectToDB();
  const body = await request.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    // check existing user
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await createUser(name, email, hashedPassword);
    const userId =
      (user as any)?._id?.toString?.() ?? String((user as any)?._id);
    const token = generateToken(userId);

    // avoid returning hashed password — handle both Mongoose document and plain object
    let safeUser: any;
    if (user && typeof (user as any).toObject === "function") {
      safeUser = (user as any).toObject();
    } else {
      safeUser = { ...(user as any) };
    }
    if (safeUser && safeUser.password) delete safeUser.password;

    const response = NextResponse.json(
      { message: "User created successfully", user: safeUser },
      { status: 201 }
    );

    // set secure cookie (adjust secure flag for local dev if needed)
    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60, // 1 hour
    });

    return response;
  } catch (err) {
    console.error("Signup error", err);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
