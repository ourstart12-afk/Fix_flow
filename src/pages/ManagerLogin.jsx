import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, ShieldCheck, Eye, EyeOff, ArrowRight, Lock } from 'lucide-react';
import { apiRequest } from '../lib/api.js';

function ManagerLogin() {
  const [email, setEmail] = useState('manager@fixflow.com');
  const [password, setPassword] = useState('Manager123!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    apiRequest('/api/auth/me')
      .then((data) => {
        if (!isMounted) return;
        if (data?.user?.role === 'manager') {
          navigate('/manager/dashboard', { replace: true });
        } else {
          setCheckingAuth(false);
        }
      })
      .catch(() => {
        if (isMounted) setCheckingAuth(false);
      });

    return () => { isMounted = false; };
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Enter your authorized manager email.');
      return;
    }
    if (!password) {
      setError('Enter your manager password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { user } = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      if (user.role !== 'manager') {
        setError('Access denied. Customer accounts cannot access the Manager Portal.');
        return;
      }

      navigate('/manager/dashboard', { replace: true });
    } catch (err) {
      if (err.status === 401) {
        setError('Invalid manager credentials. Please check your email and password.');
      } else {
        setError(err.message || 'Authentication service unavailable. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (checkingAuth) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh', background: '#0e1828', color: '#aebbd0' }}>
        <p style={{ fontSize: '14px', fontWeight: '500' }}>Checking manager session…</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: 'linear-gradient(135deg, #0e1828 0%, #152238 50%, #0d1726 100%)',
      padding: '24px',
      color: '#fff',
      fontFamily: 'inherit',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: '#131f33',
        border: '1px solid #23344d',
        borderRadius: '16px',
        padding: '36px 32px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(145deg, #5186ee, #376fd7)',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
          }}>
            <Wrench size={18} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            fix<span style={{ color: '#79a3ff' }}>flow</span>
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: '700',
            background: '#3978e8',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginLeft: 'auto',
          }}>
            Manager Portal
          </span>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', color: '#79a3ff', textTransform: 'uppercase' }}>
            Operations & Facility Access
          </p>
          <h1 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: '750', color: '#fff', letterSpacing: '-0.5px' }}>
            Manager Sign In
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#8da0be', lineHeight: '1.4' }}>
            Enter your department-issued credentials to access the facility control center.
          </p>
        </div>

        {error && (
          <div role="alert" style={{
            background: 'rgba(235, 87, 87, 0.15)',
            border: '1px solid rgba(235, 87, 87, 0.3)',
            color: '#ff8a8a',
            padding: '12px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '20px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label htmlFor="manager-email" style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#c5d1e4', marginBottom: '6px' }}>
              Manager Email
            </label>
            <input
              id="manager-email"
              type="email"
              autoComplete="email"
              placeholder="manager@fixflow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                height: '42px',
                padding: '0 12px',
                borderRadius: '8px',
                background: '#0a1220',
                border: '1px solid #23344d',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label htmlFor="manager-password" style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#c5d1e4', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="manager-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter authorized password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 40px 0 12px',
                  borderRadius: '8px',
                  background: '#0a1220',
                  border: '1px solid #23344d',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#71829e',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              height: '44px',
              marginTop: '8px',
              borderRadius: '9px',
              background: '#3978e8',
              border: 'none',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s',
            }}
          >
            <Lock size={15} />
            {isSubmitting ? 'Verifying credentials…' : 'Access Manager Dashboard'}
            <ArrowRight size={15} />
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #1c2b42',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#657896',
          fontSize: '11px',
        }}>
          <ShieldCheck size={14} style={{ color: '#3978e8' }} />
          <span>Restricted administrative portal. Authorized facility staff only.</span>
        </div>
      </div>
    </div>
  );
}

export default ManagerLogin;
