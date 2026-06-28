const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');
const { db, executeSelfDestruct } = require('../database');
const { authenticateToken } = require('./relationship');

const git = simpleGit();
const journalPath = path.resolve(__dirname, '../sync_journal.json');

// Ensure journal file exists on boot
if (!fs.existsSync(journalPath)) {
  fs.writeFileSync(journalPath, '', 'utf8');
}

// Replays a single transaction log onto the local database
function replayTransaction(tx) {
  try {
    const { type, payload } = tx;
    if (!type || !payload) return;

    switch (type) {
      case 'PROPOSE_EVENT': {
        const { id, pairing_id, itinerary_id, proposed_by, scheduled_time, status } = payload;
        // Check if event already exists
        const exists = db.prepare('SELECT id FROM calendar_events WHERE id = ?').get(id);
        if (!exists) {
          db.prepare(`
            INSERT INTO calendar_events (id, pairing_id, itinerary_id, proposed_by, scheduled_time, status)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(id, pairing_id, itinerary_id, proposed_by, scheduled_time, status || 'Pending');
          console.log(`Replayed PROPOSE_EVENT: ${id}`);
        }
        break;
      }
      case 'UPDATE_EVENT_STATUS': {
        const { id, status } = payload;
        const exists = db.prepare('SELECT id FROM calendar_events WHERE id = ?').get(id);
        if (exists) {
          db.prepare('UPDATE calendar_events SET status = ? WHERE id = ?').run(status, id);
          console.log(`Replayed UPDATE_EVENT_STATUS: ${id} to ${status}`);
        }
        break;
      }
      case 'DELETE_EVENT': {
        const { id } = payload;
        db.prepare('DELETE FROM calendar_events WHERE id = ?').run(id);
        console.log(`Replayed DELETE_EVENT: ${id}`);
        break;
      }
      case 'ADD_AFTERGLOW': {
        const { id, pairing_id, user_id, safety_rating, arousal_rating, connection_rating, notes } = payload;
        const exists = db.prepare('SELECT id FROM afterglow_surveys WHERE id = ?').get(id);
        if (!exists) {
          db.prepare(`
            INSERT INTO afterglow_surveys (id, pairing_id, user_id, safety_rating, arousal_rating, connection_rating, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(id, pairing_id, user_id, safety_rating, arousal_rating, connection_rating, notes);
          console.log(`Replayed ADD_AFTERGLOW: ${id}`);
        }
        break;
      }
      case 'ADD_ITINERARY': {
        const { id, title, description, steps, is_premium, tags } = payload;
        const exists = db.prepare('SELECT id FROM itineraries WHERE id = ?').get(id);
        if (!exists) {
          db.prepare(`
            INSERT INTO itineraries (id, title, description, steps, is_premium, tags)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(id, title, description, typeof steps === 'string' ? steps : JSON.stringify(steps), is_premium, tags);
          console.log(`Replayed ADD_ITINERARY: ${id}`);
        }
        break;
      }
      case 'UNLINK_PAIRING': {
        const { pairing_id } = payload;
        const exists = db.prepare('SELECT id FROM pairings WHERE id = ?').get(pairing_id);
        if (exists) {
          executeSelfDestruct(pairing_id);
          console.log(`Replayed UNLINK_PAIRING: ${pairing_id}`);
        }
        break;
      }
      default:
        console.warn(`Unknown transaction type: ${type}`);
    }
  } catch (err) {
    console.error(`Failed to replay transaction ${tx.id}:`, err.message);
  }
}

// Pulls sync_journal.json from Git, rebases, and replays events locally
async function pullDatabase() {
  try {
    console.log('Initiating Git sync pull for sync_journal.json...');
    await git.pull('origin', 'main', { '--rebase': 'true' });
    console.log('Git pull rebase complete. Replaying journal logs...');

    if (fs.existsSync(journalPath)) {
      const data = fs.readFileSync(journalPath, 'utf8');
      const lines = data.split('\n').filter(line => line.trim().length > 0);
      lines.forEach(line => {
        try {
          const tx = JSON.parse(line);
          replayTransaction(tx);
        } catch (e) {
          console.error('Failed to parse journal transaction line:', e.message);
        }
      });
      
      // Update metadata success
      db.prepare(`
        INSERT OR REPLACE INTO sync_metadata (id, last_sync_time, last_sync_status)
        VALUES ('global_sync', CURRENT_TIMESTAMP, 'Success')
      `).run();
    }
  } catch (err) {
    console.error('Git synchronization pull failed, operating in local-only mode:', err.message);
    db.prepare(`
      INSERT OR REPLACE INTO sync_metadata (id, last_sync_time, last_sync_status)
      VALUES ('global_sync', CURRENT_TIMESTAMP, 'Offline')
    `).run();
  }
}

// Commits and pushes the journal changes
async function pushDatabase(userEmail) {
  try {
    console.log('Initiating Git push check-in...');
    await git.add('sync_journal.json');
    const commitMsg = `Partner Sync Checkpoint: ${userEmail || 'anonymous'} - ${new Date().toISOString()}`;
    await git.commit(commitMsg);
    await git.push('origin', 'main');
    console.log('Database sync journal pushed to GitHub successfully!');
  } catch (err) {
    console.error('Git push failed, updates saved locally in journal:', err.message);
  }
}

// Appends a new event log to sync_journal.json
function appendJournal(type, payload) {
  const transaction = {
    id: require('uuid').v4(),
    type,
    timestamp: new Date().toISOString(),
    payload
  };
  fs.appendFileSync(journalPath, JSON.stringify(transaction) + '\n', 'utf8');
}

// GET /api/v1/sync/status
router.get('/status', authenticateToken, (req, res) => {
  try {
    const meta = db.prepare("SELECT * FROM sync_metadata WHERE id = 'global_sync'").get();
    res.json({ success: true, metadata: meta || { last_sync_status: 'Never synced' } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/sync (Manual sync trigger)
router.post('/', authenticateToken, async (req, res) => {
  const userEmail = req.user.email;
  try {
    await pullDatabase();
    await pushDatabase(userEmail);
    res.json({ success: true, message: 'Sync cycle completed successfully.' });
  } catch (error) {
    res.status(500).json({ success: true, message: 'Sync finished with local warnings.', error: error.message });
  }
});

module.exports = {
  router,
  pullDatabase,
  pushDatabase,
  appendJournal
};
