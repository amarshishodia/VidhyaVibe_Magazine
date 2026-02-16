import { getPool } from '../db';
import { createLogger } from '@magazine/config';

const logger = createLogger('dispatch-scheduler');

export async function assignEditionsToSchedules(limit = 100) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    // find scheduled dispatches without edition assigned, ordered by scheduled_at
    const [sRows]: any = await conn.query(
      `SELECT ds.id as schedule_id, ds.scheduled_at, us.magazine_id
       FROM dispatch_schedules ds
       JOIN user_subscriptions us ON ds.subscription_id = us.id
       WHERE ds.edition_id IS NULL
       AND us.magazine_id IS NOT NULL
       ORDER BY ds.scheduled_at ASC
       LIMIT ?`,
      [limit]
    );

    let updated = 0;
    for (const row of sRows) {
      const schedId = row.schedule_id;
      const scheduledAt = row.scheduled_at;
      const magazineId = row.magazine_id;
      if (!magazineId) continue;

      // find latest edition published at or before scheduledAt
      const [edRows]: any = await conn.query(
        `SELECT id FROM magazine_editions WHERE magazine_id = ? AND published_at IS NOT NULL AND published_at <= ? ORDER BY published_at DESC LIMIT 1`,
        [magazineId, scheduledAt]
      );
      const ed = edRows[0];
      if (ed) {
        await conn.query('UPDATE dispatch_schedules SET edition_id = ? WHERE id = ?', [ed.id, schedId]);
        updated++;
        logger.info({ scheduleId: schedId, editionId: ed.id }, 'Assigned edition to schedule');
      } else {
        logger.debug({ scheduleId: schedId, magazineId }, 'No edition found yet for schedule');
      }
    }

    return { scanned: sRows.length, updated };
  } finally {
    conn.release();
  }
}

