import ReactECharts from 'echarts-for-react';
import { useThemeStore } from '../../stores/themeStore';
import { themes } from '../../themes';
import ChartWrapper from './ChartWrapper';

interface BarChartProps {
  title: string;
  data: { label: string; value: number }[];
  horizontal?: boolean;
}

export default function BarChart({ title, data, horizontal = false }: BarChartProps) {
  const { currentTheme } = useThemeStore();
  const theme = themes[currentTheme];

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: theme.colors.border,
      textStyle: {
        color: theme.colors.text,
      },
    },
    grid: {
      left: horizontal ? '15%' : '3%',
      right: '4%',
      bottom: horizontal ? '3%' : '15%',
      top: '10%',
      containLabel: true,
    },
    xAxis: horizontal
      ? {
          type: 'value',
          axisLine: { lineStyle: { color: theme.chart.axisColor } },
          axisLabel: { color: theme.chart.textColor },
          splitLine: { lineStyle: { color: theme.chart.axisColor, opacity: 0.3 } },
        }
      : {
          type: 'category',
          data: data.map(d => d.label),
          axisLine: { lineStyle: { color: theme.chart.axisColor } },
          axisLabel: {
            color: theme.chart.textColor,
            rotate: 45,
            interval: 0,
            fontSize: 10,
          },
        },
    yAxis: horizontal
      ? {
          type: 'category',
          data: data.map(d => d.label),
          axisLine: { lineStyle: { color: theme.chart.axisColor } },
          axisLabel: { color: theme.chart.textColor, fontSize: 10 },
        }
      : {
          type: 'value',
          axisLine: { lineStyle: { color: theme.chart.axisColor } },
          axisLabel: { color: theme.chart.textColor },
          splitLine: { lineStyle: { color: theme.chart.axisColor, opacity: 0.3 } },
        },
    series: [
      {
        name: title,
        type: 'bar',
        data: data.map((d, i) => ({
          value: d.value,
          itemStyle: {
            color: {
              type: 'linear',
              x: horizontal ? 0 : 0,
              y: horizontal ? 0 : 1,
              x2: horizontal ? 1 : 0,
              y2: horizontal ? 0 : 0,
              colorStops: [
                { offset: 0, color: theme.chart.colors[i % theme.chart.colors.length] },
                { offset: 1, color: theme.chart.colors[(i + 1) % theme.chart.colors.length] },
              ],
            },
            borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
          },
        })),
        barMaxWidth: 40,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
        },
      },
    ],
    animationDuration: 1000,
    animationEasing: 'cubicOut',
  };

  return (
    <ChartWrapper title={title} data={data}>
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </ChartWrapper>
  );
}
