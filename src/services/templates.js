// Event type -> how it is shown and which channels it uses by default.
// Other modules only send { type, userId, data }; copy and channels are decided here.
//
// critical: true  => ignores user preferences and quiet hours (OTP, payment receipts, etc.)
// Placeholders like {{name}} are filled from the event's `data`.

const templates = {
  'engagement.like': {
    title: 'New like',
    body: '{{actorName}} liked your post.',
    channels: ['inApp', 'push'],
  },
  'engagement.comment': {
    title: 'New comment',
    body: '{{actorName}} commented on your post.',
    channels: ['inApp', 'push'],
  },
  'engagement.reply': {
    title: 'New reply',
    body: '{{actorName}} replied to your comment.',
    channels: ['inApp', 'push'],
  },
  'daily_content.published': {
    title: 'Your daily inspiration',
    body: '{{title}}',
    channels: ['inApp', 'push'],
  },
  'event.reminder': {
    title: 'Event starting soon',
    body: '{{eventTitle}} starts at {{startTime}}.',
    channels: ['inApp', 'push', 'email'],
  },
  'event.registration_confirmed': {
    title: 'Registration confirmed',
    body: 'You are registered for {{eventTitle}}.',
    channels: ['inApp', 'push', 'email'],
  },
  'event.waitlist_promoted': {
    title: "You're in!",
    body: 'A seat opened up. You are now confirmed for {{eventTitle}}.',
    channels: ['inApp', 'push', 'sms'],
  },
  'recommendation.created': {
    title: 'Recommended for you',
    body: '{{title}}',
    channels: ['inApp', 'push'],
  },
  'community.join_approved': {
    title: 'Request approved',
    body: 'You have joined {{communityName}}.',
    channels: ['inApp', 'push'],
  },
  'system.otp': {
    title: 'Your verification code',
    body: 'Your LifeCraft verification code is {{otp}}.',
    channels: ['sms'],
    critical: true,
  },
  'system.announcement': {
    title: '{{title}}',
    body: '{{message}}',
    channels: ['inApp', 'push'],
  },
};

function render(text, data = {}) {
  return String(text).replace(/{{\s*(\w+)\s*}}/g, (_, key) =>
    data[key] === undefined || data[key] === null ? '' : String(data[key])
  );
}

function getTemplate(type) {
  return templates[type] || null;
}

module.exports = { templates, getTemplate, render };