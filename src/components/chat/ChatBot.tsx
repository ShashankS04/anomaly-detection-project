import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Minimize2, Maximize2, HelpCircle, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../ui/Button';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'faq';
  content: string;
  timestamp: Date;
}

interface FAQ {
  category: string;
  questions: string[];
}

const faqs: FAQ[] = [
  {
    category: "General Usage",
    questions: [
      "How do I use this anomaly detection system?",
      "Can you explain what this dashboard shows?",
      "What is an anomaly and why does it matter?",
    ]
  },
  {
    category: "Data Ingestion",
    questions: [
      "How do I upload or ingest new data?",
      "What type of data formats are supported?",
      "Where can I see the data I just uploaded?",
    ]
  },
  {
    category: "Viewing Data and Analytics",
    questions: [
      "Can you show me the latest energy consumption trends?",
      "Where can I find the current CO₂ emission levels?",
      "How do I interpret this graph/chart?",
    ]
  },
  {
    category: "Alerts & Anomalies",
    questions: [
      "Are there any new anomalies detected?",
      "What should I do if an alert is triggered?",
      "How can I view past alerts or notifications?",
    ]
  },
  {
    category: "FMEA",
    questions: [
      "What is FMEA and how does it work here?",
      "How can I view the FMEA report for my system?",
      "Does the system suggest actions for the detected failure modes?",
    ]
  },
  {
    category: "Model Training & Testing",
    questions: [
      "How can I train the model with new data?",
      "Is the model currently being tested or trained?",
      "How accurate is the anomaly detection model?",
    ]
  }
];

