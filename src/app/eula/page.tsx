import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "End-User License Agreement — Pardical",
  description: "Terms for using the Pardical platform: websites, listing, pricing and order-automation services for auto recyclers and parts brokers.",
};

export default function EULA() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20 px-6 bg-white">
        <article className="max-w-3xl mx-auto prose prose-slate prose-headings:text-primary-dark">
          <h1>End-User License Agreement</h1>
          <p className="text-sm text-slate-500">Last updated: October 27, 2026</p>

          <p>
            This End-User License Agreement (&quot;Agreement&quot;) is a legal agreement between you
            (&quot;User,&quot; &quot;you,&quot; or &quot;your&quot;) and Pardical LLC (&quot;Pardical,&quot;
            &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) governing your use of the Pardical platform,
            including hosted websites, listing and pricing tools, order automation, and all related software,
            services, and integrations (collectively, the &quot;Service&quot;).
          </p>
          <p>
            By accessing or using the Service, you agree to be bound by this Agreement. If you do not agree,
            do not use the Service.
          </p>

          <h2>1. License Grant</h2>
          <p>
            We grant you a limited, non-exclusive, non-transferable, revocable license to access and use
            the Service for your internal business operations during the term of your subscription. This
            license is conditioned on your compliance with this Agreement.
          </p>

          <h2>2. Account &amp; Access</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for
            all activity that occurs under your account. You agree to notify us immediately of any
            unauthorized access. You may grant access to your employees and contractors, but you remain
            responsible for their compliance with this Agreement.
          </p>

          <h2>3. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Reverse engineer, decompile, or disassemble the Service;</li>
            <li>Copy, modify, or create derivative works based on the Service;</li>
            <li>Sublicense, sell, resell, or distribute the Service to third parties;</li>
            <li>Use the Service for any unlawful purpose or in violation of applicable laws;</li>
            <li>Attempt to gain unauthorized access to the Service or its related systems;</li>
            <li>Transmit any viruses, malware, or other harmful code through the Service;</li>
            <li>Interfere with or disrupt the integrity or performance of the Service.</li>
          </ul>

          <h2>4. Third-Party Integrations</h2>
          <p>
            The Service integrates with third-party platforms including, but not limited to, Intuit
            QuickBooks Online, eBay, Google, Meta (Facebook), and Car-Part.com. Your use of these integrations is subject to the
            respective terms of service and privacy policies of those third parties. We are not responsible
            for the availability, accuracy, or functionality of third-party services.
          </p>
          <p>
            When you connect your QuickBooks Online account, you authorize us to access your financial
            transaction data (credit card charges, vendor information) solely for the purpose of providing
            bank reconciliation and transaction matching features within the Service. We access this data
            in read-only mode and do not modify your QuickBooks records.
          </p>

          <h2>5. Data Ownership</h2>
          <p>
            You retain all ownership rights to your data. We do not claim ownership of any data you
            submit to the Service. We use your data solely to provide and improve the Service as described
            in our Privacy Policy.
          </p>

          <h2>6. Subscription &amp; Payment</h2>
          <p>
            Access to the Service requires an active subscription. Subscription fees are billed monthly or
            annually as selected at the time of purchase. All fees are non-refundable except as required by
            law or as explicitly stated in a separate written agreement. We reserve the right to change
            pricing with 30 days&apos; notice.
          </p>

          <h2>7. Service Availability</h2>
          <p>
            We strive to maintain high availability but do not guarantee uninterrupted access. The Service
            may be temporarily unavailable for maintenance, updates, or circumstances beyond our control.
            We will make reasonable efforts to notify you of planned downtime.
          </p>

          <h2>8. Intellectual Property</h2>
          <p>
            The Service, including its design, code, features, and documentation, is owned by Pardical
            LLC and is protected by intellectual property laws. This Agreement does not transfer any
            ownership rights to you. All trademarks, logos, and service marks displayed on the Service are
            our property or the property of their respective owners.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, PARDICAL LLC SHALL NOT BE LIABLE FOR ANY
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS,
            DATA, OR BUSINESS OPPORTUNITIES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE. OUR
            TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SERVICE IN THE TWELVE (12) MONTHS
            PRECEDING THE CLAIM.
          </p>

          <h2>10. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF
            ANY KIND, EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES INCLUDING, BUT NOT LIMITED TO, IMPLIED
            WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO
            NOT WARRANT THAT THE SERVICE WILL BE ERROR-FREE OR THAT FINANCIAL DATA FROM THIRD-PARTY
            INTEGRATIONS WILL BE COMPLETE OR ACCURATE.
          </p>

          <h2>11. Termination</h2>
          <p>
            Either party may terminate this Agreement at any time. You may cancel your subscription
            through the Service or by contacting us. We may suspend or terminate your access if you violate
            this Agreement or fail to pay subscription fees. Upon termination, your license to use the
            Service ends immediately. We will make your data available for export for 30 days following
            termination.
          </p>

          <h2>12. Governing Law</h2>
          <p>
            This Agreement shall be governed by and construed in accordance with the laws of the State of
            Illinois, without regard to its conflict of law provisions.
          </p>

          <h2>13. Changes to This Agreement</h2>
          <p>
            We may update this Agreement from time to time. We will notify you of material changes by
            posting the updated Agreement on this page and updating the &quot;Last updated&quot; date. Your
            continued use of the Service after changes constitutes acceptance of the revised Agreement.
          </p>

          <h2>14. Contact</h2>
          <p>
            If you have questions about this Agreement, contact us at:
          </p>
          <p>
            <strong>Pardical LLC</strong>
            <br />
            Des Plaines, Illinois
            <br />
            Email: david@pardical.com
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
