const axios = require('axios');
const Chat = require('../models/Chat');

// Get weather information
exports.getWeather = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );

    res.json(response.data);
  } catch (error) {
    console.error('Weather API error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch weather data' });
  }
};

// Get news information
exports.getNews = async (req, res) => {
  try {
    const { category = 'general', country = 'us' } = req.query;

    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines?category=${category}&country=${country}&apiKey=${process.env.NEWS_API_KEY}`
    );

    res.json(response.data);
  } catch (error) {
    console.error('News API error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch news data' });
  }
};



// Send chat message
exports.sendMessage = async (req, res) => {
  try {
    const { messages, conversationId = 'default' } = req.body;
    const userId = req.user?.userId; // Optional for now, will be required when auth is enforced

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'Messages array is required' });
    }

    // Save user messages to database
    for (const msg of messages) {
      const chatMessage = new Chat({
        userId: userId || null, // Allow null for anonymous users
        conversationId,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
      });
      await chatMessage.save();
    }

    // Retrieve last 10 messages for context
    const contextQuery = { conversationId };
    if (userId) {
      contextQuery.userId = userId;
    }

    const previousMessages = await Chat.find(contextQuery)
      .sort({ timestamp: -1 })
      .limit(10)
      .sort({ timestamp: 1 });

    // Prepare context messages
    const contextMessages = previousMessages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Append new messages to context
    const fullMessages = [...contextMessages, ...messages.slice(-5)];

    // Call OpenAI API
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "openai/gpt-3.5-turbo",
        messages: fullMessages,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5000',
        }
      }
    );

    const aiMessage = response.data.choices[0].message;

    // Save AI response
    const savedAiMessage = new Chat({
      userId: userId || null,
      conversationId,
      role: aiMessage.role,
      content: aiMessage.content,
      timestamp: new Date()
    });
    await savedAiMessage.save();

    res.json(response.data);
  } catch (error) {
    console.error('Chat error:', error.response?.data || error.message);
    res.status(500).json({
      error: { message: 'Something went wrong with the AI response' }
    });
  }
};

// Get chat history
exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { conversationId = 'default', limit = 50 } = req.query;

    const messages = await Chat.find({ userId, conversationId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .sort({ timestamp: 1 });

    res.json({ messages });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all conversations for a user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const conversations = await Chat.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$conversationId',
          title: { $first: '$title' },
          lastMessage: { $last: '$content' },
          lastTimestamp: { $last: '$timestamp' },
          messageCount: { $sum: 1 }
        }
      },
      { $sort: { lastTimestamp: -1 } }
    ]);

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update/edit a message
exports.updateMessage = async (req, res) => {
  try {
    const { messageId, content } = req.body;
    const userId = req.user.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const message = await Chat.findOneAndUpdate(
      { _id: messageId, userId, role: 'user' }, // Only allow editing user messages
      { content: content.trim() },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found or not authorized to edit' });
    }

    res.json({ message: 'Message updated successfully', message });
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add feedback to a message
exports.addFeedback = async (req, res) => {
  try {
    const { messageId, feedback } = req.body;
    const userId = req.user.userId;

    if (!['positive', 'negative'].includes(feedback)) {
      return res.status(400).json({ message: 'Invalid feedback type' });
    }

    const message = await Chat.findOneAndUpdate(
      { _id: messageId, userId },
      { feedback },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Feedback added successfully', message });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a conversation
exports.deleteConversation = async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const userId = req.user.userId;

    const result = await Chat.deleteMany({ userId, conversationId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Rename a conversation
exports.renameConversation = async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const { title } = req.body;
    const userId = req.user.userId;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const result = await Chat.updateMany(
      { userId, conversationId },
      { title: title.trim() }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({ message: 'Conversation renamed successfully' });
  } catch (error) {
    console.error('Rename conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Export a conversation
exports.exportConversation = async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const { format = 'json' } = req.query;
    const userId = req.user.userId;

    const messages = await Chat.find({ userId, conversationId })
      .sort({ timestamp: 1 })
      .select('role content timestamp');

    if (messages.length === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (format === 'txt') {
      const txtContent = messages.map(msg =>
        `${new Date(msg.timestamp).toLocaleString()} - ${msg.role.toUpperCase()}: ${msg.content}`
      ).join('\n\n');

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="conversation_${conversationId}.txt"`);
      res.send(txtContent);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="conversation_${conversationId}.json"`);
      res.json({ conversationId, messages });
    }
  } catch (error) {
    console.error('Export conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get all chat statistics
exports.getChatStats = async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const totalUsers = await require('../models/User').countDocuments();
    const totalMessages = await Chat.countDocuments();
    const totalConversations = await Chat.distinct('conversationId').then(ids => ids.length);

    res.json({
      totalUsers,
      totalMessages,
      totalConversations
    });
  } catch (error) {
    console.error('Get chat stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
