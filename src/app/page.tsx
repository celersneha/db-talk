/**
 * Landing Page
 * Professional landing page with dark neon green theme
 */

import Link from "next/link";
import {
  Database,
  MessageSquare,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Gradient background effect */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation Bar */}
      <nav className="border-b border-border backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">DB-Talk</span>
          </div>
          <Link
            href="/chat"
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/50"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-20 pb-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card mb-8 hover:border-primary/50 transition-colors">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Powered by AI & PostgreSQL
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            Chat with Your
            <span className="block bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
              Database
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Ask questions in natural language. Get SQL queries instantly. Access
            your PostgreSQL database the way you always wanted to.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/chat"
              className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/50 hover:shadow-xl hover:shadow-primary/60 transform hover:-translate-y-1"
            >
              <MessageSquare className="w-6 h-6" />
              Start Chatting Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-3 border border-border px-8 py-4 rounded-xl text-lg font-semibold hover:bg-card transition-all"
            >
              Learn More
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-8 py-12 border-y border-border">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">100%</div>
              <p className="text-muted-foreground">Read-Only Safe</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">Real-time</div>
              <p className="text-muted-foreground">Query Results</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">Secure</div>
              <p className="text-muted-foreground">No Data Logging</p>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to interact with your database naturally
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Feature 1 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
              <div className="relative bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-all">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">
                  Natural Language Queries
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Ask questions in plain English. Our AI converts them to
                  optimized SQL automatically.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Simple & intuitive queries
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Complex joins & aggregations
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
              <div className="relative bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-all">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">
                  100% Read-Only
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Only SELECT queries are allowed. Your data is completely safe.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    No write operations
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Automatic safety checks
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
              <div className="relative bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-all">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">
                  PostgreSQL Native
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Connect to any PostgreSQL database. Stateless design, no setup
                  needed.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Any PostgreSQL version
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Remote connections
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
              <div className="relative bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-all">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">
                  Conversational
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Chat naturally with your data. Follow-up questions, refine
                  results, explore further.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Multi-turn conversation
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Context aware
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Full-width feature */}
          <div className="group relative mt-12">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            <div className="relative bg-card border border-border rounded-2xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-3xl font-bold mb-4 text-foreground">
                    Real-Time SQL Generation
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed text-lg">
                    Watch as your questions are transformed into optimized SQL
                    queries in real-time. See the exact SQL being executed and
                    understand your database better.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">
                        See generated SQL queries
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">
                        Instant results with explanations
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">
                        Learn SQL naturally
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-secondary rounded-xl p-6 border border-border font-mono text-sm">
                  <div className="text-primary mb-4 font-bold">
                    Query Example:
                  </div>
                  <code className="text-muted-foreground break-all">
                    <span className="text-primary">SELECT</span> name, email
                    <br />
                    <span className="text-primary">FROM</span> users
                    <br />
                    <span className="text-primary">WHERE</span> created_at &gt;
                    &apos;2024-01-01&apos;
                    <br />
                    <span className="text-primary">ORDER BY</span> created_at
                    <br />
                    <span className="text-primary">DESC LIMIT</span> 10;
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-card border border-border rounded-2xl p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                Ready to Chat with Your Data?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Connect your PostgreSQL database and start asking questions in
                natural language.
              </p>
              <Link
                href="/chat"
                className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-10 py-4 rounded-xl text-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/50 hover:shadow-xl hover:shadow-primary/60 transform hover:-translate-y-1"
              >
                <MessageSquare className="w-6 h-6" />
                Connect Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">DB-Talk</span>
              </div>
              <p className="text-muted-foreground">
                Chat with your PostgreSQL database using natural language.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="#features"
                    className="hover:text-primary transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="hover:text-primary transition-colors"
                  >
                    Security
                  </a>
                </li>
                <li>
                  <a
                    href="/chat"
                    className="hover:text-primary transition-colors"
                  >
                    Get Started
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Technology</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>Next.js & TypeScript</li>
                <li>Vercel AI SDK</li>
                <li>PostgreSQL</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-muted-foreground text-sm">
            <p>
              © 2026 DB-Talk. All rights reserved. Built with ❤️ for data
              lovers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
