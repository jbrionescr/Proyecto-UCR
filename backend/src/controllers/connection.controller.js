const ConnectionService = require('../services/connection.service');
const asyncHandler = require('../utils/asyncHandler');

exports.sendRequest = asyncHandler(async (req, res) => {
  const senderId = req.user.id;
  const { receiver_id } = req.body;
  if (!receiver_id) {
    return res.status(400).json({ message: 'El receiver_id es obligatorio.' });
  }
  const result = await ConnectionService.sendRequest(senderId, receiver_id);
  res.status(201).json(result);
});

exports.getPendingReceived = asyncHandler(async (req, res) => {
  const result = await ConnectionService.getPendingReceived(req.user.id);
  res.status(200).json(result);
});

exports.getSent = asyncHandler(async (req, res) => {
  const result = await ConnectionService.getSent(req.user.id);
  res.status(200).json(result);
});

exports.getActiveConnections = asyncHandler(async (req, res) => {
  const result = await ConnectionService.getActiveConnections(req.user.id);
  res.status(200).json(result);
});

exports.acceptRequest = asyncHandler(async (req, res) => {
  const result = await ConnectionService.acceptRequest(req.params.id, req.user.id);
  res.status(200).json(result);
});

exports.rejectRequest = asyncHandler(async (req, res) => {
  const result = await ConnectionService.rejectRequest(req.params.id, req.user.id);
  res.status(200).json(result);
});

exports.cancelRequest = asyncHandler(async (req, res) => {
  const result = await ConnectionService.cancelRequest(req.params.id, req.user.id);
  res.status(200).json(result);
});

exports.deleteConnection = asyncHandler(async (req, res) => {
  const result = await ConnectionService.deleteConnection(req.params.id, req.user.id);
  res.status(200).json(result);
});
