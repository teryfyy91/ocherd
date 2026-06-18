import { useRegisterSW } from 'virtual:pwa-register/react';

const PwaUpdatePopup = () => {
    // autoUpdate rejimida foydalanuvchiga hech narsa ko'rsatilmaydi.
    // Yangi versiya chiqsa, service worker avtomatik yangilanadi.
    useRegisterSW({
        onRegistered(r) {
            if (r && !import.meta.env.DEV) {
                // Har 60 daqiqada yangi versiya borligini tekshiradi
                setInterval(() => {
                    r.update();
                }, 60 * 60 * 1000);
            }
        },
        onRegisterError(error) {
            console.error('SW registration error', error);
        },
    });

    // Hech narsa render qilinmaydi — popup yo'q
    return null;
};

export default PwaUpdatePopup;
