"use client";
import React from "react";
import styles from "./CustomBarChart.module.css";

interface CustomBarChartProps {
  series: number[];
  categories: string[];
  title: string;
  theme?: "light" | "dark";
}

const CustomBarChart: React.FC<CustomBarChartProps> = ({ series, categories, title, theme = "light" }) => {
  const maxValue = Math.max(...series, 1);
  const containerClass = theme === "dark" ? `${styles.container} ${styles.dark}` : styles.container;

  return (
    <div className={containerClass}>
      <div className={styles.title}>
        <h4>{title}</h4>
      </div>
      
      {/* Main Chart Area */}
      <div className={styles.chartWrapper}>
        
        {/* Y Axis Labels */}
        <div className={styles.yAxis}>
          {[maxValue, Math.floor(maxValue * 0.75), Math.floor(maxValue * 0.5), Math.floor(maxValue * 0.25), 0].map((value, index) => (
            <div key={index} className={styles.yAxisLabel}>
              {value}
            </div>
          ))}
        </div>
        
        {/* Chart Content Area (Grid + Bars) */}
        <div className={styles.chartArea}>
          {/* Gridlines */}
          <div className={styles.gridLines}>
            {[0, 1, 2, 3, 4].map((index) => (
              <div key={index} className={styles.gridLine} />
            ))}
          </div>
          
          {/* Bars */}
          <div className={styles.barsContainer}>
            {series.map((value, index) => {
              // Calculate percentage height
              const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
              return (
                <div key={index} className={styles.barColumn}>
                  <div
                    className={styles.bar}
                    style={{
                      height: `${heightPercent}%`,
                    }}
                  >
                    <div className={styles.barValue}>{value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* X Axis Labels (Row placed below the chart area) */}
      <div className={styles.xAxisRow}>
        {/* Empty space matching Y Axis width */}
        <div className={styles.yAxisPlaceholder} />
        
        {/* X Labels Container matching Chart Area */}
        <div className={styles.xAxisLabelsContainer}>
          {categories.map((category, index) => (
            <div key={index} className={styles.xAxisLabelWrapper}>
              <span className={styles.xAxisLabel}>
                {category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomBarChart;
