import Link from 'next/link';
import { ArrowRight, Clock, Users, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/shared/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Share Text in
            <span className="text-primary"> Real-Time</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Collaborate instantly with temporary rooms. No signup required.
            Perfect for quick text sharing and team collaboration.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rooms">
              <Button size="lg" className="gap-2">
                Browse Active Rooms
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/join">
              <Button size="lg" variant="outline">
                Join Existing Room
              </Button>
            </Link>
          </div>

          <div className="mt-12 text-sm text-muted-foreground">
            No account needed • Temporary rooms • Free forever
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why TextShare Live?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Real-Time Sync</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  See changes instantly as multiple people edit the same text simultaneously.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Temporary Rooms</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Set custom expiration timers or let rooms auto-delete after 24 hours of inactivity.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Team Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Built-in chat and participant tracking. Perfect for quick team discussions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>No Registration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Jump right in without creating an account. Your privacy matters to us.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 TextShare Live. Made with React, Node.js, and MongoDB.</p>
          <div className="flex items-center justify-center gap-6 mt-4">
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
          </div>
        </div>
      </footer>
    </div>
  );
}