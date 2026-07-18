import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function LoginPage() {
  const { login, loading, error } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(form);
      navigate('/app');
    } catch (err) {
      setMessage(error || 'Unable to sign in.');
    }
  };

  const handleAutofillDemo = async () => {
    const demoCredentials = { email: 'demo@vitalis.com', password: 'password123' };
    setForm(demoCredentials);
    try {
      await login(demoCredentials);
      navigate('/app');
    } catch (err) {
      setMessage(error || 'Unable to sign in.');
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <h1>Sign in to AI Health Navigator</h1>
        <p>Access your health dashboard, symptom tools and report analysis.</p>
        <form onSubmit={handleSubmit} aria-label="Login form">
          <label>
            Email address
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Password
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </label>
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          {message && <p className="form-message error">{message}</p>}
          {error && !message && <p className="form-message error">{error}</p>}
        </form>

        <div className="demo-credentials-card">
          <div className="demo-badge">PREVIEW DEMO</div>
          <h3>Frictionless Test Account</h3>
          <p>Access the pre-populated clinical dashboard, timelines, and AI analysis instantly.</p>
          <div className="credential-row">
            <span>Email:</span> <code>demo@vitalis.com</code>
          </div>
          <div className="credential-row">
            <span>Password:</span> <code>password123</code>
          </div>
          <button 
            type="button" 
            className="demo-autofill-button" 
            onClick={handleAutofillDemo}
            disabled={loading}
          >
            Auto-fill & Sign In
          </button>
        </div>

        <div className="auth-footnote">
          <Link to="/forgot-password">Forgot password?</Link>
          <span>
            New here? <Link to="/register">Create an account</Link>
          </span>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
