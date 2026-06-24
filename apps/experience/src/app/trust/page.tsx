import Link from 'next/link';

export const metadata = { title: 'Trust & Security — PSL One' };

/**
 * Trust & Security Centre — Sprint 39
 *
 * Documents PSL One security posture, SOC2 readiness status, and data practices.
 * NOT SOC2 CERTIFIED — evidence collection in progress only.
 *
 * PSL_INACTIVE · NO_REAL_MONEY · WC_BETA
 */
export default function TrustPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* beta banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center">
        <span className="text-xs text-amber-400/90 font-medium">
          BETA — SOC2 readiness in progress · Not yet certified · Evidence collection started
        </span>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0a1628] via-[#071020] to-[#050505] border-b border-white/10 py-14 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🔒</span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full">
              Trust & Security
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Security <span className="text-emerald-400">Posture</span>
          </h1>
          <p className="text-white/60 max-w-xl">
            PSL One is built with enterprise-grade security controls. SOC2 readiness evidence collection is in progress.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">

        {/* SOC2 status */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
          <div className="flex items-start gap-4">
            <span className="text-2xl">⚠️</span>
            <div>
              <h2 className="font-bold text-sm text-amber-400 mb-1">SOC2 Readiness — In Progress</h2>
              <p className="text-xs text-white/60">
                PSL One is NOT yet SOC2 certified. Evidence collection and control implementation began 2026-06.
                A formal audit is planned for a future date. Do not rely on this page as a compliance certification.
              </p>
            </div>
          </div>
        </div>

        {/* Security controls grid */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">Security Controls</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([
              { icon: '🔑', title: 'JWT Authentication', desc: 'HS256 signed tokens with expiration enforcement. Algorithm confusion prevention. alg:none rejected. 1h TTL.', status: 'IMPLEMENTED' },
              { icon: '👤', title: 'RBAC Authorization', desc: 'Role-based access control with PSL_ADMIN, CLUB_OFFICIAL, SPONSOR roles. Guards on every protected route.', status: 'IMPLEMENTED' },
              { icon: '🏢', title: 'Tenant Isolation', desc: 'Club portal scoped to club membership. Sponsor portal scoped to sponsor organisation. Cross-tenant access denied.', status: 'IMPLEMENTED' },
              { icon: '📋', title: 'Audit Logging', desc: 'Admin operations logged to AdminAuditLog. Auth events recorded. Import operations audited.', status: 'IMPLEMENTED' },
              { icon: '🔒', title: 'Secret Management', desc: 'Provider keys stored in AWS SSM Parameter Store. Never committed to git. Never exposed in API responses.', status: 'IMPLEMENTED' },
              { icon: '🛡️', title: 'Security Scanning', desc: 'Dependency audit in CI. Trivy container scanning. No HIGH CVEs unaddressed.', status: 'IMPLEMENTED' },
              { icon: '💳', title: 'No Real-Money Wallet', desc: 'Wallet is sandbox-only. No production payment processing. No real cash stored or transferred.', status: 'ENFORCED' },
              { icon: '📊', title: 'SOC2 Evidence Collection', desc: 'Control matrix, risk register, and evidence register created. Formal audit not yet completed.', status: 'IN_PROGRESS' },
            ] as const).map(({ icon, title, desc, status }) => (
              <div key={title} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <h3 className="font-semibold text-sm">{title}</h3>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono flex-shrink-0 ${
                    status === 'IMPLEMENTED' ? 'bg-emerald-500/15 text-emerald-400' :
                    status === 'ENFORCED' ? 'bg-blue-500/15 text-blue-400' :
                    'bg-amber-500/15 text-amber-400'
                  }`}>{status}</span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Data & Privacy */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-5">Data & Privacy</h2>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 space-y-4 text-sm">
            <p className="text-white/70">PSL One processes fan data under the South African Protection of Personal Information Act (POPIA). Key commitments:</p>
            <ul className="space-y-2 text-white/60 text-xs">
              <li className="flex gap-2"><span className="text-emerald-400 flex-shrink-0">✓</span> Account data stored in AWS af-south-1 region</li>
              <li className="flex gap-2"><span className="text-emerald-400 flex-shrink-0">✓</span> Passwords hashed with bcrypt (never stored in plaintext)</li>
              <li className="flex gap-2"><span className="text-emerald-400 flex-shrink-0">✓</span> Right to access and deletion (POPIA compliance roadmap)</li>
              <li className="flex gap-2"><span className="text-emerald-400 flex-shrink-0">✓</span> No real-money transactions — no financial data stored</li>
              <li className="flex gap-2"><span className="text-emerald-400 flex-shrink-0">✓</span> Provider API keys never stored in frontend or logs</li>
            </ul>
          </div>
        </section>

        {/* Security contact */}
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-bold text-sm mb-2">Security Contact</h2>
          <p className="text-xs text-white/50 mb-3">
            To report a security vulnerability or privacy concern, contact the PSL One security team.
          </p>
          <a
            href="mailto:security@pslone.co.za"
            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            security@pslone.co.za →
          </a>
        </section>

        <div className="flex gap-4">
          <Link href="/" className="text-xs text-white/40 hover:text-white/60 transition-colors">← Home</Link>
        </div>
      </div>
    </main>
  );
}
