import { useMemo, useState } from 'react';

function App() {
  const [title, setTitle] = useState('AWS Certified Cloud Practitioner');
  const [imageUrl, setImageUrl] = useState('https://images.credly.com/images/example-badge.png');
  const [credentialUrl, setCredentialUrl] = useState('https://www.credly.com/badges/your-badge-id/public_url');
  const [width, setWidth] = useState('140');

  const markdown = useMemo(() => {
    const safeTitle = title.trim() || 'Certification Badge';
    return `[![${safeTitle}](${imageUrl.trim()})](${credentialUrl.trim()})`;
  }, [title, imageUrl, credentialUrl]);

  const html = useMemo(() => {
    const safeTitle = title.trim() || 'Certification Badge';
    const safeWidth = Number(width) > 0 ? Number(width) : 140;
    return `<a href="${credentialUrl.trim()}" target="_blank" rel="noopener noreferrer"><img src="${imageUrl.trim()}" alt="${safeTitle}" width="${safeWidth}" /></a>`;
  }, [title, imageUrl, credentialUrl, width]);

  const copyToClipboard = async (value) => {
    await navigator.clipboard.writeText(value);
  };

  return (
    <main className="container">
      <h1>Credly Badge Link Builder</h1>
      <p>Create badge image snippets you can paste into your GitHub README.</p>

      <section className="card">
        <label>
          Badge title / alt text
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <label>
          Credly badge image URL
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://images.credly.com/...png" />
        </label>

        <label>
          Credly public credential URL
          <input value={credentialUrl} onChange={(e) => setCredentialUrl(e.target.value)} placeholder="https://www.credly.com/badges/.../public_url" />
        </label>

        <label>
          Image width (px)
          <input type="number" min="50" max="400" value={width} onChange={(e) => setWidth(e.target.value)} />
        </label>
      </section>

      <section className="card">
        <h2>Preview</h2>
        <a href={credentialUrl} target="_blank" rel="noopener noreferrer">
          <img src={imageUrl} alt={title} width={Number(width) || 140} />
        </a>
      </section>

      <section className="card">
        <h2>Markdown for README.md</h2>
        <pre>{markdown}</pre>
        <button onClick={() => copyToClipboard(markdown)}>Copy Markdown</button>
      </section>

      <section className="card">
        <h2>HTML snippet (if needed)</h2>
        <pre>{html}</pre>
        <button onClick={() => copyToClipboard(html)}>Copy HTML</button>
      </section>

      <section className="card">
        <h2>How to import in README</h2>
        <ol>
          <li>Open your GitHub repository README.md.</li>
          <li>Paste the generated Markdown at the location where you want the badge.</li>
          <li>Commit the README change and push.</li>
        </ol>
      </section>
    </main>
  );
}

export default App;
