import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://wldshwuvmhayizndlvel.supabase.co',
    'sb_publishable_onfQlKlkOUOLN0XFBA1blg_MBkOBvdR'
);

async function debugBookings() {
    console.log("Fetching latest bookings...");
    const { data, error } = await supabase.from('bookings').select('*').limit(5);
    if (error) {
        console.error("Error fetching bookings:", error);
    } else {
        console.log("Bookings columns:", data.length > 0 ? Object.keys(data[0]) : "No bookings found");
        console.log("Sample bookings:", data);
    }
}
debugBookings();
