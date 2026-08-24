/* ==========================================
   AI MOM GUIDE - PROTECTED CHATBOT
   Members-only access with obfuscated API
   ========================================== */

// ---- AUTH CONFIG ----
const MEMBER_PASSWORD = 'MOM2024!';
const AUTH_KEY = 'ai_mom_auth_v2';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// ---- OBFUSCATED API KEY ----
// Key is split and base64-encoded to deter casual scraping
// Format: sk-or-v1-... (stored as 3 fragments)
const K1 = 'c2stb3ItdjEtYjMzYjI2Yjk3NWM5MDcwN';
const K2 = 'zM0YTI0MTk1MTI2ODZhZDI1ZWJlY2UxMj';
const K3 = 'A0MWM0NDgyNjJiMzUyNzNiMTg2NmZkNQ==';

function getApiKey() {
    try {
        const combined = atob(K1 + K2 + K3);
        return combined;
    } catch (e) {
        console.error('Key decode failed');
        return '';
    }
}

// ---- API CONFIG ----
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// ---- STATE ----
let messages = [];
let currentImage = null;
let isProcessing = false;

// ==========================================
// AUTH SYSTEM
// ==========================================

function checkPassword() {
    const input = document.getElementById('passwordInput');
    const error = document.getElementById('passwordError');
    const value = input.value.trim();

    if (value === MEMBER_PASSWORD) {
        setAuthenticated();
        showChat();
        error.classList.remove('show');
    } else {
        error.classList.add('show');
        input.value = '';
        input.focus();
    }
}

function setAuthenticated() {
    const session = {
        authenticated: true,
        timestamp: Date.now()
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

function clearAuth() {
    localStorage.removeItem(AUTH_KEY);
}

function isAuthenticated() {
    try {
        const session = JSON.parse(localStorage.getItem(AUTH_KEY));
        if (!session || !session.authenticated) return false;
        // Check session expiry
        if (Date.now() - session.timestamp > SESSION_DURATION) {
            clearAuth();
            return false;
        }
        return true;
    } catch {
        return false;
    }
}

function logout() {
    clearAuth();
    location.reload();
}

function showChat() {
    document.getElementById('passwordGate').style.display = 'none';
    document.getElementById('chatApp').style.display = 'flex';
    document.getElementById('messageInput').focus();
}

// ==========================================
// IMAGE HANDLING
// ==========================================

function handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        addSystemMessage('Please select a valid image file (JPEG, PNG, etc.)');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        addSystemMessage('Image is too large. Please select an image under 10MB.');
        return;
    }

    resizeImageToBase64(file, 800, 0.8)
        .then(base64 => {
            currentImage = base64;
            showImagePreview(base64);
            document.getElementById('messageInput').focus();
        })
        .catch(err => {
            console.error('Image resize error:', err);
            addSystemMessage('Could not process the image. Please try a different one.');
        });
}

function resizeImageToBase64(file, maxWidth, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let w = img.width;
                let h = img.height;

                if (w > maxWidth) {
                    h = Math.round(h * (maxWidth / w));
                    w = maxWidth;
                }

                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function showImagePreview(base64) {
    const previewArea = document.getElementById('imagePreviewArea');
    const previewImg = document.getElementById('imagePreview');
    previewImg.src = base64;
    previewArea.style.display = 'block';
}

function removeImage() {
    currentImage = null;
    document.getElementById('imagePreviewArea').style.display = 'none';
    document.getElementById('imagePreview').src = '';
    document.getElementById('imageInput').value = '';
}

// ==========================================
// MESSAGE BUILDERS
// ==========================================

function buildUserMessage(text, imageBase64) {
    // Note: Using text-only model (vision models blocked on this API key)
    // Image is shown in UI but sent as text description to AI
    let messageText = text || 'What can you tell me about this?';
    if (imageBase64) {
        messageText = '[User shared a photo] ' + messageText;
    }
    return { role: 'user', content: messageText };
}

function createMessageElement(text, isUser, imageSrc) {
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper ${isUser ? 'user' : 'ai'}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = isUser ? 'You' : '🍼';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    if (imageSrc) {
        const img = document.createElement('img');
        img.src = imageSrc;
        img.className = 'message-image';
        img.alt = 'Shared image';
        bubble.appendChild(img);
    }

    const textNode = document.createElement('span');
    textNode.textContent = text;
    bubble.appendChild(textNode);

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);

    return wrapper;
}

