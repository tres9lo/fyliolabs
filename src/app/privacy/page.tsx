"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, FileText } from "lucide-react";
import Logo from "@/components/ui/logo";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-primary-500/10 to-indigo-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-indigo-500/10 to-rose-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto w-full relative z-10 flex-1 flex flex-col justify-center">
        {/* Header Branding */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center transition-transform hover:scale-105">
            <Logo />
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-primary-600 transition-colors bg-white/40 dark:bg-black/20 px-3 py-1.5 rounded-full border border-[var(--border)] backdrop-blur-md"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Register
          </Link>
        </div>

        {/* main Content Card */}
        <div className="glass p-8 sm:p-12 rounded-3xl border border-[var(--border)] shadow-xl space-y-8 backdrop-blur-2xl">
          <div className="space-y-4">
            <div className="inline-flex p-3 rounded-2xl bg-primary-50 dark:bg-primary-950/30 text-primary-500 dark:text-primary-400">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white font-display">
              Privacy Policy
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Last Updated: May 20, 2026
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed text-gray-600 dark:text-gray-300 space-y-6">
            <p>
              At <strong>Fyliolabs</strong>, accessible from <a href="https://fyliolabs.vercel.app" className="text-primary-500 underline">fyliolabs.vercel.app</a>, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Fyliolabs and how we use it.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mt-6">
              <Eye className="h-4 w-4 text-indigo-500" /> 1. Information We Collect
            </h2>
            <p>
              Fyliolabs is a secure multi-tenant cloud storage, document workspace creation, and file conversion orchestration service. We collect information necessary to deliver these capabilities, including:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account Credentials:</strong> Email address, encrypted passwords, and user profile information provided during registration.</li>
              <li><strong>User Content:</strong> Files, directories, media, and text documents uploaded to your private workspace, managed securely via Supabase and Cloudinary integrations.</li>
              <li><strong>Usage Logs:</strong> Action timestamps, conversion histories, format transcoding settings, and workspace diagnostic telemetry.</li>
            </ul>

            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mt-6">
              <Lock className="h-4 w-4 text-green-500" /> 2. How We Protect Your Data
            </h2>
            <p>
              Security is at the heart of Fyliolabs. Your uploads are securely stored using enterprise Cloudinary buckets with signed URLs, and all tenant metadata is fully isolated inside Supabase PostgreSQL databases utilizing row-level security (RLS) policies.
            </p>
            <p>
              We implement industry-standard encryption protocols (SSL/TLS) for all data in transit and service-role permission hierarchies for backend storage orchestration.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mt-6">
              <FileText className="h-4 w-4 text-primary-500" /> 3. Data Retention & Control
            </h2>
            <p>
              You retain complete ownership and control of your files. You can upload, rename, convert, organize into directories, edit inside the Word Canvas/Code IDE, or completely purge files and directories at any time. When you choose to delete a file, it is permanently deleted from both our Supabase tables and our Cloudinary storage buckets.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-6">
              4. Contact Us
            </h2>
            <p>
              If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <a href="mailto:bikotresor123@gmail.com" className="text-primary-500 underline">bikotresor123@gmail.com</a> or visit our <Link href="/contact" className="text-primary-500 underline">Contact Page</Link>.
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer copyright */}
      <div className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500 z-10">
        &copy; {new Date().getFullYear()} Fyliolabs by Objective-Dev. All rights reserved.
      </div>
    </div>
  );
}
