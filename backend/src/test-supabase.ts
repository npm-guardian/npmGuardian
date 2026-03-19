import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('🔗 Testing Supabase Connection...');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey?.substring(0, 20)}...`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  // Test 1: Check if scans table exists
  console.log('\n[Test 1] Checking if "scans" table exists...');
  const { data: scans, error: scansError } = await supabase.from('scans').select('*').limit(1);
  
  if (scansError) {
    console.log(`   ❌ Error: ${scansError.message}`);
    console.log(`   ❌ Code: ${scansError.code}`);
    console.log(`   ⚠️  You need to run supabase_schema.sql in Supabase SQL Editor first!`);
  } else {
    console.log(`   ✅ "scans" table exists! Found ${scans?.length || 0} records.`);
  }

  // Test 2: Check if users table exists  
  console.log('\n[Test 2] Checking if "users" table exists...');
  const { data: users, error: usersError } = await supabase.from('users').select('*').limit(1);
  
  if (usersError) {
    console.log(`   ❌ Error: ${usersError.message}`);
  } else {
    console.log(`   ✅ "users" table exists! Found ${users?.length || 0} records.`);
  }

  // Test 3: Try inserting a test scan
  console.log('\n[Test 3] Inserting a test scan...');
  const { data: insertData, error: insertError } = await supabase
    .from('scans')
    .insert({
      type: 'package',
      package_name: 'test-connection-check',
      package_version: '1.0.0',
      status: 'queued',
      overall_risk_score: 0,
      risk_level: 'PENDING'
    })
    .select()
    .single();

  if (insertError) {
    console.log(`   ❌ Insert failed: ${insertError.message}`);
    console.log(`   ❌ Details: ${JSON.stringify(insertError)}`);
  } else {
    console.log(`   ✅ Insert successful! Scan ID: ${insertData?.id}`);
    
    // Clean up: delete the test record
    await supabase.from('scans').delete().eq('id', insertData.id);
    console.log(`   🗑️  Cleaned up test record.`);
  }

  console.log('\n🏁 Connection test complete.');
}

test().catch(console.error);
