
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://wldshwuvmhayizndlvel.supabase.co',
    'sb_publishable_onfQlKlkOUOLN0XFBA1blg_MBkOBvdR'
);

async function testUpload() {
    console.log("Testing upload to 'avatars'...");
    const { data, error } = await supabase.storage
        .from('avatars')
        .upload('test.txt', 'Hello world');

    if (error) {
        console.error("UPLOAD ERROR:", error);
    } else {
        console.log("UPLOAD SUCCESS:", data);
    }
}

testUpload();
