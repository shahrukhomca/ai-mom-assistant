// ============================================
// AI Mom Guide - Online AI Chatbot
// ============================================

// OpenRouter API Key
const API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You are an AI Mom Assistant - a helpful, caring expert in baby care for children aged 0-2 years.

Your knowledge includes:
- Newborn care (0-3 months)
- Infant development (4-12 months)
- Toddler years (1-2 years)
- Feeding and nutrition
- Sleep training
- Health and safety
- Developmental milestones

Guidelines:
- Be warm, supportive, and encouraging
- Provide practical, actionable advice
- Always prioritize baby safety
- Acknowledge that every baby is different
- Encourage consulting pediatricians for medical concerns
- Keep responses concise but informative (2-4 paragraphs)

If asked about buying the guide or pricing, mention that the Complete Baby Care Guide is available for $47 with instant download access.`;

// ============================================
// LOCAL KNOWLEDGE BASE (FALLBACK)
// ============================================

const AI_KNOWLEDGE = {
    'hello': {
        responses: [
            "Hi Mama! I'm your AI Mom Guide, here to help you with any baby care questions. What would you like to know about?",
            "Hello! I'm here to support you on your motherhood journey. How can I help you today?",
            "Hi there! I'm your personal baby care assistant. Ask me anything about feeding, sleep, milestones, or anything else!"
        ]
    },
    'feeding': {
        keywords: ['feed', 'eat', 'food', 'bottle', 'breast', 'milk', 'nutrition'],
        responses: [
            "Newborns typically feed every 2-3 hours (8-12 times per day). Watch for hunger cues like rooting, sucking on hands, or smacking lips. Crying is a late hunger cue!",
            "Breast milk provides optimal nutrition and antibodies. If breastfeeding isn't possible, modern formulas provide complete nutrition. Always follow formula preparation instructions exactly.",
            "Most babies are ready for solid foods between 4-6 months. Look for signs: head control, sitting with support, lost tongue-thrust reflex, and interest in your food.",
            "By 1 year, toddlers need 3 meals + 2 snacks daily. Key nutrients: iron (meat, beans), calcium (dairy, greens), healthy fats (avocado, nut butters), and protein."
        ]
    },
    'sleep': {
        keywords: ['sleep', 'nap', 'bedtime', 'night', 'rest'],
        responses: [
            "Newborns sleep 16-18 hours per day in 2-4 hour stretches. They don't know day from night yet! Help them learn by keeping days bright/active and nights dark/quiet.",
            "Safe sleep guidelines: Always place baby on their back, use a firm mattress with fitted sheet, keep soft objects out of the crib, and room-share for at least 6 months.",
            "By 4-6 months, many babies can sleep longer stretches. Consistent bedtime routines help: bath, massage, pajamas, feeding, book/song, then bed drowsy but awake.",
            "Sleep training methods include: Cry It Out (fastest), Ferber Method (graduated checks), and Chair Method (gentle but slower). Choose one and stick with it!"
        ]
    },
    'milestones': {
        keywords: ['milestone', 'development', 'grow', 'learn', 'skill', 'crawl', 'walk', 'talk'],
        responses: [
            "Every baby develops at their own pace! 4-6 months: rolling over, sitting with support. 7-9 months: crawling, babbling consonants. 10-12 months: first steps may appear!",
            "4-6 months: Rolls both ways, sits with support, reaches for objects, laughs out loud, recognizes familiar faces. Time for solid food introduction!",
            "7-9 months: Sits without support, crawls/scoots, pulls to standing, uses pincer grasp, babbles 'ba-ba' 'da-da', waves bye-bye, plays peek-a-boo.",
            "10-12 months: May take first steps, stands alone, cruises along furniture, points with index finger, says 'mama' 'dada' specifically, shows separation anxiety."
        ]
    },
    'newborn': {
        keywords: ['newborn', 'baby', 'infant', '0-3', 'first week', 'first month'],
        responses: [
            "The first 3 months are all about feeding, sleeping, and bonding! Newborns sleep 16-18 hours per day and need feeding every 2-3 hours (8-12 times daily).",
            "First days: Expect sleep in 2-4 hour stretches, feeding every 2-3 hours, some weight loss (up to 10% is normal), and peeling skin. Umbilical cord stump falls off in 1-3 weeks.",
            "Crying is communication! Common reasons: hunger (most common), discomfort (wet/dirty diaper), tired, overstimulated, gassy, or sick. Learn your baby's cues!",
            "Newborn appearance: Head may be slightly misshapen, skin may peel or have minor rashes, soft spots (fontanelles) on head. All normal and will resolve!"
        ]
    },
    'safety': {
        keywords: ['safety', 'safe', 'proof', 'hazard', 'protect', 'danger'],
        responses: [
            "Baby-proofing essentials: Install gates at stairs, cover outlets, secure furniture to walls, lock cabinets with cleaning supplies/medicines, use toilet locks.",
            "Sleep safety: Back to sleep always, firm mattress with fitted sheet only, no pillows/blankets/toys in crib, room-share for 6+ months, avoid overheating.",
            "Choking hazards: Anything fitting through a toilet paper tube is dangerous! Keep coins, buttons, batteries, small toys, balloons, marbles out of reach.",
            "Never shake a baby - it can cause serious brain injury. If overwhelmed, put baby in safe place and take a break. It's okay to let baby cry while you collect yourself."
        ]
    },
    'health': {
        keywords: ['health', 'sick', 'fever', 'cold', 'doctor', 'illness', 'medicine', 'vaccine'],
        responses: [
            "Call doctor immediately if: fever over 100.4F (under 3 months), difficulty breathing, unusually sleepy, seizure, blue lips/face, severe injury. Trust your instincts!",
            "Common colds: 6-8 per year is normal! Use bulb syringe for mucus, saline drops, cool-mist humidifier, elevate crib mattress slightly, ensure hydration.",
            "Teething (4-7 months): Excessive drooling, gnawing, irritability, swollen gums. Relief: chilled teething rings, gum massage, acetaminophen (if approved by doctor).",
            "Vaccination schedule: Birth (Hep B), 1-2 months (multiple), 4 months, 6 months, 12 months (MMR, Varicella), 15-18 months. Follow the CDC schedule!"
        ]
    },
    'buy': {
        keywords: ['buy', 'purchase', 'price', 'cost', '$', 'pay', 'order'],
        responses: [
            "The Complete Baby Care Guide is $47 and includes instant access to 38 pages of expert advice, bonus checklists, and a 60-day money-back guarantee!",
            "Your purchase includes: Full guide (0-2 years), feeding schedules, sleep training methods, milestone trackers, safety checklists, and emergency care guidelines.",
            "Payment is secure via PayPal, you get instant download access, and there's a full 60-day refund policy if you're not satisfied!"
        ]
    },
    'guide': {
        keywords: ['guide', 'book', 'pdf', 'download', 'what included', 'content'],
        responses: [
            "The guide covers: Chapter 1 - Newborn Care (0-3 months), Chapter 2 - Infant Development (4-12 months), Chapter 3 - Toddler Years (1-2 years), Chapter 4 - Health & Wellness, Chapter 5 - Essential Checklists.",
            "38 pages of comprehensive, expert-backed advice based on American Academy of Pediatrics guidelines. Includes feeding schedules, sleep training, milestone tracking, safety guidelines, and more!",
            "Bonus materials included: Newborn Essentials Checklist, Hospital Bag Packing List, Baby-Proofing Safety Checklist, Developmental Milestones Tracker ($60 value FREE!)"
        ]
    },
    'thank': {
        responses: [
            "You're so welcome, Mama! Remember, you're doing an amazing job. Trust your instincts and don't hesitate to ask for help when you need it!",
            "My pleasure! You're a wonderful mother. Is there anything else I can help you with today?",
            "You're very welcome! Remember - every baby is different, and there's no such thing as a perfect parent. You're doing great!"
        ]
    },
    'bye': {
        responses: [
            "Take care, Mama! Remember to trust your instincts, ask for help when you need it, and enjoy every precious moment with your little one.",
            "Goodbye! I'm always here if you need baby care advice. You've got this!",
            "See you later, Mama! Don't forget - you're doing an amazing job. Every day is a new adventure!"
        ]
    }
};

// Chat state
let chatHistory = [];
let currentChatId = null;
let isProcessing = false;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    loadHistory();
    startNewChat();
});

// ============================================
// CHAT FUNCTIONS
// ============================================

function startNewChat() {
    currentChatId = Date.now().toString();
    chatHistory = [{
        id: Date.now(),
        text: getRandomResponse('hello'),
        sender: 'bot',
        timestamp: new Date()
    }];

    hideWelcomeScreen();
    renderMessages();
    saveToHistory();
}

async function startTopic(topic) {
    startNewChat();
    const userMessage = `Tell me about ${topic}`;
    addMessage(userMessage, 'user');

    showTypingIndicator();
    try {
        await generateBotResponse(userMessage);
    } catch (err) {
        console.error('Error:', err);
        const fallback = getAIResponse(userMessage);
        addMessage(fallback, 'bot');
    }
    hideTypingIndicator();
}

function hideWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const chatMessages = document.getElementById('chatMessages');

    if (welcomeScreen) welcomeScreen.style.display = 'none';
    if (chatMessages) chatMessages.classList.add('active');
}

function addMessage(text, sender) {
    const message = {
        id: Date.now(),
        text: text,
        sender: sender,
        timestamp: new Date()
    };

    chatHistory.push(message);
    renderMessages();
    saveToHistory();
}

function renderMessages() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    chatMessages.innerHTML = '';

    chatHistory.forEach(message => {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${message.sender}`;

        const time = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageEl.innerHTML = `
            <div class="message-avatar">${message.sender === 'bot' ? '🤱' : '👩'}</div>
            <div>
                <div class="message-content">${formatMessage(message.text)}</div>
                <div class="message-time">${time}</div>
            </div>
        `;

        chatMessages.appendChild(messageEl);
    });

    scrollToBottom();
}

