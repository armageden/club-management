'use client';

import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
  strokeWidth?: number;
  height?: number;
  width?: number;
  className?: string;
  fill?: boolean;
  fillOpacity?: number;
}

export const Sparkline = forwardRef<SVGSVGElement, SparklineProps>(
  (
    {
      data,
      color = 'var(--color-chart-1)',
      strokeWidth = 2,
      height = 40,
      width = 120,
      className,
      fill = true,
      fillOpacity = 0.1,
    },
    ref
  ) => {
    const chartData = data.map((value, index) => ({ value, index }));

    const points = chartData.map((d, i) => ({
      x: (i / (chartData.length - 1)) * width,
      y: height - ((d.value - Math.min(...data)) / (Math.max(...data) - Math.min(...data) || 1)) * height,
    }));

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <svg
        ref={ref}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={cn('overflow-visible', className)}
        aria-hidden="true"
      >
        {fill && points.length > 1 && (
          <path
            d={`${pathData} L${width} ${height} L0 ${height} Z`}
            fill={color}
            fillOpacity={fillOpacity}
          />
        )}
        {points.length > 1 && (
          <path
            d={pathData}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r={3}
            fill={color}
          />
        )}
      </svg>
    );
  }
);

Sparkline.displayName = 'Sparkline';

// Area Sparkline variant
export function AreaSparkline({
  data,
  color = 'var(--color-chart-1)',
  height = 40,
  width = 120,
  className,
}: Omit<SparklineProps, 'fill' | 'fillOpacity' | 'strokeWidth'>) {
  const chartData = data.map((value, index) => ({ value, index }));
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;

  const points = chartData.map((d, i) => ({
    x: (i / (chartData.length - 1)) * width,
    y: height - ((d.value - minVal) / range) * height,
  }));

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${pathData} L${width} ${height} L0 ${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={cn('overflow-visible', className)} aria-hidden="true">
      <defs>
        <linearGradient id="sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkline-gradient)" />
      <path d={pathData} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {points.length > 0 && (
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={3} fill={color} />
      )}
    </svg>
  );
}