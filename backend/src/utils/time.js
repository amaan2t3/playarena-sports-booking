export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function minutesToTime(totalMinutes) {
  const normMinutes = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hours = Math.floor(normMinutes / 60);
  const mins = normMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function calculateEndTime(startTime, durationHours) {
  const startMins = timeToMinutes(startTime);
  const durationMins = Math.round(Number(durationHours) * 60);
  return minutesToTime(startMins + durationMins);
}

/**
 * Checks if two time intervals on the same day overlap.
 * Both start and end are in "HH:MM" 24h format.
 */
export function areSlotsOverlapping(startA, endA, startB, endB) {
  const sA = timeToMinutes(startA);
  let eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  let eB = timeToMinutes(endB);

  // If slot spans midnight (e.g. 23:00 to 01:00)
  if (eA <= sA) eA += 24 * 60;
  if (eB <= sB) eB += 24 * 60;

  return sA < eB && eA > sB;
}
