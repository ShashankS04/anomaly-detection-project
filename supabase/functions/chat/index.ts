import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface ChatRequest {
  message: string;
  context?: {
    anomalyCount: number;
    recentAlerts: Array<{
      diagnosis: string;
      level: number;
      usage: number;
      co2: number;
      powerFactor: number;
    }>;
  };
}

function generateResponse(message: string, context?: ChatRequest['context']): string {
  const msg = message.toLowerCase();

  // Context-aware responses
  if (context) {
    if (msg.includes('how many') && (msg.includes('anomal') || msg.includes('alert'))) {
      if (context.anomalyCount === 0) {
        return 'Currently, there are no detected anomalies in the system. Everything appears to be operating normally.';
      }
      return `There are currently ${context.anomalyCount} detected anomalies in the system. Would you like to know more about any specific anomaly?`;
    }

    if ((msg.includes('recent') && msg.includes('alert')) || msg.includes('latest') || msg.includes('last')) {
      if (!context.recentAlerts || context.recentAlerts.length === 0) {
        return 'There are no recent alerts to report. The system is operating normally.';
      }

      const alertDescriptions = context.recentAlerts.map((alert, index) => {
        const severity = alert.level === 3 ? 'Critical' : alert.level === 2 ? 'Moderate' : 'Minor';
        return `${index + 1}. ${severity} alert: ${alert.diagnosis}\n   - Energy Usage: ${alert.usage.toFixed(2)} kWh\n   - CO2 Emissions: ${alert.co2.toFixed(2)} tCO2\n   - Power Factor: ${alert.powerFactor.toFixed(2)}`;
      });

      return `Here are the most recent alerts:\n\n${alertDescriptions.join('\n\n')}`;
    }
  }

  // General knowledge responses
  if (msg.includes('hello') || msg.includes('hi ') || msg.includes('hey')) {
    return 'Hello! I\'m your AI assistant for the Smart Anomaly Detection system. I can help you understand system alerts, anomalies, and metrics. What would you like to know?';
  }

  if (msg.includes('help') || msg.includes('what can you do')) {
    return 'I can help you with:\n\n' +
           '• Understanding recent alerts and anomalies\n' +
           '• Explaining power factor issues\n' +
           '• Interpreting CO2 emissions data\n' +
           '• Analyzing energy usage patterns\n' +
           '• Providing system status updates\n\n' +
           'Feel free to ask about any of these topics!';
  }

  if (msg.includes('what') && msg.includes('anomaly')) {
    return 'An anomaly is an unusual pattern or behavior in your system that deviates from normal operation. Our system uses advanced machine learning algorithms to detect these anomalies by analyzing:\n\n' +
           '• Energy usage patterns\n' +
           '• CO2 emission levels\n' +
           '• Power factor measurements\n\n' +
           'When an anomaly is detected, it\'s classified by severity (Minor, Moderate, or Critical) and analyzed for potential causes.';
  }

  if (msg.includes('power factor')) {
    return 'Power factor is a crucial metric that measures how efficiently your electrical system uses power. It\'s expressed as a value between 0 and 1, where:\n\n' +
           '• Ideal power factor: > 0.95\n' +
           '• Acceptable range: 0.85 - 0.95\n' +
           '• Concerning level: < 0.85\n\n' +
           'Low power factor can indicate issues like:\n' +
           '• Equipment inefficiency\n' +
           '• Reactive power problems\n' +
           '• Potential system overload\n\n' +
           'Would you like to know more about improving power factor?';
  }

  if (msg.includes('co2') || msg.includes('carbon')) {
    return 'CO2 emissions monitoring is essential for environmental compliance and system efficiency. Our system tracks emissions in tCO2 (tonnes of CO2) and can detect:\n\n' +
           '• Unusual spikes in emissions\n' +
           '• Gradual increases over time\n' +
           '• Correlation with energy usage\n' +
           '• Potential equipment issues\n\n' +
           'High CO2 emissions often indicate inefficiencies that need attention.';
  }

  if (msg.includes('energy') || msg.includes('usage')) {
    return 'Energy usage is measured in kilowatt-hours (kWh) and is monitored continuously. Anomalies in energy usage might indicate:\n\n' +
           '• Equipment malfunction\n' +
           '• Inefficient operations\n' +
           '• Unauthorized usage\n' +
           '• System overload\n\n' +
           'Our system analyzes usage patterns to detect both sudden spikes and gradual increases that might need attention.';
  }

  // Default response
  return 'I understand you\'re asking about the system. To help you better, you can ask about:\n\n' +
         '• Current anomalies and alerts\n' +
         '• Power factor analysis\n' +
         '• CO2 emissions data\n' +
         '• Energy usage patterns\n' +
         '• System status\n\n' +
         'What specific aspect would you like to know more about?';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const { message, context } = await req.json() as ChatRequest;
    
    if (!message) {
      throw new Error('Message is required');
    }

    const response = generateResponse(message, context);

    return new Response(
      JSON.stringify({ response }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "I apologize, but I'm having trouble processing your request. Please try again."
      }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});