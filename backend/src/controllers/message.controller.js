const MessageService = require('../services/message.service');
const asyncHandler   = require('../utils/asyncHandler');

exports.getMessages = asyncHandler(async (req, res) => {
  const data = await MessageService.getMessages(req.params.matchId);
  res.status(200).json(data);
});

exports.sendMessage = asyncHandler(async (req, res) => {
  const { sender_id, content } = req.body;
  if (!sender_id || !content?.trim()) {
    return res.status(400).json({ message: 'Se requieren sender_id y content' });
  }
  const data = await MessageService.sendMessage(req.params.matchId, sender_id, content.trim());
  res.status(201).json(data);
});
