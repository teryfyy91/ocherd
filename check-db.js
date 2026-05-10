import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://wldshwuvmhayizndlvel.supabase.co',
    'sb_publishable_onfQlKlkOUOLN0XFBA1blg_MBkOBvdR'
);

async function checkStatus() {
    const { data: shops, error: shopsErr } = await supabase.from('shops').select('*');
    const { data: pending, error: pendErr } = await supabase.from('pending_salons').select('*');
    console.log('SHOPS DB COUNT:', shops ? shops.length : 0);
    console.log('SHOPS TABLE CONTENT:', JSON.stringify(shops, null, 2));
}
checkStatus();
