<?php

use App\Http\Controllers\InventoryManagementController;
use App\Http\Controllers\ManagerAuthController;
use App\Http\Controllers\MenuManagementController;
use App\Http\Controllers\NotificationManagementController;
use App\Http\Controllers\PromotionManagementController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\SupplyManagementController;
use App\Http\Controllers\TableManagementController;
use App\Http\Controllers\UserAuthController;
use App\Http\Controllers\UserManagementController;
use App\Models\Notification;
use App\Http\Controllers\TableReservationController;
use Illuminate\Support\Facades\Route;

// .......................................................User Routes.........................................................

Route::post('/user/login', [UserAuthController::class, 'login'])->middleware('throttle:3,1');
Route::middleware('auth:sanctum')->prefix('user')->group(function () {
    Route::get('/profile', [UserAuthController::class, 'profile']);
    Route::post('/logout', [UserAuthController::class, 'logout']);
    Route::post('/change-password', [UserAuthController::class, 'changePassword']);
});

// ......................................................Manager Access......................................................

Route::post('/manager/login', [ManagerAuthController::class, 'login'])->middleware('throttle:3,1');
Route::middleware(['auth:manager', 'isManager'])->prefix('manager')->group(function () {
    Route::get('/profile', [ManagerAuthController::class, 'profile']);
    Route::post('/logout', [ManagerAuthController::class, 'logout']);
    Route::post('/change-password', [ManagerAuthController::class, 'changePassword']);

    Route::apiResource('/users', UserManagementController::class);
    Route::apiResource('/menuitem', MenuManagementController::class);
    Route::apiResource('/table', TableManagementController::class);
    Route::apiResource('/promotion', PromotionManagementController::class);
    Route::apiResource('/inventory', InventoryManagementController::class);
    Route::get('/notification', [NotificationManagementController::class, 'index']);
    Route::apiResource('/supply', SupplyManagementController::class);
    Route::post('/supply-offers/{id}/accept', [SupplyManagementController::class, 'acceptOffer']);
    Route::post('/supply-offers/{id}/reject', [SupplyManagementController::class, 'rejectOffer']);
    Route::post('/supply-purchase-bill', [SupplyManagementController::class, 'storePurchaseBill']);
});
// ......................................................Supplier Access ......................................................

Route::middleware(['auth:sanctum', 'checkUserRole:supplier'])->group(function () {
    Route::post('/supplier/offers', [SupplierController::class, 'store']);
    Route::get('/supplier/view-offers', [SupplierController::class, 'viewMyOffers']);
    Route::get('/supplier/notification', [Notification::class, '']);
});

// ......................................................customer Routes.....................................................

Route::middleware(['auth:sanctum', 'checkUserRole:customer'])->prefix('user/customer')->group(function () {
    Route::get('/table-reservation/available', [TableReservationController::class, 'indexAvailableTables']);
    Route::apiResource('/table-reservation', TableReservationController::class);
});

