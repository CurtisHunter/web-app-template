const supabase = require("./supabase");

async function recordUsageEvent({
  userId,
  eventType,
  units = 1,
  metadata = {},
}) {
  const { error } = await supabase.from("usage_events").insert({
    user_id: userId,
    event_type: eventType,
    units,
    metadata,
  });

  if (error) {
    throw error;
  }
}

module.exports = { recordUsageEvent };
