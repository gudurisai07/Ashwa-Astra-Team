import { Link } from 'react-router-dom';

export default function JobCard({ job, children }) {
  const skills = Array.isArray(job.requiredSkills)
    ? job.requiredSkills
    : (job.requiredSkills ? job.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean) : []);

  // Generate a stylish gradient for company avatar
  const initials = (job.companyName || 'CO')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <article
      className="job-card-premium"
      style={{
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '1.25rem',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top ambient highlight */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.4), transparent)'
        }}
      />

      <div>
        {/* Header: Company Avatar & Title & Type */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3))',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.95rem',
                color: '#e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              {initials}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.3 }}>
                <Link
                  to={`/jobs/${job.id}`}
                  style={{
                    color: '#f8fafc',
                    textDecoration: 'none',
                    transition: 'color 0.2s'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#c084fc')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#f8fafc')}
                >
                  {job.title}
                </Link>
              </h3>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.15rem' }}>
                <span style={{ color: '#cbd5e1' }}>{job.companyName}</span> · 📍 {job.location}
              </div>
            </div>
          </div>
          <span
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background: 'rgba(139, 92, 246, 0.12)',
              color: '#c084fc',
              border: '1px solid rgba(168, 85, 247, 0.25)'
            }}
          >
            {job.employmentType || 'Full-time'}
          </span>
        </div>

        {/* Description */}
        <p
          style={{
            color: '#94a3b8',
            fontSize: '0.88rem',
            lineHeight: 1.55,
            margin: '0.75rem 0 1.1rem 0',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {job.description}
        </p>

        {/* Required Skills tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
          {skills.slice(0, 6).map((skill, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '0.76rem',
                padding: '0.22rem 0.6rem',
                borderRadius: '0.5rem',
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.07)'
              }}
            >
              {skill}
            </span>
          ))}
          {skills.length > 6 && (
            <span style={{ fontSize: '0.74rem', color: '#64748b', alignSelf: 'center' }}>
              +{skills.length - 6} more
            </span>
          )}
        </div>
      </div>

      {/* Footer: Exp, Salary, Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '1rem',
          marginTop: '0.5rem'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Experience</span>
          <span style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600 }}>
            {job.experience}+ yrs
          </span>
        </div>

        {job.salaryRange && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Compensation</span>
            <span style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>
              {job.salaryRange}
            </span>
          </div>
        )}

        <div>{children}</div>
      </div>
    </article>
  );
}
