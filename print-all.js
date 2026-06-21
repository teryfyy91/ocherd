import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://wldshwuvmhayizndlvel.supabase.co',
    'sb_publishable_onfQlKlkOUOLN0XFBA1blg_MBkOBvdR'
);

async function printAll() {
    const { data: shops } = await supabase.from('shops').select('*');
    const { data: bookings } = await supabase.from('bookings').select('*');
    console.log("SHOPS:", shops);
    console.log("BOOKINGS:", bookings);
}
printAll();
