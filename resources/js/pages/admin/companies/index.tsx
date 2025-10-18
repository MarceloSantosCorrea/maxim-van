import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { type CheckedState } from '@radix-ui/react-checkbox';
import { ChevronsUpDown, Filter, MoreHorizontal, Plus, RefreshCw } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { type SharedData } from '@/types';

interface Company {
    id: number;
    name: string;
    cnpj: string;
    address: string;
    is_active: boolean;
    created_at?: string | null;
    updated_at?: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationMeta {
    current_page: number;
    from: number | null;
    last_page: number;
    links: PaginationLink[];
    path: string;
    per_page: number;
    to: number | null;
    total: number;
}

interface PaginatedCompanies {
    data: Company[];
    links: PaginationLink[];
    meta: PaginationMeta;
}

interface FiltersState {
    search: string;
    name: string;
    cnpj: string;
    address: string;
    is_active: string;
    per_page: number;
}

type QueryPayload = Record<string, string | number | boolean>;

interface PageProps extends SharedData {
    companies: PaginatedCompanies;
    filters: FiltersState;
    perPageOptions: number[];
}

function AdminCompanies() {
    const { companies, filters, perPageOptions } = usePage<PageProps>().props;

    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [advancedOpen, setAdvancedOpen] = useState(() =>
        Boolean(filters.name || filters.cnpj || filters.address || filters.is_active),
    );

    const [searchFilters, setSearchFilters] = useState<FiltersState>(filters);

    useEffect(() => {
        setSearchFilters(filters);
        setAdvancedOpen(Boolean(filters.name || filters.cnpj || filters.address || filters.is_active));
    }, [filters]);

    const createForm = useForm({
        name: '',
        cnpj: '',
        address: '',
        is_active: true,
    });

    const editForm = useForm({
        name: '',
        cnpj: '',
        address: '',
        is_active: true,
    });

    useEffect(() => {
        if (selectedCompany) {
            editForm.setData({
                name: selectedCompany.name,
                cnpj: selectedCompany.cnpj,
                address: selectedCompany.address,
                is_active: selectedCompany.is_active,
            });
        }
    }, [selectedCompany]);

    const handleFilterChange = (key: keyof FiltersState, value: string) => {
        setSearchFilters((previous) => ({
            ...previous,
            [key]: key === 'per_page' ? Number(value) : value,
        }));
    };

    const buildQueryFromFilters = (filtersState: FiltersState): QueryPayload => {
        const query: QueryPayload = {};

        (['search', 'name', 'cnpj', 'address', 'is_active'] as const).forEach((key) => {
            const value = filtersState[key];
            if (value && value !== 'all') {
                query[key] = value;
            }
        });

        query.per_page = filtersState.per_page;

        return query;
    };

    const submitFilters = (event?: FormEvent) => {
        event?.preventDefault();

        router.get('/admin/companies', buildQueryFromFilters(searchFilters), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        const nextState: FiltersState = {
            search: '',
            name: '',
            cnpj: '',
            address: '',
            is_active: '',
            per_page: searchFilters.per_page,
        };

        setSearchFilters(nextState);

        router.get('/admin/companies', { per_page: nextState.per_page }, {
            preserveScroll: true,
            replace: true,
        });
    };

    const closeCreate = () => {
        setCreateOpen(false);
        createForm.reset();
        createForm.clearErrors();
        createForm.setData('is_active', true);
    };

    const closeEdit = () => {
        setEditOpen(false);
        setSelectedCompany(null);
        editForm.reset();
        editForm.clearErrors();
    };

    const submitCreate = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        createForm.post('/admin/companies', {
            preserveScroll: true,
            onSuccess: () => {
                closeCreate();
            },
        });
    };

    const submitEdit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedCompany) {
            return;
        }

