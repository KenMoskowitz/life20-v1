// The next Access Your Next Level group. Shared by /access-your-next-level
// and /join so the dates can never disagree. Update all of this together
// each time a new group opens.

export const nextGroup = {
  startLabel: 'Tuesday, January 12',
  schedule: [
    { label: 'January', dates: 'Jan 12, Jan 19, Jan 26' },
    { label: 'February', dates: 'Feb 2, Feb 9, Feb 16' },
  ],
  // Fast-action bonus: a private one-to-one session with Laura before the
  // group starts, for anyone who joins by the end of the day after the
  // December 3 training.
  bonusDeadline: '2026-12-04T23:59:59-08:00',
  bonusDeadlineLabel: 'Friday, December 4',
  // Enrollment closes at the end of this day (Pacific), or when 10 seats fill.
  closesAt: '2027-01-08T23:59:59-08:00',
  closesLabel: 'Friday, January 8',
};
