import InfoPageLayout from "../components/InfoPageLayout";

function Terms() {
  return (
    <InfoPageLayout
      eyebrow="Terms of Use"
      title="Use Achievement Hub responsibly."
      description="These terms describe the basic rules for using the platform."
    >
      <div className="info-text-card">
        <h2>Account responsibility</h2>
        <p>
          You are responsible for keeping your account
          information accurate and protecting your password.
        </p>

        <h2>Acceptable use</h2>
        <p>
          Do not attempt to damage the service, access another
          user’s account, or misuse the application.
        </p>

        <h2>Steam dependency</h2>
        <p>
          Some features depend on Steam and its public APIs.
          Availability may change if Steam changes or limits access.
        </p>

        <h2>Accuracy of imported data</h2>
        <p>
          Imported game, playtime, and achievement information
          depends on the data Steam provides.
        </p>

        <h2>Service availability</h2>
        <p>
          Achievement Hub may be updated, changed, or temporarily
          unavailable during maintenance.
        </p>
      </div>
    </InfoPageLayout>
  );
}

export default Terms;
