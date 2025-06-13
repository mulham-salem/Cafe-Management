<?php

use App\Http\Controllers\ManagerAuthController;
use App\Http\Controllers\UserAuthController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\MenuManagementController;
use App\Http\Controllers\TableManagementController;
use App\Http\Controllers\InventoryManagementController;
use App\Http\Controllers\PromotionManagementController;
use App\Http\Controllers\NotificationManagementController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\SupplyManagementController;
use App\Http\Controllers\TableReservationController;
use Illuminate\Support\Facades\Route;

// .......................................................User Routes.........................................................

Route::post('/user/login', [UserAuthController::class, 'login'])->middleware('throttle:3,1');

Route::middleware('auth:sanctum')->prefix('user')->group(function () {
    Route::get('/profile', [UserAuthController::class, 'profile']);
    Route::post('/logout', [UserAuthController::class, 'logout']);
    Route::post('/change-password', [UserAuthController::class, 'changePassword']);
});

// ......................................................Manager Routes......................................................

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
    //I'm here now
    Route::apiResource('/supply', SupplyManagementController::class);
    Route::get('/suppliers', [SupplyManagementController::class, 'getSuppliers']);
    Route::post('/supply-offers/{id}/accept', [SupplyManagementController::class, 'acceptOffer']);
    Route::post('/supply-offers/{id}/reject', [SupplyManagementController::class, 'rejectOffer']);
    Route::post('/supply-purchase-bill', [SupplyManagementController::class, 'storePurchaseBill']);

    //** manager notification **//
    Route::get('/notifications/all', [NotificationManagementController::class, 'getAllManagerNotifications']);
    Route::get('/notifications/supplier-offers', [NotificationManagementController::class, 'getSupplierOfferNotifications']);
    Route::get('/notifications/supplier-responses', [NotificationManagementController::class, 'getSupplierResponseToRequests']);
});

// ......................................................Supplier Routes ......................................................

Route::middleware(['auth:sanctum', 'checkUserRole:supplier'])->group(function () {
    Route::post('/supplier/offers', [SupplierController::class, 'store']);
    Route::get('/supplier/view-offers', [SupplierController::class, 'viewMyOffers']);

    //** supplier notification **//
    Route::get('/supplier/notifications/offer-responses', [NotificationManagementController::class, 'getManagerResponseToSupplierOffers']);
    Route::get('/supplier/notifications/supplier-requests', [NotificationManagementController::class, 'getSupplyRequestSentToSupplier']);
    Route::get('/supplier/notifications/supply-requests/{id}/respond', [NotificationManagementController::class, 'respondToSupplyRequestNotification']);
});

// ....................................................customer Routes.....................................................

Route::middleware(['auth:sanctum', 'checkUserRole:customer'])->prefix('user/customer')->group(function () {
    Route::get('/table-reservation/available', [TableReservationController::class, 'indexAvailableTables']);
    Route::apiResource('/table-reservation', TableReservationController::class);
});

