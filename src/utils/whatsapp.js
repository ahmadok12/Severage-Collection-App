import { formatAED } from './formatters';

/**
 * Normalizes UAE phone number to international format without + or spaces
 * e.g. 0501234567 -> 971501234567
 * +971 50 123 4567 -> 971501234567
 */
export const normalizeUaePhone = (phone) => {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('00971')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('05')) {
    cleaned = '971' + cleaned.substring(1);
  } else if (cleaned.startsWith('5') && cleaned.length === 9) {
    cleaned = '971' + cleaned;
  }
  return cleaned;
};

/**
 * Builds direct WhatsApp URL for manual reminder
 */
export const buildWhatsAppReminderUrl = (unit, property, currentMonth) => {
  const phone = normalizeUaePhone(unit.phone);
  const pendingDue = (unit.pendingBalance !== undefined) ? unit.pendingBalance : (unit.status === 'paid' ? 0 : unit.monthlyRate);
  const paidSoFar = unit.paidAmount || 0;
  
  let message = "";
  if (paidSoFar > 0 && pendingDue > 0) {
    message = `Salam ${unit.tenantName || 'Tenant'}, this is a gentle reminder regarding the sewerage fee for Unit ${unit.unitNumber} (${currentMonth || 'this month'}).\n` +
      `Total Fee: ${formatAED(unit.monthlyRate)}\n` +
      `Paid So Far: ${formatAED(paidSoFar)}\n` +
      `*Remaining Pending Balance: ${formatAED(pendingDue)}*\n` +
      `Please settle the pending balance via Cash or Bank Transfer (${property?.bankDetails || 'Property Office'}). Thank you.`;
  } else {
    const defaultTemplate = property?.whatsappTemplate || 
      "Salam {tenant}, this is a gentle reminder that the sewerage fee for Unit {unit} ({month}) has a balance of {amount} due. Please settle via Cash or Bank Transfer ({bank}). Thank you.";

    message = defaultTemplate
      .replace('{tenant}', unit.tenantName || 'Tenant')
      .replace('{unit}', unit.unitNumber || '')
      .replace('{month}', currentMonth || 'this month')
      .replace('{amount}', formatAED(pendingDue))
      .replace('{totalFee}', formatAED(unit.monthlyRate))
      .replace('{paidAmount}', formatAED(paidSoFar))
      .replace('{bank}', property?.bankDetails || 'Property Office');
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

/**
 * Builds direct WhatsApp URL for sending voucher confirmation
 */
export const buildWhatsAppVoucherUrl = (voucher, property) => {
  const phone = normalizeUaePhone(voucher.phone);
  const amountStr = formatAED(voucher.totalAmount);
  const remainingStr = formatAED(voucher.balanceRemaining || 0);
  const isPartial = Boolean(voucher.isPartial || (voucher.balanceRemaining && voucher.balanceRemaining > 0));

  const text = `*SEWERAGE PAYMENT RECEIPT - AJMAN*\n` +
    `*Property:* ${property?.name || 'Ajman Property'}\n` +
    `*ASPCL Acc:* ${voucher.aspclAccount || property?.aspclAccount || 'ASPCL'}\n` +
    `*Voucher No:* ${voucher.id}\n` +
    `*Unit:* ${voucher.unitNumber}\n` +
    `*Tenant:* ${voucher.tenantName}\n` +
    `*Billing Month:* ${voucher.month}\n` +
    `*Amount Settled Now:* ${amountStr}\n` +
    (isPartial ? `*Pending Balance Remaining:* ${remainingStr}\n` : `*Balance Remaining:* AED 0.00 (Fully Paid)\n`) +
    `*Payment Mode:* ${voucher.paymentMethod} (${voucher.reference || 'Verified'})\n` +
    `*Date:* ${voucher.paidDate}\n` +
    `*Status:* ${isPartial ? 'PARTIAL PAYMENT (BALANCE DUE)' : 'PAID & VERIFIED ✓'}\n\n` +
    `Thank you!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

/**
 * Builds direct WhatsApp URL for sending full Statement of Account
 */
export const buildWhatsAppStatementUrl = (unit, statement, property) => {
  const phone = normalizeUaePhone(unit.phone);
  const text = `*SEWERAGE RECOVERY STATEMENT OF ACCOUNT*\n` +
    `*Property:* ${property?.name || 'Ajman Property'}\n` +
    `*Tenant:* ${unit.tenantName} (Unit ${unit.unitNumber})\n` +
    `*ASPCL Meter/Acc:* ${unit.aspclSubmeter || property?.aspclAccount || 'ASPCL'}\n` +
    `--------------------------------\n` +
    `*Total Invoiced (Debit):* ${formatAED(statement.totalDebit)}\n` +
    `*Total Paid (Credit):* ${formatAED(statement.totalCredit)}\n` +
    `*NET BALANCE DUE:* ${formatAED(statement.netBalance)}\n` +
    `*Status:* ${statement.netBalance <= 0 ? 'CLEARED / SETTLED ✓' : 'OUTSTANDING RECOVERY PENDING'}\n` +
    `--------------------------------\n` +
    (statement.netBalance > 0 ? `Please arrange settlement via Cash or Transfer (${property?.bankDetails || 'Property Office'}). Thank you!` : `All sewerage dues are cleared. Thank you!`);

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};
