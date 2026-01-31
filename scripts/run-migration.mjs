/**
 * Script to run the daily_stars migration on Supabase
 * Run with: node scripts/run-migration.mjs
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hrsljgzzmmppfmlmtltd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhyc2xqZ3p6bW1wcGZtbG10bHRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMjkyODIsImV4cCI6MjA4MDgwNTI4Mn0.y-b-WZAOEw4qiqmim6b3HTGt3rKGUC59bYQ7to3S0GA'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkTableExists() {
  console.log('Checking if daily_stars table exists...')

  const { data, error } = await supabase
    .from('daily_stars')
    .select('id')
    .limit(1)

  if (error) {
    if (error.message.includes('does not exist') || error.code === '42P01') {
      return false
    }
    console.log('Error checking table:', error.message)
    return false
  }

  return true
}

async function testInsert() {
  console.log('Testing insert to daily_stars...')

  const { data, error } = await supabase
    .from('daily_stars')
    .upsert({
      child_id: 'test',
      day_date: new Date().toISOString().split('T')[0],
      star_area_id: 'morning',
      stars: 1,
      reason: 'Test entry'
    }, {
      onConflict: 'child_id,day_date,star_area_id'
    })
    .select()

  if (error) {
    console.log('Insert error:', error.message)
    return false
  }

  console.log('Insert successful:', data)

  // Clean up test data
  await supabase
    .from('daily_stars')
    .delete()
    .eq('child_id', 'test')

  return true
}

async function main() {
  console.log('=== Supabase Daily Stars Migration Check ===\n')

  const exists = await checkTableExists()

  if (exists) {
    console.log('✓ daily_stars table already exists!')
    const insertOk = await testInsert()
    if (insertOk) {
      console.log('✓ Insert/upsert working correctly!')
      console.log('\n✅ Migration complete - table is ready to use.')
    }
  } else {
    console.log('✗ daily_stars table does not exist')
    console.log('\n📋 You need to create it manually in Supabase Dashboard:')
    console.log('   1. Go to https://supabase.com/dashboard')
    console.log('   2. Select your project: hrsljgzzmmppfmlmtltd')
    console.log('   3. Go to SQL Editor')
    console.log('   4. Copy and run the contents of: supabase/migrations/001_create_daily_stars.sql')
  }
}

main().catch(console.error)
