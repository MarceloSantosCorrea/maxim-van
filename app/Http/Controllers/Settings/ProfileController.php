<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\Admin;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = $request->user();
        $guard = $user instanceof Admin ? 'admin' : null;
        $currentPasswordRule = $guard !== null ? "current_password:{$guard}" : 'current_password';

        $request->validate([
            'password' => ['required', $currentPasswordRule],
        ]);

        if ($guard !== null) {
            Auth::guard($guard)->logout();
        } else {
            Auth::logout();
        }

        $user?->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return $guard !== null
            ? redirect()->route('admin.login')
            : redirect('/');
    }
}
