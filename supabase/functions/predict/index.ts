import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface DataPoint {
  date: string;
  usage_kwh: number;
  co2_tco2: number;
  power_factor: number;
}

function predictNextValue(historicalData: number[], days: number): number[] {
  const predictions: number[] = [];
  const n = historicalData.length;
  
  // Calculate trend using simple linear regression
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += historicalData[i];
    sumXY += i * historicalData[i];
    sumX2 += i * i;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate seasonality (if any)
  const seasonLength = 7; // Weekly seasonality
  const seasonalFactors = new Array(seasonLength).fill(0);
  const seasonCounts = new Array(seasonLength).fill(0);
  
  for (let i = 0; i < n; i++) {
    const season = i % seasonLength;
    const trend = slope * i + intercept;
    seasonalFactors[season] += historicalData[i] / trend;
    seasonCounts[season]++;
  }
  
  for (let i = 0; i < seasonLength; i++) {
    seasonalFactors[i] /= seasonCounts[i];
  }
  
  // Generate predictions with random variations
  for (let i = 0; i < days; i++) {
    const trend = slope * (n + i) + intercept;
    const seasonal = seasonalFactors[i % seasonLength];
    // Add random variation (±5%)
    const randomVariation = 1 + (Math.random() * 0.1 - 0.05);
    predictions.push(trend * seasonal * randomVariation);
  }
  
  return predictions;
}

function generateFutureDates(startDate: Date, days: number): string[] {
  const dates: string[] = [];
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < days; i++) {
    currentDate.setDate(currentDate.getDate() + 1);
    dates.push(currentDate.toISOString());
  }
  
  return dates;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { historicalData, days } = await req.json();

    if (!historicalData || !Array.isArray(historicalData)) {
      throw new Error('Invalid historical data');
    }

    if (!days || typeof days !== 'number') {
      throw new Error('Invalid number of days');
    }

    // Get the last date from historical data
    const lastDate = new Date(historicalData[historicalData.length - 1].date);
    const futureDates = generateFutureDates(lastDate, days);

    // Predict each metric
    const usagePredictions = predictNextValue(
      historicalData.map(d => d.usage_kwh),
      days
    );
    
    const co2Predictions = predictNextValue(
      historicalData.map(d => d.co2_tco2),
      days
    );
    
    const pfPredictions = predictNextValue(
      historicalData.map(d => d.power_factor),
      days
    );

    // Combine predictions
    const predictions = futureDates.map((date, i) => ({
      date,
      usage_kwh: Math.max(0, usagePredictions[i]), // Ensure non-negative
      co2_tco2: Math.max(0, co2Predictions[i]),
      power_factor: Math.min(1, Math.max(0, pfPredictions[i])) // Ensure between 0 and 1
    }));

    return new Response(
      JSON.stringify(predictions),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
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