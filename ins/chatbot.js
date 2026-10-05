/**
 * 3E Hitech Solutions  - Chatbot Management
 * - script
 * - styling
 */

// Sanitize HTML to prevent XSS attacks
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Inject chatbot styles
function injectChatbotStyles() {
    const style = document.createElement('style');
    style.textContent = `
        #chatbot-container {
            position: fixed;
            bottom: 5.5rem;
            right: 1.5rem;
            z-index: 1000;
        }

        #chatbot-toggle {
            width: 3.5rem;
            height: 3.5rem;
            background: linear-gradient(135deg, #0056b3, #00a0e9);
            color: white;
            border: none;
            border-radius: 50%;
            box-shadow: 0 4px 15px rgba(0, 86, 179, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        #chatbot-toggle:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(0, 86, 179, 0.4);
        }

        #chatbot-window {
            position: fixed;
            bottom: 5rem;
            right: 1.5rem;
            width: 24rem;
            height: 36rem;
            background: white;
            border-radius: 1.5rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            border: 1px solid #e5e7eb;
            overflow: hidden;
            display: none;
            flex-direction: column;
            z-index: 1001;
        }

        #chatbot-window.flex { display: flex; }

        .chatbot-header {
            background: linear-gradient(135deg, #0056b3, #00a0e9);
            color: white;
            padding: 1rem 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .chatbot-header h3 {
            font-size: 1rem;
            font-weight: 600;
            margin: 0;
        }

        .chatbot-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.25rem;
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 0.25rem;
            transition: background-color 0.3s ease;
        }

        .chatbot-close:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        #chatbot-messages {
            flex: 1;
            padding: 1rem;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
        }

        .message {
            max-width: 85%;
            padding: 0.75rem 1rem;
            border-radius: 1rem;
            font-size: 0.875rem;
            line-height: 1.4;
            word-wrap: break-word;
        }

        .message.user {
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 0.25rem;
            animation: slideInRight 0.3s ease-out;
        }

        .message.bot {
            background: white;
            color: #374151;
            align-self: flex-start;
            border: 1px solid #e5e7eb;
            border-bottom-left-radius: 0.25rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            animation: slideInLeft 0.3s ease-out;
        }

        .chatbot-input-area {
            padding: 1rem;
            background: white;
            border-top: 1px solid #e5e7eb;
            display: flex;
            gap: 0.75rem;
            align-items: flex-end;
        }

        #chatbot-input {
            flex: 1;
            padding: 0.75rem 1rem;
            border: 2px solid #e5e7eb;
            background: white;
            border-radius: 1rem;
            font-size: 0.875rem;
            outline: none;
            transition: all 0.3s ease;
            resize: none;
            min-height: 2.5rem;
            max-height: 6rem;
        }

        #chatbot-input:focus {
            border-color: rgba(59, 130, 246, 0.5);
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        #chatbot-send {
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            border: none;
            padding: 0.75rem 1.25rem;
            border-radius: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            min-width: 3rem;
            height: 2.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        #chatbot-send:hover {
            transform: scale(1.05) translateY(-1px);
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
        }

        @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideInRight {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
        }

        @media (max-width: 640px) {
            #chatbot-window {
                width: calc(100vw - 2rem);
                height: calc(100vh - 8rem);
                right: 1rem;
                bottom: 4rem;
            }
            #chatbot-container {
                bottom: 5rem;
                right: 1rem;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize chatbot
function initChatBot() {
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSend = document.getElementById('chatbot-send');
    const chatbotMessages = document.getElementById('chatbot-messages');
    
    if (!chatbotToggle || !chatbotWindow) return;
    
    // Toggle chat window
    chatbotToggle.addEventListener('click', () => {
        chatbotWindow.classList.toggle('hidden');
        chatbotWindow.classList.toggle('flex');
        if (!chatbotWindow.classList.contains('hidden') && chatbotInput) {
            chatbotInput.focus();
        }
    });
    
    // Close chat window
    chatbotClose.addEventListener('click', () => {
        chatbotWindow.classList.add('hidden');
        chatbotWindow.classList.remove('flex');
    });
    
    // Send message
    function sendMessage() {
        if (!chatbotInput) return;
        const message = chatbotInput.value.trim();
        if (!message) return;
        
        addMessage(message, 'user');
        chatbotInput.value = '';
        
        setTimeout(() => {
            const response = getBotResponse(message);
            addMessage(response, 'bot');
        }, 800);
    }
    
    // Add message to chat
    function addMessage(text, sender) {
        if (!chatbotMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        
        chatbotMessages.appendChild(messageDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    // Bot response system
    function getBotResponse(message) {
        const msg = message.toLowerCase().trim();
        
        const hour = new Date().getHours();
        let timeGreeting = "Hello";
        if (hour < 12) timeGreeting = "Good morning";
        else if (hour < 17) timeGreeting = "Good afternoon";
        else timeGreeting = "Good evening";
        
        // Greetings
        if (msg.match(/\b(hello|hi|hey|good morning|good afternoon|good evening)\b/)) {
            const greetings = [
                `${timeGreeting}! I'm Robbie, your friendly 3E Hitech assistant! How can I help you today?`,
                `${timeGreeting}! Welcome to 3E Hitech! I'm here to help with any questions you have.`,
                `Hey there! I'm Robbie from 3E Hitech. What can I help you discover today?`
            ];
            return greetings[Math.floor(Math.random() * greetings.length)];
        }
        
        // Services
        if (msg.match(/\b(service|solution|what do you do|offer|power|telecom|infrastructure)\b/)) {
            return "3E Hitech provides comprehensive solutions including: Power Infrastructure (substations, transmission lines), FTTH-GPON Networks, Fiber Optic Cables, and Security & CCTV systems. Which service interests you most?";
        }
        
        // Contact
        if (msg.match(/\b(contact|phone|email|address|location|reach|call|visit)\b/)) {
            return "You can reach us at: Phone: +63998-587-6995, Email: sales@3ehitech.com, Location: Makati City, Metro Manila. Business hours: Monday-Friday, 8:30 AM - 5:30 PM.";
        }
        
        // About
        if (msg.match(/\b(about|company|history|established|story)\b/)) {
            return "3E Hitech Solutions Inc. has been providing integrated ICT/Telecom & Power Solutions since 2016. We're trusted partners with NGCP and major telecom companies, with 100+ successful projects and 100% client satisfaction.";
        }
        
        // Thank you
        if (msg.match(/\b(thank|thanks|appreciate)\b/)) {
            return "You're very welcome! I'm always here to help. Is there anything else about 3E Hitech you'd like to know?";
        }
        
        // Goodbye
        if (msg.match(/\b(bye|goodbye|see you|farewell|later)\b/)) {
            return "Goodbye! Thank you for your interest in 3E Hitech. Feel free to contact us anytime. Have a great day!";
        }
        
        // Default response
        return "I'm here to help with information about 3E Hitech's services, contact details, company information, and more. What would you like to know?";
    }
    
    // Event listeners
    if (chatbotSend) {
        chatbotSend.addEventListener('click', sendMessage);
    }
    
    if (chatbotInput) {
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    injectChatbotStyles();
    initChatBot();
});
