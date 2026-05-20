"use client";

import Link from "next/link";
import { ArrowLeft, FileText, AlertCircle, Gavel, Ban, RefreshCw, Mail } from "lucide-react";
import Logo from "@/components/ui/logo";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-indigo-500/10 to-primary-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-rose-500/10 to-primary-500/10 blur-3xl pointer-events-none" />

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

        {/* Main Content Card */}
        <div className="glass p-8 sm:p-12 rounded-3xl border border-[var(--border)] shadow-xl space-y-8 backdrop-blur-2xl">
          <div className="space-y-4">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 dark:text-indigo-400">
              <Gavel className="h-6 w-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white font-display">
              Terms & Conditions
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Last Updated: May 20, 2026 &nbsp;&middot;&nbsp; Effective immediately upon registration.
            </p>
          </div>

          <div className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 space-y-6">
            <p>
              Please read these Terms and Conditions carefully before using <strong>Fyliolabs</strong> (<a href="https://fyliolabs.vercel.app" className="text-primary-500 underline">fyliolabs.vercel.app</a>), a cloud storage and file orchestration platform operated by <strong>Objective-Dev</strong>. By accessing or using Fyliolabs, you agree to be bound by these terms.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mt-6">
              <FileText className="h-4 w-4 text-primary-500" /> 1. Acceptance of Terms
            </h2>
            <p>
              By creating an account and using Fyliolabs, you confirm that you are at least 13 years old, have read and agree to these Terms, and agree to our <Link href="/privacy" className="text-primary-500 underline">Privacy Policy</Link>. If you do not agree to these terms, please refrain from using the platform.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mt-6">
              <Gavel className="h-4 w-4 text-indigo-500" /> 2. Description of Service
            </h2>
            <p>
              Fyliolabs provides a secure, multi-tenant cloud storage workspace with the following core features:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Secure file upload and cloud storage management via Cloudinary and Supabase</li>
              <li>Folder and directory creation and organization tools</li>
              <li>Media, image, video, and audio format conversion (e.g. JPG → WEBP, MP4 → WEBM, WAV → MP3)</li>
              <li>A Microsoft Word-style interactive document canvas for in-browser document editing</li>
              <li>A live browser-based code IDE with syntax-highlighted themes (One Dark Pro, Dracula, Monokai)</li>
              <li>Multilingual interface (English, French, Swahili, Kinyarwanda)</li>
              <li>Real-time activity logs and storage diagnostics</li>
            </ul>
            <p>
              We reserve the right to modify, suspend, or discontinue any feature of the service at any time with or without notice.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mt-6">
              <Ban className="h-4 w-4 text-red-500" /> 3. Prohibited Use
            </h2>
            <p>
              You agree not to use Fyliolabs to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Upload, store, or transmit illegal, harmful, abusive, or infringing content</li>
              <li>Attempt to gain unauthorized access to other users&apos; data or to our infrastructure</li>
              <li>Use the platform for malware distribution, phishing, or fraudulent purposes</li>
              <li>Reverse-engineer, decompile, or extract source code from the platform</li>
              <li>Violate any applicable local, national, or international laws or regulations</li>
            </ul>
            <p>
              Violations may result in immediate account suspension or termination without notice.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mt-6">
              <AlertCircle className="h-4 w-4 text-amber-500" /> 4. Intellectual Property
            </h2>
            <p>
              All content uploaded to your workspace remains your intellectual property. You grant Fyliolabs a limited, non-exclusive, revocable license to store and process your content solely for the purpose of providing the service. The Fyliolabs platform, branding, UI designs, and codebase are the exclusive intellectual property of Objective-Dev.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mt-6">
              <AlertCircle className="h-4 w-4 text-orange-500" /> 5. Disclaimer of Warranties
            </h2>
            <p>
              Fyliolabs is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied, including but not limited to fitness for a particular purpose, availability, or error-free operation. We make reasonable efforts to ensure platform uptime and data integrity, but cannot guarantee uninterrupted service.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mt-6">
              <RefreshCw className="h-4 w-4 text-emerald-500" /> 6. Changes to Terms
            </h2>
            <p>
              Objective-Dev reserves the right to update these Terms and Conditions at any time. We will notify users of significant changes by updating the &quot;Last Updated&quot; date above. Continued use of the platform after changes constitutes acceptance of the updated terms.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mt-6">
              <Mail className="h-4 w-4 text-primary-500" /> 7. Contact & Governing Law
            </h2>
            <p>
              These Terms are governed by the laws applicable to the jurisdiction of Objective-Dev. For any questions or concerns regarding these Terms, please contact us at:
            </p>
            <div className="bg-[var(--surface-muted)] rounded-xl p-4 space-y-1 text-sm">
              <p><strong>Company:</strong> Objective-Dev</p>
              <p><strong>Email:</strong> <a href="mailto:bikotresor123@gmail.com" className="text-primary-500 underline">bikotresor123@gmail.com</a></p>
              <p><strong>Website:</strong> <a href="https://objective-dev.vercel.app" target="_blank" rel="noopener noreferrer" className="text-primary-500 underline">objective-dev.vercel.app</a></p>
              <p><strong>Contact page:</strong> <Link href="/contact" className="text-primary-500 underline">fyliolabs.vercel.app/contact</Link></p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500 z-10 space-y-2">
        <div className="flex justify-center gap-4">
          <Link href="/privacy" className="hover:text-primary-500 hover:underline transition-colors">Privacy Policy</Link>
          <span>&middot;</span>
          <Link href="/terms" className="text-primary-500 underline">Terms & Conditions</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} Fyliolabs by Objective-Dev. All rights reserved.</p>
      </div>
    </div>
  );
}
