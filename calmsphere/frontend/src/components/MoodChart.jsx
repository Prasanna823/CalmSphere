import React from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const MoodChart = ({ data }) => {
  const emotionColors = {
    calm: '#7ee8a2',
    neutral: '#60a5fa',
    anxious: '#fbbf24',
    sad: '#60a5fa',
    stressed: '#f87171'
  }

  const chartData = {
    labels: data.map(item => item.day),
    datasets: [
      {
        label: 'Mood Score',
        data: data.map(item => item.score),
        backgroundColor: data.map(item => emotionColors[item.emotion] || '#6e7681'),
        borderColor: data.map(item => emotionColors[item.emotion] || '#6e7681'),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#161b22',
        titleColor: '#e6edf3',
        bodyColor: '#8b949e',
        borderColor: '#30363d',
        borderWidth: 1,
        padding: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            const item = data[context.dataIndex]
            return `Score: ${item.score} (${item.emotion})`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: '#21262d',
          drawBorder: false
        },
        ticks: {
          color: '#6e7681',
          font: {
            size: 10
          }
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: '#6e7681',
          font: {
            size: 10
          }
        }
      }
    }
  }

  return (
    <div style={{ height: '100px' }}>
      <Bar data={chartData} options={options} />
    </div>
  )
}

export default MoodChart
