// ==========================================
// AI Mom Guide - Premium Chat UI
// OpenRouter API + Local Fallback
// ==========================================

OLD: const API_KEY = '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';
NEW: const API_KEY = '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';const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You are "Mama Sage" — a warm, experienced mom friend who's been through it all. You help new moms with babies aged 0-2 years. You are NOT a cold medical encyclopedia. You are the wise best-friend moms call at 2 AM.

YOUR PERSONALITY:
- Warm, encouraging, and slightly humorous. Use a conversational tone, like texting a friend.
- Use emojis naturally (👶, 💤, 🍼, ❤️) but don't overdo it.
- Validate the mom's feelings first before giving advice. Example: "Oh honey, sleepless nights are BRUTAL. You're doing amazing even when it doesn't feel like it."
- Use short paragraphs, bullet points, and bold text for key takeaways so it's easy to read on a phone at 3 AM.
- Share relatable "mini stories" — "When my little one was 4 months, she did the exact same thing..."
- Always end with a gentle follow-up question or encouragement to keep the conversation going.

YOUR KNOWLEDGE:
- Newborn care (0-3 months): feeding schedules, colic, swaddling, umbilical cord care
- Infant development (4-12 months): sleep regression, introducing solids, teething, crawling
- Toddler years (1-2 years): tantrums, potty training prep, speech development
- Feeding & nutrition: breastfeeding, formula, allergies, meal prep
- Sleep training: gentle methods, bedtime routines, nap schedules
- Health & safety: fever guidelines, rashes, when to call the doctor
- Developmental milestones: month-by-month what to expect

RULES:
- NEVER sound robotic or like a textbook. No "Step 1, Step 2" unless the mom specifically asks for a checklist.
- If a question is medical and serious, give helpful info BUT gently remind them to check with their pediatrician. Don't scare them.
- Keep responses under 150 words unless the question needs a detailed explanation.
- Use phrases like "Here's the thing...", "Trust me on this...", "You're not alone in this."
- If the mom seems stressed, give her a virtual hug: "Breathe, mama. You've got this. 💪"

