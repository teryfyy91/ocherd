import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://wldshwuvmhayizndlvel.supabase.co',
    'sb_publishable_onfQlKlkOUOLN0XFBA1blg_MBkOBvdR'
);

async function findAdmin() {
    const { data: shops } = await supabase.from('shops').select('*');
    const adminShop = shops?.find(s => s.phone?.includes('505521107') || s.owner_id?.includes('505521107'));
    console.log('ADMIN SHOP:', adminShop);

    // Check if we can find any shop with that phone
    const anyShop = shops?.filter(s => s.phone?.includes('505521107'));
    console.log('ALL SHOPS WITH PHONE 505521107:', anyShop);
}
findAdmin();
