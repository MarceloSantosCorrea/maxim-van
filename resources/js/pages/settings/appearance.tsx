import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Head, usePage } from '@inertiajs/react';

export default function Appearance() {
    const { url } = usePage();
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Configurações de aparência',
            href: url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configurações de aparência" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Configurações de aparência"
                        description="Atualize as preferências de aparência da sua conta"
                    />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
