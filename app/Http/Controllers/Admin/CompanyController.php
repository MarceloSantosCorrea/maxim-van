<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Rules\Cnpj;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    /**
     * Display a listing of companies.
     */
    public function index(Request $request): Response
    {
        $perPageOptions = [10, 25, 50, 100];
        $perPage = (int) $request->integer('per_page', 10);
        if (! in_array($perPage, $perPageOptions, true)) {
            $perPage = 10;
        }

        $filters = [
            'search' => (string) $request->string('search')->trim(),
            'name' => (string) $request->string('name')->trim(),
            'cnpj' => (string) $request->string('cnpj')->trim(),
            'address' => (string) $request->string('address')->trim(),
            'is_active' => (string) $request->string('is_active')->trim(),
            'per_page' => $perPage,
        ];

        $companies = Company::query()
            ->when($filters['search'], function ($query, string $search) {
                $digits = preg_replace('/\D+/', '', $search);

                $query->where(function ($query) use ($search, $digits) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%");

                    if ($digits !== '') {
                        $query->orWhere('cnpj', 'like', "%{$digits}%");
                    }
                });
            })
            ->when($filters['name'], fn ($query, string $name) => $query->where('name', 'like', "%{$name}%"))
            ->when($filters['cnpj'], function ($query, string $cnpj) {
                $digits = preg_replace('/\D+/', '', $cnpj);

                if ($digits !== '') {
                    $query->where('cnpj', 'like', "%{$digits}%");
                }
            })
            ->when($filters['address'], fn ($query, string $address) => $query->where('address', 'like', "%{$address}%"))
            ->when(
                $filters['is_active'] === 'active',
                fn ($query) => $query->where('is_active', true),
            )
            ->when(
                $filters['is_active'] === 'inactive',
                fn ($query) => $query->where('is_active', false),
            )
            ->latest()
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Company $company) => [
                'id' => $company->id,
                'name' => $company->name,
                'cnpj' => $this->formatCnpj($company->cnpj),
                'address' => $company->address,
                'is_active' => $company->is_active,
                'created_at' => $company->created_at?->toIso8601String(),
                'updated_at' => $company->updated_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/companies/index', [
            'companies' => $companies,
            'filters' => $filters,
            'perPageOptions' => $perPageOptions,
        ]);
    }

    /**
     * Store a newly created company in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->merge([
            'cnpj' => $this->sanitizeCnpj($request->input('cnpj')),
            'is_active' => $request->boolean('is_active'),
        ]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'cnpj' => ['required', 'string', 'size:14', new Cnpj(), 'unique:companies,cnpj'],
            'address' => ['required', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ]);

        Company::create($validated);

        return back()->with('success', 'Empresa criada com sucesso.');
    }

    /**
     * Update the specified company in storage.
     */
    public function update(Request $request, Company $company): RedirectResponse
    {
        $request->merge([
            'cnpj' => $this->sanitizeCnpj($request->input('cnpj')),
            'is_active' => $request->boolean('is_active'),
        ]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'cnpj' => ['required', 'string', 'size:14', new Cnpj(), Rule::unique('companies', 'cnpj')->ignore($company->id)],
            'address' => ['required', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ]);

        $company->update($validated);

        return back()->with('success', 'Empresa atualizada com sucesso.');
    }

    /**
     * Remove the specified company from storage.
     */
    public function destroy(Company $company): RedirectResponse
    {
        $company->delete();

        return back()->with('success', 'Empresa removida com sucesso.');
    }

    protected function sanitizeCnpj(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        return preg_replace('/\D+/', '', $value);
    }

    protected function formatCnpj(?string $value): ?string
    {
        $digits = $this->sanitizeCnpj($value);

        if ($digits === null || strlen($digits) !== 14) {
            return $value;
        }

        return vsprintf('%s%s.%s%s%s.%s%s%s/%s%s%s%s-%s%s', str_split($digits));
    }
}
