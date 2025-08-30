import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';
import { GRADE_SCALE } from '../constants/universityData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface GradeDistributionProps {
  grades: Record<string, number>;
}

const GradeDistribution: React.FC<GradeDistributionProps> = ({ grades }) => {
  const gradeDistribution = Object.keys(GRADE_SCALE).reduce((acc, grade) => {
    acc[grade] = 0;
    return acc;
  }, {} as Record<string, number>);

  // Calculate grade distribution
  Object.values(grades).forEach(score => {
    for (const [grade, range] of Object.entries(GRADE_SCALE)) {
      if (score >= range.min && score <= range.max) {
        gradeDistribution[grade]++;
        break;
      }
    }
  });

  const data = {
    labels: Object.keys(GRADE_SCALE),
    datasets: [
      {
        label: 'Number of Students',
        data: Object.values(gradeDistribution),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)', // A+
          'rgba(54, 162, 235, 0.6)', // A
          'rgba(153, 102, 255, 0.6)', // B+
          'rgba(255, 206, 86, 0.6)', // B
          'rgba(255, 159, 64, 0.6)', // C+
          'rgba(255, 99, 132, 0.6)', // C
          'rgba(231, 76, 60, 0.6)', // F
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(231, 76, 60, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Grade Distribution',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const calculateStats = () => {
    const scores = Object.values(grades);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    
    return { avg, max, min };
  };

  const stats = calculateStats();

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Class Statistics
        </Typography>
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Average Score
            </Typography>
            <Typography variant="h6">
              {stats.avg.toFixed(1)}%
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Highest Score
            </Typography>
            <Typography variant="h6">
              {stats.max}%
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Lowest Score
            </Typography>
            <Typography variant="h6">
              {stats.min}%
            </Typography>
          </Box>
        </Box>
      </Box>
      <Bar data={data} options={options} />
    </Box>
  );
};

export default GradeDistribution;