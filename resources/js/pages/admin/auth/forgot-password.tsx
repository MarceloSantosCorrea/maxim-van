import AdminPasswordResetLinkController from '@/actions/App/Http/Controllers/Admin/Auth/AdminPasswordResetLinkController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { Form, Head } from '@inertiajs/react';

interface ForgotPasswordProps {
    status?: string;
}

export default function AdminForgotPassword({ status }: ForgotPasswordProps) {
    return (
        <AuthLayout
            title="Recuperar acesso de administrador"
            description="Informe o email para enviar um link de redefinição"
        >
            <Head title="Admin Forgot Password" />
            <Form {...AdminPasswordResetLinkController.store.form()} className="flex flex-col gap-6">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="admin@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                disabled={processing}
                                tabIndex={2}
                            >
                                {processing && <Spinner />}
                                Enviar link de redefinição
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Lembrou a senha?{' '}
                            <TextLink href="/admin/login" tabIndex={3}>
                                Voltar ao login
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
