import React from 'react';

const ReportCard = ({ report }) => {
  return (
    <div className="report-card">
      <h4>{report.sessionId}</h4>
      <p>Completion Rate: {report.completionRate}%</p>
      <p>Errors: {report.openErrors}</p>
    </div>
  );
};

export default ReportCard;
