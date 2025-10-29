# Enhanced Features for Mini AI Chatbot Project

## 🧠 Core AI Features
- [x] Natural Language Understanding (NLU) — using OpenAI API
- [x] Natural Language Generation (NLG) — AI-generated responses
- [x] Context Awareness — storing chat context in MongoDB
- [ ] Intent Recognition — detect intents like "greeting", "help", "bye"

## 💬 Conversation & Database Features
- [x] Multi-turn conversation — remembers previous messages
- [x] Chat history storage in MongoDB — stores user messages and bot replies
- [x] User registration & login — each user has their own chat history
- [x] Admin login — view or delete all chat records

## 🌐 Backend Integration Features
- [x] API Integration — connected to OpenAI API
- [x] RESTful API endpoints — /api/auth/*, /api/chat/* endpoints
- [x] Additional endpoints: /register, /login, /history, /conversations, /stats
- [x] Real-time updates — Socket.io for live chat feel

## 🧩 UI Features
- [ ] Simple Chat Interface — React chat bubbles (removed)
- [ ] Typing indicator — animated dots while AI responds (removed)
- [ ] Dark/Light mode — toggle button (removed)

## 🔒 Security Features
- [x] JWT Authentication — for secure login and protected routes
- [x] Password hashing with bcrypt — secure user credentials
- [x] Input validation — prevent invalid or harmful data

## 📊 Bonus Features
- [x] Feedback system — users can rate chatbot replies (👍👎)
- [ ] Export chat history — download chat as .txt or .json
- [x] Admin analytics — show total users, messages count, etc.
- [x] News integration — fetch top headlines from NewsAPI
