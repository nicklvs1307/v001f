const asyncHandler = require('express-async-handler');
const { PushSubscription } = require('../../models');

// @desc    Subscribe to push notifications
// @route   POST /api/push/subscribe
// @access  Private
exports.subscribe = asyncHandler(async (req, res) => {
  const { subscription } = req.body;
  const userId = req.user.id;

  if (!subscription) {
    res.status(400).json({ message: 'Subscription object is required' });
    return;
  }

  // Store the subscription
  await PushSubscription.create({
    userId,
    subscription
  });

  res.status(201).json({ message: 'Subscribed successfully' });
});
