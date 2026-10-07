import { useState } from 'react';
import PageHeading from '../components/PageHeading.jsx';
import { useApp } from '../context/AppContext.jsx';

function formatNoteDate(value) {
  return new Intl.DateTimeFormat('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export default function Notes() {
  const { notes, addNote, deleteNote } = useApp();
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!content.trim()) {
      setError('Write a reflection before saving.');
      return;
    }
    setError('');
    try {
      await addNote(content.trim());
      setContent('');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="page-content notes-page">
      <PageHeading title="My reflections" />
      <section className="note-compose-card">
        <div className="compose-body">
          <h2>Write a reflection</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="new-note" className="sr-only">Write a reflection</label>
            <textarea id="new-note" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write a thought or something you want to remember..." rows="4" maxLength={1200} />
            <div className="compose-actions">
              {error ? <span className="form-error" role="alert">{error}</span> : <span>{content.length}/1200</span>}
              <button type="submit" className="button button-primary">Save reflection</button>
            </div>
          </form>
        </div>
      </section>
      <div className="notes-heading"><h2>Saved reflections</h2></div>
      {notes.length ? (
        <div className="notes-list">{notes.map((note) => (
          <article className="note-card" key={note.id}>
            <div className="note-card-top"><span className="note-date">{formatNoteDate(note.createdAt)}</span><button type="button" className="delete-note" onClick={() => deleteNote(note.id)}>Delete</button></div>
            <p>{note.content}</p>
          </article>
        ))}</div>
      ) : <p className="plain-empty-state">No reflections saved yet.</p>}
    </div>
  );
}
