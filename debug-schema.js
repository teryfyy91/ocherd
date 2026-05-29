
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://wldshwuvmhayizndlvel.supabase.co',
    'sb_publishable_onfQlKlkOUOLN0XFBA1blg_MBkOBvdR'
);

async function debug() {
    console.log("Fetching one shop to check columns...");
    const { data, error } = await supabase.from('shops').select('*').limit(1);

    if (error) {
        console.error("Error fetching shop:", error);
    } else if (data && data.length > 0) {
        console.log("Columns found in first shop record:", Object.keys(data[0]));
        console.log("Sample record:", data[0]);
    } else {
        console.log("No shops found in database.");
    }
}

debug();
