import type { ReactNode } from "react";
import { ArrowRight, Loader2, LockKeyhole, RefreshCw, ShieldAlert, UserRoundX, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export type AccessState = "checking" | "allowed" | "sign-in" | "wrong-account" | "unavailable";

interface AccessCardProps {
  state: Exclude<AccessState, "allowed">;
  /** e.g. "Customer portal" */
  portalLabel: string;
  /** e.g. "customer" -> "a ScholarDesk customer account" */
  accountNoun: string;
  markSrc: string;
  signInHref: string;
  register?: { href: string; label: string } | undefined;
  /** Email of the account that is signed in but not allowed here. */
  signedInAs?: string | null | undefined;
  onRetry: () => void;
  onSwitchAccount?: (() => void) | undefined;
  switching?: boolean | undefined;
  /** Shown under the actions, e.g. support link. */
  footer?: ReactNode;
  /** fullscreen = no surrounding app shell. */
  variant?: "inline" | "fullscreen";
}

const COPY = {
  "sign-in": {
    icon: LockKeyhole,
    title: "Sign in to continue",
    detail: (noun: string) =>
      `This page is part of your ScholarDesk ${noun} workspace. Sign in and we'll bring you straight back here.`,
  },
  "wrong-account": {
    icon: UserRoundX,
    title: "This account can't open this page",
    detail: (noun: string) =>
      `You're signed in, but not with a ScholarDesk ${noun} account. Switch to the right account and we'll bring you back here.`,
  },
  unavailable: {
    icon: WifiOff,
    title: "We couldn't confirm your access",
    detail: () =>
      "This is usually a brief connection problem. Check your internet connection and try again.",
  },
} as const;

/**
 * Professional, branded access gate shared by the ScholarDesk portals.
 * Purely presentational: the API decides access (see PortalAccess).
 */
export function AccessCard(props: AccessCardProps) {
  const wrapper =
    props.variant === "fullscreen"
      ? "flex min-h-screen items-center justify-center bg-background px-4 py-12"
      : "flex min-h-[32rem] items-center justify-center px-2 py-10";

  if (props.state === "checking") {
    return (
      <div className={wrapper} aria-live="polite" aria-busy="true">
        <div className="flex flex-col items-center gap-4 text-center">
          <img src={props.markSrc} alt="" className="size-12 animate-pulse rounded-xl object-contain" />
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Checking your access…
          </p>
        </div>
      </div>
    );
  }

  const copy = COPY[props.state];
  const Icon = copy.icon;

  return (
    <div className={wrapper}>
      <section
        role="alert"
        aria-live="assertive"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-lg"
      >
        <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-6 py-4">
          <img src={props.markSrc} alt="ScholarDesk" className="size-8 rounded-lg object-contain" />
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold">ScholarDesk</p>
            <p className="text-xs text-muted-foreground">{props.portalLabel}</p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            <ShieldAlert className="size-3" aria-hidden="true" /> Secure area
          </span>
        </div>

        <div className="px-6 py-7 sm:px-8">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-6" aria-hidden="true" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">{copy.title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.detail(props.accountNoun)}</p>

          {props.state === "wrong-account" && props.signedInAs && (
            <p className="mt-4 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              Signed in as <span className="font-semibold text-foreground">{props.signedInAs}</span>
            </p>
          )}

          <div className="mt-7 flex flex-col gap-2.5">
            {props.state === "sign-in" && (
              <>
                <Button asChild size="lg" className="w-full">
                  <a href={props.signInHref}>
                    Sign in <ArrowRight className="size-4" aria-hidden="true" />
                  </a>
                </Button>
                {props.register && (
                  <Button asChild size="lg" variant="outline" className="w-full">
                    <a href={props.register.href}>{props.register.label}</a>
                  </Button>
                )}
              </>
            )}

            {props.state === "wrong-account" && (
              <>
                <Button
                  size="lg"
                  className="w-full"
                  disabled={props.switching}
                  onClick={props.onSwitchAccount}
                >
                  {props.switching ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
                  Switch account
                </Button>
                <Button size="lg" variant="outline" className="w-full" onClick={props.onRetry}>
                  <RefreshCw className="size-4" aria-hidden="true" /> Check again
                </Button>
              </>
            )}

            {props.state === "unavailable" && (
              <Button size="lg" className="w-full" onClick={props.onRetry}>
                <RefreshCw className="size-4" aria-hidden="true" /> Try again
              </Button>
            )}
          </div>

          {props.footer && <div className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">{props.footer}</div>}
        </div>
      </section>
    </div>
  );
}