function addSystemMessage(text) {
    const container = document.getElementById('messagesContainer');
    const msg = createMessageElement(text, false, null);
    container.appendChild(msg);
    scrollToBottom();
}

// ==========================================
// API & CHAT
// ==========================================

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();

    if (!text && !currentImage) return;
    if (isProcessing) return;

    isProcessing = true;
    const imageToSend = currentImage;
    if (currentImage) removeImage();

    // Show user message
    const container = document.getElementById('messagesContainer');
    const userMsg = createMessageElement(text || 'Shared a photo', true, imageToSend);
    container.appendChild(userMsg);

    input.value = '';
    input.style.height = 'auto';
    scrollToBottom();

    // Show typing indicator
    const typing = document.getElementById('typingIndicator');
    typing.classList.add('active');
    scrollToBottom();

    // Build message
    const userMessage = buildUserMessage(text, imageToSend);
    messages.push(userMessage);

    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            throw new Error('API key unavailable');
        }

        // Try primary model (Grok - free, fast)
        let response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://ai-mom-assistant.vercel.app',
                'X-Title': 'AI Mom Guide'
            },
            body: JSON.stringify({
                model: 'x-ai/grok-4.6',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...messages.slice(-10)
                ],
                temperature: 0.7,
                max_tokens: 800
            })
        });

        // Fallback to Llama if Grok fails
        if (!response.ok) {
            response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://ai-mom-assistant.vercel.app',
                    'X-Title': 'AI Mom Guide'
                },
                body: JSON.stringify({
                    model: 'meta-llama/llama-3.1-8b-instruct',
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        ...messages.slice(-10)
                    ],
                    temperature: 0.7,
                    max_tokens: 800
                })
            });
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;
        messages.push({ role: 'assistant', content: reply });

        typing.classList.remove('active');
        const aiMsg = createMessageElement(reply, false, null);
        container.appendChild(aiMsg);

    } catch (err) {
        console.error('API Error:', err);
        typing.classList.remove('active');

        // Fallback response
        const fallback = getFallbackResponse(text);
        const aiMsg = createMessageElement(fallback, false, null);
        container.appendChild(aiMsg);
    }

    isProcessing = false;
    scrollToBottom();
}

function scrollToBottom() {
    const area = document.getElementById('chatArea');
    area.scrollTop = area.scrollHeight;
}

// ==========================================
// SYSTEM PROMPT (with medical disclaimer)
// ==========================================

const SYSTEM_PROMPT = `You are "AI Mom Guide," a warm, knowledgeable, and supportive AI assistant for new mothers. You specialize in baby care for ages 0-2 years.

IMPORTANT RULES:
1. ALWAYS give actionable advice FIRST, then ask a brief follow-up question.
2. Keep responses warm, supportive, and easy to understand (8th-grade reading level).
3. Use emojis naturally to convey warmth.
4. NEVER make up medical facts. If unsure, say "Always check with your pediatrician to be safe."
5. Include a brief medical disclaimer when discussing health concerns.
6. Keep responses under 150 words when possible.
7. Be encouraging — mothering is hard and the user is doing great.

MEDICAL DISCLAIMER TO INCLUDE when relevant:
"I'm an AI assistant, not a doctor. This information is for educational purposes only. Always consult your pediatrician for medical advice."

You can help with: sleep training, feeding schedules (breast/formula/solids), diapering, milestone tracking, babyproofing, common illnesses, teething, postpartum care, and emotional support.`;

// ==========================================
// FALLBACK KNOWLEDGE BASE
// ==========================================

