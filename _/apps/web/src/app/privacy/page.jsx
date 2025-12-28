export default function PrivacyPolicy() {
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
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Last updated: December 28, 2025
        </p>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          <p>
            This website is a study organizing tool that helps users manage
            folders, timers, and progress.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              What data we collect
            </h2>
            <p>We only collect the minimum data needed for the site to work:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Account information (such as email and password), if you create
                an account
              </li>
              <li>Study data you choose to save (folders, timers, progress)</li>
            </ul>
            <p>Passwords are stored securely and are not visible to us.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Cookies
            </h2>
            <p>We use essential cookies only to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Keep users logged in</li>
              <li>Maintain secure sessions</li>
            </ul>
            <p>We do not use cookies for advertising or tracking.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              How we use data
            </h2>
            <p>Your data is used only to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide the study organizer features</li>
              <li>Save and load your progress</li>
            </ul>
            <p>We do not sell or share your data with third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Data storage
            </h2>
            <p>
              Your data is stored securely on our servers and is kept only as
              long as necessary for the service to function.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Children's privacy
            </h2>
            <p>
              This website is intended for educational use. We do not knowingly
              collect unnecessary personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Changes
            </h2>
            <p>This policy may be updated if the website changes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Contact
            </h2>
            <p>
              If you have questions about this policy, please contact us through
              the website.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            By using this website, you agree to this Privacy Policy and our{" "}
            <a href="/terms" className="text-[#2962FF] hover:underline">
              Terms of Service
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
