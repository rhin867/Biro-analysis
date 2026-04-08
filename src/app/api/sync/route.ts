import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

/**
 * BIRO-ANALYSIS SYNC GATEWAY
 * Ingests behavioral batches from Chrome Extension (Kiwi/Desktop)
 */
export async function POST(req: Request) {
  try {
    const { events, sessionId, testId, userId } = await req.json()

    if (!events || !Array.isArray(events)) {
      return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 })
    }

    console.log(`[Sync] Ingesting ${events.length} events for session ${sessionId}`)

    // Prepare batch insert for event_logs
    const rows = events.map((ev: any) => ({
      test_id: testId || ev.testId || 'external_session',
      user_id: userId || 'guest',
      event_type: ev.type,
      payload: {
        ...ev.payload,
        session_id: sessionId,
        browser_timestamp: ev.timestamp
      },
      client_timestamp: new Date(ev.timestamp).toISOString()
    }))

    const { error } = await supabase.from('event_logs').insert(rows)

    if (error) {
      console.error('[Sync] Supabase Error:', error)
      return NextResponse.json({ error: 'DB_INSERT_FAIL', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      ok: true, 
      ingested: rows.length,
      server_received_at: new Date().toISOString()
    })

  } catch (err: any) {
    console.error('[Sync] Critical Gateway Failure:', err)
    return NextResponse.json({ error: 'INTERNAL_GATEWAY_CRASH', details: err.message }, { status: 500 })
  }
}
