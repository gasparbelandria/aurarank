import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "AuraRank Privacy Policy — how we collect, use, and protect your information.",
};

const EFFECTIVE_DATE = "August 29, 2026";
const CONTACT_EMAIL = "aurarankme@gmail.com";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors text-sm cursor-pointer"
          >
            <ArrowLeft size={15} />
            Back
          </Link>
          <span className="text-border">|</span>
          <span className="text-xs font-black uppercase tracking-widest text-brand">AuraRank</span>
        </div>

        <h1 className="text-3xl font-black uppercase tracking-wide text-foreground mb-1">
          Privacy Policy
        </h1>
        <p className="text-xs text-muted mb-10">Effective Date: {EFFECTIVE_DATE}</p>

        <div className="space-y-8 text-sm text-foreground leading-relaxed">

          {/* Intro */}
          <div className="bg-elevated border border-border rounded-2xl p-5">
            <p>
              AuraRank (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your privacy.
              This Privacy Policy explains what information we collect, how we use it, with whom we share it, and the
              choices you have. By using the Platform, you agree to this policy.
            </p>
          </div>

          {/* 1 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              1. Information We Collect
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5 space-y-4">
              <div>
                <p className="font-bold text-foreground mb-1">Account Information</p>
                <p className="text-foreground/80">
                  When you sign in via Google, we receive your name, email address, and profile picture as permitted
                  by your Google account settings. We store this to create and manage your AuraRank account.
                </p>
              </div>
              <div>
                <p className="font-bold text-foreground mb-1">User Content</p>
                <p className="text-foreground/80">
                  Posts, images, text, and any other content you submit to the Platform, including ratings you give
                  and receive.
                </p>
              </div>
              <div>
                <p className="font-bold text-foreground mb-1">Profile Data</p>
                <p className="text-foreground/80">
                  Username, bio, location (if voluntarily provided), and any other profile information you choose
                  to share.
                </p>
              </div>
              <div>
                <p className="font-bold text-foreground mb-1">Usage Data</p>
                <p className="text-foreground/80">
                  Pages visited, features used, interactions with content, timestamps, and behavioral data collected
                  automatically when you use the Platform.
                </p>
              </div>
              <div>
                <p className="font-bold text-foreground mb-1">Device and Technical Data</p>
                <p className="text-foreground/80">
                  IP address, browser type, operating system, device identifiers, and referring URLs. This data is
                  collected automatically via standard web server logs and analytics tools.
                </p>
              </div>
              <div>
                <p className="font-bold text-foreground mb-1">Cookies and Similar Technologies</p>
                <p className="text-foreground/80">
                  We use cookies, local storage, and similar technologies for authentication, session management,
                  preferences, and analytics. See Section 8 for details.
                </p>
              </div>
            </div>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              2. How We Use Your Information
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5">
              <ul className="list-disc list-inside space-y-2 text-foreground/90">
                <li>To create and manage your account and authenticate your identity</li>
                <li>To display your profile, posts, and Aura Score to other users</li>
                <li>To operate and improve the Platform&rsquo;s features and performance</li>
                <li>To calculate, update, and display Aura Scores and leaderboards</li>
                <li>To send transactional communications (e.g., account verification, notifications)</li>
                <li>To process payments and manage subscriptions</li>
                <li>To analyze usage patterns and improve user experience via analytics</li>
                <li>To detect and prevent fraud, abuse, or violations of our Terms of Service</li>
                <li>To comply with legal obligations and enforce our rights</li>
                <li>To respond to your support requests or inquiries</li>
              </ul>
            </div>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              3. Third-Party Services
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5 space-y-4">
              <p className="text-foreground/80">
                AuraRank integrates with the following third-party services. Each operates under its own privacy policy,
                which we encourage you to review:
              </p>
              <div>
                <p className="font-bold text-foreground mb-1">Google Sign-In (Alphabet Inc.)</p>
                <p className="text-foreground/80">
                  Used for authentication. Google may collect data in accordance with its{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand hover:text-brand-light underline underline-offset-2 cursor-pointer"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
              <div>
                <p className="font-bold text-foreground mb-1">Google Analytics (Alphabet Inc.)</p>
                <p className="text-foreground/80">
                  Used to analyze traffic and usage patterns. Google Analytics may use cookies and collect
                  pseudonymized usage data. You can opt out via the{" "}
                  <a
                    href="https://tools.google.com/dlpage/gaoptout"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand hover:text-brand-light underline underline-offset-2 cursor-pointer"
                  >
                    Google Analytics Opt-out Browser Add-on
                  </a>
                  .
                </p>
              </div>
            </div>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              4. How We Share Your Information
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5 space-y-3">
              <p>
                <strong>We do not sell your personal information.</strong> We may share your information only in the
                following limited circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/90">
                <li>
                  <strong>Service Providers:</strong> With trusted third-party vendors who assist in operating the
                  Platform (e.g., hosting, payment processing, analytics), under confidentiality obligations and only
                  to the extent necessary.
                </li>
                <li>
                  <strong>Public Profile:</strong> Your username, profile picture, posts, and Aura Score are visible
                  to other Platform users and, depending on your settings, may be publicly accessible.
                </li>
                <li>
                  <strong>Legal Requirements:</strong> If required by law, court order, or governmental authority,
                  or to protect the rights, property, or safety of AuraRank, its users, or the public.
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets,
                  your information may be transferred as part of that transaction, subject to confidentiality obligations.
                </li>
                <li>
                  <strong>With Your Consent:</strong> For any other purpose with your explicit prior consent.
                </li>
              </ul>
            </div>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              5. Data Retention
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5 space-y-3">
              <p>
                We retain your personal information for as long as your account is active or as needed to provide the
                Platform and fulfill the purposes described in this policy. We may retain certain information for longer
                periods where required by law or to resolve disputes.
              </p>
              <p>
                When you delete your account, we will delete or anonymize your personal information within <strong>30 days</strong>,
                except where retention is required by applicable law, for fraud prevention, or to resolve outstanding
                disputes. User Content may remain visible in an anonymized form.
              </p>
            </div>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              6. Your Rights and Choices
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5 space-y-3">
              <p>Depending on your location and applicable law, you may have the following rights:</p>
              <ul className="list-disc list-inside space-y-2 text-foreground/90">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data, subject to legal exceptions</li>
                <li><strong>Portability:</strong> Request your data in a structured, machine-readable format</li>
                <li><strong>Objection / Restriction:</strong> Object to or request restriction of certain processing</li>
                <li><strong>Withdraw Consent:</strong> Where processing is based on consent, withdraw it at any time</li>
              </ul>
              <div className="pt-2 border-t border-border mt-2">
                <p className="font-bold text-foreground mb-2">California Residents (CCPA)</p>
                <p className="text-foreground/80">
                  California residents have additional rights under the California Consumer Privacy Act, including the
                  right to know what personal information is collected, the right to delete, and the right to
                  non-discrimination for exercising their rights. We do not sell personal information. To exercise your
                  rights, contact us at{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand hover:text-brand-light underline underline-offset-2 cursor-pointer">
                    {CONTACT_EMAIL}
                  </a>
                  .
                </p>
              </div>
              <p className="text-foreground/80">
                To exercise any of these rights, please contact us at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand hover:text-brand-light underline underline-offset-2 cursor-pointer">
                  {CONTACT_EMAIL}
                </a>
                . We will respond within 30 days.
              </p>
            </div>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              7. Children&rsquo;s Privacy
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5 space-y-3">
              <p>
                AuraRank is not intended for, and does not knowingly collect personal information from, individuals
                under the age of <strong>16</strong>. If we become aware that a user under 16 has provided personal
                information, we will take steps to delete such information and terminate the account promptly.
              </p>
              <p>
                If you believe a person under 16 has created an account on AuraRank, please contact us at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand hover:text-brand-light underline underline-offset-2 cursor-pointer">
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </div>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              8. Cookies
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5 space-y-3">
              <p>We use the following types of cookies and similar technologies:</p>
              <ul className="list-disc list-inside space-y-2 text-foreground/90">
                <li>
                  <strong>Essential cookies:</strong> Required for authentication, session management, and security.
                  These cannot be disabled without breaking core functionality.
                </li>
                <li>
                  <strong>Analytics cookies:</strong> Used by Google Analytics to collect pseudonymized usage data
                  that helps us improve the Platform.
                </li>
                <li>
                  <strong>Preference cookies:</strong> Used to remember your settings and language preferences.
                </li>
              </ul>
              <p className="text-foreground/80">
                Most browsers allow you to control cookies through their settings. Disabling analytics cookies will not
                affect your ability to use the Platform.
              </p>
            </div>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              9. Data Security
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5 space-y-3">
              <p>
                We implement industry-standard security measures to protect your information, including HTTPS encryption,
                secure credential storage, and access controls. Authentication is handled via industry-standard JWT
                tokens with appropriate expiry.
              </p>
              <p>
                <strong>However, no method of transmission over the internet or method of electronic storage is 100%
                secure.</strong> We cannot guarantee absolute security of your data. In the event of a data breach that
                affects your rights, we will notify you as required by applicable law.
              </p>
            </div>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              10. International Users
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5">
              <p>
                AuraRank is operated from the United States. If you access the Platform from outside the United States,
                your information may be transferred to and processed in the United States, where data protection laws
                may differ from those in your jurisdiction. By using the Platform, you consent to such transfer and processing.
              </p>
            </div>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              11. Changes to This Policy
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5">
              <p>
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an
                updated effective date. For material changes, we will make reasonable efforts to notify you via email
                or in-app notification. Your continued use of the Platform after any changes constitutes acceptance
                of the updated policy.
              </p>
            </div>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              12. Contact
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5">
              <p>
                For privacy-related questions, requests, or concerns, please contact us at:{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-brand hover:text-brand-light underline underline-offset-2 cursor-pointer"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
          </section>

        </div>

        {/* Footer links */}
        <div className="mt-12 pt-6 border-t border-border flex flex-wrap gap-4 text-xs text-muted">
          <Link href="/terms" className="hover:text-foreground transition-colors cursor-pointer">Terms of Service</Link>
          <Link href="/help" className="hover:text-foreground transition-colors cursor-pointer">Help</Link>
          <Link href="/" className="hover:text-foreground transition-colors cursor-pointer">Back to AuraRank</Link>
        </div>
      </div>
    </div>
  );
}
