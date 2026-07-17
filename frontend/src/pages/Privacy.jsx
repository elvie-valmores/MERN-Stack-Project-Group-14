import InfoPageLayout from "../components/InfoPageLayout";

function Privacy() {
  return (
    <InfoPageLayout
      eyebrow="Privacy"
      title="Your data stays protected."
      description="This page explains what Achievement Hub stores and how account and Steam information are used."
    >
      <div className="info-text-card">
        <h2>Account information</h2>
        <p>
          Achievement Hub stores the name and email address
          you provide when creating an account.
        </p>

        <h2>Passwords</h2>
        <p>
          Passwords are hashed before being stored. Plain-text
          passwords are not saved in the database.
        </p>

        <h2>Steam information</h2>
        <p>
          Only public Steam information is requested, such as
          your Steam ID, display name, avatar, games, playtime,
          and public achievements.
        </p>

        <h2>API credentials</h2>
        <p>
          Steam API keys and database connection strings remain
          on the server and are not exposed to the browser.
        </p>

        <h2>Data sharing</h2>
        <p>
          Achievement Hub does not sell user information.
          Public ranking information may appear on the leaderboard.
        </p>
      </div>
    </InfoPageLayout>
  );
}

export default Privacy;
