import React from 'react';
import ReportCard from './ReportCard';

const ReportViewer = ({ reports }) => {
  return (
    <div>
      <h3>AI-Generated Reports</h3>
      {reports.map((r, i) => <ReportCard key={i} report={r} />)}
    </div>
  );
};

export default ReportViewer;
