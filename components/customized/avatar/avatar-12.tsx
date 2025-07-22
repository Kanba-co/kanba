import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarGroup, AvatarGroupItem, AvatarGroupTooltip } from '@/components/ui/avatar-group';

export default function LovedBy() {
  const AVATARS = [
    {
      src: 'https://avatars.githubusercontent.com/u/10678821?v=4',
      fallback: 'SH',
      name: 'Summer Hearts',
    },
    {
      src: 'https://avatars.githubusercontent.com/u/26098938?v=4',
      fallback: 'JG',
      name: 'John Garner',
    },
    {
      src: 'https://avatars.githubusercontent.com/u/1567626?v=4',
      fallback: 'KA',
      name: 'Karminski',
    },
    {
      src: 'https://avatars.githubusercontent.com/u/177061748?v=4',
      fallback: 'YA',
      name: 'Yassr Atti',
    },
    {
      src: 'https://avatars.githubusercontent.com/u/58935?v=4',
      fallback: 'AG',
      name: 'Alex Gutjahr',
    },
  ];

  return (
    <AvatarGroup tooltipClassName="">
      {AVATARS.map((avatar, index) => (
        <AvatarGroupItem key={index}>
          <Avatar className="w-10 h-10 rounded-full overflow-hidden border-4 border-background">
            <AvatarImage src={avatar.src} />
            <AvatarFallback>{avatar.fallback}</AvatarFallback>
          </Avatar>
          <AvatarGroupTooltip className="flex flex-col gap-0.5 text-center">
            <span className="text-sm font-semibold">{avatar.name}</span>
          </AvatarGroupTooltip>
        </AvatarGroupItem>
      ))}
      <AvatarGroupItem>
        <Avatar className="w-10 h-10 rounded-full overflow-hidden border-4 border-background bg-muted flex items-center justify-center">
          <AvatarFallback className="text-xs text-primary">+150</AvatarFallback>
        </Avatar>
        <AvatarGroupTooltip className="text-center text-xs">150+ more</AvatarGroupTooltip>
      </AvatarGroupItem>
    </AvatarGroup>
  );
}
