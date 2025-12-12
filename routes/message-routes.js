const express = require('express');
const router = express.Router();

const messageController = require('../controllers/messageController');

router.get('/chats', messageController.getChats);
router.get('/users', messageController.getSyncedUsers);
router.get('/:chatId', messageController.getMessages);
router.post('/', messageController.createMessage);
router.post('/chats/:chatId/read', messageController.markChatRead);
router.post('/presence/ping', messageController.pingPresence);
router.put('/:id', messageController.updateMessage);
router.delete('/chats/:chatId', messageController.deleteChat);
router.delete('/:id', messageController.deleteMessage);
router.post('/sync-users', messageController.syncUsers);

module.exports = router;
