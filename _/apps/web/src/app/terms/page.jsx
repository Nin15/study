export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <a
            href="/"
            className="text-[#2962FF] hover:text-[#1E4FCC] text-sm font-medium"
          >
            ← Back to Home
          </a>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Last updated: December 28, 2025
        </p>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          <p>By using this website, you agree to these terms.</p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Service description
            </h2>
            <p>
              This website provides tools for organizing study materials,
              tracking time, and viewing progress.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              User responsibility
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>You are responsible for the data you enter</li>
              <li>Do not use the service for illegal or harmful activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Availability
            </h2>
            <p>
              The service is provided "as is". We may change or stop the service
              at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Accounts
            </h2>
            <p>
              If you create an account, you are responsible for keeping your
              login details secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Premium Features
            </h2>
            <p>
              Some features may require a premium subscription. Premium features
              include:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Custom themes and accent colors</li>
              <li>Custom layouts</li>
              <li>Timer sounds</li>
              <li>Premium templates</li>
            </ul>
            <p>
              Premium subscriptions are billed according to the plan you select.
              You may cancel at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Liability
            </h2>
            <p>
              We are not responsible for data loss, interruptions, or issues
              caused by technical problems.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Changes
            </h2>
            <p>These terms may be updated as the service evolves.</p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            By using this website, you agree to these Terms of Service and our{" "}
            <a href="/privacy" className="text-[#2962FF] hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
