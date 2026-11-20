import {Atlas,Hero} from '@/components/ecosystem/Atlas';
import {NotificationCenter} from '@/components/demo-notifications/Inbox';

export const metadata={title:'Центр демоуведомлений'};
export default function Page(){
  return <Atlas demo><Hero tag="Демо / Входящие" title="Центр уведомлений">Учебный почтовый ящик гостя. Аккаунт не нужен.</Hero><NotificationCenter/></Atlas>;
}
