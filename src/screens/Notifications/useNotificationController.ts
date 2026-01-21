import { useState, useCallback, useMemo } from 'react';

const NOTIFICATION_TABS = [
    { label: 'All', value: 'all' },
    { label: 'Accounts', value: 'accounts' },
    { label: 'Updates', value: 'updates' },
    { label: 'Status', value: 'status' },
];

const MOCK_NOTIFICATIONS = [
    {
        id: '1',
        message: 'Get notifications for winding down, reflecting, and prepping for tomorrow.',
        date: 'mm/dd/yyy',
        time: '01:30 PM',
        is_read: false,
        type: 'all',
    },
    {
        id: '2',
        message: 'Get notifications for winding down, reflecting, and prepping for tomorrow.',
        date: 'mm/dd/yyy',
        time: '01:30 PM',
        is_read: true,
        type: 'all',
    },
    {
        id: '3',
        message: 'Get notifications for winding down, reflecting, and prepping for tomorrow.',
        date: 'mm/dd/yyy',
        time: '01:30 PM',
        is_read: true,
        type: 'accounts',
    },
    {
        id: '4',
        message: 'Get notifications for winding down, reflecting, and prepping for tomorrow.',
        date: 'mm/dd/yyy',
        time: '01:30 PM',
        is_read: true,
        type: 'updates',
    },
    {
        id: '5',
        message: 'Get notifications for winding down, reflecting, and prepping for tomorrow.',
        date: 'mm/dd/yyy',
        time: '01:30 PM',
        is_read: true,
        type: 'status',
    },
     {
        id: '6',
        message: 'Get notifications for winding down, reflecting, and prepping for tomorrow.',
        date: 'mm/dd/yyy',
        time: '01:30 PM',
        is_read: true,
        type: 'all',
    },
];

const useNotificationController = () => {
    const [selectedTab, setSelectedTab] = useState<string | number>(NOTIFICATION_TABS[0].value);
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    const filteredNotifications = useMemo(() => {
        if (selectedTab === 'all') return notifications;
        return notifications.filter(n => n.type === selectedTab);
    }, [notifications, selectedTab]);

    const toggleReadStatus = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => 
            n.id === id ? { ...n, is_read: !n.is_read } : n
        ));
    }, []);

    return {
        values: {
            tabs: NOTIFICATION_TABS,
            selectedTab,
            notifications: filteredNotifications,
        },
        functions: {
            setSelectedTab,
            toggleReadStatus,
        }
    };
};

export default useNotificationController;
