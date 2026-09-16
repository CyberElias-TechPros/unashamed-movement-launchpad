import { ReactNode } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { SEO } from "@/components/SEO";

const LEGAL_UPDATED = "September 16, 2026";

const LegalShell = ({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) => (
  <Layout>
    <SEO title={title} description={intro} />
    <section className="section-padding bg-primary pt-28 pb-16">
      <div className="container-custom max-w-3xl">
        <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-2">Legal</p>
        <h1 className="font-heading text-4xl sm:text-5xl tracking-wider text-primary-foreground">
          {title}
        </h1>
        <p className="text-primary-foreground/70 font-body mt-4 max-w-2xl">{intro}</p>
        <p className="text-primary-foreground/50 font-body text-sm mt-3">
          Last updated: {LEGAL_UPDATED}
        </p>
      </div>
    </section>
    <section className="section-padding bg-background">
      <div className="container-custom max-w-3xl">
        <div className="prose prose-neutral max-w-none space-y-6 text-foreground [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:tracking-wide [&_h2]:mt-10 [&_h3]:font-heading [&_li]:font-body [&_p]:font-body">
          {children}
        </div>
        <div className="mt-12 pt-8 border-t border-border text-sm text-muted-foreground flex flex-wrap gap-4">
          <Link to="/privacy" className="hover:text-accent">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-accent">Terms of Service</Link>
          <Link to="/refunds" className="hover:text-accent">Refund Policy</Link>
          <Link to="/cookies" className="hover:text-accent">Cookie Notice</Link>
          <Link to="/contact" className="hover:text-accent">Contact Us</Link>
        </div>
      </div>
    </section>
  </Layout>
);

/* ------------------------------------------------------------------ */

export const PrivacyPolicy = () => (
  <LegalShell
    title="Privacy Policy"
    intro="How The Time Is Now collects, uses, and protects your personal information."
  >
    <h2>Who we are</h2>
    <p>
      The Time Is Now (“TTIN”, “we”, “us”) is a faith-based movement operating this website. You
      can reach us at <a href="mailto:hello@thetimeisnow.org" className="text-accent hover:underline">hello@thetimeisnow.org</a>.
    </p>

    <h2>Information we collect</h2>
    <ul className="list-disc pl-6 space-y-2">
      <li><strong>Account data:</strong> name, email address, and password (stored only as a cryptographic hash) when you create an account.</li>
      <li><strong>Order data:</strong> name, email, shipping address, items purchased, and payment status. Card details are processed by Stripe, Paystack, or Flutterwave and <strong>never touch our servers</strong>.</li>
      <li><strong>Donation data:</strong> name (optional), email, amount, and payment status. Donations may be made anonymously.</li>
      <li><strong>Message data:</strong> the name, email, and message you send through our contact form, and event-registration details.</li>
      <li><strong>Usage data:</strong> anonymous analytics events (pages viewed, buttons clicked) that help us understand what's working.</li>
    </ul>

    <h2>How we use it</h2>
    <ul className="list-disc pl-6 space-y-2">
      <li>To process orders, deliver digital purchases, and send order/receipt emails.</li>
      <li>To create and secure your account (verification and password-reset emails).</li>
      <li>To send the newsletter you subscribed to — with one-click unsubscribe in every email.</li>
      <li>To reply to your messages and confirm event registrations.</li>
      <li>To improve the site through aggregated, anonymous analytics.</li>
    </ul>

    <h2>What we never do</h2>
    <p>
      We never sell, rent, or trade your personal information. We never send unrelated marketing
      to transactional addresses. We never store card numbers.
    </p>

    <h2>Sharing</h2>
    <p>
      We share data only with the processors required to run the site: our payment providers
      (Stripe, Paystack, Flutterwave), our email sender (Resend), and our infrastructure
      (Cloudflare). Each is bound by its own privacy policy to process data only on our behalf.
    </p>

    <h2>Your rights</h2>
    <p>
      Depending on where you live (including under GDPR and the Nigeria Data Protection Act),
      you may request access, correction, export, or deletion of your personal data at any time.
      Email <a href="mailto:hello@thetimeisnow.org" className="text-accent hover:underline">hello@thetimeisnow.org</a> and
      we'll respond within 30 days.
    </p>

    <h2>Retention &amp; security</h2>
    <p>
      Account and order data is kept while your account is active or as needed for tax/accounting
      (typically up to 7 years). Passwords are hashed; authentication uses signed, HTTP-only
      cookies; and all traffic is served over HTTPS.
    </p>

    <h2>Children</h2>
    <p>The site is not directed at children under 13, and we don't knowingly collect their data.</p>
  </LegalShell>
);

export const TermsOfService = () => (
  <LegalShell
    title="Terms of Service"
    intro="The agreement between you and The Time Is Now when you use this site."
  >
    <h2>Acceptance</h2>
    <p>
      By accessing this website, creating an account, or making a purchase, you agree to these
      terms. If you don't agree, please don't use the site.
    </p>

    <h2>Accounts</h2>
    <ul className="list-disc pl-6 space-y-2">
      <li>You're responsible for keeping your password confidential and for activity under your account.</li>
      <li>You must provide accurate information and be at least 13 years old (or the digital-consent age in your country).</li>
      <li>We may suspend accounts engaged in fraud, abuse, or attempts to disrupt the service.</li>
    </ul>

    <h2>Purchases &amp; pricing</h2>
    <ul className="list-disc pl-6 space-y-2">
      <li>All prices are shown in your selected currency before you pay; applicable taxes may apply at checkout.</li>
      <li>An order is a request to buy; the contract forms when payment is confirmed and we send your confirmation email.</li>
      <li>If an item is unavailable after payment, we'll refund it in full.</li>
      <li>Digital products are licensed for personal use — you may not resell or redistribute files.</li>
    </ul>

    <h2>Donations</h2>
    <p>
      Donations are voluntary gifts to support the ministry and are not payments for goods or
      services. They're generally non-refundable except in cases of clear error or fraud.
    </p>

    <h2>Acceptable use</h2>
    <ul className="list-disc pl-6 space-y-2">
      <li>Don't submit unlawful, hateful, or spam content through testimonies, reviews, contact, or event registrations.</li>
      <li>Content you submit (e.g. testimonies) may be moderated before publication; by submitting, you grant us a non-exclusive right to display it on the site.</li>
      <li>Don't scrape, overload, probe, or attempt to bypass security features of the site.</li>
    </ul>

    <h2>Intellectual property</h2>
    <p>
      All site content — text, designs, logos, videos, and downloadable resources — belongs to
      The Time Is Now or its licensors. Free resources are for personal/ ministry use with
      attribution; commercial redistribution requires written permission.
    </p>

    <h2>Liability</h2>
    <p>
      The site is provided "as is". To the maximum extent permitted by law, we're not liable for
      indirect or consequential damages, and our total liability for any claim is limited to the
      amount you paid us in the 12 months before the claim.
    </p>

    <h2>Changes</h2>
    <p>
      We may update these terms; material changes will be announced on the site. Continued use
      after changes means acceptance.
    </p>
  </LegalShell>
);

export const RefundPolicy = () => (
  <LegalShell
    title="Refund & Returns Policy"
    intro="What to expect if something goes wrong with an order or donation."
  >
    <h2>Our promise</h2>
    <p>
      We want every purchase to feel right. If it doesn't, email{" "}
      <a href="mailto:hello@thetimeisnow.org" className="text-accent hover:underline">hello@thetimeisnow.org</a> within
      the windows below and we'll make it right.
    </p>

    <h2>Physical merch</h2>
    <ul className="list-disc pl-6 space-y-2">
      <li><strong>14 days from delivery</strong> to request a refund for unworn, unwashed items in original condition.</li>
      <li>Clearly faulty or wrong item? We cover return shipping and replace or refund in full.</li>
      <li>Change-of-mind returns: refund is for the item price; original shipping isn't refunded.</li>
      <li>Refunds are issued to the original payment method within 5–10 business days of approval.</li>
    </ul>

    <h2>Digital products</h2>
    <ul className="list-disc pl-6 space-y-2">
      <li>If a file is corrupted, inaccessible, or not as described, we'll fix it or refund in full within <strong>30 days of purchase</strong>.</li>
      <li>Because downloads can't truly be "returned", we can't refund digital items simply because they've been downloaded — but we will always make genuine problems right.</li>
    </ul>

    <h2>Donations</h2>
    <p>
      Donations are voluntary gifts and are generally non-refundable. If you donated in error,
      duplicate a gift, or suspect fraud, contact us within 7 days and we'll review a full
      reversal.
    </p>

    <h2>Event tickets &amp; registrations</h2>
    <p>
      Free event registrations can be cancelled any time by contacting us. For paid events (when
      offered), refunds are available up to 7 days before the event date.
    </p>

    <h2>How to request</h2>
    <p>
      Email us with your order ID (or use the{" "}
      <Link to="/order-lookup" className="text-accent hover:underline">order lookup page</Link>{" "}
      to find it) and what went wrong. We aim to respond within 2 business days.
    </p>
  </LegalShell>
);

export const CookieNotice = () => (
  <LegalShell
    title="Cookie Notice"
    intro="The small files this site stores in your browser, and why."
  >
    <h2>What cookies we use</h2>
    <ul className="list-disc pl-6 space-y-2">
      <li><strong>Authentication (essential):</strong> signed, HTTP-only session cookies that keep you logged in and protect actions (like checkout and profile changes) with CSRF tokens. Without these, accounts can't work.</li>
      <li><strong>Preferences (functional):</strong> remember your theme/layout choice and shopping cart between visits, stored locally in your browser.</li>
      <li><strong>Analytics (optional):</strong> anonymous, aggregated usage events — page views and clicks — that tell us which pages help people. No cross-site tracking, no advertising profiles.</li>
    </ul>

    <h2>No advertising trackers</h2>
    <p>
      We don't run advertising cookies or sell behavioural data. If we ever add a third-party
      analytics or ad tool, this notice will be updated first and consent will be requested where
      required.
    </p>

    <h2>Managing cookies</h2>
    <p>
      Essential cookies can't be disabled without breaking sign-in and checkout. You can clear
      or block cookies in your browser settings at any time — see your browser's help pages for
      how. Clearing cookies will sign you out.
    </p>
  </LegalShell>
);
