<?php

use App\Http\Controllers\Admin\Auth\AdminAuthenticatedSessionController;
use App\Http\Controllers\Admin\Auth\AdminNewPasswordController;
use App\Http\Controllers\Admin\Auth\AdminPasswordResetLinkController;
use App\Http\Controllers\Admin\Auth\AdminRegisteredUserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware('guest:admin')->group(function () {
        Route::get('login', [AdminAuthenticatedSessionController::class, 'create'])
            ->name('login');

        Route::post('login', [AdminAuthenticatedSessionController::class, 'store'])
            ->name('login.store');

        Route::get('register', [AdminRegisteredUserController::class, 'create'])
            ->name('register');

        Route::post('register', [AdminRegisteredUserController::class, 'store'])
            ->name('register.store');

        Route::get('forgot-password', [AdminPasswordResetLinkController::class, 'create'])
            ->name('password.request');

        Route::post('forgot-password', [AdminPasswordResetLinkController::class, 'store'])
            ->name('password.email');

        Route::get('reset-password/{token}', [AdminNewPasswordController::class, 'create'])
            ->name('password.reset');

        Route::post('reset-password', [AdminNewPasswordController::class, 'store'])
            ->name('password.store');
    });

    Route::middleware('auth:admin')->group(function () {
        Route::post('logout', [AdminAuthenticatedSessionController::class, 'destroy'])
            ->name('logout');

        Route::get('dashboard', function () {
            return Inertia::render('admin/dashboard');
        })->name('dashboard');
    });
});
