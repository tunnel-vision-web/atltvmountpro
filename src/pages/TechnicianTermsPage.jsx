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

const TechnicianTermsPage = () => {
  usePageTitle({
    title: "Technician Membership Terms - Atlanta TV Mount PRO",
    description: "Read the Technician Dispatch and Membership Terms for Atlanta TV Mount PRO outlining contractor status, payouts, warranties, and screening.",
    keywords: "technician terms, contractor agreement, dispatch terms, Atlanta TV Mount PRO"
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
              Partnership & Compliance
            </p>
            <h1 className="text-3xl font-bold mb-3">Technician Membership & Dispatch Terms</h1>
            <p className="text-muted-foreground mb-2">
              Effective Date: January 1, 2025 &nbsp;·&nbsp; Last updated: June 17, 2026
            </p>
            <p className="text-muted-foreground mb-10">
              Please read these Technician Membership & Dispatch Terms ("Technician Terms") carefully before submitting your technician application or registering on the{" "}
              <strong className="text-foreground">Atlanta TV Mount PRO</strong> technician platform. These terms form a legally binding agreement between you ("Technician," "Contractor," or "you") and Atlanta TV Mount PRO ("Company," "we," "us," or "our") regarding your participation in our dispatch network.
            </p>

            <div className="w-full h-px bg-border mb-10" />

            <Section title="1. Independent Contractor Relationship">
              <p>
                You acknowledge and agree that your relationship with Atlanta TV Mount PRO is strictly that of an independent contractor. Nothing in this agreement, the application, or your use of the Technician App simulator/portal shall be construed as creating an employer-employee relationship, partnership, joint venture, or agency relationship.
              </p>
              <p>
                As an independent contractor, you retain full control over your work:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>You are free to accept or decline any service dispatch requests sent to you.</li>
                <li>You set your own work schedule and hours of availability.</li>
                <li>You are responsible for supplying all of your own tools, ladders, safety gear, vehicles, and fuel required to complete job dispatches.</li>
                <li>You are solely responsible for reporting and paying all federal, state, and local taxes, self-employment taxes, and any business licensing fees.</li>
              </ul>
            </Section>

            <Section title="2. Dispatching & Service Levels">
              <p>
                Atlanta TV Mount PRO operates a dispatching platform that matches client service requests (such as TV mounting, speaker installation, or light handyman work) with independent technicians based on skills, geography, and availability.
              </p>
              <p>
                To maintain membership in the dispatch network, you agree to perform all accepted service dispatches in a professional, timely, and workmanlike manner, conforming to the highest industry standards. Technicians must maintain an average customer satisfaction score of 4.5 out of 5 stars to remain active on the platform.
              </p>
            </Section>

            <Section title="3. 90-Day Workmanship Warranty">
              <p>
                Atlanta TV Mount PRO provides a 90-day workmanship warranty to customers on all completed service bookings. As the performing technician, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Fully warrant your workmanship for a period of 90 days following completion of any job.</li>
                <li>In the event of a customer complaint regarding your service quality or installation integrity, return to the job site to rectify the issue within 48 hours of notification at your own expense.</li>
                <li>Accept liability and indemnify Atlanta TV Mount PRO for any property damage, wall damage, or equipment damage resulting from improper installation or negligence on your part.</li>
              </ul>
            </Section>

            <Section title="4. Pay Structure and Direct Deposits">
              <p>
                Technician payouts are calculated per completed job based on the service scope (typically ranging from $45 to $85 per hour equivalent, or a fixed flat fee per unit as shown in the dispatch offer). 
              </p>
              <p>
                Payouts are compiled weekly through the local ledger and distributed via direct deposit (ACH) to your linked bank account. Invoicing is handled automatically by the Atlanta TV Mount PRO platform on your behalf; you are not required to generate or send custom invoices to clients.
              </p>
            </Section>

            <Section title="5. FCRA Onboarding & Background Check Disclosures">
              <p>
                To protect client safety, property, and peace of mind, all network technicians must undergo a mandatory criminal and identity background check prior to receiving active dispatches.
              </p>
              <p>
                By applying, you authorize Atlanta TV Mount PRO and its designated consumer reporting agency to obtain consumer reports and background checks on you, in compliance with the Fair Credit Reporting Act (FCRA). You understand that this screening may include criminal records, driving history, identity verification, and professional credential checks. You also agree that the Company may require periodic drug screenings or updated background checks to maintain your active dispatch status.
              </p>
            </Section>

            <Section title="6. Vehicle, Insurance & Safety Requirements">
              <p>
                Technicians must possess and maintain a valid driver's license and have access to a reliable, clean vehicle suitable for transporting tools and materials.
              </p>
              <p>
                You agree to carry and maintain active automobile insurance meeting or exceeding the minimum statutory requirements in the State of Georgia. You are also highly encouraged to carry independent commercial general liability insurance. You agree to provide proof of insurance and licensing upon request.
              </p>
            </Section>

            <Section title="7. Termination and Platform Access">
              <p>
                Either party may terminate this agreement and partnership at any time, with or without cause, by providing written notice.
              </p>
              <p>
                Atlanta TV Mount PRO reserves the right to immediately suspend or permanently disable your access to the Technician App and dispatch network for any violation of these terms, breach of contract, unsafe work practices, failure to pass background checks, low customer ratings, or behavior that harms the reputation of the platform.
              </p>
            </Section>

            <Section title="8. Governing Law">
              <p>
                These Technician Terms shall be governed by, and construed in accordance with, the laws of the State of Georgia, without regard to its conflict of law principles. Any dispute arising out of or relating to these terms shall be resolved exclusively in the state or federal courts located in Fulton County, Georgia.
              </p>
            </Section>

            <Section title="9. Acknowledgment">
              <p>
                By checking the agreement box during technician signup or onboarding, you acknowledge that you have read, understood, and agree to be bound by these Technician Membership & Dispatch Terms.
              </p>
            </Section>

            <div className="w-full h-px bg-border mt-4 mb-8" />

            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link
                to="/terms-of-service"
                className="hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
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

export default TechnicianTermsPage;
