import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClientForAPI } from "@/lib/supabase-api";
import { uploadFile } from "@/lib/file-service";

export async function POST(request: NextRequest) {
  try {
    const { supabase } = createSupabaseClientForAPI(request, true);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder_id = formData.get("folder_id") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size (client-side mime already in form)
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: `File too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate mime type (basic check)
    if (!file.type) {
      return NextResponse.json(
        { success: false, error: "Invalid file type" },
        { status: 400 }
      );
    }

    const result = await uploadFile(supabase, user.id, file, folder_id || null);

    if (result.success && result.file) {
      return NextResponse.json({ success: true, data: result.file });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Upload failed" },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    const message = (error instanceof Error) ? error.message : "Unexpected error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

