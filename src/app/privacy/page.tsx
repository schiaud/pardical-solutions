import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Pardical",
  description: "How Pardical LLC collects, uses and protects information for its websites, listing, pricing and order-automation services.",
};

export default function Privacy() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20 px-6 bg-white">
        <article className="max-w-3xl mx-auto prose prose-slate prose-headings:text-primary-dark">
          <h1>Privacy Policy</h1>
          <p className="text-sm text-slate-500">Last updated: October 27, 2026</p>

          <p>
            Pardical LLC (&quot;Pardical,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
            is committed to protecting your privacy. This Privacy Policy explains how we collect, use,
            store, and share information when you visit pardical.com, use the Pardical platform, or visit a
            parts website that we build and host for an auto recycler (together, the &quot;Service&quot;).
          </p>

          <h2>1. Information We Collect</h2>

          <h3>Information You Provide</h3>
          <ul>
            <li>
              <strong>Account information:</strong> Name, email address, phone number, company name, and
              login credentials when you create an account.
            </li>
            <li>
              <strong>Business data:</strong> Order information, customer records, supplier details,
              inventory data, shipment records, and other business information you enter into the Service.
            </li>
            <li>
              <strong>Payment information:</strong> Billing details processed through our third-party
              payment provider (Stripe). We do not store your full credit card number.
            </li>
            <li>
              <strong>Communications:</strong> Messages you send through the Service, support requests,
              and feedback.
            </li>
            <li>
              <strong>Website forms and chat:</strong> When you request a demo on pardical.com, or request a
              part, offer a vehicle for sale, or use the parts chat on a yard website we host, we collect
              what you enter (such as your name, phone number, email, ZIP code, VIN and vehicle details) and
              the chat conversation. We pass it to the business you contacted so they can reply.
            </li>
            <li>
              <strong>Inventory data:</strong> Parts inventory, prices and photos that a yard sends us to
              publish on its website and listing channels.
            </li>
          </ul>

          <h3>Information from Third-Party Integrations</h3>
          <ul>
            <li>
              <strong>QuickBooks Online:</strong> When you connect your QuickBooks account, we access
              credit card transaction data (transaction dates, amounts, vendor names, descriptions) and
              vendor information. We access this data in <strong>read-only mode</strong> using OAuth 2.0
              authentication. We do not access your full bank account numbers, and we do not modify any
              records in your QuickBooks account.
            </li>
            <li>
              <strong>eBay:</strong> When you connect your eBay account, we access listing data, order
              information, and messages related to your auto parts sales.
            </li>
            <li>
              <strong>Pricing sources:</strong> We look up publicly available market prices (for example on
              eBay and Car-Part.com) to suggest part prices.
            </li>
          </ul>

          <h3>Information Collected Automatically</h3>
          <ul>
            <li>
              <strong>Usage data:</strong> Pages viewed, features used, actions taken within the Service,
              timestamps, and session duration.
            </li>
            <li>
              <strong>Device information:</strong> Browser type, operating system, IP address, and
              device identifiers.
            </li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, operate, and maintain the Service;</li>
            <li>Process and manage your orders, inventory, and business operations;</li>
            <li>Publish yard inventory on websites and listing channels the customer chooses;</li>
            <li>Answer parts questions in website chat and pass leads to the business you contacted;</li>
            <li>Match bank and card transactions to orders for reconciliation purposes;</li>
            <li>Show team activity and order status to our business customers;</li>
            <li>Send you service-related notifications and updates;</li>
            <li>Provide customer support;</li>
            <li>Improve and develop new features;</li>
            <li>Comply with legal obligations.</li>
          </ul>

          <h2>3. How We Share Your Information</h2>
          <p>We do not sell your personal information. We may share information with:</p>
          <ul>
            <li>
              <strong>Service providers:</strong> Third-party companies that help us operate the Service
              (e.g., cloud hosting providers such as Railway and Google Cloud, AI providers such as
              Anthropic that generate chat replies, and payment processing via Stripe). These providers are
              contractually obligated to protect your data.
            </li>
            <li>
              <strong>Third-party integrations:</strong> When you authorize connections to QuickBooks,
              eBay, or other platforms, data flows between those services and our platform as necessary
              to provide the features you requested.
            </li>
            <li>
              <strong>Legal requirements:</strong> When required by law, legal process, or to protect the
              rights, property, or safety of Pardical, our users, or the public.
            </li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data, including:
          </p>
          <ul>
            <li>Encryption in transit (TLS/SSL) and at rest;</li>
            <li>OAuth 2.0 authentication for all third-party integrations;</li>
            <li>Role-based access controls within the platform;</li>
            <li>Regular security reviews and monitoring.</li>
          </ul>
          <p>
            While we take reasonable precautions, no method of transmission or storage is 100% secure. We
            cannot guarantee absolute security.
          </p>

          <h2>5. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active or as needed to provide the Service.
            After account termination, we retain your data for 30 days to allow for export, after which it
            is permanently deleted. We may retain anonymized, aggregated data for analytical purposes.
          </p>

          <h2>6. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you;</li>
            <li>Request correction of inaccurate data;</li>
            <li>Request deletion of your data;</li>
            <li>Export your data in a portable format;</li>
            <li>Withdraw consent for data processing;</li>
            <li>Opt out of non-essential communications.</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at hello@pardical.com.
          </p>

          <h2>7. Third-Party Integration Data Handling</h2>

          <h3>QuickBooks Online (Intuit)</h3>
          <p>
            Our use of data received from QuickBooks Online APIs adheres to
            Intuit&apos;s developer requirements:
          </p>
          <ul>
            <li>We only request the minimum scopes necessary (accounting read access);</li>
            <li>We access data in read-only mode and do not modify your QuickBooks records;</li>
            <li>OAuth tokens are stored securely and refreshed automatically;</li>
            <li>You can disconnect QuickBooks at any time from the Service settings, which revokes
            our access;</li>
            <li>Upon disconnection, we cease accessing your QuickBooks data. Previously synced
            transaction data is retained per our standard retention policy unless you request deletion.</li>
          </ul>

          <h3>eBay</h3>
          <p>
            We access eBay data through their official APIs using OAuth tokens you authorize. We only
            access data necessary for listing management and order processing. You can revoke access at
            any time through your eBay account settings.
          </p>

          <h2>8. Cookies &amp; Tracking</h2>
          <p>
            We use essential cookies to keep signed-in users signed in, and browser session storage to keep a
            chat conversation together. We do not use third-party advertising trackers. We may use analytics tools to understand how the Service is used and to
            improve it.
          </p>

          <h2>9. Children&apos;s Privacy</h2>
          <p>
            The Service is not intended for individuals under 18 years of age. We do not knowingly collect
            personal information from children.
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes by
            posting the updated policy on this page and updating the &quot;Last updated&quot; date. Your
            continued use of the Service after changes constitutes acceptance.
          </p>

          <h2>11. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or your data, contact us at:
          </p>
          <p>
            <strong>Pardical LLC</strong>
            <br />
            Des Plaines, Illinois
            <br />
            Email: hello@pardical.com
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
