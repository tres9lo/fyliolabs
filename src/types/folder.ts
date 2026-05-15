import { z } from "zod";

export const folderCreateSchema = z.object({
  name: z.string().min(1, "Folder name is required").max(255),
  description: z.string().max(500).optional(),
  parent_id: z.string().uuid().optional().nullable(),
});

export const folderUpdateSchema = z.object({
  name: z.string().min(1, "Folder name is required").max(255).optional(),
  description: z.string().max(500).optional().nullable(),
  parent_id: z.string().uuid().optional().nullable(),
});

export type FolderCreateInput = z.infer<typeof folderCreateSchema>;
export type FolderUpdateInput = z.infer<typeof folderUpdateSchema>;

export type Folder = {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  children?: Folder[];
};
