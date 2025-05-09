import React, { useMemo } from 'react';
import PageContainer from '../components/layout/PageContainer';
import ChartContainer from '../components/ui/ChartContainer';
import { useAppContext } from '../contexts/AppContext';
import { AlertTriangle, BatteryCharging, Gauge, Thermometer, Activity, Settings } from 'lucide-react';

interface FMEACategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  causes: string[];
  effects: string[];
  solutions: string[];
  preventiveMeasures: string[];
  detectionMethods: string[];
  severity: 'low' | 'medium' | 'high';
  kpis: {
    name: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
  }[];
}

const fmeaCategories: FMEACategory[] = [
  {
    id: 'energy',
    name: 'Energy Consumption',
    icon: <BatteryCharging className="h-6 w-6" />,
    causes: [
      'Equipment degradation or malfunction',
      'Inefficient operational settings',
      'Poor maintenance practices',
      'Unauthorized equipment usage',
      'System overload conditions',
      'Off-hours operation',
      'Control system failures'
    ],
    effects: [
      'Increased operational costs',
      'Higher carbon footprint',
      'Equipment wear and tear',
      'Reduced system efficiency',
      'Potential regulatory non-compliance'
    ],
    solutions: [
      'Implement predictive maintenance',
      'Optimize operational parameters',
      'Install energy monitoring systems',
      'Upgrade to energy-efficient equipment',
      'Develop standard operating procedures',
      'Train operators on energy efficiency',
      'Regular system audits'
    ],
    preventiveMeasures: [
      'Regular equipment maintenance',
      'Energy consumption monitoring',
      'Staff training programs',
      'Automated shutdown systems',
      'Load balancing protocols'
    ],
    detectionMethods: [
      'Real-time energy monitoring',
      'Power quality analysis',
      'Thermal imaging',
      'Equipment performance metrics',
      'Energy audit reports'
    ],
    severity: 'high',
    kpis: [
      { name: 'Energy Efficiency', value: '85%', trend: 'up' },
      { name: 'Cost per kWh', value: '$0.12', trend: 'down' },
      { name: 'Peak Demand', value: '450kW', trend: 'stable' }
    ]
  },
  {
    id: 'emissions',
    name: 'CO2 Emissions',
    icon: <Thermometer className="h-6 w-6" />,
    causes: [
      'Combustion inefficiency',
      'Poor fuel quality',
      'Air-fuel ratio imbalance',
      'Equipment calibration issues',
      'Process control problems',
      'Exhaust system leaks',
      'Incomplete combustion'
    ],
    effects: [
      'Environmental impact',
      'Regulatory compliance issues',
      'Carbon tax implications',
      'Public health concerns',
      'Sustainability goal deviation'
    ],
    solutions: [
      'Optimize combustion processes',
      'Implement emissions monitoring',
      'Upgrade filtration systems',
      'Regular calibration checks',
      'Process control optimization',
      'Staff training on emissions',
      'Alternative fuel assessment'
    ],
    preventiveMeasures: [
      'Regular emissions testing',
      'Fuel quality monitoring',
      'Equipment maintenance',
      'Process optimization',
      'Environmental audits'
    ],
    detectionMethods: [
      'Continuous emissions monitoring',
      'Gas analyzers',
      'Opacity meters',
      'Environmental sensors',
      'Regular testing protocols'
    ],
    severity: 'high',
    kpis: [
      { name: 'CO2 Reduction', value: '15%', trend: 'down' },
      { name: 'Emission Rate', value: '2.5 tCO2/h', trend: 'down' },
      { name: 'Compliance Rate', value: '98%', trend: 'up' }
    ]
  },
  {
    id: 'power-factor',
    name: 'Power Factor',
    icon: <Gauge className="h-6 w-6" />,
    causes: [
      'Reactive power imbalance',
      'Motor/transformer issues',
      'Capacitor bank failure',
      'Harmonic distortion',
      'Improper equipment sizing',
      'Phase imbalance',
      'Inductive load variations'
    ],
    effects: [
      'Increased electricity costs',
      'Reduced system capacity',
      'Equipment overheating',
      'Voltage regulation issues',
      'Grid stability problems'
    ],
    solutions: [
      'Install power factor correction',
      'Regular equipment maintenance',
      'Harmonic filtering',
      'Load balancing',
      'Equipment sizing review',
      'Capacitor bank maintenance',
      'Power quality monitoring'
    ],
    preventiveMeasures: [
      'Regular power factor monitoring',
      'Equipment maintenance schedule',
      'Load analysis and planning',
      'Power quality assessments',
      'Staff training'
    ],
    detectionMethods: [
      'Power factor meters',
      'Harmonic analyzers',
      'Thermal imaging',
      'Power quality monitors',
      'Energy management systems'
    ],
    severity: 'medium',
    kpis: [
      { name: 'Power Factor', value: '0.92', trend: 'up' },
      { name: 'Reactive Power', value: '120 kVAR', trend: 'down' },
      { name: 'System Efficiency', value: '88%', trend: 'up' }
    ]
  }
];

