import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const { error_message, error_stack, context } = body;

    if (!error_message) {
      return NextResponse.json(
        { error: "error_message is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("error_logs").insert({
      user_id: user?.id || null,
      error_message,
      error_stack,
      context,
    });

    if (error) {
      console.error("Error logging to database:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
