const Message = require('../models/Message');
const ChatUser = require('../models/ChatUser');
const ChatState = require('../models/ChatState');

const normalizeMessage = doc => {
  if (!doc) return null;
  const message = doc.toObject ? doc.toObject() : doc;
  return {
    id: message._id ? message._id.toString() : message.id,
    chatId: message.chatId,
    participants: message.participants,
    sender: message.sender,
    type: message.type,
    text: message.text,
    lat: message.lat,
    lng: message.lng,
    deletedFor: message.deletedFor || [],
    timestamp: message.timestamp,
    editedAt: message.editedAt,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
};

const normalizeChatUser = doc => {
  if (!doc) return null;
  const user = doc.toObject ? doc.toObject() : doc;
  return {
    id: user._id ? user._id.toString() : user.id,
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    picture: user.picture,
    roleId: user.roleId,
    schools: user.schools || [],
    lastActiveAt: user.lastActiveAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

exports.getChats = async (req, res) => {
  try {
    const userId = String(req.query.userId || '').trim();
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const messages = await Message.find({ participants: userId })
      .sort({ timestamp: -1, createdAt: -1 })
      .lean();

    const chatIds = new Set();
    const participantIds = new Set();

    messages.forEach(msg => {
      if (!msg || !msg.chatId) return;
      chatIds.add(msg.chatId);
      (msg.participants || []).forEach(participant => {
        if (String(participant) !== userId) {
          participantIds.add(String(participant));
        }
      });
    });

    const [stateDocs, participantDocs] = await Promise.all([
      ChatState.find({
        userId,
        chatId: { $in: Array.from(chatIds) },
      }).lean(),
      ChatUser.find({ userId: { $in: Array.from(participantIds) } }).lean(),
    ]);

    const stateMap = new Map(
      stateDocs.map(doc => [String(doc.chatId), doc])
    );

    const participantMap = new Map(
      participantDocs.map(doc => [String(doc.userId), doc])
    );

    const now = Date.now();
    const ONLINE_THRESHOLD_MS = 60 * 1000;

    const chatMap = new Map();

    messages.forEach(msg => {
      if (Array.isArray(msg.deletedFor) && msg.deletedFor.includes(userId)) {
        return;
      }

      const key = msg.chatId;
      if (!key) return;

      let entry = chatMap.get(key);

      if (!entry) {
        const participants = (msg.participants || []).map(String);
        const participantStatuses = participants
          .filter(participant => participant !== userId)
          .map(participant => {
            const info = participantMap.get(participant);
            const lastActiveAt = info?.lastActiveAt || null;
            const lastActiveMs = lastActiveAt
              ? new Date(lastActiveAt).getTime()
              : 0;
            return {
              userId: participant,
              lastActiveAt,
              isOnline:
                lastActiveMs > 0 && now - lastActiveMs <= ONLINE_THRESHOLD_MS,
            };
          });

        entry = {
          chatId: key,
          participants,
          lastMessage: normalizeMessage(msg),
          unreadCount: 0,
          participantStatuses,
        };
        chatMap.set(key, entry);
      }

      const lastReadAt = stateMap.get(key)?.lastReadAt
        ? new Date(stateMap.get(key).lastReadAt).getTime()
        : 0;
      const msgTimestamp = new Date(
        msg.timestamp || msg.createdAt || 0
      ).getTime();

      if (msg.sender !== userId && msgTimestamp > lastReadAt) {
        entry.unreadCount += 1;
      }
    });

    const items = Array.from(chatMap.values()).sort((a, b) => {
      const timeA = new Date(a.lastMessage?.timestamp || 0).getTime();
      const timeB = new Date(b.lastMessage?.timestamp || 0).getTime();
      return timeB - timeA;
    });

    return res.json({ items });
  } catch (err) {
    console.error('Failed to load chats', err);
    return res
      .status(500)
      .json({ message: 'Failed to load chats', error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = String(req.query.userId || '').trim();
    if (!chatId) {
      return res.status(400).json({ message: 'chatId is required' });
    }
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const messages = await Message.find({
      chatId,
      deletedFor: { $ne: userId },
    }).sort({ timestamp: 1, createdAt: 1 });

    return res.json({ items: messages.map(normalizeMessage) });
  } catch (err) {
    console.error('Failed to load messages', err);
    return res.status(500).json({ message: 'Failed to load messages' });
  }
};

exports.createMessage = async (req, res) => {
  try {
    const {
      senderId,
      recipientId,
      text = '',
      type = 'text',
      lat,
      lng,
    } = req.body || {};

    const sender = String(senderId || '').trim();
    const recipient = String(recipientId || '').trim();

    if (!sender || !recipient) {
      return res
        .status(400)
        .json({ message: 'senderId and recipientId are required' });
    }

    if (sender === recipient) {
      return res
        .status(400)
        .json({ message: 'Cannot create chat with yourself' });
    }

    if (type === 'text' && !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    if (
      type === 'location' &&
      (typeof lat !== 'number' || typeof lng !== 'number')
    ) {
      return res
        .status(400)
        .json({
          message: 'Latitude and longitude are required for location messages',
        });
    }

    const participants = [sender, recipient].sort();
    const chatId = participants.join('_');

    const message = await Message.create({
      chatId,
      participants,
      sender,
      type,
      text: type === 'text' ? text.trim() : '',
      lat: type === 'location' ? lat : undefined,
      lng: type === 'location' ? lng : undefined,
      timestamp: new Date(),
    });

    return res.status(201).json({ item: normalizeMessage(message) });
  } catch (err) {
    console.error('Failed to create message', err);
    return res.status(500).json({ message: 'Failed to create message' });
  }
};

exports.updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text = '', userId } = req.body || {};
    const requester = String(userId || '').trim();

    if (!id) {
      return res.status(400).json({ message: 'message id is required' });
    }

    if (!requester) {
      return res.status(400).json({ message: 'userId is required' });
    }

    if (!text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender !== requester) {
      return res
        .status(403)
        .json({ message: 'Only the sender can edit the message' });
    }

    message.text = text.trim();
    message.editedAt = new Date();
    await message.save();

    return res.json({ item: normalizeMessage(message) });
  } catch (err) {
    console.error('Failed to update message', err);
    return res.status(500).json({ message: 'Failed to update message' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const mode = String(req.query.mode || 'me').toLowerCase();
    const userId = String(req.query.userId || '').trim();

    if (!id) {
      return res.status(400).json({ message: 'message id is required' });
    }

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (!message.participants.includes(userId)) {
      return res
        .status(403)
        .json({ message: 'Not allowed to modify this message' });
    }

    if (mode === 'everyone') {
      if (message.sender !== userId) {
        return res
          .status(403)
          .json({ message: 'Only sender can delete for everyone' });
      }
      await message.deleteOne();
      return res.status(204).end();
    }

    if (mode === 'me') {
      if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId);
        await message.save();
      }
      return res.json({ item: normalizeMessage(message) });
    }

    return res.status(400).json({ message: 'Invalid delete mode' });
  } catch (err) {
    console.error('Failed to delete message', err);
    return res.status(500).json({ message: 'Failed to delete message' });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const mode = String(req.query.mode || 'everyone').toLowerCase();
    const userId = String(req.query.userId || '').trim();

    if (!chatId) {
      return res.status(400).json({ message: 'chatId is required' });
    }

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const isParticipant = await Message.exists({
      chatId,
      participants: userId,
    });
    if (!isParticipant) {
      return res.status(404).json({ message: 'Chat not found for this user' });
    }

    if (mode === 'everyone') {
      await Message.deleteMany({ chatId });
      return res.status(204).end();
    }

    if (mode === 'me') {
      await Message.updateMany(
        { chatId, deletedFor: { $ne: userId } },
        { $push: { deletedFor: userId } }
      );
      return res.json({ success: true });
    }

    return res.status(400).json({ message: 'Invalid delete mode' });
  } catch (err) {
    console.error('Failed to delete chat', err);
    return res.status(500).json({ message: 'Failed to delete chat' });
  }
};

exports.markChatRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId, lastMessageTimestamp } = req.body || {};

    const user = String(userId || '').trim();
    if (!chatId) {
      return res.status(400).json({ message: 'chatId is required' });
    }
    if (!user) {
      return res.status(400).json({ message: 'userId is required' });
    }

    let lastReadAt = null;

    if (lastMessageTimestamp) {
      const parsed = new Date(lastMessageTimestamp);
      if (!Number.isNaN(parsed.getTime())) {
        lastReadAt = parsed;
      }
    }

    if (!lastReadAt) {
      const latestMessage = await Message.findOne({
        chatId,
        deletedFor: { $ne: user },
      })
        .sort({ timestamp: -1, createdAt: -1 })
        .lean();

      lastReadAt = latestMessage?.timestamp || new Date();
    }

    await ChatState.findOneAndUpdate(
      { userId: user, chatId },
      { $set: { lastReadAt, updatedAt: new Date() } },
      { upsert: true }
    );

    return res.json({ success: true, lastReadAt });
  } catch (err) {
    console.error('Failed to mark chat as read', err);
    return res.status(500).json({ message: 'Failed to mark chat as read' });
  }
};

