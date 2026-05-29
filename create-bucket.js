
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://wldshwuvmhayizndlvel.supabase.co',
    'sb_publishable_onfQlKlkOUOLN0XFBA1blg_MBkOBvdR'
);

async function createBucket() {
    console.log("Attempting to create bucket 'avatars'...");
    const { data, error } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880 // 5MB
    });

    if (error) {
        console.error("Error creating bucket:", error);
    } else {
        console.log("Bucket created successfully:", data);
    }
}

createBucket();
