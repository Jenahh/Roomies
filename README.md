# Roomies
CSC 4330 - Roomies

npm install
npm run dev
## CSC 4402 database demo

Run from the repository root in two terminals:

```text
python database/chore_api.py
npm ci
npm run dev
```

Keep the API running in the first terminal. Run the npm commands in the second.
Open the URL printed by Vite and select Log In. All seeded demo accounts use
password `1234`.

| Area | Residents | Property manager | Resident assistant |
| --- | --- | --- | --- |
| Cypress Apartments, unit 2A | `alex@example.com`, `mia@example.com`, `sam@example.com` | `jordan@example.com` | `taylor@example.com` |
| Oak Commons, unit 3B | `riley@example.com` | `morgan@example.com` | `casey@example.com` |

1. **Chores:** Add a chore as Alex. Open Chores as Mia in a private window to
   see and complete it. Reopen the Chores tab as Alex and select Completed.
   Riley sees the chores for Oak Commons.
2. **Maintenance:** As Alex, open Profile → Maintenance and submit a description.
   As Jordan, open Requests and set it to In Progress. Use Refresh on Alex's
   Maintenance page to check the new status.
3. **RA concerns:** As Mia, open Profile → Contact My RA and submit a description.
   As Taylor, open Concerns and close it. Use Refresh on Mia's page to verify.
   The manager queue contains maintenance requests and the RA queue contains
   concerns, each scoped to the assigned staff member.

The request screens use the database's description and status fields. The API
uses seeded demo identities in a request header and is for local testing only.
The five reproducible assignment queries use the shipped SQLite database, while
the web demo uses a seeded working database.

The API creates a seeded `database/demo-local.sqlite3` on first launch.
Stop the API and remove that local demo file to reset it. The included
submission database and CLI are available separately:

```text
python database/test_chore_api.py
python database/roomies.py test
python database/roomies.py app
```
