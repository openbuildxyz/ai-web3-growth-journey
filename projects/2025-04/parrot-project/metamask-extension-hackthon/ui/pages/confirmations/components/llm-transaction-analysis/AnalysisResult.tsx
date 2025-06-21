import React from 'react';
import PropTypes from 'prop-types';

// TODO: Replace with actual components from the component library (e.g., Card, Alert)
const ResultCard = ({ children }) => (
  <div style={{ border: '1px solid #ddd', padding: '16px', margin: '16px 0', borderRadius: '8px' }}>
    {children}
  </div>
);

const Title = ({ children }) => <h4 style={{ marginTop: 0 }}>{children}</h4>;
const Paragraph = ({ children }) => <p>{children}</p>;

export const AnalysisResult = ({ analysis, riskLevel }) => {
  if (!analysis) {
    return null;
  }

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      default:
        return 'green';
    }
  };

  return (
    <ResultCard>
      <Title>🤖 AI 分析结果</Title>
      <Paragraph>
        <strong>风险等级:</strong>{' '}
        <span style={{ color: getRiskColor() }}>{riskLevel?.toUpperCase() || '未知'}</span>
      </Paragraph>
      <Paragraph>{analysis}</Paragraph>
    </ResultCard>
  );
};

AnalysisResult.propTypes = {
  analysis: PropTypes.string,
  riskLevel: PropTypes.oneOf(['low', 'medium', 'high']),
};