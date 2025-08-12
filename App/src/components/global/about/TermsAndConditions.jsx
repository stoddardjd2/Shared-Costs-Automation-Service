import React from "react";

export default function TermsAndConditions() {
  return (
    <div className="max-w-3xl mx-auto p-6 leading-7">
      <h1 className="text-2xl font-semibold mb-4">Terms & Conditions</h1>
      <p className="text-sm text-gray-600 mb-6">
        Effective Date: <strong>8/11/25</strong>
      </p>

      <h2 className="text-xl font-medium mt-6 mb-2">1. Agreement to Terms</h2>
      <p>
        These Terms & Conditions (“Terms”) govern your access to and use of the
        services provided by <strong>Splitify</strong> (“we,” “our,”
        “us”) including our website, apps, and SMS messaging program (the
        “Services”). By using the Services, you agree to these Terms.
      </p>

      <h2 className="text-xl font-medium mt-6 mb-2">2. Eligibility</h2>
      <p>
        You must be at least 18 years old (or the age of majority in your
        jurisdiction) to use the Services. If the Services relate to age-restricted
        products, you may be required to complete an age gate prior to access.
      </p>

      <h2 className="text-xl font-medium mt-6 mb-2">3. Account & Accuracy</h2>
      <p>
        You are responsible for maintaining the security of your account
        credentials and for ensuring information you provide is accurate and
        up to date.
      </p>

      <h2 className="text-xl font-medium mt-6 mb-2">4. SMS Program Terms</h2>
      <p>
        By opting in, you agree to receive text messages from{" "}
        <strong>Splitify</strong> related to{" "}
        <em> transactional notifications, reminders, and
        marketing (if separately opted-in)</em>.
      </p>
      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li>
          <strong>Opt-Out:</strong> Reply <strong>STOP</strong> to any message to
          unsubscribe.
        </li>
        <li>
          {/* <strong>Help:</strong> Reply <strong>HELP</strong> or contact us at{" "} */}
          <em>Contact us at Splitifiy.support@gmail.com</em>.
        </li>
        <li>
          <strong>Rates & Frequency:</strong> Message and data rates may apply.
          Message frequency may vary.
        </li>
        <li>
          <strong>Consent:</strong> Consent is not a condition of purchase.
        </li>
        {/* <li>
          <strong>Canada (if applicable):</strong> Canadian toll-free programs
          require double opt-in (confirm by replying to the confirmation message).
        </li> */}
      </ul>
      <p className="mt-2 text-sm text-gray-700">
        Carriers are not liable for delayed or undelivered messages.
      </p>

      <h2 className="text-xl font-medium mt-6 mb-2">5. Acceptable Use</h2>
      <p>
        You agree not to misuse the Services, interfere with their operation, or
        violate any law or third-party rights.
      </p>

      <h2 className="text-xl font-medium mt-6 mb-2">6. Intellectual Property</h2>
      <p>
        The Services and all related content are owned by{" "}
        <strong>Splitify</strong> or our licensors and are protected by
        intellectual property laws. You may not copy, modify, or distribute any
        part of the Services without permission.
      </p>

      <h2 className="text-xl font-medium mt-6 mb-2">7. Disclaimers</h2>
      <p>
        The Services are provided “as is” without warranties of any kind, whether
        express or implied, including merchantability, fitness for a particular
        purpose, and non-infringement.
      </p>

      <h2 className="text-xl font-medium mt-6 mb-2">8. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law,{" "}
        <strong>Splitify</strong> will not be liable for any indirect,
        incidental, special, consequential, or punitive damages, or any loss of
        profits or revenues, arising from your use of the Services.
      </p>

      <h2 className="text-xl font-medium mt-6 mb-2">9. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless{" "}
        <strong>Splitify</strong> from any claims, damages, liabilities,
        and expenses arising from your use of the Services or violation of these
        Terms.
      </p>

      <h2 className="text-xl font-medium mt-6 mb-2">10. Changes to the Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the
        Services after changes become effective constitutes your acceptance of
        the updated Terms.
      </p>

      <h2 className="text-xl font-medium mt-6 mb-2">11. Governing Law</h2>
      <p>
        These Terms are governed by the laws of <em>Washington State</em>, without
        regard to conflicts of law principles.
      </p>

      <h2 className="text-xl font-medium mt-6 mb-2">12. Contact</h2>
      <p>
        Questions? Contact us at <em>Splitify.support@gmail.com</em>,{" "}
        {/* <em>[business phone]</em>, or <em>[business address]</em>. */}
      </p>
    </div>
  );
}
