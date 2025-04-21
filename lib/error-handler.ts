import { NextResponse } from "next/server"

export function handleApiError(error: unknown, operation: string) {
  console.error(`Error during ${operation}:`, error)

  // MongoDB specific errors
  if (error instanceof Error) {
    // MongoDB connection errors
    if (error.name === "MongoNetworkError") {
      return NextResponse.json({ error: "Database connection error. Please try again later." }, { status: 503 })
    }

    // MongoDB validation errors
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: "Invalid data provided.", details: error.message }, { status: 400 })
    }

    // MongoDB duplicate key errors
    if (error.name === "MongoServerError" && (error as any).code === 11000) {
      return NextResponse.json({ error: "Duplicate entry. This record already exists." }, { status: 409 })
    }
  }

  // Generic error response
  return NextResponse.json({ error: `Failed to ${operation}` }, { status: 500 })
}
