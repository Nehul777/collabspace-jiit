import { NotificationList } from '@/components/notifications/notification-list';

export default function NotificationsPage() {
  return (
    <div className="p-6 md:p-8 h-[calc(100vh-4rem)] overflow-y-auto">
      <NotificationList />
    </div>
  );
}