At the end of relevant responses, naturally mention the Complete Baby Care Guide PDF available for $20 with instant download, but only if it genuinely fits the conversation. Example: "If you want a printable sleep schedule that actually worked for us, I put my full routine in the Complete Baby Care Guide — it's $20 and you can download it instantly. But honestly, just try the tips above first and see how it goes! ❤️"`;

// ==========================================
// LOCAL KNOWLEDGE BASE (FALLBACK)
// ==========================================
const LOCAL_KNOWLEDGE = {
    'hello': {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
        responses: [
            "Hi there, mama! 👋 Welcome! I'm so glad you're here. How's your little one doing today? Feel free to ask me anything — no question is too small!",
            "Hey mama! 💕 So lovely to meet you. How can I help make your day a little easier?",
            "Hello, beautiful! 👶✨ How's motherhood treating you? I'm here for whatever you need!"
        ]
    },
    'sleep': {
        keywords: ['sleep', 'nap', 'bedtime', 'night', 'crying', 'wakes', 'waking', 'tired', 'exhausted'],
        responses: [
            "Oh honey, sleepless nights are BRUTAL. You're doing amazing even when it doesn't feel like it. 💤\n\n**Here's what usually helps:**\n- **Swaddling** (0-3 months) — keeps that startle reflex from waking them\n- **White noise** — a fan or app works wonders\n- **Dream feed** — feed right before YOU go to bed to extend their longest stretch\n- **Drowsy but awake** — put them down before they're fully asleep so they learn to self-soothe\n\nHow old is your little one? I can give you age-specific tips! ❤️",
            "I feel you, mama. Sleep deprivation is no joke. 😴\n\n**Quick wins:**\n- Dark room (blackout curtains are worth every penny)\n- Consistent bedtime routine (bath → book → bed)\n- Try the **5 S's**: Swaddle, Side, Shush, Swing, Suck\n\nTrust me on this — it gets better. My little one was up every 2 hours until we got the routine down. You've got this! 💪",
            "Sleep struggles are SO real, mama. You're not alone in this. 💤\n\n**A few things to try:**\n- Check if baby is **overtired** — sometimes they fight sleep because they're too tired!\n- **Bedtime between 7-8pm** often works best for little ones\n- If they're 4+ months, a gentle sleep training method might help\n\nWhat's your current bedtime routine looking like?"
        ]
    },
    'feeding': {
        keywords: ['feed', 'eat', 'food', 'bottle', 'breast', 'milk', 'nursing', 'formula', 'solid', 'hungry', 'nutrition'],
        responses: [
            "Feeding questions are SO common — you're definitely not alone! 🍼\n\n**Here's the thing:**\n- **Newborns**: Every 2-3 hours (8-12 feeds/day)\n- **4-6 months**: Still frequent, but you can start thinking about solids when they show signs\n- **6-12 months**: 3 meals + milk, gradually increasing textures\n\n**Signs baby is ready for solids:**\n- Sits with support\n- Lost tongue-thrust reflex\n- Interested in your food\n\nAre you breastfeeding, formula feeding, or a mix? I can give more specific tips! 💕",
            "Feeding can feel overwhelming at first, but you'll find your groove! 🍼\n\n**A few tips that saved my sanity:**\n- **Cluster feeding** is normal (especially evenings!) — baby is tanking up\n- Burp halfway through and at the end\n- If bottle-feeding, pace feeding prevents overfeeding\n\nHow old is your baby, and what feeding method are you using? I'm here to help! ❤️"
        ]
    },
    'milestones': {
        keywords: ['milestone', 'development', 'grow', 'learn', 'skill', 'crawl', 'walk', 'talk', 'sitting', 'rolling', 'teething'],
        responses: [
            "Every baby develops at their own pace, mama! Here's a rough guide to ease your mind: 👶\n\n**0-3 months:**\n- Lifts head during tummy time\n- Tracks objects with eyes\n- Smiles socially\n\n**4-6 months:**\n- Rolls over\n- Sits with support\n- Babbles (ma-ma, ba-ba)\n\n**7-9 months:**\n- Crawls or scoots\n- Pulls to stand\n- Pincer grasp (thumb + finger)\n\n**10-12 months:**\n- May take first steps!\n- Says 1-2 words\n- Waves bye-bye\n\nRemember — there's a wide range of normal! If you're ever worried, your pediatrician is the best person to check. How old is your little one? 💕"
        ]
    },
    'newborn': {
        keywords: ['newborn', 'baby', 'infant', '0-3', 'first week', 'first month', 'umbilical', 'colic', 'swaddle'],
        responses: [
            "The newborn stage is beautiful AND overwhelming. You're doing great, mama! 👶💕\n\n**A few newborn essentials:**\n- **Swaddling** helps with the startle reflex — just make sure hips can move!\n- **Tummy time** starts day 1 (even just 1-2 minutes)\n- **Umbilical cord** falls off in 1-3 weeks — keep it dry\n- **Colic** peaks at 6-8 weeks — it WILL pass, I promise\n\nWhat specifically are you dealing with? I'm here for you! 💪",
            "Those first few weeks are a whirlwind, aren't they? 🌪️👶\n\n**Things that helped me survive:**\n- Accept ALL help offered (meals, laundry, holding baby while you shower)\n- Sleep when baby sleeps — seriously, the dishes can wait\n- Skin-to-skin is magic for both of you\n- Crying peaks at 6-8 weeks — you're almost through the hardest part!\n\nHow are YOU feeling, mama? Are you getting any rest? 💕"
        ]
    },
    'safety': {
        keywords: ['safety', 'safe', 'proof', 'hazard', 'protect', 'danger', 'choking', 'crib', 'car seat'],
        responses: [
            "Safety first, always! 🛡️ Here's a quick room-by-room checklist:\n\n**Nursery:**\n- Firm mattress, fitted sheet ONLY (no bumpers, pillows, blankets until 12+ months)\n- Baby monitor placed safely away from crib\n\n**Living Room:**\n- Anchor furniture to walls (dressers, TVs, bookshelves)\n- Outlet covers on ALL unused outlets\n- Cord shorteners for blinds\n\n**Kitchen:**\n- Cabinet locks on lower cabinets\n- Stove knob covers\n- Keep knives, cleaners, and small objects out of reach\n\n**Car:**\n- Rear-facing car seat until at least age 2 (or outgrows height/weight limits)\n\nWant me to go deeper on any room? 💕"
        ]
    },
    'health': {
        keywords: ['health', 'sick', 'fever', 'cold', 'doctor', 'illness', 'medicine', 'vaccine', 'rash', 'teething'],
        responses: [
            "I know it's scary when baby isn't feeling well. 💔 You're doing the right thing by seeking info.\n\n**When to call the doctor:**\n- Fever over 100.4°F (38°C) in babies under 3 months\n- Fever over 102°F (38.9°C) in older babies\n- Trouble breathing\n- Not eating or drinking\n- Unusual lethargy\n\n**For mild colds:**\n- Saline drops + bulb syringe for stuffy noses\n- Cool-mist humidifier\n- Lots of cuddles and fluids\n\n**Please check with your pediatrician for medical concerns** — I'm here for support, but they're the pros! 💕 What's going on with your little one?"
        ]
    },
    'crying': {
        keywords: ['cry', 'crying', 'fussy', 'fussing', 'won\'t stop', 'screaming', 'colic'],
        responses: [
            "Oh mama, I hear you. A crying baby is SO stressful, but you're not doing anything wrong. 👶💕\n\n**The 5 S's (Dr. Karp's method) — lifesavers:**\n1. **Swaddle** — snug wrapping (arms down)\n2. **Side/Stomach** — hold on their side or stomach (never for sleep!)\n3. **Shush** — loud white noise (vacuum, hair dryer, app)\n4. **Swing** — gentle jiggling motion (support the head!)\n5. **Suck** — pacifier, clean finger, or nursing\n\n**Other checks:**\n- Hungry? (rooting, sucking on hands)\n- Wet/dirty diaper?\n- Too hot or cold?\n- Overstimulated? (take to a quiet, dark room)\n\nYou've got this, mama. Breathe. 💪 What's been working (or not working) so far?"
        ]
    },
    'buy': {
        keywords: ['buy', 'purchase', 'price', 'cost', '$', 'pay', 'order', 'guide', 'pdf', 'download'],
        responses: [
            "The Complete Baby Care Guide is $20 and includes instant access to 38 pages of expert advice, feeding schedules, sleep training methods, milestone trackers, safety checklists, and more! You also get the AI Mom Assistant (that's me!) for 24/7 support. Would you like the link to purchase? 💕"
        ]
    },
    'thank': {
        keywords: ['thank', 'thanks', 'appreciate', 'grateful'],
        responses: [
            "You're so welcome, mama! 💕 I'm just happy I could help. You're doing an amazing job, even on the hard days. Remember — you're exactly the mom your baby needs. Is there anything else on your mind?",
            "Anytime, beautiful! 👶✨ Being a mom is the hardest and most rewarding job in the world. You're not alone in this journey. What else can I help with?"
        ]
    },
    'bye': {
        keywords: ['bye', 'goodbye', 'see you', 'later', 'night'],
        responses: [
            "Take care, mama! 💕 Remember to be gentle with yourself. You're doing better than you think. I'm always here if you need me — day or night! Sleep well (if baby lets you 😉).",
            "Goodbye, beautiful! 👶💤 Don't forget — you've got this. And if you ever feel like you don't, come back and chat. I'm always here. Take care! ❤️"
        ]
    }
};

function getLocalResponse(userText) {
    const lowerText = userText.toLowerCase();
    for (const [topic, data] of Object.entries(LOCAL_KNOWLEDGE)) {
        if (data.keywords) {
            for (const keyword of data.keywords) {
                if (lowerText.includes(keyword)) {
                    const responses = data.responses;
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            }
        }
    }
    return `I'm here to help with baby care questions! Ask me about feeding, sleep, milestones, safety, or anything else on your mind. 💕`;
}

