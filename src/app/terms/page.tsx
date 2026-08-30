import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "AuraRank Terms of Service — rules, rights, and responsibilities for using the platform.",
};

const EFFECTIVE_DATE = "August 29, 2026";
const CONTACT_EMAIL = "aurarankme@gmail.com";

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-xs text-muted mb-10">Effective Date: {EFFECTIVE_DATE}</p>

        <div className="space-y-8 text-sm text-foreground leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              1. Acceptance of Terms
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5 space-y-3">
              <p>
                By accessing, browsing, or using AuraRank (the &ldquo;Platform&rdquo;), you acknowledge that you have read,
                understood, and agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;) and our{" "}
                <Link href="/privacy" className="text-brand hover:text-brand-light underline underline-offset-2 cursor-pointer">
                  Privacy Policy
                </Link>
                , which is incorporated herein by reference.
              </p>
              <p>
                If you do not agree to these Terms in their entirety, you must immediately discontinue use of the Platform.
                Your continued use constitutes acceptance of any future amendments.
              </p>
            </div>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              2. Eligibility
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5 space-y-3">
              <p>
                You must be at least <strong>16 years of age</strong> to register for or use AuraRank. By using the Platform,
                you represent and warrant that you meet this age requirement and have the legal capacity to enter into a binding
                agreement under applicable law.
              </p>
              <p>
                If you are using the Platform on behalf of an organization, you represent and warrant that you have the authority
                to bind that organization to these Terms.
              </p>
              <p>
                AuraRank reserves the right to request proof of age at any time and to suspend or terminate any account
                where the user is found to be under the minimum age requirement.
              </p>
            </div>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              3. User Accounts
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5 space-y-3">
              <p>
                You are solely responsible for maintaining the confidentiality of your account credentials and for all
                activities that occur under your account. You agree to notify us immediately at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand hover:text-brand-light underline underline-offset-2 cursor-pointer">
                  {CONTACT_EMAIL}
                </a>{" "}
                of any unauthorized use of your account.
              </p>
              <p>
                AuraRank is not liable for any loss or damage arising from your failure to maintain account security.
                You may not create multiple accounts, transfer your account to another party, or use another user&rsquo;s account
                without permission.
              </p>
              <p>
                We reserve the right to suspend, disable, or terminate any account at our sole discretion, without prior
                notice or liability, including for violations of these Terms or any applicable law.
              </p>
            </div>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              4. User-Generated Content
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5 space-y-3">
              <p>
                You retain ownership of the content you post on AuraRank (&ldquo;User Content&rdquo;). By submitting User Content,
                you grant AuraRank a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to
                use, reproduce, modify, adapt, publish, translate, display, distribute, and create derivative works of
                such content, solely for the purpose of operating, improving, and promoting the Platform.
              </p>
              <p>
                You represent and warrant that: (a) you own or have the necessary rights to submit the User Content; (b)
                the User Content does not infringe any third-party intellectual property rights, privacy rights, or other
                rights; and (c) the User Content complies with these Terms and all applicable laws.
              </p>
              <p>
                <strong>AuraRank acts as a passive host of User Content and is not responsible or liable for any User Content
                posted by users.</strong> We do not endorse, verify, or make any representations regarding User Content.
              </p>
              <p>
                We reserve the right, but not the obligation, to review, remove, or disable access to any User Content that
                violates these Terms or that we deem objectionable in our sole discretion, without prior notice or liability.
              </p>
            </div>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              5. Aura Score and Rating System
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5 space-y-3">
              <p>
                The Aura Score is a <strong>community-generated, subjective metric for entertainment purposes only</strong>.
                It does not constitute an objective assessment of any person&rsquo;s character, ability, social standing,
                or value.
              </p>
              <p>
                AuraRank makes no representations or warranties regarding the accuracy, fairness, reliability, or completeness
                of any Aura Score or rating. Scores may fluctuate at any time based on community activity and algorithmic factors
                within our sole discretion.
              </p>
              <p>
                <strong>AuraRank is not liable for any psychological, emotional, reputational, social, or financial harm
                arising from ratings received on the Platform.</strong> By using the rating features, you acknowledge and
                accept that ratings are opinions of other users and are not fact.
              </p>
              <p>
                We reserve the right to adjust, recalibrate, or reset Aura Scores at any time without notice.
              </p>
            </div>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              6. Prohibited Conduct
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5">
              <p className="mb-3">You agree not to, directly or indirectly:</p>
              <ul className="list-disc list-inside space-y-2 text-foreground/90">
                <li>Post content that is unlawful, defamatory, harassing, threatening, abusive, obscene, or otherwise objectionable</li>
                <li>Impersonate any person, entity, or AuraRank staff, or falsely claim affiliation</li>
                <li>Post content depicting minors in any sexual, inappropriate, or exploitative manner</li>
                <li>Artificially inflate, manipulate, or game the Aura Score or rating system</li>
                <li>Use bots, scripts, or automated tools to interact with the Platform</li>
                <li>Scrape, data-mine, or harvest any content or data from the Platform without express written permission</li>
                <li>Upload malware, viruses, or any code designed to interfere with the Platform</li>
                <li>Attempt to gain unauthorized access to other user accounts or Platform systems</li>
                <li>Engage in coordinated inauthentic behavior, brigading, or mass targeted harassment</li>
                <li>Post content that infringes third-party copyrights, trademarks, or other intellectual property rights</li>
                <li>Violate any applicable local, state, federal, or international law or regulation</li>
              </ul>
              <p className="mt-3">
                Violation of these prohibitions may result in immediate account termination and, where applicable, referral
                to law enforcement.
              </p>
            </div>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              7. DMCA and Copyright
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5 space-y-3">
              <p>
                AuraRank respects the intellectual property rights of others and complies with the Digital Millennium
                Copyright Act (&ldquo;DMCA&rdquo;). If you believe your copyrighted work has been infringed on the Platform, please
                send a written notice to{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand hover:text-brand-light underline underline-offset-2 cursor-pointer">
                  {CONTACT_EMAIL}
                </a>{" "}
                containing: (a) identification of the copyrighted work; (b) identification of the infringing material and
                its location on the Platform; (c) your contact information; (d) a statement of good-faith belief; (e) a
                statement of accuracy under penalty of perjury; and (f) your signature.
              </p>
              <p>
                AuraRank may, at its sole discretion, terminate the accounts of repeat infringers.
              </p>
            </div>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              8. Payments and Subscriptions
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5">
              <p>
                Paid features are planned for a future phase of AuraRank. No payments are currently processed on the
                Platform. This section will be updated when paid features become available.
              </p>
            </div>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              9. Intellectual Property
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5 space-y-3">
              <p>
                The AuraRank brand, name, logo, design, code, features, and all associated intellectual property are the
                exclusive property of AuraRank and its operators and are protected by copyright, trademark, and other
                applicable laws. Nothing in these Terms grants you any right to use AuraRank&rsquo;s intellectual property
                without express written permission.
              </p>
              <p>
                You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit any
                part of the Platform without prior written consent.
              </p>
            </div>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              10. Disclaimers
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5 space-y-3">
              <p className="uppercase font-bold text-xs tracking-wide text-muted">
                The platform is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, either express or implied.
              </p>
              <p>
                AuraRank expressly disclaims all warranties, including but not limited to: implied warranties of merchantability,
                fitness for a particular purpose, non-infringement, and any warranties arising from course of dealing or usage
                of trade. We do not warrant that the Platform will be uninterrupted, error-free, secure, or free of viruses;
                that defects will be corrected; or that any content is accurate, complete, or reliable.
              </p>
              <p>
                AuraRank is a social entertainment platform. Any use of the Platform for purposes beyond entertainment — including
                but not limited to professional, reputational, psychological, or financial decisions — is at your sole risk.
              </p>
            </div>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              11. Limitation of Liability
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5 space-y-3">
              <p className="uppercase font-bold text-xs tracking-wide text-muted">
                To the maximum extent permitted by applicable law:
              </p>
              <p>
                AuraRank, its operators, affiliates, licensors, employees, agents, and successors shall not be liable
                for any indirect, incidental, special, consequential, exemplary, or punitive damages — including but not
                limited to loss of profits, data, goodwill, or other intangible losses — arising from or related to your
                use of or inability to use the Platform, User Content, Aura Scores, or any platform features, regardless
                of whether such damages were foreseeable or AuraRank was advised of their possibility.
              </p>
              <p>
                AuraRank&rsquo;s total cumulative liability to you for any claims arising from these Terms or your use of
                the Platform shall not exceed the greater of: (a) the amount you paid to AuraRank in the twelve (12) months
                preceding the claim, or (b) fifty US dollars (USD $50).
              </p>
              <p>
                Some jurisdictions do not allow the exclusion or limitation of certain damages. In such jurisdictions,
                our liability is limited to the maximum extent permitted by law.
              </p>
            </div>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              12. Indemnification
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5">
              <p>
                You agree to defend, indemnify, and hold harmless AuraRank and its operators, affiliates, licensors,
                employees, and agents from and against any claims, liabilities, damages, judgments, awards, losses, costs,
                expenses, or fees (including reasonable attorneys&rsquo; fees) arising from or relating to: (a) your use of the
                Platform; (b) your User Content; (c) your violation of these Terms; (d) your violation of any rights of
                another party; or (e) your violation of any applicable law.
              </p>
            </div>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              13. Governing Law and Dispute Resolution
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5 space-y-3">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the United States, without
                regard to its conflict of law provisions. Any dispute arising from or relating to these Terms or the
                Platform shall first be attempted to be resolved through good-faith negotiation.
              </p>
              <p>
                If negotiation fails, disputes shall be resolved by binding arbitration on an individual basis. You waive
                any right to participate in a class action lawsuit or class-wide arbitration against AuraRank.
              </p>
              <p>
                Notwithstanding the foregoing, either party may seek injunctive or equitable relief in a court of competent
                jurisdiction to prevent irreparable harm.
              </p>
            </div>
          </section>

          {/* 14 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              14. Modifications to Terms
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5">
              <p>
                AuraRank reserves the right to modify these Terms at any time. Changes will be posted on this page with
                an updated effective date. For material changes, we will make reasonable efforts to notify you via email
                or an in-app notification. Your continued use of the Platform after such changes constitutes your acceptance
                of the revised Terms.
              </p>
            </div>
          </section>

          {/* 15 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              15. Miscellaneous
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5 space-y-3">
              <p>
                <strong>Severability:</strong> If any provision of these Terms is found to be unenforceable, that provision
                will be modified to the minimum extent necessary to make it enforceable, and the remaining provisions will
                continue in full force.
              </p>
              <p>
                <strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy, constitute the entire
                agreement between you and AuraRank regarding the Platform and supersede all prior agreements.
              </p>
              <p>
                <strong>Waiver:</strong> Failure to enforce any provision of these Terms shall not constitute a waiver
                of our right to enforce it in the future.
              </p>
              <p>
                <strong>Assignment:</strong> You may not assign your rights or obligations under these Terms without our
                prior written consent. AuraRank may assign its rights freely.
              </p>
            </div>
          </section>

          {/* 16 */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-3">
              16. Contact
            </h2>
            <div className="bg-elevated border border-border rounded-2xl p-5">
              <p>
                For questions about these Terms, please contact us at:{" "}
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
          <Link href="/privacy" className="hover:text-foreground transition-colors cursor-pointer">Privacy Policy</Link>
          <Link href="/help" className="hover:text-foreground transition-colors cursor-pointer">Help</Link>
          <Link href="/" className="hover:text-foreground transition-colors cursor-pointer">Back to AuraRank</Link>
        </div>
      </div>
    </div>
  );
}
