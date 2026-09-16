import { Wrench, Mail } from "lucide-react";

/** Full-screen maintenance mode — shown when the site is temporarily closed. */
const Maintenance = () => (
  <div className="min-h-screen bg-primary flex items-center justify-center px-4">
    <div className="text-center max-w-lg">
      <Wrench className="w-16 h-16 text-accent mx-auto mb-6" />
      <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
        Be right back
      </p>
      <h1 className="font-heading text-4xl sm:text-5xl tracking-wider text-primary-foreground mb-6">
        We're Making Something Better
      </h1>
      <p className="font-body text-primary-foreground/70 text-lg mb-8">
        The Time Is Now is temporarily down for scheduled maintenance. This usually takes just a
        few minutes — please refresh shortly.
      </p>
      <a
        href="mailto:hello@thetimeisnow.org"
        className="inline-flex items-center gap-2 text-accent hover:underline font-body"
      >
        <Mail className="w-4 h-4" /> hello@thetimeisnow.org
      </a>
      <p className="font-display italic text-primary-foreground/50 mt-10">
        "Is your timidity worth someone else's eternity?"
      </p>
    </div>
  </div>
);

export default Maintenance;