// ==========================================
// DOM READY - Initialize Everything
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Mom Guide loaded successfully!');

    const chatArea = document.getElementById('chatArea');
    const messagesContainer = document.getElementById('messagesContainer');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const typingIndicator = document.getElementById('typingIndicator');
    const welcomeMessage = document.getElementById('welcomeMessage');

    if (!messageInput || !sendBtn) {
        console.error('Required elements not found!');
        return;
    }

    let chatHistory = [];
    let isProcessing = false;

    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // Send on Enter
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Send button click
    sendBtn.addEventListener('click', function(e) {
        e.preventDefault();
        sendMessage();
    });

    function getTimeString() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    }

    function createMessageElement(text, isUser) {
        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${isUser ? 'user' : 'ai'}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = isUser ? 'You' : '👩‍🍼';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';

        let formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');

        bubble.innerHTML = formattedText;

        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = getTimeString();

        const bubbleWrapper = document.createElement('div');
        bubbleWrapper.appendChild(bubble);
        bubbleWrapper.appendChild(time);

        wrapper.appendChild(avatar);
        wrapper.appendChild(bubbleWrapper);

        return wrapper;
    }

    function showTyping() {
        if (typingIndicator) typingIndicator.classList.add('active');
        scrollToBottom();
    }

    function hideTyping() {
        if (typingIndicator) typingIndicator.classList.remove('active');
    }

    function scrollToBottom() {
        if (chatArea) {
            chatArea.scrollTo({
                top: chatArea.scrollHeight,
                behavior: 'smooth'
            });
        }
    }

    async function sendMessage() {
        if (isProcessing) return;

        const text = messageInput.value.trim();
        if (!text) return;

        isProcessing = true;

        // Hide welcome message on first message
        if (welcomeMessage) {
            welcomeMessage.style.display = 'none';
        }

        // Add user message
        const userMsg = createMessageElement(text, true);
        messagesContainer.appendChild(userMsg);
        chatHistory.push({ role: 'user', content: text });

        // Clear input
        messageInput.value = '';
        messageInput.style.height = 'auto';
        scrollToBottom();

        // Show typing
        showTyping();

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
                        ...chatHistory
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                throw new Error('API request failed: ' + response.status);
            }

            const data = await response.json();
            const aiReply = data.choices?.[0]?.message?.content || getLocalResponse(text);

            hideTyping();

            // Add AI message
            const aiMsg = createMessageElement(aiReply, false);
            messagesContainer.appendChild(aiMsg);
            chatHistory.push({ role: 'assistant', content: aiReply });

            scrollToBottom();

        } catch (error) {
            console.error('AI Error:', error);
            hideTyping();

            // Use local fallback on error
            const fallbackReply = getLocalResponse(text);
            const aiMsg = createMessageElement(fallbackReply + '\n\n_(Note: Using offline mode — AI service temporarily unavailable)_', false);
            messagesContainer.appendChild(aiMsg);
            chatHistory.push({ role: 'assistant', content: fallbackReply });

            scrollToBottom();
        }

        isProcessing = false;
    }

    // Make startTopic globally accessible for onclick handlers
    window.startTopic = function(topic) {
        messageInput.value = `Tell me about ${topic}`;
        sendMessage();
    };
});
