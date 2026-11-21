import { Link } from 'react-router-dom';
import TagList from './TagList';

export default function JobCard({ job, children }) {
  return (
    <article className="card job-card">
      <div className="job-head">
        <div>
          <h3>
            <Link to={`/jobs/${job.id}`}>{job.title}</Link>
          </h3>
          <div className="muted">{job.companyName} · {job.location}</div>
        </div>
        <span className="pill">{job.employmentType}</span>
      </div>
      <p className="clamp">{job.description}</p>
      <TagList items={job.requiredSkills} tone="blue" />
      <div className="job-foot">
        <span className="muted">{job.experience}+ yrs{job.salaryRange ? ` · ${job.salaryRange}` : ''}</span>
        {children}
      </div>
    </article>
  );
}