const FMEA: React.FC = () => {
  const { selectedFile, anomalyData } = useAppContext();

  const anomalyStats = useMemo(() => {
    if (!anomalyData) return null;

    // Count anomalies by type and severity
    const stats = {
      byType: {} as Record<string, number>,
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0
      },
      byTimeOfDay: {
        morning: 0,    // 6-12
        afternoon: 0,  // 12-18
        evening: 0,    // 18-24
        night: 0       // 0-6
      },
      total: anomalyData.length
    };

    anomalyData.forEach(anomaly => {
      // Count by type
      const type = anomaly.FMEA_Diagnosis.toLowerCase();
      if (type.includes('energy')) stats.byType['energy'] = (stats.byType['energy'] || 0) + 1;
      if (type.includes('co2')) stats.byType['emissions'] = (stats.byType['emissions'] || 0) + 1;
      if (type.includes('power factor')) stats.byType['power-factor'] = (stats.byType['power-factor'] || 0) + 1;

      // Count by severity
      if (anomaly.Alert_Level === 3) stats.bySeverity.high++;
      else if (anomaly.Alert_Level === 2) stats.bySeverity.medium++;
      else stats.bySeverity.low++;

      // Count by time of day
      const hour = new Date(anomaly.date).getHours();
      if (hour >= 6 && hour < 12) stats.byTimeOfDay.morning++;
      else if (hour >= 12 && hour < 18) stats.byTimeOfDay.afternoon++;
      else if (hour >= 18 && hour < 24) stats.byTimeOfDay.evening++;
      else stats.byTimeOfDay.night++;
    });

    return stats;
  }, [anomalyData]);

  const chartData = useMemo(() => {
    if (!anomalyStats) return null;

    return {
      anomalyTypes: {
        labels: ['Energy Consumption', 'CO2 Emissions', 'Power Factor'],
        datasets: [{
          label: 'Number of Anomalies',
          data: [
            anomalyStats.byType['energy'] || 0,
            anomalyStats.byType['emissions'] || 0,
            anomalyStats.byType['power-factor'] || 0
          ],
          backgroundColor: [
            'rgba(15, 82, 186, 0.6)',   // primary
            'rgba(0, 166, 166, 0.6)',   // secondary
            'rgba(255, 140, 0, 0.6)',   // accent
          ],
          borderColor: [
            'rgb(15, 82, 186)',
            'rgb(0, 166, 166)',
            'rgb(255, 140, 0)',
          ],
          borderWidth: 1
        }]
      },
      severityDistribution: {
        labels: ['Low', 'Medium', 'High'],
        datasets: [{
          label: 'Anomalies by Severity',
          data: [
            anomalyStats.bySeverity.low,
            anomalyStats.bySeverity.medium,
            anomalyStats.bySeverity.high
          ],
          backgroundColor: [
            'rgba(16, 185, 129, 0.6)',  // success
            'rgba(245, 158, 11, 0.6)',  // warning
            'rgba(239, 68, 68, 0.6)',   // error
          ],
          borderColor: [
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
          ],
          borderWidth: 1
        }]
      },
      timeDistribution: {
        labels: ['Morning (6-12)', 'Afternoon (12-18)', 'Evening (18-24)', 'Night (0-6)'],
        datasets: [{
          label: 'Anomalies by Time of Day',
          data: [
            anomalyStats.byTimeOfDay.morning,
            anomalyStats.byTimeOfDay.afternoon,
            anomalyStats.byTimeOfDay.evening,
            anomalyStats.byTimeOfDay.night
          ],
          backgroundColor: [
            'rgba(99, 102, 241, 0.6)',  // indigo
            'rgba(236, 72, 153, 0.6)',  // pink
            'rgba(139, 92, 246, 0.6)',  // purple
            'rgba(20, 184, 166, 0.6)',  // teal
          ],
          borderColor: [
            'rgb(99, 102, 241)',
            'rgb(236, 72, 153)',
            'rgb(139, 92, 246)',
            'rgb(20, 184, 166)',
          ],
          borderWidth: 1
        }]
      }
    };
  }, [anomalyStats]);

  if (!selectedFile || !anomalyData) {
    return (
      <PageContainer
        title="FMEA Analysis"
        description="Failure Mode and Effects Analysis"
      >
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-center text-gray-500">
            Please select a file and train the model to view FMEA analysis.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="FMEA Analysis"
      description="Failure Mode and Effects Analysis"
    >
      <div className="space-y-6">
        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Anomaly Distribution</h3>
            {chartData && (
              <ChartContainer
                type="bar"
                data={chartData.anomalyTypes}
                height={300}
              />
            )}
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Severity Distribution</h3>
            {chartData && (
              <ChartContainer
                type="bar"
                data={chartData.severityDistribution}
                height={300}
              />
            )}
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Time Distribution</h3>
            {chartData && (
              <ChartContainer
                type="bar"
                data={chartData.timeDistribution}
                height={300}
              />
            )}
          </div>
        </div>

        {/* FMEA Categories */}
        <section className="space-y-6">
          {fmeaCategories.map((category) => {
            const anomalyCount = anomalyStats?.byType[category.id] || 0;
            
            return (
              <div
                key={category.id}
                className={`bg-white shadow rounded-lg overflow-hidden border-l-4 ${
                  category.severity === 'high'
                    ? 'border-l-error-500'
                    : category.severity === 'medium'
                    ? 'border-l-warning-500'
                    : 'border-l-success-500'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{category.name}</h3>
                        <p className="text-sm text-gray-500">
                          {anomalyCount} anomalies detected
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                          category.severity === 'high'
                            ? 'bg-error-100 text-error-700'
                            : category.severity === 'medium'
                            ? 'bg-warning-100 text-warning-700'
                            : 'bg-success-100 text-success-700'
                        }`}
                      >
                        {category.severity} severity
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Root Causes</h4>
                      <ul className="space-y-2 text-sm">
                        {category.causes.map((cause, index) => (
                          <li key={index} className="flex items-start">
                            <AlertTriangle className="h-4 w-4 text-warning-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>{cause}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Solutions</h4>
                      <ul className="space-y-2 text-sm">
                        {category.solutions.map((solution, index) => (
                          <li key={index} className="flex items-start">
                            <Settings className="h-4 w-4 text-primary-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>{solution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Key Performance Indicators</h4>
                      <div className="space-y-3">
                        {category.kpis.map((kpi, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm font-medium">{kpi.name}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold">{kpi.value}</span>
                              <Activity className={`h-4 w-4 ${
                                kpi.trend === 'up'
                                  ? 'text-success-500'
                                  : kpi.trend === 'down'
                                  ? 'text-error-500'
                                  : 'text-warning-500'
                              }`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </PageContainer>
  );
};

export default FMEA;