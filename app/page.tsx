export default function Home() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Farcaster Space App SDK</h1>
      <p>API endpoints for building Farcaster Space applications.</p>
      <h2>Available API Routes:</h2>
      <ul>
        <li><code>/api/spaces/create</code> - Create a new space</li>
        <li><code>/api/spaces/invite</code> - Invite users to a space</li>
        <li><code>/api/spaces/leaderboard</code> - Get space leaderboard</li>
        <li><code>/api/spaces/list</code> - List all spaces</li>
        <li><code>/api/spaces/moderate</code> - Moderate a space</li>
        <li><code>/api/spaces/stream</code> - Stream space data</li>
        <li><code>/api/spaces/token</code> - Get access token</li>
      </ul>
    </main>
  );
}