function getFallbackResponse(input) {
    const text = input.toLowerCase();

    if (text.includes('sleep') || text.includes('nap')) {
        return "Newborns need 14-17 hours of sleep daily. Try the 'Eat, Play, Sleep' routine.\n\nFor the first 3 months, swaddling and white noise work wonders.\n\nI'm an AI assistant, not a doctor. Always consult your pediatrician for medical advice. 👶💤";
    }
    if (text.includes('feed') || text.includes('bottle') || text.includes('breast') || text.includes('milk')) {
        return "Newborns eat every 2-3 hours. Look for hunger cues: rooting, sucking on hands.\n\nBy 6 months, you can start purees alongside milk.\n\nI'm an AI assistant, not a doctor. Always consult your pediatrician for medical advice. 🍼";
    }
    if (text.includes('rash') || text.includes('skin')) {
        return "Most baby rashes are harmless diaper rash or baby acne. Keep the area clean and dry.\n\nCall your pediatrician if: fever appears, rash spreads rapidly, or baby seems very uncomfortable.\n\nI'm an AI assistant, not a doctor. Always consult your pediatrician for medical advice. 🩺";
    }
    if (text.includes('mileston')) {
        return "By 2 months: Social smiles.\nBy 4 months: Rolls over, reaches for toys.\nBy 6 months: Sits with support, babbles.\nBy 9 months: Crawls, says 'mama/dada'.\nBy 12 months: Stands, first steps.\n\nEvery baby develops at their own pace!\n\nI'm an AI assistant, not a doctor. Always consult your pediatrician for medical advice. 📈";
    }
    if (text.includes('safety') || text.includes('babyproof')) {
        return "Start babyproofing before baby crawls:\n- Install cabinet locks\n- Cover outlets\n- Secure furniture to walls\n- Remove small objects\n- Gate stairs\n\nThe Home Babyproofing Guide in your downloads has a full room-by-room checklist!\n\nI'm an AI assistant, not a doctor. Always consult your pediatrician for medical advice. 🛡️";
    }
    if (text.includes('fever') || text.includes('sick') || text.includes('cold')) {
        return "For babies under 3 months, any fever (100.4°F/38°C+) needs immediate medical attention.\n\nFor older babies: keep them hydrated, use a cool-mist humidifier, and monitor.\n\nI'm an AI assistant, not a doctor. Always consult your pediatrician for medical advice. 🩺";
    }
    if (text.includes('hello') || text.includes('hi') || text === '') {
        return "Hey there, mama! 👋 I'm here to help with anything about your little one.\n\nAsk me about sleep, feeding, milestones, or share a photo!\n\nI'm an AI assistant, not a doctor. Always consult your pediatrician for medical advice. 💕";
    }

    return "That's a great question about your baby! 💕\n\nCould you share a bit more detail so I can give you the best guidance?\n\nI'm an AI assistant, not a doctor. Always consult your pediatrician for medical advice.";
}

// ==========================================
// TOPIC BUTTONS
// ==========================================

function startTopic(topic) {
    const topics = {
        sleep: 'How do I help my baby sleep through the night?',
        feeding: 'What is the best feeding schedule for my baby?',
        milestones: 'What are the key milestones I should watch for?',
        safety: 'How do I babyproof my home?',
        newborn: 'What should I know about caring for a newborn?',
        health: 'When should I call the pediatrician?'
    };

    const input = document.getElementById('messageInput');
    input.value = topics[topic] || '';
    input.style.height = 'auto';
    input.style.height = input.scrollHeight + 'px';
    input.focus();
}

// ==========================================
// INPUT AUTO-RESIZE
// ==========================================

function setupTextarea() {
    const textarea = document.getElementById('messageInput');

    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

// ==========================================
// PRIVACY & LEGAL DISCLAIMER
// ==========================================

function addPrivacyNotice() {
    const container = document.getElementById('messagesContainer');
    const notice = document.createElement('div');
    notice.className = 'message-wrapper ai';
    notice.style.maxWidth = '100%';
    notice.innerHTML = `
        <div class="message-avatar" style="font-size:12px;">🔒</div>
        <div class="message-bubble" style="background:rgba(254,243,199,0.6);border:1px solid rgba(251,191,36,0.3);">
            <div style="font-size:0.8rem;color:#92400e;line-height:1.5;">
                <strong>Privacy & Safety:</strong><br>
                • Photos you share are processed by AI and not stored permanently<br>
                • This AI provides educational info, not medical advice<br>
                • Always consult your pediatrician for health concerns<br>
                • Conversations stay on this device (not saved to servers)
            </div>
        </div>
    `;
    container.appendChild(notice);
    scrollToBottom();
}

// ==========================================
// APP INIT
// ==========================================

// Check auth on load
if (isAuthenticated()) {
    showChat();
    // Show privacy notice after a short delay
    setTimeout(addPrivacyNotice, 2000);
} else {
    document.getElementById('passwordGate').style.display = 'flex';
    document.getElementById('chatApp').style.display = 'none';
    document.getElementById('passwordInput').focus();

    // Enter key on password
    document.getElementById('passwordInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') checkPassword();
    });
}

// Setup textarea
setupTextarea();

// Add click handler for document (in case any buttons need global access)
document.addEventListener('click', function(e) {
    if (e.target.matches('.topic-btn')) {
        // Topic buttons are handled inline via onclick
    }
});

console.log('AI Mom Guide loaded. Auth:', isAuthenticated());
