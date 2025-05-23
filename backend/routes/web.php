<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/login', [AuthController::class, 'showLoginForm'])->middleware('guest:web,manager')->name('login.form');

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:3,1')->name('login');

Route::get('/{any}/logout', [AuthController::class, 'logout'])->where('any', '.*')
    ->middleware('auth:web,manager')->name('logout');

Route::get('/customer', function () {
    return view('customer');
})->middleware(['auth:web', 'role:customer']);

Route::get('/employee', function () {
    return view('employee');
})->middleware(['auth:web', 'role:employee']);

Route::get('/supplier', function () {
    return view('supplier');
})->middleware(['auth:web', 'role:supplier']);

Route::get('/manager', function () {
    return view('manager');
})->middleware('auth:manager');


Route::middleware(['auth:web', 'role:customer'])->prefix('customer')->group(function () {
    Route::get('/change-password', [AuthController::class, 'showChangePasswordForm']);
    Route::post('/change-password', [AuthController::class, 'userChangePassword'])
        ->middleware('throttle:3,1')->name('customer.change-password');
});
Route::middleware(['auth:web', 'role:employee'])->prefix('employee')->group(function () {
    Route::get('/change-password', [AuthController::class, 'showChangePasswordForm']);
    Route::post('/change-password', [AuthController::class, 'userChangePassword'])
        ->middleware('throttle:3,1')->name('employee.change-password');
});
Route::middleware(['auth:web', 'role:supplier'])->prefix('supplier')->group(function () {
    Route::get('/change-password', [AuthController::class, 'showChangePasswordForm']);
    Route::post('/change-password', [AuthController::class, 'userChangePassword'])
        ->middleware('throttle:3,1')->name('supplier.change-password');
});
Route::middleware('auth:manager')->prefix('manager')->group(function () {
    Route::get('/change-password', [AuthController::class, 'showChangePasswordForm']);
    Route::post('/change-password', [AuthController::class, 'managerChangePassword'])
        ->middleware('throttle:3,1')->name('manager.change-password');
});



