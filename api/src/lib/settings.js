import { first, run, nowIso, parseJson } from './util.js';

export const DEFAULT_TEMPLATES = {
  request_received: {
    subject: 'We received your training request — LakeShore Legends',
    body: `Hi {{parent}},

Thanks for reaching out! We received your request for {{service}} for {{athlete}}.

Requested: {{requested}}

This is not a confirmed booking yet. {{coach}} will review it and follow up at this email address. No payment has been taken.

{{policy}}

— LakeShore Legends Basketball`,
  },
  confirmation: {
    subject: 'Confirmed: {{service}} on {{date}}',
    body: `Hi {{parent}},

{{athlete}}'s session is confirmed.

Service: {{service}}
When: {{date}} at {{time}} ({{timezone}})
Coach: {{coach}}
Where: {{location}}
{{location_details}}
{{prep}}
{{policy}}

See you on the court!
— LakeShore Legends Basketball`,
  },
  reminder: {
    subject: 'Reminder: {{service}} {{relative}}',
    body: `Hi {{parent}},

A reminder that {{athlete}} has {{service}} on {{date}} at {{time}} ({{timezone}}) with {{coach}}.

Where: {{location}}
{{location_details}}
{{prep}}
{{policy}}

— LakeShore Legends Basketball`,
  },
  cancellation: {
    subject: 'Canceled: {{service}} on {{date}}',
    body: `Hi {{parent}},

{{athlete}}'s {{service}} on {{date}} at {{time}} ({{timezone}}) has been canceled.

{{cancel_outcome}}

If you have questions, just reply to this email.
— LakeShore Legends Basketball`,
  },
  reschedule: {
    subject: 'Rescheduled: {{service}} now on {{date}}',
    body: `Hi {{parent}},

{{athlete}}'s session has been moved.

Previously: {{previous}}
Now: {{date}} at {{time}} ({{timezone}})
Coach: {{coach}}
Where: {{location}}
{{location_details}}
{{policy}}

— LakeShore Legends Basketball`,
  },
  approval: {
    subject: 'Request approved: {{service}} on {{date}}',
    body: `Hi {{parent}},

Good news — {{coach}} approved your request.

Service: {{service}}
When: {{date}} at {{time}} ({{timezone}})
Where: {{location}}

{{payment_step}}

{{policy}}

— LakeShore Legends Basketball`,
  },
  decline: {
    subject: 'About your training request — LakeShore Legends',
    body: `Hi {{parent}},

Thank you for your request for {{athlete}}. Unfortunately we can't accommodate it{{reason}}.

Please check the website for other open times, or reply to this email and we'll try to find something that works.
— LakeShore Legends Basketball`,
  },
  offer: {
    subject: 'Training times for {{athlete}} — LakeShore Legends',
    body: `Hi {{parent}},

Thanks for your request. Here are the times {{coach}} can offer for {{service}}:

{{offer_times}}

{{message}}

Reply to this email with the time that works best and we'll lock it in.
— LakeShore Legends Basketball`,
  },
};

export const DEFAULT_SETTINGS = {
  timezone: 'America/Chicago',
  defaultDuration: 60,
  sameLocationBuffer: 0,          // minutes required between sessions at the same location
  travelDefault: 60,              // minutes required between sessions at different locations
  travel: {},                     // { 'locA|locB': minutes } — sorted id pair
  conflictAction: 'bump',         // what to do with open slots that conflict with a new booking
  minNoticeHours: 12,
  maxAdvanceDays: 90,
  holdMinutes: 30,                // checkout reservation window
  cancellation: {
    fullRefundHours: 48,
    lateRetainerPct: 50,
    creditRestoreHours: 48,       // package credits restored when canceled at least this far ahead
    rescheduleHours: 24,
    policyLines: [
      'Cancellations made within 48 hours of a session are subject to a 50% retainer.',
      'Cancellations made more than 48 hours in advance receive a 100% refund.',
      'Training session times and availability are subject to change.',
    ],
  },
  payment: { mode: 'pay_to_confirm' }, // 'pay_to_confirm' | 'confirm_then_pay'
  registration: {
    fields: {
      age: { label: 'Athlete Age / Grade', show: true, required: false },
      focus: { label: 'Focus Areas / Goals', show: true, required: false },
      notes: { label: 'Additional Notes', show: true, required: false },
      phone: { label: 'Phone', show: true, required: true },
    },
    acknowledgments: [
      { id: 'policy', text: 'I have read and agree to the cancellation policy.', required: true },
    ],
  },
  notifications: {
    fromName: 'LakeShore Legends Basketball',
    replyTo: '',
    coachAlertEmail: '',
    sendRequestReceipt: true,
    sendConfirmation: true,
    sendCancellation: true,
    sendReschedule: true,
    reminders: [{ hoursBefore: 24, enabled: true }],
  },
  templates: DEFAULT_TEMPLATES,
  calendar: { icsEnabled: true, coachName: 'Coach Gio Paganis' },
};

function merge(base, over) {
  if (Array.isArray(base) || typeof base !== 'object' || base === null) return over === undefined ? base : over;
  const out = { ...base };
  if (over && typeof over === 'object' && !Array.isArray(over)) {
    for (const k of Object.keys(over)) out[k] = k in base ? merge(base[k], over[k]) : over[k];
  }
  return out;
}

export async function getSettings(db) {
  const row = await first(db, "SELECT value FROM settings WHERE key = 'app'");
  return merge(DEFAULT_SETTINGS, parseJson(row && row.value, {}));
}

export async function saveSettings(db, patch) {
  const cur = await getSettings(db);
  const next = merge(cur, patch);
  await run(db, "INSERT INTO settings (key, value, updated_at) VALUES ('app', ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
    JSON.stringify(next), nowIso());
  return next;
}

export function publicSettings(s) {
  return {
    timezone: s.timezone,
    minNoticeHours: s.minNoticeHours,
    maxAdvanceDays: s.maxAdvanceDays,
    holdMinutes: s.holdMinutes,
    policyLines: s.cancellation.policyLines,
    paymentMode: s.payment.mode,
    registration: s.registration,
  };
}

export const travelKey = (a, b) => [a, b].sort().join('|');
export function travelMinutes(s, a, b) {
  if (a === b) return s.sameLocationBuffer || 0;
  const v = s.travel && s.travel[travelKey(a, b)];
  return v == null || v === '' ? (s.travelDefault || 0) : Number(v);
}