function formatMessage(text) {
    return text.replace(/\n/g, '<br>');
}

// ============================================
// SEND MESSAGE (main function)
// ============================================

async function sendMessage() {
    if (isProcessing) return;

    const input = document.getElementById('messageInput');
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    isProcessing = true;

    addMessage(text, 'user');
    input.value = '';
    autoResize(input);

    showTypingIndicator();

    try {
        await generateBotResponse(text);
    } catch (err) {
        console.error('Send Error:', err);
        const fallback = getAIResponse(text);
        addMessage(fallback + '\n\n_(Note: Using offline mode - AI temporarily unavailable)_', 'bot');
    }

    hideTypingIndicator();
    isProcessing = false;
}

// ============================================
// AI RESPONSE (online API + fallback)
// ============================================

async function generateBotResponse(userMessage) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'AI Mom Assistant'
            },
            body: JSON.stringify({
                model: 'openai/gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error('API request failed: ' + response.status);
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid API response');
        }

        const aiResponse = data.choices[0].message.content;
        addMessage(aiResponse, 'bot');

    } catch (error) {
        console.error('AI Error:', error);
        const fallbackResponse = getAIResponse(userMessage);
        addMessage(fallbackResponse + '\n\n_(Note: Using offline mode)_', 'bot');
    }
}

