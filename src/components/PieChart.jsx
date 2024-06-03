import React from 'react';
import Chart from 'react-apexcharts';

const PieChart = ({ correctAnswers, totalQuestions }) => {
  const correctPercentage = (correctAnswers / totalQuestions) * 100;
  const incorrectPercentage = 100 - correctPercentage;

  const options = {
    labels: ['Correct', 'Incorrect'],
  };

  const series = [correctPercentage, incorrectPercentage];

  return (
    <div>
      <Chart
        options={options}
        series={series}
        type="pie"
        width="380"
      />
    </div>
  );
};

export default PieChart;
