"use client";

import { useState } from "react";
import { Mail, Phone, Globe, MessageSquare, Send } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Message dispatched successfully!", {
          description: "Trésor Biko will respond to your inquiry within 12 hours.",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(result.error || "Failed to dispatch ticket. Please try again.");
      }
    } catch {
      toast.error("Network interface error. Please check your connectivity.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in select-none">
      {/* Ambient Top Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] glass p-8 shadow-sm bg-surface">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 dark:bg-primary-500/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="space-y-3 relative z-10">
          <span className="text-[10px] bg-primary-100 dark:bg-primary-950/50 text-primary-700 dark:text-primary-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Support Center
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Get in Touch
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
            Have questions about Objective-Dev products or need custom enterprise software? Drop us a line below or reach out directly via our verified communication nodes.
          </p>
        </div>
      </div>

      {/* Main Grid: Info Cards + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Direct Indexes */}
        <div className="space-y-4 lg:col-span-1">
          {/* Email Card */}
          <div className="glass p-6 rounded-2xl border border-[var(--border)] bg-surface flex gap-4 items-start hover:scale-[1.01] transition-transform duration-300">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
              <Mail className="h-5 w-5 text-blue-500" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Node</span>
              <h4 className="font-extrabold text-gray-950 dark:text-white text-sm">Direct Inquiry</h4>
              <Link
                href="mailto:bikotresor123@gmail.com"
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline block"
              >
                bikotresor123@gmail.com
              </Link>
            </div>
          </div>

          {/* Telephone Card */}
          <div className="glass p-6 rounded-2xl border border-[var(--border)] bg-surface flex gap-4 items-start hover:scale-[1.01] transition-transform duration-300">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              <Phone className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Hotline</span>
              <h4 className="font-extrabold text-gray-950 dark:text-white text-sm">Direct Phone</h4>
              <Link
                href="tel:+250791730752"
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline block font-semibold"
              >
                +250 791 730 752
              </Link>
            </div>
          </div>

          {/* Enterprise Web Card */}
          <div className="glass p-6 rounded-2xl border border-[var(--border)] bg-surface flex gap-4 items-start hover:scale-[1.01] transition-transform duration-300">
            <div className="p-3 bg-violet-50 dark:bg-violet-950/20 rounded-xl border border-violet-100 dark:border-violet-900/30">
              <Globe className="h-5 w-5 text-violet-500" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Web Domain</span>
              <h4 className="font-extrabold text-gray-950 dark:text-white text-sm">Objective-Dev</h4>
              <Link
                href="https://objective-dev.vercel.app"
                target="_blank"
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline block"
              >
                objective-dev.vercel.app
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="glass p-8 rounded-2xl border border-[var(--border)] bg-surface space-y-5 shadow-sm relative"
          >
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
              <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                  Dispatch Message
                </h3>
                <p className="text-xs text-gray-500">Send an encrypted support ticket to our engineering desk</p>
              </div>
            </div>

            {/* Inputs grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Your Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Trésor Biko"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[var(--surface-muted)] text-gray-900 dark:text-white border border-[var(--border)] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="bikotresor123@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-[var(--surface-muted)] text-gray-900 dark:text-white border border-[var(--border)] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Subject (Optional)
              </label>
              <input
                type="text"
                placeholder="Product Partnership / Enterprise Request"
                value={formData.subject}
                onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                className="w-full bg-[var(--surface-muted)] text-gray-900 dark:text-white border border-[var(--border)] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Message Body <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                placeholder="Write your support ticket or inquiry details here..."
                value={formData.message}
                onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                className="w-full bg-[var(--surface-muted)] text-gray-900 dark:text-white border border-[var(--border)] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary-500 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Submission button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-55 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary-500/25 active:scale-[0.99] cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="h-4.5 w-4.5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-1" />
                  Routing Ticket...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Dispatch Ticket
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
