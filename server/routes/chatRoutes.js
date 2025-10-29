const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { auth, optionalAuth } = require('../middleware/auth');

// Routes
router.post('/chat', optionalAuth, chatController.sendMessage);
router.get('/history', auth, chatController.getChatHistory);
router.get('/conversations', auth, chatController.getConversations);
router.put('/update-message', auth, chatController.updateMessage);
router.post('/feedback', auth, chatController.addFeedback);
router.delete('/conversations/:id', auth, chatController.deleteConversation);
router.put('/conversations/:id/rename', auth, chatController.renameConversation);
router.get('/conversations/:id/export', auth, chatController.exportConversation);
router.get('/stats', auth, chatController.getChatStats);
router.get('/weather', optionalAuth, chatController.getWeather);
router.get('/news', optionalAuth, chatController.getNews);


module.exports = router;
