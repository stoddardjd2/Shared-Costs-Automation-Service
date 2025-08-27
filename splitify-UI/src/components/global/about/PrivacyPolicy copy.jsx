import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto p-6 leading-7">
      <h1 className="text-2xl font-semibold mb-4">Privacy Policy</h1>
      <p className="text-sm text-gray-600 mb-6">
        Effective Date: <strong>8/11/25</strong>
      </p>

      <p className="mb-4">
        <strong>Splitify</strong> we value your
        privacy and are committed to protecting your personal information.
      </p>

      <h2 className="text-xl font-medium mt-6 mb-2">1. Information We Collect</h2>
      <p>
        We may collect your name, phone number, email, and other details you
        provide when creating an account or opting into SMS messages.
      </p>

      <h2 className="text-xl font-medium mt-6 mb-2">2. How We Use Information</h2>
      <p>
        We use your information to provide and improve our Services, including
        sending transactional messages, service updates, and (only if separately
        opted-in) marketing communications.
      </p>

      <h2 className="text-xl font-medium mt-6 mb-2">3. SMS Privacy</h2>
      <p className="mb-2">
        <strong>
          We will not share or sell your mobile information with third parties
          for promotional or marketing purposes.
        </strong>
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          We do not share your text messaging originator opt-in data and consent
          with any third parties.
        </li>
        <li>
          Message and data rates may apply. Message frequency may vary.
        </li>
        <li>
          Reply <strong>STOP</strong> to opt out; reply <strong>HELP</strong> for help.
        </li>
      </ul>

      <h2 className="text-xl font-medium mt-6 mb-2">4. Sharing & Disclosure</h2>
      <p>
        We may share information with service providers who support our Services
        (e.g., hosting, analytics) under confidentiality obligations. We may
        disclose information if required by law or to protect our rights.
      </p>

      <h2 className="text-xl font-medium mt-6 mb-2">5. Security</h2>
      <p>
        We implement reasonable technical and organizational measures to protect
        your information. No method of transmission or storage is 100% secure.
      </p>

      <h2 className="text-xl font-medium mt-6 mb-2">6. Data Retention</h2>
      <p>
        We retain information only as long as necessary for the purposes outlined
        in this Policy or as required by law.
      </p>

      <h2 className="text-xl font-medium mt-6 mb-2">7. Your Choices</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Opt out of SMS: reply <strong>STOP</strong> to any message.</li>
        <li>Request access, update, or deletion by contacting us.</li>
      </ul>

      <h2 className="text-xl font-medium mt-6 mb-2">8. Children’s Privacy</h2>
      <p>
        Our Services are not directed to children under 13, and we do not
        knowingly collect personal information from them.
      </p>

      <h2 className="text-xl font-medium mt-6 mb-2">9. Changes to this Policy</h2>
      <p>
        We may update this Policy from time to time. We will post the updated
        version with a revised “Effective Date.”
      </p>

      <h2 className="text-xl font-medium mt-6 mb-2">10. Contact Us</h2>
      <p>
        Email: <em>Splitify.support@gmail.com</em> <br />
        {/* Phone: <em>[business phone]</em> <br /> */}
        {/* Address: <em>[business address]</em> */}
      </p>
    </div>
  );
}
