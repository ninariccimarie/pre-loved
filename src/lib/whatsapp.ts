/** Normalize Singapore-friendly mobile numbers to digits only. */
export const normalizeContact = (contact: string): string =>
  contact.replace(/\D/g, '')

/** Build a wa.me URL for WhatsApp with optional prefilled message. */
export const buildWhatsAppUrl = (contact: string, message: string): string => {
  let digits = normalizeContact(contact)
  if (digits.length === 8) {
    digits = `65${digits}`
  }
  if (digits.startsWith('0') && digits.length === 9) {
    digits = `65${digits.slice(1)}`
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export const buildContactMessage = (name: string, itemTitles: string[]): string => {
  const count = itemTitles.length
  const itemList =
    count === 1
      ? `"${itemTitles[0]}"`
      : itemTitles.map((title) => `• ${title}`).join('\n')

  if (count === 1) {
    return `Hi ${name}! This is Nina from the pre-loved items 👋 Just reaching out about ${itemList} that you asked about. Happy to help arrange pickup whenever you're free!`
  }

  return `Hi ${name}! This is Nina from the pre-loved items 👋 Just reaching out about the ${count} items you asked about:\n${itemList}\n\nHappy to help arrange pickup whenever you're free!`
}
