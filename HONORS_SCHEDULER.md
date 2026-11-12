# Smart Chore Scheduler

Open **Chores → Add chore** to pick a preset or type a custom task. The default due date is today. Roomies suggests someone based on availability, remaining weekly capacity, and the most recent matching assignment in the prior 28 days. The resident can accept the suggestion, or choose another eligible roommate. If nobody fits, it can be saved unassigned. Exact workload and rotation ties use a rotating weekly priority based on stable roommate IDs. Picking an already busier roommate displays their projected workload before saving. The demo assigns residents to a household ahead of time, and Chores reads its roster automatically. The weekly split shows assigned minutes, including completed work.

The same popup handles one-time, daily, and weekly chores. A repeat end date limits the series to 52 occurrences. The resident can override the first assignment; the scheduler independently checks each later occurrence and leaves it unassigned if nobody fits. Saving creates individually completable chores without changing existing assignments. The demo roster uses default availability and workload limits.

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
The existing application stores resident data in browser localStorage per email, not a shared backend. Scheduler settings and published chores use that same storage. The scheduler does not provide household synchronization, identity verification, or publisher permissions. Those must be integrated with the team's backend/auth work before multi-user production use. The demo household roster is predefined and is not a shared backend roster. Draft previews are temporary; saved preferences and published chores persist. Storage failure is displayed but does not provide server durability.

Honors scope
The additional feature is availability-aware automatic weekly assignment with effort balancing, history-based rotation, conflict reporting, manual review, and validated publication. Obtain instructor approval for this scope; this file is implementation documentation, not the required three-page report.
