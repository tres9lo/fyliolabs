"use client";

import { Info, Globe, Code2, Award, Users, Heart } from "lucide-react";
import Link from "next/link";

// Custom premium brand SVG icons for perfect compiler compatibility
const GithubIcon = (props: React.ComponentProps<"svg">) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon = (props: React.ComponentProps<"svg">) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const InstagramIcon = (props: React.ComponentProps<"svg">) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export default function AboutPage() {
  return (
    <div className="space-y-8 animate-fade-in select-none">
      {/* Premium Ambient Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] glass p-8 shadow-sm bg-surface">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 dark:bg-primary-500/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <span className="text-[10px] bg-primary-100 dark:bg-primary-950/50 text-primary-700 dark:text-primary-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              About the Creator
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Objective-Dev
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
              We engineer beautiful digital products, Cloud orchestration platforms, and fluid developer tools. Led by Trésor Dev Biko, we combine elite aesthetic standards with top-tier technical robustness.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              href="https://objective-dev.vercel.app"
              target="_blank"
              className="flex items-center gap-2 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary-500/20 active:scale-95 cursor-pointer"
            >
              <Globe className="h-4 w-4" />
              Visit Objective-Dev
            </Link>
            <Link
              href="https://tresor-dev.vercel.app"
              target="_blank"
              className="flex items-center gap-2 py-2.5 px-4 border border-[var(--border)] bg-surface-muted hover:bg-[var(--border)] text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              <Code2 className="h-4 w-4" />
              Personal Portfolio
            </Link>
          </div>
        </div>
      </div>

      {/* Core values and stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border border-[var(--border)] space-y-3 bg-surface">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 w-fit rounded-xl border border-emerald-100 dark:border-emerald-900/30">
            <Award className="h-5 w-5 text-emerald-500" />
          </div>
          <h4 className="font-extrabold text-gray-900 dark:text-white">Elite Craftsmanship</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            We reject the minimum viable standard. We implement custom design systems, vibrant transitions, and crisp styling blocks to amaze users.
          </p>
        </div>

        <div className="glass p-6 rounded-2xl border border-[var(--border)] space-y-3 bg-surface">
          <div className="p-3 bg-violet-50 dark:bg-violet-950/20 w-fit rounded-xl border border-violet-100 dark:border-violet-900/30">
            <Users className="h-5 w-5 text-violet-500" />
          </div>
          <h4 className="font-extrabold text-gray-900 dark:text-white">Developer-First Focus</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            From fluid code editors, markdown document compilation pipelines, to clean cloud storage widgets, our tools are built for modern web creators.
          </p>
        </div>

        <div className="glass p-6 rounded-2xl border border-[var(--border)] space-y-3 bg-surface">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 w-fit rounded-xl border border-amber-100 dark:border-amber-900/30">
            <Heart className="h-5 w-5 text-amber-500" />
          </div>
          <h4 className="font-extrabold text-gray-900 dark:text-white">Secure Orchestration</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            We securely encrypt and preserve your local cloudinary secrets, providing direct database security so you can upload with confidence.
          </p>
        </div>
      </div>

      {/* Leadership Spotlight & Social Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Founder Bio Card */}
        <div className="glass p-6 rounded-2xl border border-[var(--border)] space-y-4 bg-surface relative overflow-hidden">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            Founder & Architect
          </h3>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gradient-to-tr from-primary-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-black shadow-md">
              TB
            </div>
            <div>
              <h4 className="font-extrabold text-gray-900 dark:text-white">Trésor Dev Biko</h4>
              <p className="text-xs text-gray-400">Chief Engineer, Objective-Dev</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pt-2">
            Trésor is a full-stack engineer and digital product designer specializing in robust cloud networks, modern Next.js systems, and premium design aesthetics. Under his guidance, Objective-Dev ships beautiful, secure architectures.
          </p>
        </div>

        {/* Corporate & Personal Social Indexes */}
        <div className="glass p-6 rounded-2xl border border-[var(--border)] space-y-4 bg-surface">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            Connect & Follow
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Github */}
            <Link
              href="https://github.com/tres9lo"
              target="_blank"
              className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors text-gray-700 dark:text-gray-300 font-medium text-xs group cursor-pointer"
            >
              <GithubIcon className="h-4.5 w-4.5 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0" />
              <span className="truncate">github.com/tres9lo</span>
            </Link>

            {/* LinkedIn */}
            <Link
              href="https://www.linkedin.com/in/tresor-dev-biko-4671b6361"
              target="_blank"
              className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors text-gray-700 dark:text-gray-300 font-medium text-xs group cursor-pointer"
            >
              <LinkedinIcon className="h-4.5 w-4.5 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0" />
              <span className="truncate">LinkedIn Profile</span>
            </Link>

            {/* Personal Instagram */}
            <Link
              href="https://instagram.com/_.iamtres"
              target="_blank"
              className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors text-gray-700 dark:text-gray-300 font-medium text-xs group cursor-pointer"
            >
              <InstagramIcon className="h-4.5 w-4.5 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0" />
              <span className="truncate">@_.iamtres (Personal)</span>
            </Link>

            {/* Company Instagram */}
            <Link
              href="https://instagram.com/_objectiv"
              target="_blank"
              className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors text-gray-700 dark:text-gray-300 font-medium text-xs group cursor-pointer"
            >
              <InstagramIcon className="h-4.5 w-4.5 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0" />
              <span className="truncate">@_objectiv (Company)</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
