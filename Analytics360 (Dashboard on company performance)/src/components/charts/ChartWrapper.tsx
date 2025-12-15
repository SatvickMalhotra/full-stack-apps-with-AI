import { useState, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, Download, Table, Copy, Check } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ChartWrapperProps {
  title: string;
  children: ReactNode;
  data?: { label: string; value: number }[];
}

export default function ChartWrapper({ title, children, data = [] }: ChartWrapperProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [copied, setCopied] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_')}_chart.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading chart:', error);
    }
  };

  const handleCopy = () => {
    if (data.length === 0) return;

    const text = data.map(d => `${d.label}\t${d.value}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const chartContent = (
    <motion.div
      ref={chartRef}
      layout
      className={`glass-card overflow-hidden ${isFullscreen ? 'fixed inset-4 z-[200]' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
        <h3 className="font-semibold text-[var(--color-text)]">{title}</h3>
        <div className="flex items-center gap-2">
          {data.length > 0 && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowTable(!showTable)}
                className={`p-2 rounded-lg transition-all ${
                  showTable
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)]'
                }`}
                title="Toggle Table View"
              >
                <Table className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)]"
                title="Copy Data"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </motion.button>
            </>
          )}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDownload}
            className="p-2 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)]"
            title="Download as PNG"
          >
            <Download className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)]"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      {/* Chart or Table Content */}
      <div className={`p-4 ${isFullscreen ? 'h-[calc(100%-60px)]' : 'h-[350px]'}`}>
        <AnimatePresence mode="wait">
          {showTable && data.length > 0 ? (
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-auto"
            >
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Label</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={item.label}>
                      <td>{index + 1}</td>
                      <td>{item.label}</td>
                      <td>{item.value.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          ) : (
            <motion.div
              key="chart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  return (
    <>
      {chartContent}

      {/* Fullscreen Backdrop */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFullscreen(false)}
            className="fixed inset-0 bg-black/80 z-[199]"
          />
        )}
      </AnimatePresence>
    </>
  );
}
