import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { type SharedData, type User } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { KeyRound, LogOut, Palette, ShieldCheck, UserRound } from 'lucide-react';

interface UserMenuContentProps {
    user: User;
    logoutHref?: string;
}

export function UserMenuContent({ user, logoutHref }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const page = usePage<SharedData>();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    const fallbackLogoutHref = page.props.logoutRoute ?? logout();
    const href = logoutHref ?? fallbackLogoutHref;
    const normalizedLogoutHref = href.startsWith('/') ? href.slice(1) : href;
    const isAdminLogout =
        normalizedLogoutHref.startsWith('admin/') || normalizedLogoutHref.includes('/admin/');
    const baseSettingsPath = isAdminLogout ? '/admin/settings' : '/settings';
    const settingsItems = [
        {
            title: 'Profile',
            href: `${baseSettingsPath}/profile`,
            icon: UserRound,
        },
        {
            title: 'Password',
            href: `${baseSettingsPath}/password`,
            icon: KeyRound,
        },
        {
            title: 'Two-Factor Auth',
            href: `${baseSettingsPath}/two-factor`,
            icon: ShieldCheck,
        },
        {
            title: 'Appearance',
            href: `${baseSettingsPath}/appearance`,
            icon: Palette,
        },
    ];

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                {settingsItems.map(({ title, href: itemHref, icon: Icon }) => (
                    <DropdownMenuItem asChild key={itemHref}>
                        <Link
                            className="flex w-full items-center"
                            href={itemHref}
                            as="button"
                            prefetch
                            onClick={cleanup}
                        >
                            <Icon className="mr-2" />
                            {title}
                        </Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full"
                    href={href}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
