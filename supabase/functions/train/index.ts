import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DataPoint {
  date: string;
  usage_kwh: number;
  co2_tco2: number;
  power_factor: number;
}

interface ModelResponse {
  date: string;
  Usage_kWh: number;
  'CO2(tCO2)': number;
  Lagging_Current_Power_Factor: number;
  Anomaly_Label: string;
  FMEA_Diagnosis: string;
  Alert_Level: number;
}

interface MetricAnalysis {
  value: number;
  mean: number;
  std: number;
  zScore: number;
  percentageDeviation: number;
  isAnomaly: boolean;
  severity: 'critical' | 'moderate' | 'minor' | 'normal';
  direction: 'high' | 'low';
}

function parseCSV(csvContent: string): DataPoint[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].toLowerCase().split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      date: values[headers.indexOf('date')],
      usage_kwh: parseFloat(values[headers.indexOf('usage_kwh')]),
      co2_tco2: parseFloat(values[headers.indexOf('co2_tco2')]),
      power_factor: parseFloat(values[headers.indexOf('power_factor')])
    };
  });
}

function analyzeMetric(value: number, mean: number, std: number): MetricAnalysis {
  const zScore = Math.abs((value - mean) / std);
  const percentageDeviation = ((value - mean) / mean) * 100;
  
  // Updated thresholds for better distribution
  let severity: MetricAnalysis['severity'] = 'normal';
  if (zScore > 3.5) severity = 'critical';
  else if (zScore > 2.8) severity = 'moderate';
  else if (zScore > 2.0) severity = 'minor';
  
  return {
    value,
    mean,
    std,
    zScore,
    percentageDeviation,
    isAnomaly: zScore > 2.0, // Lower threshold to catch more anomalies
    severity,
    direction: value > mean ? 'high' : 'low'
  };
}

function generateFMEADiagnosis(analyses: Record<string, MetricAnalysis>): string {
  const causes: string[] = [];
  const recommendations: string[] = [];

  // Energy consumption analysis
  if (analyses.usage_kwh.isAnomaly) {
    const severityText = analyses.usage_kwh.severity.toUpperCase();
    const deviation = Math.abs(analyses.usage_kwh.percentageDeviation).toFixed(1);
    
    if (analyses.usage_kwh.direction === 'high') {
      causes.push(`${severityText}: Energy consumption ${deviation}% above normal`);
      if (analyses.usage_kwh.severity === 'critical') {
        recommendations.push(
          'Immediate inspection of high-energy equipment',
          'Check for system overload conditions',
          'Verify emergency protocols'
        );
      } else if (analyses.usage_kwh.severity === 'moderate') {
        recommendations.push(
          'Schedule equipment maintenance',
          'Review operational efficiency',
          'Check for unauthorized usage'
        );
      } else {
        recommendations.push(
          'Monitor equipment performance',
          'Review energy usage patterns',
          'Consider optimization opportunities'
        );
      }
    } else {
      causes.push(`${severityText}: Energy consumption ${deviation}% below normal`);
      recommendations.push(
        'Verify equipment operation',
        'Check for measurement errors',
        'Review production schedules'
      );
    }
  }

  // CO2 emissions analysis with severity-specific recommendations
  if (analyses.co2_tco2.isAnomaly) {
    const severityText = analyses.co2_tco2.severity.toUpperCase();
    const deviation = Math.abs(analyses.co2_tco2.percentageDeviation).toFixed(1);
    
    if (analyses.co2_tco2.direction === 'high') {
      causes.push(`${severityText}: CO2 emissions ${deviation}% above normal`);
      if (analyses.co2_tco2.severity === 'critical') {
        recommendations.push(
          'Immediate emission control system check',
          'Verify combustion efficiency',
          'Emergency protocol review'
        );
      } else if (analyses.co2_tco2.severity === 'moderate') {
        recommendations.push(
          'Schedule emission system maintenance',
          'Check fuel quality',
          'Review operational parameters'
        );
      } else {
        recommendations.push(
          'Monitor emission trends',
          'Regular system checks',
          'Consider efficiency improvements'
        );
      }
    } else {
      causes.push(`${severityText}: CO2 emissions ${deviation}% below normal`);
      recommendations.push(
        'Verify sensor calibration',
        'Check production levels',
        'Review system efficiency'
      );
    }
  }

  // Power factor analysis with detailed recommendations
  if (analyses.power_factor.isAnomaly) {
    const severityText = analyses.power_factor.severity.toUpperCase();
    const value = analyses.power_factor.value.toFixed(2);
    
    if (analyses.power_factor.value < 0.85) {
      causes.push(`${severityText}: Low power factor (${value})`);
      if (analyses.power_factor.severity === 'critical') {
        recommendations.push(
          'Immediate capacitor bank inspection',
          'Check for equipment malfunction',
          'Review reactive power compensation'
        );
      } else if (analyses.power_factor.severity === 'moderate') {
        recommendations.push(
          'Schedule power factor correction',
          'Monitor reactive power',
          'Check motor loads'
        );
      } else {
        recommendations.push(
          'Regular power factor monitoring',
          'Consider system optimization',
          'Plan preventive maintenance'
        );
      }
    } else if (analyses.power_factor.value > 0.98) {
      causes.push(`${severityText}: Power factor over-compensation (${value})`);
      recommendations.push(
        'Adjust compensation settings',
        'Review capacitor bank sizing',
        'Monitor leading power factor'
      );
    }
  }

  // Enhanced correlation analysis
  if (analyses.usage_kwh.isAnomaly && analyses.co2_tco2.isAnomaly) {
    const maxSeverity = [analyses.usage_kwh.severity, analyses.co2_tco2.severity]
      .sort((a, b) => {
        const order = { critical: 3, moderate: 2, minor: 1, normal: 0 };
        return order[b] - order[a];
      })[0].toUpperCase();
    
    if (analyses.usage_kwh.direction === analyses.co2_tco2.direction) {
      causes.push(`${maxSeverity}: Correlated energy and emissions anomaly detected`);
      recommendations.push(
        'Conduct comprehensive system audit',
        'Review operational efficiency',
        'Check for systemic issues'
      );
    }
  }

  return `CAUSES:\n${causes.join('\n')}\n\nRECOMMENDATIONS:\n${recommendations.map(r => '• ' + r).join('\n')}`;
}

