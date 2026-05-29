
-- Bunyod etish: 'avatars' storage bucketini yaratish va unga ruxsatlar berish
-- Ushbu SQL kodini Supabase SQL Editor-da ishga tushiring.

-- 1. 'avatars' bucketini yaratish (agar mavjud bo'lmasa)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Ruxsatlarni o'rnatish (RLS Policies)

-- Hammaga rasmlarni ko'rishga ruxsat berish
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Barcha tizimga kirgan foydalanuvchilarga rasm yuklashga ruxsat berish
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

-- Rasmlarni o'chirishga ruxsat (faqat o'zinikini o'chirish murakkabroq, hozircha authenticated uchun ochiq)
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );
