
import { useState, useEffect, useCallback } from 'react';

export const useNotifications = () => {
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            alert('This browser does not support desktop notification');
            return;
        }
        const status = await Notification.requestPermission();
        setPermission(status);
    }, []);

    const scheduleNotification = useCallback((
        time: Date, 
        title: string, 
        body: string, 
        advanceMs: number = 0
    ) => {
        if (permission !== 'granted') {
            console.log('Notification permission not granted.');
            return;
        }

        const now = new Date().getTime();
        const notificationTime = time.getTime() - advanceMs;
        const delay = notificationTime - now;

        if (delay <= 0) {
            console.log('Cannot schedule notification in the past.');
            return null;
        }

        const timeoutId = setTimeout(() => {
            new Notification(title, { body });
        }, delay);

        return timeoutId;
    }, [permission]);

    const cancelNotification = useCallback((timeoutId: ReturnType<typeof setTimeout> | undefined) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    }, []);

    return { permission, requestPermission, scheduleNotification, cancelNotification };
};
