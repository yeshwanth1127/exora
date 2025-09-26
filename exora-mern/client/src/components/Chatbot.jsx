import React, { useState, useRef, useEffect } from 'react'
import './Chatbot.css'

const Chatbot = ({ isOpen: externalIsOpen, onToggle, hideFloatingButton = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  
  // Use external control if provided, otherwise use internal state
  const isChatOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen
  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    } else {
      setIsOpen(!isOpen)
    }
  }
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Exora's AI assistant. I can help you understand our AI automation services, answer questions about our solutions, and guide you through our offerings. What would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Knowledge base about Exora
  const knowledgeBase = {
    greetings: [
      "Hello! Welcome to Exora. How can I help you today?",
      "Hi there! I'm here to tell you about Exora's AI automation solutions.",
      "Hey! Ready to learn about how Exora can transform your business with AI?"
    ],
    about: {
      company: "Exora is an AI automation company that specializes in creating intelligent agents for businesses. We build custom AI solutions that can handle complex tasks autonomously, from customer service to sales processes and operations management.",
      mission: "Our mission is to empower teams with intelligent agents that operate as seamlessly as humans, delivering AI that truly understands your business—not just automates it.",
      vision: "We envision AI agents that amplify human potential for every business, at any scale, making automation intelligent and adaptive rather than just rule-based.",
      values: "Our core values are Innovation, Business-centricity, Transparency, and Partnership in every engagement."
    },
    services: {
      customAgents: "We create task-specific desktop or web agents with human-in-the-loop controls. These agents can handle complex workflows while maintaining oversight and control.",
      dataIntegration: "We provide ETL, vector search, RAG pipelines and secure integrations into your existing tech stack, ensuring seamless data flow and AI capabilities.",
      consulting: "Our automation consulting helps identify high-ROI workflows and ship pilots in weeks, not months, not years.",
      customerExperience: "We build self-serve assistants, knowledge search tools and proactive support systems to enhance customer experience."
    },
    solutions: {
      customerService: "Our Customer Service Agents handle complex inquiries autonomously and escalate only when needed, reducing response times and improving customer satisfaction.",
      salesAutomation: "Sales Process Automation agents can qualify leads, nurture prospects, schedule meetings, and even negotiate within your parameters.",
      operations: "Operations Management agents predict bottlenecks, allocate resources, and coordinate teams to optimize business processes.",
      dataIntelligence: "Data Intelligence Agents analyze your data, spot trends, and surface actionable recommendations to drive business decisions."
    },
    technology: "We use advanced AI technologies including large language models, vector databases, RAG (Retrieval Augmented Generation), and custom training to create agents that understand your specific business context and requirements.",
    pricing: "We offer custom pricing based on your specific needs and requirements. Our solutions are designed to provide high ROI through intelligent automation. Would you like to schedule a consultation to discuss your specific use case?",
    contact: "You can reach us through our website contact form, email, or schedule a consultation. We'd love to learn about your automation needs and show you how Exora can help transform your business processes."
  }

  // Natural language processing for user queries
  const processQuery = (query) => {
    const lowerQuery = query.toLowerCase()
    
    // Greeting responses
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
      return knowledgeBase.greetings[Math.floor(Math.random() * knowledgeBase.greetings.length)]
    }
    
    // About company queries
    if (lowerQuery.includes('what is exora') || lowerQuery.includes('tell me about exora') || lowerQuery.includes('company')) {
      return knowledgeBase.about.company
    }
    
    if (lowerQuery.includes('mission') || lowerQuery.includes('purpose')) {
      return knowledgeBase.about.mission
    }
    
    if (lowerQuery.includes('vision') || lowerQuery.includes('goal')) {
      return knowledgeBase.about.vision
    }
    
    if (lowerQuery.includes('values') || lowerQuery.includes('principles')) {
      return knowledgeBase.about.values
    }
    
    // Services queries
    if (lowerQuery.includes('services') || lowerQuery.includes('what do you offer') || lowerQuery.includes('offerings')) {
      return `We offer several key services:\n\n• Custom AI Agents: ${knowledgeBase.services.customAgents}\n\n• Data & Integration: ${knowledgeBase.services.dataIntegration}\n\n• Automation Consulting: ${knowledgeBase.services.consulting}\n\n• Customer Experience: ${knowledgeBase.services.customerExperience}`
    }
    
    if (lowerQuery.includes('custom agents') || lowerQuery.includes('ai agents')) {
      return knowledgeBase.services.customAgents
    }
    
    if (lowerQuery.includes('data') || lowerQuery.includes('integration')) {
      return knowledgeBase.services.dataIntegration
    }
    
    if (lowerQuery.includes('consulting') || lowerQuery.includes('consultation')) {
      return knowledgeBase.services.consulting
    }
    
    // Solutions queries
    if (lowerQuery.includes('solutions') || lowerQuery.includes('what can you do')) {
      return `Our comprehensive AI agent solutions include:\n\n• Customer Service Agents: ${knowledgeBase.solutions.customerService}\n\n• Sales Process Automation: ${knowledgeBase.solutions.salesAutomation}\n\n• Operations Management: ${knowledgeBase.solutions.operations}\n\n• Data Intelligence Agents: ${knowledgeBase.solutions.dataIntelligence}`
    }
    
    if (lowerQuery.includes('customer service') || lowerQuery.includes('support')) {
      return knowledgeBase.solutions.customerService
    }
    
    if (lowerQuery.includes('sales') || lowerQuery.includes('sales process')) {
      return knowledgeBase.solutions.salesAutomation
    }
    
    if (lowerQuery.includes('operations') || lowerQuery.includes('management')) {
      return knowledgeBase.solutions.operations
    }
    
    if (lowerQuery.includes('data intelligence') || lowerQuery.includes('analytics')) {
      return knowledgeBase.solutions.dataIntelligence
    }
    
    // Technology queries
    if (lowerQuery.includes('technology') || lowerQuery.includes('tech') || lowerQuery.includes('how does it work')) {
      return knowledgeBase.technology
    }
    
    // Pricing queries
    if (lowerQuery.includes('price') || lowerQuery.includes('cost') || lowerQuery.includes('pricing') || lowerQuery.includes('how much')) {
      return knowledgeBase.pricing
    }
    
    // Contact queries
    if (lowerQuery.includes('contact') || lowerQuery.includes('reach') || lowerQuery.includes('get in touch') || lowerQuery.includes('speak to someone')) {
      return knowledgeBase.contact
    }
    
    // Waitlist queries
    if (lowerQuery.includes('waitlist') || lowerQuery.includes('join') || lowerQuery.includes('sign up') || lowerQuery.includes('early access')) {
      return "Great! You can join our waitlist by clicking the 'Join the Waitlist' button on our website. This will give you early access to our AI automation solutions and exclusive updates about new features and capabilities."
    }
    
    // Default response for unrecognized queries
    return "I understand you're asking about something specific. Could you rephrase your question? I can help you with information about Exora's services, solutions, technology, pricing, or how to get started. What would you like to know more about?"
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = processQuery(inputValue)
      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000) // Random delay between 1-2 seconds
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const suggestedQuestions = [
    "What is Exora?",
    "What services do you offer?",
    "How much does it cost?",
    "Tell me about your AI agents"
  ]

  return (
    <div className="chatbot-container">
      {/* Chat Button - Only show if not hidden */}
      {!hideFloatingButton && (
        <button 
          className={`chatbot-toggle ${isChatOpen ? 'open' : ''}`}
          onClick={handleToggle}
          aria-label="Open chatbot"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {!isChatOpen && <span className="notification-dot"></span>}
        </button>
      )}

      {/* Chat Window */}
      <div className={`chatbot-window ${isChatOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div className="chatbot-title">
            <div className="bot-avatar">🤖</div>
            <div>
              <h3>Exora Assistant</h3>
              <p>AI Automation Expert</p>
            </div>
          </div>
          <button 
            className="close-button"
            onClick={handleToggle}
            aria-label="Close chatbot"
          >
            ×
          </button>
        </div>

        <div className="chatbot-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-content">
                {message.text.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message bot">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="suggested-questions">
            <p>Try asking:</p>
            <div className="question-chips">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  className="question-chip"
                  onClick={() => setInputValue(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="chatbot-input">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about Exora..."
            disabled={isTyping}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="send-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chatbot
