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
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('shop_id', activeShopId)
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
            const { data: { user } } = await supabase.auth.getUser();
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
    }, [shopInfo.id, userRole]);

    const [allShops, setAllShops] = useState([]);
    const [myShops, setMyShops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    // Initial fetch of all shops and user
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
            }
            fetchShops();
            fetchMyBookings();
            if (shopInfo.id) fetchReviews();
        };
        init();

        // Polling for new data (every 10 seconds)
        const interval = setInterval(() => {
            fetchBookings();
            fetchMyBookings();
            if (shopInfo.id) fetchReviews();
        }, 10000);
        return () => clearInterval(interval);
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
                    services: parseServices(s.services),
                    workingHours: s.working_hours,
                    createdAt: s.created_at
                }));
                setAllShops(formattedShops);

                // Get current user again to be sure
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const ownerShops = formattedShops.filter(s => s.ownerId === user.id);
                    setMyShops(ownerShops);

                    // If no shopInfo set yet, pick the first one
                    if (!shopInfo.name && ownerShops.length > 0) {
                        setShopInfo(ownerShops[0]);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching shops:', error);
        } finally {
            setLoading(false);
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
            // Encode price into service string: "buzz cut||30000"
            service: booking.price ? `${booking.service}||${booking.price}` : booking.service,
            time: booking.time,
            status: 'Pending',
            created_at: new Date().toISOString()
        };

        try {
            const { data, error } = await supabase.from('bookings').insert([newBooking]).select();
            if (error) throw error;

            const insertedBooking = data[0];

            // Still sync to local for user visibility
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
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Please log in first");
                return;
            }

            // Normalize services: always save as array of {name, price} objects
            const normalizedServices = (info.services || []).map(s => {
                if (typeof s === 'string' && s.startsWith('{')) {
                    try { return JSON.parse(s); } catch (e) { return { name: s, price: 50000 }; }
                }
                return typeof s === 'string' ? { name: s, price: 50000 } : s;
            });

            const payload = {
                owner_id: user.id,
                name: info.name,
                services: normalizedServices,
                working_hours: info.workingHours
            };

            let result;
            if (info.id) {
                // Update existing
                result = await supabase
                    .from('shops')
                    .update(payload)
                    .eq('id', info.id);
            } else {
                // Insert new
                result = await supabase
                    .from('shops')
                    .insert([payload]);
            }

            if (result.error) {
                console.error('Error saving shop:', result.error);
                return { success: false, error: result.error.message };
            } else {
                await fetchShops();
                // Update current shopInfo with the new data (especially the ID if it was new)
                if (!info.id) {
                    const { data: newData } = await supabase
                        .from('shops')
                        .select('*')
                        .eq('owner_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(1);
                    if (newData && newData[0]) {
                        const newShop = {
                            id: newData[0].id,
                            ownerId: newData[0].owner_id,
                            name: newData[0].name,
                            services: newData[0].services,
                            workingHours: newData[0].working_hours
                        };
                        setShopInfo(newShop);
                    }
                } else {
                    // Update current local shopInfo if it was an update
                    setShopInfo({
                        ...shopInfo,
                        name: info.name,
                        services: info.services,
                        workingHours: info.workingHours
                    });
                }
                return { success: true };
            }
        } catch (error) {
            console.error('Supabase error:', error);
            return { success: false, error: 'Something went wrong while saving shop info' };
        }
    };

    const deleteShop = async (id) => {
        try {
            // 1. Delete associated bookings first to avoid foreign key constraints
            const { error: bookingError } = await supabase
                .from('bookings')
                .delete()
                .eq('shop_id', id);

            if (bookingError) {
                console.warn('Could not delete associated bookings:', bookingError);
            }

            // 2. Delete the shop itself
            const { data, error } = await supabase
                .from('shops')
                .delete()
                .eq('id', id)
                .select();

            if (error) throw error;

            if (!data || data.length === 0) {
                console.error("Delete failed: No rows returned. This usually means RLS blocked the delete or the ID is wrong.", { id, user: (await supabase.auth.getUser()).data.user?.id });
                throw new Error("Salonni o'chirish imkoni bo'lmadi. Iltimos, sahifani yangilab qaytadan urinib ko'ring.");
            }


            // 3. Clear active shop if it was the one deleted
            if (shopInfo.id === id) {
                setShopInfo({
                    name: '',
                    services: [],
                    workingHours: { start: '09:00', end: '18:00' }
                });
            }

            // 4. Refresh the list
            await fetchShops();
            return { success: true };
        } catch (err) {
            console.error('Error deleting shop:', err);
            return { success: false, error: err.message };
        }
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
            getAllShops,
            myShops,
            loadingShops: loading,
            refreshShops: fetchShops,
            refreshMyBookings: fetchMyBookings
        }}>


            {children}
        </StoreContext.Provider>
    );
};
