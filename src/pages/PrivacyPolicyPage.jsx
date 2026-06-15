import React from "react";
import usePageTitle from "@/hooks/usePageTitle";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-xl font-semibold mb-3 text-foreground">{title}</h2>
    <div className="text-muted-foreground leading-relaxed space-y-3">
      {children}
    </div>
  </div>
);

const PrivacyPolicyPage = () => {
  usePageTitle("Privacy Policy - ATL TV Mount PRO");
  return (
    <>
      <div className="py-24 bg-background min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
              Legal
            </p>
            <h1 className="text-3xl font-bold mb-3">Privacy Policy</h1>
            <p className="text-muted-foreground mb-2">
              Effective Date: January 1, 2025 &nbsp;·&nbsp; Last updated: June
              1, 2025
            </p>
            <p className="text-muted-foreground mb-10">
              <strong className="text-foreground">ATL TV Mount PRO</strong>{" "}
              ("we," "us," or "our") is committed to protecting your personal
              information. This Privacy Policy explains what information we
              collect, how we use it, and your rights regarding that information
              when you use our website or services.
            </p>

            <div className="w-full h-px bg-border mb-10" />

            <Section title="1. Information We Collect">
              <p>
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>
                  <strong className="text-foreground">
                    Contact information
                  </strong>{" "}
                  — your name, email address, phone number, and service address
                  when submitting a booking or quote request.
                </li>
                <li>
                  <strong className="text-foreground">Service details</strong> —
                  the type of service requested, project description, and any
                  photos or notes you choose to share.
                </li>
                <li>
                  <strong className="text-foreground">
                    Payment information
                  </strong>{" "}
                  — we do not store payment card details. Payments are processed
                  through trusted third-party providers.
                </li>
                <li>
                  <strong className="text-foreground">
                    Newsletter subscriptions
                  </strong>{" "}
                  — your email address if you opt in to receive updates.
                </li>
              </ul>
              <p>
                We may also collect limited technical information automatically
                when you visit our website, such as your IP address, browser
                type, operating system, referring URLs, and pages viewed,
                through standard web server logs and analytics tools.
              </p>
            </Section>

            <Section title="2. How We Use Your Information">
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>
                  Schedule, confirm, and complete your service appointments.
                </li>
                <li>
                  Send appointment confirmations, reminders, and follow-up
                  communications.
                </li>
                <li>
                  Provide estimates and respond to inquiries about our services.
                </li>
                <li>Process payments and maintain accurate billing records.</li>
                <li>
                  Send newsletters or promotional offers if you have opted in
                  (you can unsubscribe at any time).
                </li>
                <li>
                  Improve our website, services, and customer experience based
                  on aggregate usage patterns.
                </li>
                <li>Comply with legal obligations and resolve disputes.</li>
              </ul>
              <p>
                We will not sell, rent, or share your personal information with
                third-party marketers.
              </p>
            </Section>

            <Section title="3. Information Sharing">
              <p>We may share your information in limited circumstances:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>
                  <strong className="text-foreground">Service providers</strong>{" "}
                  — we may share necessary details with third-party tools and
                  platforms that help us operate our business (e.g., scheduling
                  software, email platforms, payment processors). These
                  providers are contractually required to handle your data
                  securely and only for the purposes we specify.
                </li>
                <li>
                  <strong className="text-foreground">Legal compliance</strong>{" "}
                  — we may disclose information when required by law, court
                  order, or to protect the rights, property, or safety of our
                  business, employees, or clients.
                </li>
                <li>
                  <strong className="text-foreground">
                    Business transfers
                  </strong>{" "}
                  — in the event of a merger, acquisition, or sale of assets,
                  your information may be transferred as part of that
                  transaction. We will provide notice before this occurs.
                </li>
              </ul>
            </Section>

            <Section title="4. Data Retention">
              <p>
                We retain your personal information for as long as necessary to
                fulfill the purposes for which it was collected, including
                providing services, maintaining business records, and complying
                with legal obligations.
              </p>
              <p>
                Booking and contact records are typically retained for up to{" "}
                <strong className="text-foreground">3 years</strong> from the
                date of service. Newsletter subscription records are kept until
                you unsubscribe. You may request deletion of your data at any
                time (see Section 7).
              </p>
            </Section>

            <Section title="5. Cookies and Tracking">
              <p>
                Our website may use cookies and similar technologies to enhance
                your browsing experience, remember your preferences, and gather
                analytics data. Cookies are small text files stored on your
                device.
              </p>
              <p>
                You can control cookie settings through your browser. Disabling
                cookies may affect some website functionality. We do not use
                advertising or cross-site tracking cookies.
              </p>
            </Section>

            <Section title="6. Data Security">
              <p>
                We take reasonable technical and organizational measures to
                protect your personal information from unauthorized access,
                disclosure, alteration, or destruction. These measures include
                secure HTTPS transmission, access controls, and encrypted data
                storage.
              </p>
              <p>
                While we strive to protect your information, no method of
                transmission over the internet or electronic storage is 100%
                secure. We cannot guarantee absolute security, but we will
                notify you promptly in the event of a data breach that affects
                your personal information.
              </p>
            </Section>

            <Section title="7. Your Rights">
              <p>
                You have the following rights with respect to your personal
                information:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>
                  <strong className="text-foreground">Access</strong> — request
                  a copy of the personal information we hold about you.
                </li>
                <li>
                  <strong className="text-foreground">Correction</strong> — ask
                  us to correct inaccurate or incomplete data.
                </li>
                <li>
                  <strong className="text-foreground">Deletion</strong> —
                  request that we delete your personal data, subject to legal
                  retention requirements.
                </li>
                <li>
                  <strong className="text-foreground">Opt-out</strong> —
                  unsubscribe from marketing communications at any time using
                  the link in any email we send, or by contacting us directly.
                </li>
              </ul>
              <p>
                To exercise any of these rights, contact us at the details
                provided in Section 9 below. We will respond within 30 days.
              </p>
            </Section>

            <Section title="8. Children's Privacy">
              <p>
                Our services are not directed at children under the age of 13,
                and we do not knowingly collect personal information from anyone
                under 13. If you believe we have inadvertently collected
                information from a child, please contact us immediately and we
                will take steps to delete it.
              </p>
            </Section>

            <Section title="9. Changes to This Policy">
              <p>
                We may update this Privacy Policy periodically to reflect
                changes in our practices or applicable law. When we make
                changes, we will update the "Last updated" date at the top of
                this page. We encourage you to review this Policy from time to
                time.
              </p>
              <p>
                Continued use of our website or services after any update
                constitutes your acceptance of the revised Privacy Policy.
              </p>
            </Section>

            <Section title="10. Contact Us">
              <p>
                If you have questions, concerns, or requests regarding this
                Privacy Policy or your personal information, please reach out:
              </p>
              <div className="mt-3 p-4 bg-muted/50 rounded-xl text-sm space-y-1">
                <p className="font-semibold text-foreground">
                  ATL TV Mount PRO
                </p>
                <p>Atlanta, Georgia</p>
                <p>
                  Phone:{" "}
                  <a
                    href="tel:770-374-3203"
                    className="text-primary hover:underline"
                  >
                    770-374-3203
                  </a>
                </p>
              </div>
            </Section>

            <div className="w-full h-px bg-border mt-4 mb-8" />

            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link
                to="/terms-of-service"
                className="hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
              <Link to="/" className="hover:text-primary transition-colors">
                ← Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;
