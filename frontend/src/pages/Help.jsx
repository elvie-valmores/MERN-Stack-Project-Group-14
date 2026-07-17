import InfoPageLayout from "../components/InfoPageLayout";

function Help() {
  return (
    <InfoPageLayout
      eyebrow="Help Center"
      title="How can we help?"
      description="Find quick answers to common Achievement Hub questions."
    >
      <div className="faq-list">
        <details className="faq-card">
          <summary>How do I create an account?</summary>
          <p>
            Open the Register page, enter your name, email,
            and password, then select Create Account.
          </p>
        </details>

        <details className="faq-card">
          <summary>Why can’t I see my Steam games?</summary>
          <p>
            Your Steam profile and Game details privacy settings
            must be public before your library can be imported.
          </p>
        </details>

        <details className="faq-card">
          <summary>Where do I find my Steam ID?</summary>
          <p>
            Your Steam ID is a 17-digit number linked to your
            Steam account. It can be found through your Steam
            profile URL or a Steam ID lookup tool.
          </p>
        </details>

        <details className="faq-card">
          <summary>Why was I logged out?</summary>
          <p>
            Your login token may have expired or become invalid.
            Log in again to create a new session.
          </p>
        </details>

        <details className="faq-card">
          <summary>Why are some pages empty?</summary>
          <p>
            Game and achievement pages will remain empty until
            a Steam account is connected and imported.
          </p>
        </details>
      </div>
    </InfoPageLayout>
  );
}

export default Help;
