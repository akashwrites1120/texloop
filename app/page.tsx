import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Asterisk,
  Check,
  Infinity as InfinityIcon,
  Lock,
  MessagesSquare,
  Timer,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/shared/Navbar";
import Reveal from "@/components/shared/Reveal";
import RotatingPhrase from "@/components/home/RotatingPhrase";
import HeroDemo from "@/components/home/HeroDemo";

const MARQUEE_ITEMS = [
  "CRDT-powered sync",
  "Yjs + Socket.IO",
  "Ephemeral by design",
  "No signup",
  "Password-protectable",
  "Auto-expiring rooms",
  "Built-in chat",
  "Open source",
];

const STEPS = [
  {
    n: "01",
    title: "Create a room",
    body: "One click. You get a shareable link and a room that lives on your terms.",
  },
  {
    n: "02",
    title: "Share the link",
    body: "Anyone with the link jumps in instantly. Lock it with a password if you like.",
  },
  {
    n: "03",
    title: "Type together",
    body: "Edits, chat and presence stream live. When you're done, the room fades away.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* ---------------------------------------------------------- */}
      {/* Hero                                                        */}
      {/* ---------------------------------------------------------- */}
      <section className="relative overflow-hidden pt-16">
        <div className="bg-dots mask-fade-y pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute top-[-20%] left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-brand/8 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center pt-16 pb-14 text-center sm:pt-24 sm:pb-20">
            <div className="animate-fade-up mb-7 flex items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-xs font-medium shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full animate-ping-slow rounded-full bg-brand" />
                <span className="relative h-2 w-2 rounded-full bg-brand" />
              </span>
              Live collaboration, zero signup
            </div>

            <h1 className="animate-fade-up font-display max-w-3xl text-4xl leading-[1.06] font-semibold tracking-tight sm:text-6xl md:text-7xl [animation-delay:80ms]">
              Share text
              <br />
              <span className="whitespace-nowrap">
                <RotatingPhrase />
              </span>
            </h1>

            <p
              className="animate-fade-up mt-6 max-w-xl text-base leading-relaxed text-muted-foreground text-balance sm:text-lg [animation-delay:160ms]"
            >
              Ephemeral rooms with live sync and built-in chat. Paste, drop a
              link, collaborate — everything disappears when you&apos;re done.
            </p>

            <div className="animate-fade-up mt-9 flex flex-col gap-3 sm:flex-row [animation-delay:240ms]">
              <Link href="/rooms">
                <Button
                  size="lg"
                  className="group h-12 rounded-full px-7 text-sm hover:cursor-pointer"
                >
                  Create a room
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/join">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full px-7 text-sm hover:cursor-pointer hover:bg-accent hover:text-accent-foreground"
                >
                  Join with a code
                </Button>
              </Link>
            </div>

            <div className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground [animation-delay:320ms]">
              {["Free forever", "Rooms auto-expire", "Nothing to install"].map(
                (item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-brand" />
                    {item}
                  </span>
                )
              )}
            </div>
          </div>

          <Reveal immediate delay={200} className="mx-auto max-w-4xl pb-16 sm:pb-24">
            <HeroDemo />
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Marquee                                                     */}
      {/* ---------------------------------------------------------- */}
      <section className="border-y py-5">
        <div className="mask-fade-x overflow-hidden">
          <div className="animate-marquee flex w-max items-center gap-8 pr-8">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span
                key={i}
                className="flex items-center gap-8 text-sm font-medium whitespace-nowrap text-muted-foreground"
              >
                {item}
                <Asterisk className="h-4 w-4 text-brand/60" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Features — bento                                            */}
      {/* ---------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <Reveal className="mb-14 max-w-2xl">
          <p className="font-mono text-xs tracking-widest text-brand uppercase">
            why texloop
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
            Everything you need. Nothing you don&apos;t.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:gap-5">
          {/* Sync — large */}
          <Reveal className="md:col-span-3" delay={0}>
            <div className="ring-hairline group relative flex h-full flex-col overflow-hidden rounded-2xl bg-card p-7 transition-transform duration-300 hover:-translate-y-1">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-muted text-accent-foreground">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold">
                Real-time sync
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                CRDT-based editing means every keystroke lands on every device
                — no refresh, no conflicts, no merge hell.
              </p>

              {/* Traveling pulse visual */}
              <div className="mt-auto pt-8">
                <div className="relative flex items-center justify-between rounded-xl border bg-muted/40 px-5 py-4">
                  <span className="z-10 h-2.5 w-2.5 rounded-full bg-primary" />
                  <div className="absolute inset-x-8 mx-3 border-t border-dashed border-border" />
                  <span className="animate-travel-x absolute top-1/2 -translate-y-1/2">
                    <span className="block h-2 w-2 rounded-full bg-brand" />
                  </span>
                  <span className="z-10 h-2.5 w-2.5 rounded-full bg-brand" />
                </div>
                <div className="mt-3 flex justify-between font-mono text-[10px] text-muted-foreground">
                  <span>you.type(“hello”)</span>
                  <span>them sees “hello”</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Ephemeral */}
          <Reveal className="md:col-span-3" delay={80}>
            <div className="ring-hairline group relative flex h-full flex-col overflow-hidden rounded-2xl bg-card p-7 transition-transform duration-300 hover:-translate-y-1">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <Timer className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold">
                Rooms that self-destruct
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Set a countdown or let idle rooms expire. Your data is temporary
                by default — privacy without thinking about it.
              </p>
              <div className="mt-auto pt-8">
                <div className="rounded-xl border bg-muted/40 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      auto-deletion
                    </span>
                    <span className="font-mono text-xs font-medium">24h</span>
                  </div>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-border">
                    <div className="animate-progress-loop h-full rounded-full bg-brand" />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Chat */}
          <Reveal className="md:col-span-2" delay={0}>
            <div className="ring-hairline group flex h-full flex-col overflow-hidden rounded-2xl bg-card p-7 transition-transform duration-300 hover:-translate-y-1">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <MessagesSquare className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold">Chat beside the text</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Talk it through without leaving the room.
              </p>
              <div className="mt-auto space-y-2 pt-6">
                <div className="w-fit max-w-full rounded-xl rounded-bl-sm border bg-background px-3 py-1.5 text-xs">
                  push to main?
                </div>
                <div className="ml-auto w-fit rounded-xl rounded-br-sm bg-primary px-3 py-1.5 text-xs text-primary-foreground">
                  on it — 2 min
                </div>
              </div>
            </div>
          </Reveal>

          {/* Private */}
          <Reveal className="md:col-span-2" delay={80}>
            <div className="ring-hairline group flex h-full flex-col overflow-hidden rounded-2xl bg-card p-7 transition-transform duration-300 hover:-translate-y-1">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold">Private when it matters</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Password-gate any room in one toggle.
              </p>
              <div className="mt-auto pt-6">
                <div className="flex items-center gap-2 rounded-xl border bg-muted/40 px-4 py-3">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-mono text-xs tracking-[0.25em] text-muted-foreground select-none">
                    ••••••••
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Zero friction */}
          <Reveal className="md:col-span-2" delay={160}>
            <div className="ring-hairline group flex h-full flex-col overflow-hidden rounded-2xl bg-card p-7 transition-transform duration-300 hover:-translate-y-1">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-muted text-accent-foreground">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold">Zero friction</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                No accounts, no downloads, no onboarding tour.
              </p>
              <div className="mt-auto flex items-end gap-2 pt-6">
                <span className="font-display text-5xl leading-none font-semibold text-brand">
                  0
                </span>
                <span className="pb-1 text-xs text-muted-foreground">
                  forms between you
                  <br /> and a shared page
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* How it works                                                */}
      {/* ---------------------------------------------------------- */}
      <section className="border-t bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <Reveal className="mb-14 max-w-2xl">
            <p className="font-mono text-xs tracking-widest text-brand uppercase">
              how it works
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
              Three steps. About ten seconds.
            </h2>
          </Reveal>

          <div className="relative grid gap-10 md:grid-cols-3 md:gap-6">
            <div className="absolute top-6 right-[12%] left-[12%] hidden border-t border-dashed md:block" />
            {STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 120} className="relative">
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border bg-card font-mono text-sm font-medium shadow-sm">
                  {step.n}
                </div>
                <h3 className="font-display mt-5 text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* CTA                                                         */}
      {/* ---------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground sm:px-12 sm:py-20">
            <div className="bg-dots pointer-events-none absolute inset-0 opacity-[0.15] invert" />
            <h2 className="font-display relative mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              Your next shared document is one click away.
            </h2>
            <p className="relative mx-auto mt-4 max-w-md text-sm text-primary-foreground/70 sm:text-base">
              Open a room, paste your text, send the link. It really is that
              fast.
            </p>
            <div className="relative mt-9">
              <Link href="/rooms">
                <Button
                  size="lg"
                  className="group h-12 rounded-full bg-background px-8 text-sm text-primary hover:bg-background/90 hover:cursor-pointer"
                >
                  Get started — free
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Footer                                                      */}
      {/* ---------------------------------------------------------- */}
      <footer className="mt-auto border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:flex-row sm:px-6 sm:text-left">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <InfinityIcon className="h-3.5 w-3.5" strokeWidth={2.4} />
            </span>
            <span className="font-display text-sm font-semibold">TexLoop</span>
          </div>
          <p className="text-xs text-muted-foreground">
            The internet&apos;s scratchpad — here when you need it, gone when
            you don&apos;t.
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} TexLoop
          </p>
        </div>
      </footer>
    </div>
  );
}
