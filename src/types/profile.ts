import { z } from "zod";

// Profile update schema (only updatable fields)
export const profileUpdateSchema = z
  .object({
    full_name: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be less than 100 characters")
      .optional()
      .or(z.literal("")),
    avatar_url: z
      .string()
      .url("Avatar URL must be a valid URL")
      .optional()
      .or(z.literal("")),
    cloudinary_cloud_name: z
      .string()
      .regex(/^[a-z0-9_]+$/i, "Invalid cloud name format")
      .optional()
      .or(z.literal("")),
    cloudinary_api_key: z
      .string()
      .optional()
      .or(z.literal("")),
    cloudinary_api_secret: z
      .string()
      .optional()
      .or(z.literal("")),
    cloudinary_secure: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // If any cloudinary field is provided, all required ones must be present
      const hasAny =
        data.cloudinary_cloud_name ||
        data.cloudinary_api_key ||
        data.cloudinary_api_secret;
      if (hasAny) {
        return (
          data.cloudinary_cloud_name &&
          data.cloudinary_api_key &&
          data.cloudinary_api_secret
        );
      }
      return true;
    },
    {
      message:
        "All Cloudinary fields (cloud name, API key, API secret) must be provided together",
      path: ["cloudinary_cloud_name"],
    }
  );

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// Full profile type from database
export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  cloudinary_cloud_name: string | null;
  cloudinary_api_key: string | null;
  cloudinary_api_secret: string | null;
  cloudinary_secure: boolean;
  created_at: string;
  updated_at: string;
};