function detectAnomalies(data: DataPoint[]): ModelResponse[] {
  // Calculate statistics for each metric
  const metrics = ['usage_kwh', 'co2_tco2', 'power_factor'] as const;
  const stats = metrics.reduce((acc, metric) => {
    const values = data.map(d => d[metric]);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);
    
    acc[metric] = { mean, std };
    return acc;
  }, {} as Record<typeof metrics[number], { mean: number; std: number }>);

  // Detect and analyze anomalies
  return data
    .map(point => {
      // Analyze each metric
      const analyses = {
        usage_kwh: analyzeMetric(point.usage_kwh, stats.usage_kwh.mean, stats.usage_kwh.std),
        co2_tco2: analyzeMetric(point.co2_tco2, stats.co2_tco2.mean, stats.co2_tco2.std),
        power_factor: analyzeMetric(point.power_factor, stats.power_factor.mean, stats.power_factor.std)
      };

      // Check if any metric is anomalous
      const hasAnomaly = Object.values(analyses).some(a => a.isAnomaly);
      if (!hasAnomaly) return null;

      // Determine highest severity level
      const severityLevels = {
        critical: 3,
        moderate: 2,
        minor: 1,
        normal: 0
      };

      const alertLevel = Math.max(
        ...Object.values(analyses)
          .map(a => severityLevels[a.severity])
      );

      // Generate FMEA diagnosis with recommendations
      const diagnosis = generateFMEADiagnosis(analyses);

      // Determine anomaly types with severity
      const anomalyTypes = Object.entries(analyses)
        .filter(([, analysis]) => analysis.isAnomaly)
        .map(([metric, analysis]) => `${analysis.severity.toUpperCase()} ${metric}`)
        .join(', ');

      return {
        date: point.date,
        Usage_kWh: point.usage_kwh,
        'CO2(tCO2)': point.co2_tco2,
        Lagging_Current_Power_Factor: point.power_factor,
        Anomaly_Label: `Anomaly in: ${anomalyTypes}`,
        FMEA_Diagnosis: diagnosis,
        Alert_Level: alertLevel
      };
    })
    .filter((item): item is ModelResponse => item !== null);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { csvContent, modelType, fileId } = await req.json();

    if (!csvContent || typeof csvContent !== 'string') {
      throw new Error('Invalid or missing CSV content');
    }
    if (!modelType || typeof modelType !== 'string') {
      throw new Error('Invalid or missing model type');
    }
    if (!fileId || typeof fileId !== 'string') {
      throw new Error('Invalid or missing file ID');
    }

    const data = parseCSV(csvContent);
    if (data.length === 0) {
      throw new Error('No valid data points found in CSV');
    }

    const anomalies = detectAnomalies(data);

    return new Response(
      JSON.stringify(anomalies),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});