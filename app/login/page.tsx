'use client';
import { LoginForm } from "@/components/auth/login-form";
import { useTheme } from "@/lib/theme-provider";

export default function LoginPage() {
  const { theme } = useTheme();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: theme === 'dark' ? 'linear-gradient(135deg, #060810 0%, #0f1419 100%)' : 'linear-gradient(135deg, #eef1f8 0%, #f8fafb 100%)',
      transition: 'background 0.25s',
      padding: '16px',
    }}>
      <style>{`
        @media (max-width: 480px) {
          .login-container {
            max-width: 100%;
          }
          .login-logo {
            font-size: 24px;
          }
          .login-card {
            padding: 24px !important;
          }
          .login-card-title {
            font-size: 14px;
          }
          .login-card-sub {
            font-size: 11px;
          }
        }
      `}</style>
      <div className="login-container" style={{
        width: '100%',
        maxWidth: '420px',
      }}>
        {/* Logo & Branding */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="login-logo" style={{
            fontWeight: '700',
            fontFamily: 'Syne, sans-serif',
            marginBottom: '8px',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}>
            <span>📦</span>
            Move Ready Plus
          </div>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            fontFamily: 'DM Mono, monospace',
            marginTop: '8px',
          }}>
            Real-Time Operations Command Center
          </p>
        </div>

        {/* Card Container */}
        <div className="login-card" style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '32px',
          backdropFilter: 'blur(10px)',
          boxShadow: theme === 'dark' 
            ? '0 8px 32px rgba(0,0,0,0.3)' 
            : '0 8px 32px rgba(0,0,0,0.08)',
          transition: 'all 0.25s',
        }}>
          <div className="login-card-title" style={{
            fontWeight: '600',
            fontFamily: 'Syne, sans-serif',
            marginBottom: '8px',
            color: 'var(--text-primary)',
          }}>
            Sign In
          </div>
          <p className="login-card-sub" style={{
            color: 'var(--text-secondary)',
            fontFamily: 'DM Mono, monospace',
            marginBottom: '24px',
          }}>
            Enter your credentials to access the dispatch center
          </p>

          <LoginForm />

          {/* Footer */}
          <div style={{
            borderTop: '1px solid var(--border)',
            marginTop: '24px',
            paddingTop: '24px',
          }}>
            <p style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontFamily: 'DM Mono, monospace',
              textAlign: 'center',
              lineHeight: '1.5',
            }}>
              Protected by enterprise-grade security.<br />
              Questions? Contact support@moveready.ca
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          marginTop: '24px',
          fontSize: '11px',
          color: 'var(--text-muted)',
          fontFamily: 'DM Mono, monospace',
        }}>
          <span>🔒</span>
          <span>SSL Encrypted • Two-Factor Authentication Available</span>
        </div>
      </div>
    </div>
  );
}
