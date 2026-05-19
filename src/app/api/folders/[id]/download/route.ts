import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClientForAPI } from "@/lib/supabase-api";
import AdmZip from "adm-zip";

export const maxDuration = 60; // 60 seconds

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { supabase } = createSupabaseClientForAPI(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1. Get the folder itself to get its name
    const { data: rootFolder, error: folderError } = await supabase
      .from("folders")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (folderError || !rootFolder) {
      return new NextResponse("Folder not found", { status: 404 });
    }

    // 2. Fetch all folders and files belonging to the user to reconstruct the tree recursively in memory
    const [foldersRes, filesRes] = await Promise.all([
      supabase.from("folders").select("*").eq("user_id", user.id),
      supabase.from("files").select("*").eq("user_id", user.id),
    ]);

    if (foldersRes.error || filesRes.error) {
      throw new Error("Failed to fetch folder/file tree data");
    }

    const allFolders = foldersRes.data || [];
    const allFiles = filesRes.data || [];

    const zip = new AdmZip();
    
    // Recursive function to add files and directories
    async function addFolderToZip(folderId: string, currentPath: string) {
      // Find files in the current folder
      const currentFiles = allFiles.filter(f => f.folder_id === folderId);
      for (const file of currentFiles) {
        try {
          const fileRes = await fetch(file.cloudinary_url);
          if (fileRes.ok) {
            const arrayBuffer = await fileRes.arrayBuffer();
            const filePath = currentPath ? `${currentPath}/${file.display_name}` : file.display_name;
            zip.addFile(filePath, Buffer.from(arrayBuffer));
          }
        } catch (e) {
          console.error(`Failed to download file ${file.name}:`, e);
        }
      }

      // Find child folders
      const childFolders = allFolders.filter(f => f.parent_id === folderId);
      for (const child of childFolders) {
        const nextPath = currentPath ? `${currentPath}/${child.name}` : child.name;
        await addFolderToZip(child.id, nextPath);
      }
    }

    // Populate zip with recursive content
    await addFolderToZip(rootFolder.id, "");

    const zipBuffer = zip.toBuffer();
    const zipBytes = new Uint8Array(zipBuffer.buffer, zipBuffer.byteOffset, zipBuffer.byteLength);

    return new NextResponse(zipBytes as any, {
      headers: {
        "Content-Disposition": `attachment; filename="${rootFolder.name}.zip"`,
        "Content-Type": "application/zip",
        "Content-Length": zipBytes.length.toString(),
      },
    });
  } catch (error: unknown) {
    const message = (error instanceof Error) ? error.message : "Unexpected error";
    return new NextResponse(message, { status: 500 });
  }
}
