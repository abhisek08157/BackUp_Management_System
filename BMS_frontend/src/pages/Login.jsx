import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import authService from '../services/authService.js';

function randomCaptcha() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [captcha, setCaptcha] = useState(randomCaptcha());
  const [form, setForm] = useState({ username: '', password: '', captchaInput: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const refreshCaptcha = () => setCaptcha(randomCaptcha());

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'User name is required';
    if (!form.password.trim()) e.password = 'Password is required';
    if (!form.captchaInput.trim()) e.captchaInput = 'Enter the string shown in the image';
    else if (form.captchaInput.trim().toLowerCase() !== captcha.toLowerCase()) e.captchaInput = 'Captcha does not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {

    e.preventDefault();

    setAuthError("");

    if (!validate()) {

        refreshCaptcha();

        setForm((f) => ({
            ...f,
            captchaInput: ""
        }));

        return;

    }

    setSubmitting(true);

    try {

        const response = await authService.login(

            form.username.trim(),

            form.password

        );

        if (!response.success) {

            setAuthError(

                response.message ||

                "Invalid Username or Password"

            );

            refreshCaptcha();

            setForm((f) => ({
                ...f,
                captchaInput: ""
            }));

            return;

        }

        sessionStorage.setItem(

            "irbms_token",

            "loggedin"

        );

        sessionStorage.setItem(

            "role",

            response.role

        );

        login(form.username.trim(), response.role);

        navigate(

            "/dashboard",

            {

                replace: true

            }

        );

    }

    catch (err) {

        setAuthError(

            err.message ||

            "Login Failed"

        );

        refreshCaptcha();

        setForm((f) => ({
            ...f,
            captchaInput: ""
        }));

    }

    finally {

        setSubmitting(false);

    }

};

  const captchaLetters = useMemo(() => captcha.split(''), [captcha]);

  return (
    <div className="login-page">
      <div className="hdr-top">
        <span>भारतीय रेल · Government of India · Ministry of Railways</span>
        <span>Administrator Console</span>
      </div>
      <div className="tricolor-strip" />
      <div className="login-hero">
        <div className="login-panel">
          <div className="login-side">

    <div className="login-top">

        <div className="brand">

            <img
    src="/railway-logo.png"
    alt="Railway Logo"
    className="railway-logo"
/>

            <div>

                <h1>Indian Railways</h1>

                <p>
                    Backup Monitoring &
                    Database Administration Console
                </p>

            </div>

        </div>

        <div className="rail-track"></div>

        <ul className="feature-list">

            <li>🗄 Centralised monitoring of MySQL & Oracle production instances</li>

            <li>☁ Manual, scheduled and cloud backups</li>

            <li>🛡 Zone-wise audit trail for every backup run</li>

            <li>👥 Role-based secure access</li>

        </ul>

    </div>

    <div className="train-wrapper">

        <img
    src="/train.jpg"
    alt="Indian Railway"
    className="train-image"
/>

    </div>



            <div className="train-wrapper">
              <div className="train-placeholder" aria-hidden="true">🚄</div>
            </div>

            <div style={{ fontSize: 11.5, color: '#9FBBDD' }}>
              Maintained by CRIS · Ministry of Railways, Government of India
            </div>
          </div>

          <div className="login-form-side">
            <div className="login-title">

    <div className="login-icon">

        🚆

    </div>

    <div>

        <h2>Administrator Login</h2>

        <div className="sub">
            East Coast Railway · Please sign in to continue
        </div>

    </div>

</div>
            <div className="sub">East Coast Railway · Please sign in to continue</div>

            {authError && <div className="alert error">{authError}</div>}

            <form onSubmit={onSubmit} noValidate>
              <div className="field" style={{ marginBottom: 14 }}>
                <label htmlFor="username">User name <span className="req">*</span></label>
                <input id="username" className={errors.username ? 'invalid' : ''} value={form.username} onChange={update('username')} autoComplete="username" placeholder="e.g. ecr_dba01" />
                {errors.username && <span className="err">{errors.username}</span>}
              </div>
              <div className="field" style={{ marginBottom: 14 }}>
                <label htmlFor="password">Password <span className="req">*</span></label>
                <input id="password" type="password" className={errors.password ? 'invalid' : ''} value={form.password} onChange={update('password')} autoComplete="current-password" placeholder="••••••••" />
                {errors.password && <span className="err">{errors.password}</span>}
              </div>

              <div className="field" style={{ marginBottom: 6 }}>
                <label>Please enter the string shown in the image <span className="req">*</span></label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="captcha-box">{captchaLetters.join(' ')}</span>
                  <button type="button" className="btn btn-sm" onClick={refreshCaptcha} title="Refresh code">↻</button>
                </div>
              </div>
              <div className="field" style={{ marginBottom: 18 }}>
                <input className={errors.captchaInput ? 'invalid' : ''} value={form.captchaInput} onChange={update('captchaInput')} placeholder="Enter code above" />
                {errors.captchaInput && <span className="err">{errors.captchaInput}</span>}
              </div>

              <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} disabled={submitting}>
                {submitting ? <span className="spinner" /> : 'Sign In'}
              </button>
            </form>

            <div style={{ textAlign: 'right', marginTop: 10 }}><a href="#!" style={{ fontSize: 12.5 }}>Forgot Password?</a></div>
            <div className="login-demo-hint">
              Enter your authorized Railway administrator credentials.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