function getAIResponse(userMessage) {
    const message = userMessage.toLowerCase();

    for (const [topic, data] of Object.entries(AI_KNOWLEDGE)) {
        if (data.keywords) {
            for (const keyword of data.keywords) {
                if (message.includes(keyword)) {
                    return getRandomResponse(topic);
                }
            }
        }
    }

    for (const [topic, data] of Object.entries(AI_KNOWLEDGE)) {
        if (message.includes(topic)) {
            return getRandomResponse(topic);
        }
    }

    return getDefaultResponse(message);
}

function getRandomResponse(topic) {
    const responses = AI_KNOWLEDGE[topic].responses;
    return responses[Math.floor(Math.random() * responses.length)];
}

function getDefaultResponse(message) {
    const defaults = [
        "I'm here to help with baby care questions! Ask me about feeding, sleep, milestones, safety, or anything else on your mind.",
        "I can help with newborn care, feeding schedules, sleep training, developmental milestones, and safety tips. What would you like to know?",
        "I'm your AI Mom Guide! I specialize in baby care topics. Feel free to ask about anything related to your little one's care."
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
}

// ============================================
// UI HELPERS
// ============================================

function showTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.style.display = 'block';
    scrollToBottom();
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.style.display = 'none';
}

function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('active');
}

// ============================================
// HISTORY FUNCTIONS
// ============================================

function saveToHistory() {
    if (!currentChatId || chatHistory.length <= 1) return;

    const history = JSON.parse(localStorage.getItem('momGuideHistory') || '[]');
    const existingIndex = history.findIndex(h => h.id === currentChatId);

    const chatData = {
        id: currentChatId,
        title: chatHistory[1]?.text.substring(0, 50) + '...' || 'New Chat',
        messages: [...chatHistory],
        timestamp: new Date().toISOString()
    };

    if (existingIndex !== -1) {
        history[existingIndex] = chatData;
    } else {
        history.unshift(chatData);
        history.splice(50);
    }

    localStorage.setItem('momGuideHistory', JSON.stringify(history));
    renderHistory();
}

function loadHistory() {
    renderHistory();
}

function renderHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    const history = JSON.parse(localStorage.getItem('momGuideHistory') || '[]');

    historyList.innerHTML = '';

    if (history.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No chat history yet</p>';
        return;
    }

    history.forEach(chat => {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${chat.id === currentChatId ? 'active' : ''}`;
        historyItem.onclick = () => loadChat(chat.id);

        const date = new Date(chat.timestamp);
        const dateStr = date.toLocaleDateString();

        historyItem.innerHTML = `
            <div class="history-title">${chat.title}</div>
            <div class="history-date">${dateStr}</div>
        `;

        historyList.appendChild(historyItem);
    });
}

function loadChat(chatId) {
    const history = JSON.parse(localStorage.getItem('momGuideHistory') || '[]');
    const chat = history.find(h => h.id === chatId);

    if (chat) {
        currentChatId = chat.id;
        chatHistory = [...chat.messages];
        hideWelcomeScreen();
        renderMessages();
        toggleSidebar();
    }
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all chat history?')) {
        localStorage.removeItem('momGuideHistory');
        renderHistory();
        startNewChat();
    }
}

function exportChat() {
    if (chatHistory.length <= 1) {
        alert('No messages to export yet!');
        return;
    }

    const chatText = chatHistory.map(msg => {
        const sender = msg.sender === 'bot' ? 'AI Mom Guide' : 'You';
        const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `[${time}] ${sender}: ${msg.text}`;
    }).join('\n\n');

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mom-guide-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
