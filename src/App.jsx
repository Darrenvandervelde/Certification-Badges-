import { useMemo, useState } from 'react';

const badgeConfigs = [
  {
    key: 'followers',
    label: 'Followers',
    color: '0e75b6',
    logo: 'github',
    value: (profile) => profile.followers,
  },
  {
    key: 'following',
    label: 'Following',
    color: '1f6feb',
    logo: 'github',
    value: (profile) => profile.following,
  },
  {
    key: 'repos',
    label: 'Public Repos',
    color: '238636',
    logo: 'github',
    value: (profile) => profile.public_repos,
  },
  {
    key: 'gists',
    label: 'Public Gists',
    color: '7c3aed',
    logo: 'gist',
    value: (profile) => profile.public_gists,
  },
  {
    key: 'joined',
    label: 'Joined',
    color: 'd97706',
    logo: 'github',
    value: (profile) => new Date(profile.created_at).getFullYear(),
  },
];

const buildBadgeUrl = ({ label, message, color, logo }) => {
  const safeLabel = encodeURIComponent(label);
  const safeMessage = encodeURIComponent(String(message));
  const safeColor = encodeURIComponent(color);
  const safeLogo = encodeURIComponent(logo);
  return `https://img.shields.io/badge/${safeLabel}-${safeMessage}-${safeColor}?logo=${safeLogo}&logoColor=white`;
};

function App() {
  const [username, setUsername] = useState('octocat');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);

  const generatedBadges = useMemo(() => {
    if (!profile) return [];

    return badgeConfigs.map((config) => {
      const value = config.value(profile);
      const image = buildBadgeUrl({
        label: config.label,
        message: value,
        color: config.color,
        logo: config.logo,
      });

      const markdown = `[![${config.label}](${image})](https://github.com/${profile.login})`;

      return {
        ...config,
        value,
        image,
        markdown,
      };
    });
  }, [profile]);

  const markdownBlock = generatedBadges.map((badge) => badge.markdown).join('\n');

  const fetchProfile = async (event) => {
    event.preventDefault();

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError('Please enter a GitHub username.');
      setProfile(null);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`);
      if (response.status === 404) {
        throw new Error('User not found. Please check the username and try again.');
      }
      if (!response.ok) {
        throw new Error('GitHub API is temporarily unavailable. Please try again.');
      }

      const json = await response.json();
      setProfile(json);
    } catch (fetchError) {
      setProfile(null);
      setError(fetchError.message || 'Unable to fetch profile.');
    } finally {
      setLoading(false);
    }
  };

  const copyMarkdown = async () => {
    if (!markdownBlock) return;
    await navigator.clipboard.writeText(markdownBlock);
  };

  return (
    <main className="container">
      <h1>GitHub Achievement Badge Builder</h1>
      <p>Enter your GitHub username to generate up-to-date badges you can paste directly into your GitHub profile README.</p>

      <section className="card">
        <form onSubmit={fetchProfile} className="search-form">
          <label htmlFor="username">GitHub Username</label>
          <div className="search-row">
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="example: octocat"
            />
            <button type="submit" disabled={loading}>{loading ? 'Updating…' : 'Generate Badges'}</button>
          </div>
        </form>
        {error ? <p className="error">{error}</p> : null}
      </section>

      {profile ? (
        <>
          <section className="card">
            <h2>Preview for @{profile.login}</h2>
            <div className="badges-grid">
              {generatedBadges.map((badge) => (
                <a key={badge.key} href={`https://github.com/${profile.login}`} target="_blank" rel="noreferrer">
                  <img src={badge.image} alt={`${badge.label}: ${badge.value}`} />
                </a>
              ))}
            </div>
          </section>

          <section className="card">
            <h2>Markdown for GitHub Profile</h2>
            <p>Copy and paste this block into your <code>README.md</code> in the profile repository.</p>
            <textarea value={markdownBlock} readOnly rows={8} />
            <button type="button" onClick={copyMarkdown} className="copy-btn">Copy Markdown</button>
          </section>
        </>
      ) : null}
    </main>
  );
}

export default App;
