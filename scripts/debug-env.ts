import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '.env.local' });

console.log('--- Env Debug ---');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'EXISTS' : 'MISSING');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'EXISTS' : 'MISSING');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'EXISTS' : 'MISSING');
console.log('VERCEL_TOKEN:', process.env.VERCEL_TOKEN ? 'EXISTS' : 'MISSING');
console.log('--- .env.local Raw Check ---');
if (fs.existsSync('.env.local')) {
    const raw = fs.readFileSync('.env.local', 'utf-8');
    const lines = raw.split('\n');
    lines.forEach(l => {
        const key = l.split('=')[0].trim();
        if (key && !key.startsWith('#')) {
            console.log(`Found Key: ${key}`);
        }
    });
} else {
    console.log('.env.local NOT FOUND');
}
