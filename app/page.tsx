import Link from "next/link";
import { ArrowRight, Clock, Users, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Navbar from "@/components/shared/Navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-normal mb-6">
            Share Text in
            <span className="text-slate-700 block"> Real-Time</span>
          </h1>
          <p className="text-lg text-slate-500 mb-14 max-w-2xl mx-auto">
            Collaborate instantly with temporary rooms. No signup required.
            Perfect for quick text sharing and team collaboration.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rooms">
              <Button
                size="lg"
                variant="default"
                className="group transition-all duration-300 hover:-translate-y-0.5"
              >
                Browse Active Rooms
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>

            <Link href="/join">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-400"
              >
                Join Existing Room
              </Button>
            </Link>
          </div>

          <div className="mt-16 text-sm text-slate-500">
            No account needed • Temporary rooms • Free forever
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 mb-6">
              Why TextShare Live?
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Everything you need for seamless real-time text collaboration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 py-8">
              <CardHeader className="flex flex-col items-center text-center pb-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg mb-6">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">
                  Real-Time Sync
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <CardDescription className="text-slate-500 leading-relaxed">
                  See changes instantly as multiple people edit the same text
                  simultaneously.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 py-8">
              <CardHeader className="flex flex-col items-center text-center pb-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg mb-6">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">
                  Temporary Rooms
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <CardDescription className="text-slate-500 leading-relaxed">
                  Set custom expiration timers or let rooms auto-delete after 24
                  hours of inactivity.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 py-8">
              <CardHeader className="flex flex-col items-center text-center pb-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">
                  Team Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <CardDescription className="text-slate-500 leading-relaxed">
                  Built-in chat and participant tracking. Perfect for quick team
                  discussions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 py-8">
              <CardHeader className="flex flex-col items-center text-center pb-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg mb-6">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">
                  No Registration
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <CardDescription className="text-slate-500 leading-relaxed">
                  Jump right in without creating an account. Your privacy
                  matters to us.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 TextShare Live. Made with React, Node.js, and MongoDB.</p>
          {/* <div className="flex items-center justify-center gap-6 mt-4">
            <Link href="/rooms" className="hover:text-foreground">
              Active Rooms
            </Link>
            <Link href="/join" className="hover:text-foreground">
              Join Room
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </a>
          </div> */}
        </div>
      </footer>
    </div>
  );
}
