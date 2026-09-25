const express = require('express');
const router = express.Router();
const store = require('../store');
const discovery = require('../discovery');

// Register device via REST
router.post('/register', (req, res) => {
  const { id, name, type, browser, os } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Device id is required' });
  }
  const device = store.registerDevice({
    id,
    name: name || `Device-${id.substring(0, 5)}`,
    type: type || 'desktop',
    browser: browser || 'Unknown',
    os: os || 'Unknown',
    ip: req.ip || req.connection.remoteAddress
  });
  return res.json({ success: true, device });
});

// List active peers
router.get('/peers', (req, res) => {
  const excludeId = req.query.exclude;
  const peers = store.listDevices(excludeId);
  return res.json({ peers });
});

// List LAN discovered nodes via UDP
router.get('/discovery', (req, res) => {
  const nodes = discovery.getDiscoveredNodes();
  return res.json({ nodes });
});

// List sessions
router.get('/sessions', (req, res) => {
  const sessions = store.listSessions();
  return res.json({ sessions });
});

// REST fallback: Send offer
router.post('/offer', (req, res) => {
  const { from, to, sdp, metadata } = req.body;
  if (!from || !to || !sdp) {
    return res.status(400).json({ error: 'Missing required fields (from, to, sdp)' });
  }

  const receiverSocket = store.getSocket(to);
  if (receiverSocket && receiverSocket.readyState === 1) { // OPEN
    receiverSocket.send(JSON.stringify({
      type: 'offer',
      from,
      sdp,
      metadata: metadata || {}
    }));
    return res.json({ success: true, deliveredVia: 'websocket' });
  }

  // If receiver is not on WebSocket, queue or store in session
  const session = store.createSession(from, to);
  session.pendingOffer = { from, sdp, metadata };
  return res.json({ success: true, deliveredVia: 'queued', sessionId: session.id });
});

// REST fallback: Send answer
router.post('/answer', (req, res) => {
  const { from, to, sdp } = req.body;
  if (!from || !to || !sdp) {
    return res.status(400).json({ error: 'Missing required fields (from, to, sdp)' });
  }

  const initiatorSocket = store.getSocket(to);
  if (initiatorSocket && initiatorSocket.readyState === 1) {
    initiatorSocket.send(JSON.stringify({
      type: 'answer',
      from,
      sdp
    }));
    return res.json({ success: true, deliveredVia: 'websocket' });
  }

  return res.json({ success: true, deliveredVia: 'queued' });
});

// REST fallback: ICE Candidate
router.post('/ice-candidate', (req, res) => {
  const { from, to, candidate } = req.body;
  if (!from || !to || !candidate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const targetSocket = store.getSocket(to);
  if (targetSocket && targetSocket.readyState === 1) {
    targetSocket.send(JSON.stringify({
      type: 'ice-candidate',
      from,
      candidate
    }));
    return res.json({ success: true, deliveredVia: 'websocket' });
  }

  return res.json({ success: true, deliveredVia: 'queued' });
});

module.exports = router;