exports.pingPresence = async (req, res) => {
  try {
    const { userId } = req.body || {};
    const user = String(userId || '').trim();

    if (!user) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const now = new Date();

    await ChatUser.updateOne(
      { userId: user },
      {
        $set: { lastActiveAt: now },
        $setOnInsert: { userId: user },
      },
      { upsert: true }
    );

    return res.json({ success: true, lastActiveAt: now });
  } catch (err) {
    console.error('Failed to update presence', err);
    return res.status(500).json({ message: 'Failed to update presence' });
  }
};

exports.syncUsers = async (req, res) => {
  try {
    const { users = [], schoolId } = req.body || {};

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: 'users array is required' });
    }

    const operations = users
      .map(user => {
        const userId = String(user.id || user.userId || '').trim();
        if (!userId) return null;

        const payload = {
          userId,
          firstName: user.firstName || user.first_name || '',
          lastName: user.lastName || user.last_name || '',
          email: user.email || '',
          picture: user.picture || '',
          roleId: user.roleId || user.role_id || user.role?.id || null,
        };

        return {
          updateOne: {
            filter: { userId },
            update: {
              $set: { ...payload, updatedAt: new Date() },
              ...(schoolId
                ? { $addToSet: { schools: String(schoolId) } }
                : {}),
            },
            upsert: true,
          },
        };
      })
      .filter(Boolean);

    if (operations.length === 0) {
      return res
        .status(400)
        .json({ message: 'No valid users found for syncing' });
    }

    await ChatUser.bulkWrite(operations, { ordered: false });

    return res.json({ success: true, count: operations.length });
  } catch (err) {
    console.error('Failed to sync users', err);
    return res.status(500).json({ message: 'Failed to sync users' });
  }
};

exports.getSyncedUsers = async (req, res) => {
  try {
    const schoolId = req.query.schoolId
      ? String(req.query.schoolId).trim()
      : null;
    const limit = Math.min(
      parseInt(req.query.limit, 10) || 100,
      500
    );
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const filter = schoolId ? { schools: schoolId } : {};

    const query = ChatUser.find(filter)
      .sort({ firstName: 1, lastName: 1 })
      .skip(offset)
      .limit(limit);

    const [items, total] = await Promise.all([
      query.lean(),
      ChatUser.countDocuments(filter),
    ]);

    return res.json({
      items: items.map(normalizeChatUser),
      total,
      limit,
      offset,
    });
  } catch (err) {
    console.error('Failed to load synced users', err);
    return res.status(500).json({ message: 'Failed to load users' });
  }
};
