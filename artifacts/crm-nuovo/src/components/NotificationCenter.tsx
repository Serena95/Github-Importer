import React from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Check, ExternalLink, Inbox } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface NotificationCenterProps {
  onDealClick: (dealId: string, structureSlug?: string) => void;
  isMobile?: boolean;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onDealClick, isMobile }) => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, init } = useNotificationStore();

  React.useEffect(() => {
    if (user?.uid) {
      const unsubscribe = init(user.uid);
      return () => unsubscribe();
    }
  }, [user?.uid, init]);

  const handleNotificationClick = (id: string, dealId: string, structureSlug?: string) => {
    markAsRead(id);
    onDealClick(dealId, structureSlug);
  };

  const renderNotificationItem = (notification: any) => (
    <div 
      key={notification.id}
      onClick={() => handleNotificationClick(notification.id, notification.dealId, notification.structureSlug)}
      className={cn(
        "p-4 cursor-pointer hover:bg-slate-50 transition-colors border-b last:border-0 flex gap-3 relative",
        !notification.read && "bg-blue-50/30"
      )}
    >
      {!notification.read && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full" />
      )}
      
      <Avatar className="h-10 w-10 shrink-0 border border-slate-100">
        <AvatarImage src={notification.createdBy.avatar} />
        <AvatarFallback className="bg-slate-100 text-slate-500 text-xs">
          {notification.createdBy.name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900 leading-tight">
            {notification.title}
          </p>
          <span className="text-[10px] text-slate-400 whitespace-nowrap pt-0.5">
            {notification.createdAt ? formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true, locale: it }) : 'Adesso'}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
          {notification.description}
        </p>
        <div className="flex items-center gap-1 mt-2 text-[10px] text-blue-600 font-medium bg-blue-50 w-fit px-1.5 py-0.5 rounded">
          <ExternalLink size={10} />
          <span className="truncate max-w-[150px] uppercase tracking-wider">{notification.dealTitle}</span>
        </div>
      </div>
    </div>
  );

  const emptyState = (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
        <Inbox size={32} />
      </div>
      <p className="text-sm font-medium text-slate-500">Nessuna notifica</p>
      <p className="text-xs text-slate-400 mt-1">Stai lavorando alla grande!</p>
    </div>
  );

  const bellIcon = (
    <div className="relative">
      <Bell className="h-5 w-5 text-slate-600 hover:text-blue-600 transition-colors" />
      {unreadCount > 0 && (
        <Badge 
          className="absolute -top-1.5 -right-1.5 h-4 min-w-4 p-0 items-center justify-center text-[10px] bg-red-500 hover:bg-red-600 border-2 border-white"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-10 w-10">
            {bellIcon}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[90%] sm:w-[400px] p-0 flex flex-col">
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-bold flex items-center gap-2">
                Notifiche
                {unreadCount > 0 && <Badge variant="secondary">{unreadCount}</Badge>}
              </SheetTitle>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => user?.uid && markAllAsRead(user.uid)}
                  className="text-xs text-blue-600 font-medium hover:text-blue-700 hover:bg-blue-50"
                >
                  Segna tutto come letto
                </Button>
              )}
            </div>
          </SheetHeader>
          <ScrollArea className="flex-1">
            {notifications.length > 0 ? (
              <div className="flex flex-col">
                {notifications.map(renderNotificationItem)}
              </div>
            ) : emptyState}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-blue-50">
          {bellIcon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden rounded-2xl shadow-xl border-slate-200">
        <DropdownMenuLabel className="p-4 bg-slate-50/50 border-b">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">Notifiche</span>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => user?.uid && markAllAsRead(user.uid)}
                className="h-auto p-0 text-[11px] text-blue-600 font-bold hover:text-blue-700 hover:bg-transparent"
              >
                Segna tutto come letto
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <ScrollArea className="max-h-[450px]">
          {notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map(renderNotificationItem)}
            </div>
          ) : emptyState}
        </ScrollArea>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="m-0" />
            <div className="p-2 bg-slate-50/30 text-center">
              <Button variant="ghost" size="sm" className="w-full text-xs text-slate-500 font-medium h-8">
                Vedi tutte le attività
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationCenter;
