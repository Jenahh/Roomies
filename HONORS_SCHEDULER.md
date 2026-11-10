# Smart Chore Scheduler

Open Chores > Plan a smart schedule.

1. Add the participating roommates, available weekdays, and weekly minute limits.
2. Add recurring chores with estimated effort and 1–7 occurrences per week.
3. Choose a Monday; generate, review, optionally adjust, and publish.
4. Published assignments use the existing chores list, calendar, dashboard, and completion/points behavior.

Algorithm
- Uses a deterministic greedy heuristic, processing larger/constrained chores first.
- Availability, capacity, and one occurrence of each recurring chore per date are hard constraints.
- Scores eligible assignments by weekly utilization, repeat assignments in the prior 28 days, daily workload, and spacing toward target days.
- Existing assignments (including completed chores) count against the week's effort. Older one-off chores without effort use a 30-minute estimate.
- Records stable member/template IDs on generated chores to support later rotations.
- Unplaced occurrences are surfaced and prevent publication. This heuristic can miss a feasible global solution; users can revise settings and regenerate.
- Manual changes are validated. Publication preserves history, rejects an already-published week, and uses deterministic occurrence IDs to prevent duplicate inserts.

Tests: node tests/scheduler.test.mjs
Build: npm run build

Current integration boundary
The existing application stores resident data in browser localStorage per email, not a shared backend. Scheduler settings and published chores use that same storage. The scheduler does not provide household synchronization, identity verification, or publisher permissions. Those must be integrated with the team's backend/auth work before multi-user production use. Roommate names/availability are manually entered for this local version. Draft previews are temporary; saved preferences and published chores persist. Storage failure is displayed but does not provide server durability.

Honors scope
The additional feature is availability-aware automatic weekly assignment with effort balancing, history-based rotation, conflict reporting, manual review, and validated publication. Obtain instructor approval for this scope; this file is implementation documentation, not the required three-page report.
