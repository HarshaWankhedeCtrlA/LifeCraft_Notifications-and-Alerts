// WhatsApp is a Future Ready requirement. This stub keeps the channel in place
// without sending anything. Replace send() when a WhatsApp provider is chosen.
module.exports = {
  name: 'whatsapp-stub',
  async send() {
    return { ok: false, error: 'WhatsApp provider not implemented yet (future-ready)' };
  },
};