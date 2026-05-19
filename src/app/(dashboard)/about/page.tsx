"use client";

import { Info, Globe, Github, Instagram, Linkedin, Code2, Award, Users, Heart } from "lucide-react";
import Link from "next/link";

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
              <Github className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
              <span>github.com/tres9lo</span>
            </Link>

            {/* LinkedIn */}
            <Link
              href="https://www.linkedin.com/in/tresor-dev-biko-4671b6361"
              target="_blank"
              className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors text-gray-700 dark:text-gray-300 font-medium text-xs group cursor-pointer"
            >
              <Linkedin className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
              <span>LinkedIn Profile</span>
            </Link>

            {/* Personal Instagram */}
            <Link
              href="https://instagram.com/_.iamtres"
              target="_blank"
              className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors text-gray-700 dark:text-gray-300 font-medium text-xs group cursor-pointer"
            >
              <Instagram className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
              <span>@_.iamtres (Personal)</span>
            </Link>

            {/* Company Instagram */}
            <Link
              href="https://instagram.com/_objectiv"
              target="_blank"
              className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors text-gray-700 dark:text-gray-300 font-medium text-xs group cursor-pointer"
            >
              <Instagram className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
              <span>@_objectiv (Company)</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
