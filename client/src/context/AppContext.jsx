import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest, normalizeNote, normalizeSangat } from '../lib/api.js';

const AppContext = createContext(null);

function readToken() {
  return localStorage.getItem('sanjhi-token');
}

export function AppProvider({ children }) {
  const [token, setToken] = useState(readToken);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(() => Boolean(localStorage.getItem('sanjhi-token')));
  const [sangat, setSangat] = useState([]);
  const [notes, setNotes] = useState([]);
  const [appError, setAppError] = useState('');
  const accountId = user?.id;

  useEffect(() => {
    localStorage.removeItem('sanjhi-user');
    localStorage.removeItem('sanjhi-notes');
    localStorage.removeItem('sanjhi-sessions');
    localStorage.removeItem('sanjhi-signed-out');
  }, []);

  useEffect(() => {
    if (!token) return undefined;

    let active = true;

    async function loadAccount() {
      try {
        const profileData = await apiRequest('/auth/me', { token });
        if (!active) return;
        setUser(profileData.user);

        try {
          const noteData = await apiRequest('/notes', { token });
          if (active) setNotes(noteData.notes.map(normalizeNote));
        } catch (error) {
          if (active) setAppError(error.message);
        }
      } catch (error) {
        if (!active) return;
        setUser(null);
        setNotes([]);
        setSangat([]);
        setAppError(error.message);
        if (error.status === 401) {
          localStorage.removeItem('sanjhi-token');
          setToken(null);
        }
      } finally {
        if (active) setAuthLoading(false);
      }
    }

    loadAccount();
    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    if (!token || !accountId) return undefined;
    let active = true;
    apiRequest('/sangat', { token })
      .then((data) => { if (active) setSangat(data.sangat.map(normalizeSangat)); })
      .catch((error) => { if (active) setAppError(error.message); });
    return () => { active = false; };
  }, [token, accountId]);

  const signIn = useCallback(({ token: authToken, user: profile }) => {
    localStorage.setItem('sanjhi-token', authToken);
    setToken(authToken);
    setUser(profile);
    setNotes([]);
    setAuthLoading(true);
    setAppError('');
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('sanjhi-token');
    setToken(null);
    setUser(null);
    setSangat([]);
    setNotes([]);
    setAuthLoading(false);
    setAppError('');
  }, []);

  const toggleAttendance = useCallback(async (sangatId) => {
    const listing = sangat.find((item) => item.id === sangatId);
    if (!listing || !token) return;
    try {
      const attending = !listing.isAttending;
      const result = await apiRequest(`/sangat/${sangatId}/rsvp`, { method: attending ? 'POST' : 'DELETE', token });
      setSangat((current) => current.map((item) => item.id === sangatId
        ? { ...item, isAttending: attending, attendeeCount: result.attendeeCount }
        : item));
    } catch (error) {
      setAppError(error.message);
    }
  }, [sangat, token]);

  const addNote = useCallback(async (content) => {
    if (!token) throw new Error('Sign in to save a reflection.');
    try {
      const { note } = await apiRequest('/notes', { method: 'POST', token, body: { content } });
      setNotes((current) => [normalizeNote(note), ...current]);
    } catch (error) {
      setAppError(error.message);
      throw error;
    }
  }, [token]);

  const deleteNote = useCallback(async (noteId) => {
    if (!token) return;
    try {
      await apiRequest(`/notes/${noteId}`, { method: 'DELETE', token });
      setNotes((current) => current.filter((note) => note.id !== noteId));
    } catch (error) {
      setAppError(error.message);
    }
  }, [token]);

  const clearAppError = useCallback(() => {
    setAppError('');
  }, []);

  const updateProfile = useCallback(async (profile) => {
    const { user: updatedUser } = await apiRequest('/auth/me', { method: 'PATCH', token, body: profile });
    setUser(updatedUser);
    return updatedUser;
  }, [token]);

  const value = useMemo(() => ({
    user, token, authLoading, sangat, notes, appError,
    signIn, signOut, toggleAttendance, addNote, deleteNote, clearAppError, updateProfile,
  }), [user, token, authLoading, sangat, notes, appError, signIn, signOut, toggleAttendance, addNote, deleteNote, clearAppError, updateProfile]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
