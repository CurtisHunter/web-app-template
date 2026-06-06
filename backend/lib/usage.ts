const supabase = require("./supabase");

type UsageEventInput = {
  userId: string;
  eventType: string;
  units?: number;
  metadata?: Record<string, unknown>;
};

type MonthlyUsageInput = {
  userId: string;
  eventType: string;
};

type AllowanceInput = MonthlyUsageInput & {
  monthlyLimit: number;
  requestedUnits?: number;
};

// Record usage only after the expensive external API call succeeds. That avoids
// charging/limiting users for failed OpenAI or other provider requests.
async function recordUsageEvent({
  userId,
  eventType,
  units = 1,
  metadata = {},
}: UsageEventInput) {
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

// For now, sum usage in Node for readability. Move this aggregation into SQL or
// a Supabase RPC later if usage_events grows large.
async function getMonthlyUsage({ userId, eventType }: MonthlyUsageInput) {
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("usage_events")
    .select("units")
    .eq("user_id", userId)
    .eq("event_type", eventType)
    .gte("created_at", monthStart.toISOString());

  if (error) {
    throw error;
  }

  return data.reduce(
    (total: number, event: { units: number }) => total + event.units,
    0,
  );
}

async function canUseMonthlyAllowance({
  userId,
  eventType,
  monthlyLimit,
  requestedUnits = 1,
}: AllowanceInput) {
  // This is the core future pattern for paid APIs:
  // check allowance -> call external provider -> record usage.
  const usedUnits = await getMonthlyUsage({ userId, eventType });
  const remainingUnits = Math.max(monthlyLimit - usedUnits, 0);

  return {
    allowed: usedUnits + requestedUnits <= monthlyLimit,
    usedUnits,
    remainingUnits,
    monthlyLimit,
  };
}

module.exports = { getMonthlyUsage, recordUsageEvent, canUseMonthlyAllowance };