        editForm.put(`/admin/companies/${selectedCompany.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                closeEdit();
            },
        });
    };

    const handleDelete = (company: Company) => {
        if (!confirm(`Deseja realmente remover "${company.name}"?`)) {
            return;
        }

        router.delete(`/admin/companies/${company.id}`, {
            preserveScroll: true,
        });
    };

    const paginationLinks = useMemo(() => {
        if (companies.links && companies.links.length > 0) {
            return companies.links;
        }

        return companies.meta.links ?? [];
    }, [companies]);

    const breadcrumbItems = [
        { title: 'Admin Dashboard', href: '/admin/dashboard' },
        { title: 'Empresas', href: '/admin/companies' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbItems}>
            <Head title="Empresas" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <div className="flex flex-col gap-4 rounded-lg border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-xl font-semibold">Empresas</h1>
                            <p className="text-sm text-muted-foreground">
                                Gerencie os cadastros de empresas, incluindo informações de contato e status.
                            </p>
                        </div>
                        <Button onClick={() => setCreateOpen(true)} className="self-start md:self-auto">
                            <Plus className="mr-2 size-4" />
                            Nova empresa
                        </Button>
                    </div>

                    <form
                        onSubmit={submitFilters}
                        className="flex flex-col gap-4 rounded-lg border border-dashed border-border p-4"
                    >
                        <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="search">Busca rápida</Label>
                                <Input
                                    id="search"
                                    placeholder="Buscar por nome, CNPJ ou endereço"
                                    value={searchFilters.search}
                                    onChange={(event) => handleFilterChange('search', event.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="per_page">Itens por página</Label>
                                <Select
                                    value={String(searchFilters.per_page)}
                                    onValueChange={(value) => {
                                        const nextState = {
                                            ...searchFilters,
                                            per_page: Number(value),
                                        } as FiltersState;

                                        setSearchFilters(nextState);

                                        router.get('/admin/companies', buildQueryFromFilters(nextState), {
                                            preserveScroll: true,
                                            preserveState: true,
                                            replace: true,
                                        });
                                    }}
                                >
                                    <SelectTrigger id="per_page">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {perPageOptions.map((option) => (
                                            <SelectItem key={option} value={String(option)}>
                                                {option} por página
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                            <div className="flex flex-wrap items-center gap-2">
                                <CollapsibleTrigger asChild>
                                    <Button type="button" variant="outline" size="sm">
                                        <Filter className="mr-2 size-4" />
                                        Busca avançada
                                        <ChevronsUpDown className="ml-2 size-4" />
                                    </Button>
                                </CollapsibleTrigger>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetFilters}
                                    className="gap-2"
                                >
                                    <RefreshCw className="size-4" />
                                    Limpar filtros
                                </Button>
                                <div className="ml-auto flex gap-2">
                                    <Button type="submit">Aplicar filtros</Button>
                                </div>
                            </div>

                            <CollapsibleContent>
                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="name">Nome da empresa</Label>
                                        <Input
                                            id="name"
                                            placeholder="Nome"
                                            value={searchFilters.name}
                                            onChange={(event) => handleFilterChange('name', event.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="cnpj">CNPJ</Label>
                                        <Input
                                            id="cnpj"
                                            placeholder="00.000.000/0000-00"
                                            value={searchFilters.cnpj}
                                            onChange={(event) => handleFilterChange('cnpj', event.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="address">Endereço</Label>
                                        <Input
                                            id="address"
                                            placeholder="Rua, número, cidade"
                                            value={searchFilters.address}
                                            onChange={(event) => handleFilterChange('address', event.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            value={searchFilters.is_active || 'all'}
                                            onValueChange={(value) =>
                                                handleFilterChange('is_active', value === 'all' ? '' : value)
                                            }
                                        >
                                            <SelectTrigger id="status">
                                                <SelectValue placeholder="Todos" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos</SelectItem>
                                                <SelectItem value="active">Ativas</SelectItem>
                                                <SelectItem value="inactive">Inativas</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </form>
                </div>

                <div className="flex flex-col gap-4 rounded-lg border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>CNPJ</TableHead>
                                    <TableHead>Endereço</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-12 text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {companies.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                                            Nenhuma empresa encontrada com os filtros atuais.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    companies.data.map((company) => (
                                        <TableRow key={company.id}>
                                            <TableCell className="font-medium">{company.name}</TableCell>
                                            <TableCell>{company.cnpj}</TableCell>
                                            <TableCell>{company.address}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={company.is_active ? 'default' : 'secondary'}
                                                    className={
                                                        company.is_active
                                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                                                            : 'bg-muted text-muted-foreground'
                                                    }
                                                >
                                                    {company.is_active ? 'Ativa' : 'Inativa'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="size-4" />
                                                            <span className="sr-only">Abrir ações</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40">
                                                        <DropdownMenuItem
                                                            onSelect={(event) => {
                                                                event.preventDefault();
                                                                setSelectedCompany(company);
                                                                setEditOpen(true);
                                                            }}
                                                        >
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            onSelect={(event) => {
                                                                event.preventDefault();
                                                                handleDelete(company);
                                                            }}
                                                        >
                                                            Remover
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <p className="text-sm text-muted-foreground">
                            {companies.meta.total > 0 ? (
                                <>
                                    Mostrando <strong>{companies.meta.from}</strong> a{' '}
                                    <strong>{companies.meta.to}</strong> de <strong>{companies.meta.total}</strong> empresas
                                </>
                            ) : (
                                'Nenhum resultado encontrado'
                            )}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                            {paginationLinks.map((link, index) => {
                                const label = link.label.replace('&laquo;', '«').replace('&raquo;', '»');
                                return (
                                    <Button
                                        key={`${label}-${index}`}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) {
                                                router.get(link.url, {}, {
                                                    preserveScroll: true,
                                                    preserveState: true,
                                                });
                                            }
                                        }}
                                    >
                                        {label}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={createOpen} onOpenChange={(open) => (open ? setCreateOpen(true) : closeCreate())}>
                <DialogContent onInteractOutside={(event) => event.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Cadastrar empresa</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={submitCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-name">Nome</Label>
                            <Input
                                id="create-name"
                                name="name"
                                value={createForm.data.name}
                                onChange={(event) => createForm.setData('name', event.target.value)}
                                placeholder="Nome da empresa"
                                required
                            />
                            <InputError message={createForm.errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-cnpj">CNPJ</Label>
                            <Input
                                id="create-cnpj"
                                name="cnpj"
                                value={createForm.data.cnpj}
                                onChange={(event) => createForm.setData('cnpj', event.target.value)}
                                placeholder="00.000.000/0000-00"
                                required
                            />
                            <InputError message={createForm.errors.cnpj} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-address">Endereço</Label>
                            <Input
                                id="create-address"
                                name="address"
                                value={createForm.data.address}
                                onChange={(event) => createForm.setData('address', event.target.value)}
                                placeholder="Rua, número, cidade"
                                required
                            />
                            <InputError message={createForm.errors.address} />
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="create-is-active"
                                checked={createForm.data.is_active}
                                onCheckedChange={(checked: CheckedState) =>
                                    createForm.setData('is_active', checked === true)
                                }
                            />
                            <Label htmlFor="create-is-active">Empresa ativa</Label>
                        </div>
                        <InputError message={createForm.errors.is_active} />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeCreate}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                Salvar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={editOpen} onOpenChange={(open) => (open ? setEditOpen(true) : closeEdit())}>
                <DialogContent onInteractOutside={(event) => event.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Editar empresa</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={submitEdit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nome</Label>
                            <Input
                                id="edit-name"
                                name="name"
                                value={editForm.data.name}
                                onChange={(event) => editForm.setData('name', event.target.value)}
                                placeholder="Nome da empresa"
                                required
                            />
                            <InputError message={editForm.errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-cnpj">CNPJ</Label>
                            <Input
                                id="edit-cnpj"
                                name="cnpj"
                                value={editForm.data.cnpj}
                                onChange={(event) => editForm.setData('cnpj', event.target.value)}
                                placeholder="00.000.000/0000-00"
                                required
                            />
                            <InputError message={editForm.errors.cnpj} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-address">Endereço</Label>
                            <Input
                                id="edit-address"
                                name="address"
                                value={editForm.data.address}
                                onChange={(event) => editForm.setData('address', event.target.value)}
                                placeholder="Rua, número, cidade"
                                required
                            />
                            <InputError message={editForm.errors.address} />
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="edit-is-active"
                                checked={editForm.data.is_active}
                                onCheckedChange={(checked: CheckedState) =>
                                    editForm.setData('is_active', checked === true)
                                }
                            />
                            <Label htmlFor="edit-is-active">Empresa ativa</Label>
                        </div>
                        <InputError message={editForm.errors.is_active} />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeEdit}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                Atualizar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

export default AdminCompanies;
