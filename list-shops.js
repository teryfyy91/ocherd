import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://wldshwuvmhayizndlvel.supabase.co',
    'sb_publishable_onfQlKlkOUOLN0XFBA1blg_MBkOBvdR'
);

async function listShops() {
    const { data, error } = await supabase.from('shops').select('id, name, status, owner_id');
    if (error) console.error('Error fetching shops:', error);
    console.log('ALL SHOPS:', data);
}
listShops();
