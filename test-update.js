
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://wldshwuvmhayizndlvel.supabase.co',
    'sb_publishable_onfQlKlkOUOLN0XFBA1blg_MBkOBvdR'
);

async function testUpdate() {
    console.log("Testing gallery update...");
    const shopId = '0bd4881f-6505-4f65-a4b2-5c870e525d62'; // From previous log
    const testGallery = ['https://test.com/image1.jpg'];

    const { data, error } = await supabase
        .from('shops')
        .update({ gallery: testGallery })
        .eq('id', shopId)
        .select();

    if (error) {
        console.error("UPDATE ERROR:", error);
    } else {
        console.log("UPDATE SUCCESS:", data[0].gallery);
    }
}

testUpdate();
