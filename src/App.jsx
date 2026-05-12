import { useState } from 'react';

function App() {
  const [username, setUsername] = useState('steven-tapscott');
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getBadgeData = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.badges)) return payload.badges;
    if (payload.data && Array.isArray(payload.data.badges)) return payload.data.badges;
    return [];
  };

  const fetchBadges = async (event) => {
    event.preventDefault();
    const cleanUsername = username.trim();

    if (!cleanUsername) {
      setError('Please enter a Credly username.');
      setBadges([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoints = [
        `https://www.credly.com/users/${encodeURIComponent(cleanUsername)}/badges.json`,
        `https://www.credly.com/users/${encodeURIComponent(cleanUsername)}/badges`,
      ];

      let parsed = null;

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: {
              Accept: 'application/json',
            },
          });

          if (!response.ok) continue;

          const contentType = response.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) continue;

          const json = await response.json();
          const extracted = getBadgeData(json);
          if (extracted.length > 0) {
            parsed = extracted;
            break;
          }
        } catch {
          // Try next endpoint.
        }
      }

      if (!parsed) {
        throw new Error('No badges found or username is not public.');
      }

      setBadges(parsed);
    } catch (fetchError) {
      setBadges([]);
      setError(fetchError.message || 'Unable to fetch badges.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <h1>Credly Badges by Username</h1>
      <p>Enter a Credly username and pull all public badges into a table. The form defaults to the test user <strong>steven-tapscott</strong>.</p>

      <section className="card">
        <form onSubmit={fetchBadges} className="search-form">
          <label htmlFor="username">Credly Username</label>
          <div className="search-row">
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="example: john-doe"
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Loading…' : 'Get Badges'}
            </button>
          </div>
        </form>

        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="card">
        <h2>Badges ({badges.length})</h2>

        {badges.length === 0 ? (
          <p>No badges to display yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Badge</th>
                  <th>Title</th>
                  <th>Issued</th>
                  <th>Credential</th>
                </tr>
              </thead>
              <tbody>
                {badges.map((badge) => {
                  const id = badge.id || badge.badge_template_id || badge.url;
                  const title = badge.badge_template?.name || badge.name || 'Untitled Badge';
                  const image =
                    badge.badge_template?.image_url ||
                    badge.badge_template?.image?.url ||
                    badge.image_url ||
                    '';
                  const issuedAt = badge.issued_at || badge.issued_on || badge.created_at || '';
                  const credentialUrl = badge.public_url || badge.url || '#';

                  return (
                    <tr key={id}>
                      <td>{image ? <img src={image} alt={title} width="64" /> : 'N/A'}</td>
                      <td>{title}</td>
                      <td>{issuedAt ? new Date(issuedAt).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        {credentialUrl !== '#' ? (
                          <a href={credentialUrl} target="_blank" rel="noopener noreferrer">
                            View
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
