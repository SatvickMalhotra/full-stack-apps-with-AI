import ReactECharts from 'echarts-for-react';
import { useThemeStore } from '../../stores/themeStore';
import { themes } from '../../themes';
import ChartWrapper from './ChartWrapper';

interface PieChartProps {
  title: string;
  data: { label: string; value: number }[];
  donut?: boolean;
}

export default function PieChart({ title, data, donut = false }: PieChartProps) {
  const { currentTheme } = useThemeStore();
  const theme = themes[currentTheme];

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: theme.colors.border,
      textStyle: {
        color: theme.colors.text,
      },
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      type: 'scroll',
      orient: 'horizontal',
      bottom: 5,
      left: 'center',
      textStyle: {
        color: theme.chart.textColor,
        fontSize: 11,
      },
      pageTextStyle: {
        color: theme.chart.textColor,
      },
    },
    series: [
      {
        name: title,
        type: 'pie',
        radius: donut ? ['30%', '60%'] : '60%',
        center: ['50%', '42%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: theme.colors.background,
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: theme.colors.text,
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        labelLine: {
          show: false,
        },
        data: data.map((d, i) => ({
          name: d.label,
          value: d.value,
          itemStyle: {
            color: theme.chart.colors[i % theme.chart.colors.length],
          },
        })),
      },
    ],
    animationType: 'scale',
    animationEasing: 'elasticOut',
    animationDuration: 1000,
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
