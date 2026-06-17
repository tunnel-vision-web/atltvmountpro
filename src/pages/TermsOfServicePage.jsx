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

const TermsOfServicePage = () => {
  usePageTitle({
    title: "Terms of Service - Atlanta TV Mount PRO",
    description: "Read the Terms of Service for Atlanta TV Mount PRO outlining our agreement, billing, liabilities, and service guidelines.",
    keywords: "terms of service, Atlanta TV Mount PRO terms"
  });
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
            <h1 className="text-3xl font-bold mb-3">Terms of Service</h1>
            <p className="text-muted-foreground mb-2">
              Effective Date: January 1, 2025 &nbsp;·&nbsp; Last updated: June
              1, 2025
            </p>
            <p className="text-muted-foreground mb-10">
              Please read these Terms of Service ("Terms") carefully before
              booking or using any services provided by{" "}
              <strong className="text-foreground">Atlanta TV Mount Pro</strong>{" "}
              ("Company," "we," "us," or "our"). By scheduling a service,
              submitting a booking request, or using our website, you agree to
              be bound by these Terms.
            </p>

            <div className="w-full h-px bg-border mb-10" />

            <Section title="1. Services Provided">
              <p>
                Atlanta TV Mount Pro provides residential and light commercial
                handyman services including, but not limited to: TV mounting,
                drywall repair, interior and exterior painting, carpentry,
                flooring installation, minor plumbing, and light electrical
                work, throughout the Atlanta metropolitan area and the state of
                Georgia.
              </p>
              <p>
                All services are subject to availability. We reserve the right
                to decline any job that falls outside our service area, skill
                set, or safety guidelines.
              </p>
            </Section>

            <Section title="2. Estimates and Pricing">
              <p>
                Estimates provided through our website estimator tool, phone,
                email, or in-person consultation are indicative only and are not
                a binding contract. Final pricing is confirmed in writing before
                work commences, following an on-site assessment where required.
              </p>
              <p>
                Prices may be subject to change if the scope of work is found to
                differ materially from what was originally described. Any
                changes to scope will be communicated and agreed upon with the
                client before additional work begins.
              </p>
              <p>
                A same-day or rush service fee of $40 applies to appointments
                booked within the same calendar day, subject to technician
                availability.
              </p>
            </Section>

            <Section title="3. Booking and Cancellations">
              <p>
                Booking requests submitted online or by phone are not confirmed
                until you receive written or verbal confirmation from ATL TV
                Mount PRO. Confirmation is typically provided within 24 hours.
              </p>
              <p>
                We ask that cancellations or rescheduling requests be made at
                least{" "}
                <strong className="text-foreground">24 hours before</strong> the
                scheduled appointment. Cancellations made with less than 24
                hours notice may incur a $35 cancellation fee to cover
                scheduling and travel costs.
              </p>
              <p>
                Atlanta TV Mount Pro reserves the right to reschedule appointments
                due to technician illness, severe weather, or other
                circumstances beyond our control. We will notify you as soon as
                possible and offer the earliest available alternative
                appointment.
              </p>
            </Section>

            <Section title="4. Payment Terms">
              <p>
                Payment is due upon completion of the service unless otherwise
                agreed in writing in advance. We accept cash, major credit/debit
                cards, and popular digital payment methods including Zelle,
                Venmo, and Cash App.
              </p>
              <p>
                For larger projects (estimated over $500), we may request a
                deposit of up to 50% of the estimated total prior to
                commencement of work. Deposits are non-refundable if the client
                cancels within 48 hours of the scheduled start date.
              </p>
              <p>
                Invoices unpaid beyond 14 days of the service date may be
                subject to a 1.5% monthly late fee on the outstanding balance.
              </p>
            </Section>

            <Section title="5. Satisfaction Guarantee and Warranty">
              <p>
                We stand behind our work with a{" "}
                <strong className="text-foreground">
                  100% satisfaction guarantee
                </strong>
                . If you are not satisfied with the quality of a completed
                service, notify us within 7 days and we will return to address
                the issue at no additional charge, provided the scope of the
                complaint falls within the original work performed.
              </p>
              <p>
                Our workmanship warranty does not cover damage caused by
                third-party contractors, normal wear and tear, client-supplied
                materials that prove defective, or structural issues that were
                pre-existing and not disclosed prior to the job.
              </p>
              <p>
                Manufacturer warranties on materials or fixtures are the
                responsibility of the manufacturer and are separate from our
                service guarantee.
              </p>
            </Section>

            <Section title="6. Client Responsibilities">
              <p>To ensure a smooth and safe job, clients agree to:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Provide safe, unobstructed access to the work area.</li>
                <li>
                  Disclose any known hazards including lead paint, asbestos,
                  mold, or structural weaknesses.
                </li>
                <li>
                  Ensure that a responsible adult (18+) is present for the
                  duration of the service visit.
                </li>
                <li>
                  Secure pets in a separate area to prevent interference or
                  injury.
                </li>
                <li>
                  Provide accurate descriptions of the work required when
                  submitting a booking request.
                </li>
              </ul>
            </Section>

            <Section title="7. Limitation of Liability">
              <p>
                Atlanta TV Mount Pro carries general liability insurance. In the
                event of accidental damage caused by our technicians during the
                course of an approved service, we will work in good faith to
                repair or compensate for the damage, up to the limits of our
                insurance policy.
              </p>
              <p>
                We are not liable for pre-existing damage, damage caused by
                hidden structural defects not disclosed by the client, or damage
                arising from client-supplied materials or fixtures.
              </p>
              <p>
                Our total liability for any claim arising from a single service
                visit shall not exceed the total amount paid by the client for
                that visit.
              </p>
            </Section>

            <Section title="8. Intellectual Property">
              <p>
                All content on the Atlanta TV Mount Pro website — including text,
                images, logos, and graphics — is the property of ATL TV Mount
                PRO and may not be reproduced, distributed, or used without
                prior written permission.
              </p>
            </Section>

            <Section title="9. Changes to These Terms">
              <p>
                We may update these Terms from time to time. The most current
                version will always be available on our website. Continued use
                of our services following any update constitutes your acceptance
                of the revised Terms.
              </p>
            </Section>

            <Section title="10. Governing Law">
              <p>
                These Terms are governed by and construed in accordance with the
                laws of the State of Georgia. Any disputes arising under these
                Terms shall be subject to the exclusive jurisdiction of the
                courts of Fulton County, Georgia.
              </p>
            </Section>

            <Section title="11. Contact Us">
              <p>
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="mt-3 p-4 bg-muted/50 rounded-xl text-sm space-y-1">
                <p className="font-semibold text-foreground">
                  Atlanta TV Mount Pro
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
                to="/privacy-policy"
                className="hover:text-primary transition-colors"
              >
                Privacy Policy
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

export default TermsOfServicePage;
