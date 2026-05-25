import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLocalStorage, setLocalStorage } from '../utils/storage';
import { supabase } from '../utils/supabase';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
    const userRole = localStorage.getItem('userRole');
    const ownerId = localStorage.getItem('currentUserPhone') || 'default';

    // Local storage keys
    const shopKey = userRole === 'owner' ? `shopInfo_${ownerId}` : 'shopInfo_global';

    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        localStorage.setItem('theme', theme);
        if (theme === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Dynamic queue key based on active shop
    const getQueueKey = () => {
        if (userRole !== 'owner') return 'queue_global';
        return `queue_${ownerId}_${shopInfo.id || 'default'}`;
    };

    const [shopInfo, setShopInfo] = useState(() => getLocalStorage(shopKey, {
        name: '',
        services: [],
        workingHours: { start: '09:00', end: '18:00' }
    }));

    const [queue, setQueue] = useState([]);
    const [myBookings, setMyBookings] = useState([]);

    const fetchBookings = async () => {
        const activeShopId = shopInfo.id;
        if (!activeShopId) return;

        try {
            // Fetch ALL bookings for this shop to check availability and for owner dashboard
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('shop_id', activeShopId)
                .gte('created_at', thirtyDaysAgo.toISOString())
                .order('created_at', { ascending: true });

            if (data) {
                const formatted = data.map(b => {
                    // Parse encoded price: "buzz cut||30000"
                    const serviceParts = (b.service || '').split('||');
                    const serviceName = serviceParts[0];
                    const servicePrice = serviceParts[1] ? parseInt(serviceParts[1]) : 0;
                    return {
                        id: b.id,
                        shopId: b.shop_id,
                        shopName: b.shop_name,
                        service: serviceName,
                        price: servicePrice,
                        time: b.time,
                        name: b.user_name,
                        phone: b.user_phone,
                        status: b.status,
                        createdAt: b.created_at
                    };
                });
                setQueue(formatted);
            }
        } catch (err) {
            console.error('Error fetching bookings:', err);
        }
    };

    const fetchMyBookings = async () => {
        const localQueue = getLocalStorage('queue_global', []);
        if (localQueue.length === 0) {
            setMyBookings([]);
            return;
        }

        try {
            const ids = localQueue
                .map(q => q.id)
                .filter(id => id && (id.includes('-') || id.length > 15));

            if (ids.length === 0) {
                setMyBookings([]);
                return;
            }

            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .in('id', ids)
                .order('created_at', { ascending: false });

            if (data) {
                const formatted = data.map(b => ({
                    id: b.id,
                    shopId: b.shop_id,
                    shopName: b.shop_name,
                    service: b.service,
                    time: b.time,
                    name: b.user_name,
                    phone: b.user_phone,
                    status: b.status,
                    createdAt: b.created_at
                }));
                setMyBookings(formatted);
            }
        } catch (err) {
            console.error('Error fetching my bookings:', err);
        }
    };

    const [reviews, setReviews] = useState([]);

    const fetchReviews = async (shopId) => {
        const id = shopId || shopInfo.id;
        if (!id) return;
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('shop_id', id)
                .order('created_at', { ascending: false });

            if (data) {
                setReviews(data);
            }
        } catch (err) {
            console.error('Error fetching reviews:', err);
        }
    };

    const addReview = async (review) => {
        try {
            const user = currentUser;
            const { error } = await supabase
                .from('reviews')
                .insert([{
                    shop_id: review.shopId,
                    user_id: user?.id,
                    user_name: review.userName,
                    rating: review.rating,
                    comment: review.comment,
                    created_at: new Date().toISOString()
                }]);
            if (error) throw error;
            fetchReviews(review.shopId);
            return { success: true };
        } catch (err) {
            console.error('Error adding review:', err);
            return { success: false, error: err.message };
        }
    };

    // Load queue and reviews when shop changes
    useEffect(() => {
        if (shopInfo.id || userRole !== 'owner') {
            fetchBookings();
            fetchReviews();
        }
    }, [shopInfo.id]);

    const [allShops, setAllShops] = useState([]);
    const [myShops, setMyShops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingUser, setLoadingUser] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    // Handle auth state and user initialization
    useEffect(() => {
        const initUser = async () => {
            setLoadingUser(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setCurrentUser(session?.user ?? null);
            } catch (err) {
                console.error('Auth init error:', err);
                setCurrentUser(null);
            } finally {
                setLoadingUser(false);
                fetchShops();
                fetchMyBookings();
            }
        };
        initUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setCurrentUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Sync myShops whenever allShops or currentUser changes
    useEffect(() => {
        if (currentUser && allShops.length > 0) {
            const ownerShops = allShops.filter(s => s.ownerId === currentUser.id);
            setMyShops(ownerShops);
        } else if (!currentUser) {
            setMyShops([]);
        }
    }, [allShops, currentUser]);

    // Real-time subscriptions for bookings and reviews
    useEffect(() => {
        const channel = supabase
            .channel('realtime-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
                fetchBookings();
                fetchMyBookings();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, (payload) => {
                fetchReviews();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [shopInfo.id]);

    // Polling for new data (every 60 seconds), as a fallback and for tab visibility
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchBookings();
                fetchMyBookings();
                if (shopInfo.id) fetchReviews();
            }
        };

        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchBookings();
                fetchMyBookings();
                if (shopInfo.id) fetchReviews();
            }
        }, 60000);

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [shopInfo.id]);

    const fetchShops = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('shops')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) {
                const parseServices = (services) => (services || []).map(s => {
                    if (typeof s === 'string' && s.startsWith('{')) {
                        try { return JSON.parse(s); } catch (e) { return { name: s, price: 50000 }; }
                    }
                    return typeof s === 'string' ? { name: s, price: 50000 } : s;
                });

                const formattedShops = data.map(s => ({
                    id: s.id,
                    ownerId: s.owner_id,
                    name: s.name,
                    imageUrl: s.image_url,
                    services: parseServices(s.services),
                    workingHours: s.working_hours,
                    phone: s.phone || '',
                    gallery: s.gallery || [],
                    status: s.status || 'Active',
                    createdAt: s.created_at
                }));
                setAllShops(formattedShops);
            }
        } catch (error) {
            console.error('Error fetching shops:', error);
        } finally {
            setLoading(false);
        }
    };

    const approveShop = async (id) => {
        try {
            const { error } = await supabase
                .from('shops')
                .update({ status: 'Active' })
                .eq('id', id);

            if (error) throw error;
            await fetchShops();
            return { success: true };
        } catch (err) {
            console.error('Error approving shop:', err);
            return { success: false, error: err.message };
        }
    };

    useEffect(() => {
        setLocalStorage(shopKey, shopInfo);
    }, [shopInfo, shopKey]);

    const addBooking = async (booking) => {
        const newBooking = {
            shop_id: booking.shopId,
            shop_name: booking.shopName,
            user_name: booking.name,
            user_phone: booking.phone,
            service: booking.price ? `${booking.service}||${booking.price}` : booking.service,
            time: booking.time,
            status: 'Pending',
            created_at: new Date().toISOString()
        };

        try {
            const { data, error } = await supabase.from('bookings').insert([newBooking]).select();
            if (error) throw error;

            const insertedBooking = data[0];

            if (userRole !== 'owner') {
                const localQueue = getLocalStorage('queue_global', []);
                setLocalStorage('queue_global', [...localQueue, { ...booking, id: insertedBooking.id, status: 'Pending' }]);
            }

            fetchBookings();
            return { success: true, message: 'Successfully requested booking!' };
        } catch (err) {
            console.error('Error adding booking:', err);
            return { success: false, message: `Error: ${err.message || 'Failed to add booking'}` };
        }
    };

    const updateBookingStatus = async (id, status) => {
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status })
                .eq('id', id);

            if (error) {
                console.error('Error updating status in Supabase:', error);
                alert(`Error: ${error.message}`);
                return;
            }
            fetchBookings();
        } catch (err) {
            console.error('Catch error updating booking:', err);
        }
    };

    const deleteBooking = async (id) => {
        try {
            const { error } = await supabase
                .from('bookings')
                .delete()
                .eq('id', id);

            if (error) throw error;

            if (userRole !== 'owner') {
                const localQueue = getLocalStorage('queue_global', []);
                setLocalStorage('queue_global', localQueue.filter(q => q.id !== id));
            }

            fetchBookings();
        } catch (err) {
            console.error('Error deleting booking:', err);
        }
    };

    const getAllShops = () => {
        return allShops;
    };

    const updateShopInfo = async (info) => {
        try {
            const user = currentUser;
            if (!user) {
                return { success: false, error: "Tizimga kirmagansiz" };
            }

            const normalizedServices = (info.services || []).map(s => {
                if (typeof s === 'string' && s.startsWith('{')) {
                    try { return JSON.parse(s); } catch (e) { return { name: s, price: 50000 }; }
                }
                return typeof s === 'string' ? { name: s, price: 50000 } : s;
            });

            // Base record data
            let payload = {
                owner_id: user.id,
                name: info.name,
                image_url: info.imageUrl,
                services: normalizedServices,
                working_hours: info.workingHours,
                phone: info.phone || '',
                gallery: info.gallery || [],
                status: info.status || 'Active'
            };

            const performSave = async (data) => {
                if (info.id) {
                    return await supabase.from('shops').update(data).eq('id', info.id).select();
                } else {
                    return await supabase.from('shops').insert([data]).select();
                }
            };

            let result = await performSave(payload);

            // If error, try to strip potentially missing columns
            if (result.error) {
                const errorMessage = result.error.message.toLowerCase();
                if (errorMessage.includes('column') && (errorMessage.includes('not exist') || errorMessage.includes('schema'))) {
                    // Identify the likely culprit column
                    const columns = ['gallery', 'phone', 'status', 'image_url'];
                    let retryPayload = { ...payload };

                    for (const col of columns) {
                        if (errorMessage.includes(col)) {
                            delete retryPayload[col];
                        }
                    }

                    // Simple retry with safest fields
                    const fallbackPayload = {
                        owner_id: user.id,
                        name: payload.name,
                        services: payload.services,
                        working_hours: payload.working_hours
                    };

                    result = await performSave(fallbackPayload);
                }
            }

            if (result.error) {
                throw new Error(result.error.message);
            }

            const savedData = result.data?.[0];
            if (savedData) {
                const newShopInfo = {
                    id: savedData.id,
                    ownerId: savedData.owner_id,
                    name: savedData.name,
                    imageUrl: savedData.image_url,
                    services: savedData.services,
                    workingHours: savedData.working_hours,
                    phone: savedData.phone || '',
                    gallery: savedData.gallery || [],
                    status: savedData.status
                };
                setShopInfo(newShopInfo);
                await fetchShops(); // Refresh the list
            }

            return { success: true };
        } catch (error) {
            console.error('Save error details:', error);
            return { success: false, error: "Saqlashda xatolik: " + error.message };
        }
    };

    const deleteShop = async (id) => {
        try {
            console.log('Attempting to delete shop:', id);

            // 1. Delete associated bookings
            const { error: bookingError } = await supabase
                .from('bookings')
                .delete()
                .eq('shop_id', id);

            if (bookingError) {
                console.warn('Could not delete associated bookings:', bookingError);
            } else {
                console.log('Associated bookings deleted successfully');
            }

            // 2. Delete associated reviews
            const { error: reviewError } = await supabase
                .from('reviews')
                .delete()
                .eq('shop_id', id);

            if (reviewError) {
                console.warn('Could not delete associated reviews:', reviewError);
            } else {
                console.log('Associated reviews deleted successfully');
            }

            // 3. Delete the shop itself
            const { data, error } = await supabase
                .from('shops')
                .delete()
                .eq('id', id)
                .select();

            if (error) {
                console.error('Database error during shop deletion:', error);
                throw new Error("Bazadan o'chirishda xatolik: " + (error.message || 'Noma\'lum xato'));
            }

            if (!data || data.length === 0) {
                console.error('No rows deleted from shops. RLS or ID mismatch?');
                throw new Error("Salon topilmadi yoki uni o'chirish uchun ruxsatingiz yo'q (RLS).");
            }

            console.log('Shop deleted successfully:', data[0]);

            if (shopInfo.id === id) {
                setShopInfo({
                    name: '',
                    services: [],
                    workingHours: { start: '09:00', end: '18:00' }
                });
            }

            await fetchShops();
            return { success: true };
        } catch (err) {
            console.error('Error in deleteShop caught:', err);
            return { success: false, error: err.message };
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        localStorage.removeItem('currentUserPhone');
        localStorage.removeItem('hasSelectedLang');
        localStorage.removeItem('authBypass');
        window.location.href = '/';
    };

    return (
        <StoreContext.Provider value={{
            shopInfo,
            setShopInfo,
            queue,
            myBookings,
            reviews,
            addReview,
            fetchReviews,
            updateShopInfo,
            addBooking,
            updateBookingStatus,
            deleteBooking,
            deleteShop,
            approveShop,
            getAllShops,
            allShops,
            setAllShops,
            currentUser,
            loadingUser,
            signOut,
            myShops,
            loadingShops: loading,
            refreshShops: fetchShops,
            refreshMyBookings: fetchMyBookings,
            theme,
            toggleTheme,
            sendNotification: async (message) => {
                try {
                    await supabase.from('notifications').insert([{
                        message,
                        status: 'unread',
                        created_at: new Date().toISOString()
                    }]);
                } catch (err) {
                    console.error('Error sending notification:', err);
                }
            }
        }}>
            {children}
        </StoreContext.Provider>
    );
};