const answers: Record<string, string> = {
  "How do I use this anomaly detection system?": 
    "Our system works in three simple steps:\n1. Upload your data through the Data Ingestion page\n2. Select and train an anomaly detection model\n3. View results in the Alerts and FMEA sections",
  
  "Can you explain what this dashboard shows?":
    "The dashboard provides comprehensive monitoring of your system's performance through multiple views:\n• Data Ingestion: Upload and manage data\n• Multichannel View: Visualize multiple metrics\n• Model Training: Train anomaly detection models\n• Alerts: View detected anomalies\n• FMEA: Detailed failure mode analysis",
  
  "What is an anomaly and why does it matter?":
    "An anomaly is an unusual pattern in your data that could indicate potential issues. We monitor:\n• Energy consumption spikes\n• Abnormal CO₂ emissions\n• Power factor deviations\nDetecting these early helps prevent equipment failures and reduce operational costs.",
  
  "How do I upload or ingest new data?":
    "To upload data:\n1. Go to the Data Ingestion page\n2. Drag & drop your CSV file or click to select\n3. Ensure your file contains required columns (usage_kwh, co2_tco2, power_factor)\n4. The system will automatically validate and process your data",
  
  "What type of data formats are supported?":
    "Currently, we support CSV files with the following required columns:\n• usage_kwh: Energy usage in kilowatt-hours\n• co2_tco2: CO₂ emissions in tonnes\n• power_factor: Power factor measurements\nThe data should be time-series with a date/timestamp column.",
  
  "Where can I see the data I just uploaded?":
    "Uploaded data can be viewed in:\n1. Data Ingestion page: List of all uploaded files\n2. Multichannel View: Visual representation of data\n3. Model Training: When selecting data for training",
  
  "Can you show me the latest energy consumption trends?":
    "You can view energy consumption trends in:\n1. Multichannel View: Interactive time-series graphs\n2. Alerts page: Anomalies in consumption\n3. FMEA section: Detailed analysis of patterns",
  
  "Where can I find the current CO₂ emission levels?":
    "CO₂ emissions can be monitored in:\n1. Multichannel View: Real-time emissions data\n2. Alerts: Emission-related anomalies\n3. FMEA: Environmental impact analysis",
  
  "How do I interpret this graph/chart?":
    "Our graphs show:\n• X-axis: Time series data\n• Y-axis: Metric values (kWh, tCO₂, etc.)\n• Color coding: Different metrics\n• Interactive features: Zoom, pan, hover for details\nAnomalies are highlighted for easy identification.",
  
  "Are there any new anomalies detected?":
    "Check the Alerts page for:\n• Latest anomalies with severity levels\n• Detailed diagnosis of each anomaly\n• Time and date of detection\nYou can filter by severity (Critical, Moderate, Minor)",
  
  "What should I do if an alert is triggered?":
    "When an alert triggers:\n1. Check the severity level\n2. Review the FMEA diagnosis\n3. Follow recommended actions\n4. Monitor the system for improvements\nCritical alerts require immediate attention.",
  
  "How can I view past alerts or notifications?":
    "Access historical alerts in:\n1. Alerts page: Complete alert history\n2. FMEA section: Detailed analysis\nUse filters and sorting to find specific alerts.",
  
  "What is FMEA and how does it work here?":
    "FMEA (Failure Mode and Effects Analysis) helps identify potential failures:\n• Analyzes anomaly patterns\n• Provides root cause analysis\n• Suggests preventive measures\n• Prioritizes issues by severity",
  
  "How can I view the FMEA report for my system?":
    "Access FMEA reports in the FMEA section:\n1. View failure mode categories\n2. Check root cause analysis\n3. Review recommended actions\n4. Monitor effectiveness metrics",
  
  "Does the system suggest actions for the detected failure modes?":
    "Yes, for each anomaly the system provides:\n• Root cause analysis\n• Recommended actions\n• Prevention strategies\n• Priority levels for action",
  
  "How can I train the model with new data?":
    "To train the model:\n1. Upload data in Data Ingestion\n2. Go to Model Training page\n3. Select your dataset\n4. Choose a model type\n5. Click 'Train Model'",
  
  "Is the model currently being tested or trained?":
    "Check the Model Training page for:\n• Current training status\n• Progress indicators\n• Success/failure notifications\n• Model performance metrics",
  
  "How accurate is the anomaly detection model?":
    "Model accuracy is measured by:\n• False positive/negative rates\n• Detection precision\n• Recall rates\nWe use multiple algorithms to ensure reliable detection."
};

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showFAQ, setShowFAQ] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { anomalyData } = useAppContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuestionClick = (question: string) => {
    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      type: 'user',
      content: question,
      timestamp: new Date(),
    };

    const botMessage: Message = {
      id: Date.now().toString() + '-bot',
      type: 'bot',
      content: answers[question] || "I'm sorry, I don't have an answer for that specific question.",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage, botMessage]);
    setShowFAQ(false);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      type: 'user',
      content: message,
      timestamp: new Date(),
    };

    // Find the most relevant predefined answer
    const relevantQuestion = Object.keys(answers).find(q => 
      q.toLowerCase().includes(message.toLowerCase()) ||
      message.toLowerCase().includes(q.toLowerCase())
    );

    const botMessage: Message = {
      id: Date.now().toString() + '-bot',
      type: 'bot',
      content: relevantQuestion 
        ? answers[relevantQuestion]
        : "I'm not sure about that. Please try asking one of the suggested questions or rephrase your question.",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage, botMessage]);
    setMessage('');
    setShowFAQ(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-primary-500 text-white p-4 rounded-full shadow-lg hover:bg-primary-600 transition-colors z-50"
        aria-label="Open chat"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div
      className={`fixed right-4 bottom-4 bg-white rounded-lg shadow-xl transition-all duration-300 z-50 ${
        isMinimized ? 'w-72 h-14' : 'w-96 h-[32rem]'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <MessageSquare className="text-primary-500" size={20} />
          <h3 className="font-medium">Support Assistant</h3>
        </div>
        <div className="flex items-center space-x-2">
          {!showFAQ && messages.length > 0 && (
            <button
              onClick={() => {
                setShowFAQ(true);
                setMessages([]);
              }}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Back to FAQ"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <button
            onClick={() => {
              setShowFAQ(true);
              setMessages([]);
            }}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Show FAQ"
          >
            <HelpCircle size={18} />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-500 hover:text-gray-700"
            aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="h-[calc(32rem-8rem)] overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.type === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-xs opacity-75 mt-1 block">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}

            {showFAQ && (
              <div className="space-y-4">
                {faqs.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <h4 className="font-medium text-gray-700">{category.category}</h4>
                    {category.questions.map((question) => (
                      <button
                        key={question}
                        onClick={() => handleQuestionClick(question)}
                        className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                icon={<Send size={16} />}
              >
                Send
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;