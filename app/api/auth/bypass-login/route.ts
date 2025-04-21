import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "This endpoint allows you to test login without database",
    instructions: "Make a POST request with email and password",
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log(`Bypass login attempt for: ${email}`)

    // Always succeed with any credentials
    return NextResponse.json({
      success: true,
      user: {
        id: "bypass-user-id",
        name: email.split("@")[0] || "Test User",
        email: email,
      },
      message: "Bypass login successful",
    })
  } catch (error) {
    console.error("Bypass login error:", error)
    return NextResponse.json({
      success: false,
      error: "Invalid request",
    })
  }
}
