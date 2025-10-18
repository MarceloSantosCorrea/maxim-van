<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    /**
     * Show the user's password settings page.
     */
    public function edit(): Response
    {
        return Inertia::render('settings/password');
    }

    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();
        $isAdmin = $user instanceof Admin;
        $currentPasswordRule = $isAdmin ? 'current_password:admin' : 'current_password';

        $validated = $request->validate([
            'current_password' => ['required', $currentPasswordRule],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $user?->update([
            'password' => $validated['password'],
        ]);

        return back();
    }
}
