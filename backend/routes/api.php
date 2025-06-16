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
use App\Http\Controllers\OrderManagementController;
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

    Route::apiResource('/supply', SupplyManagementController::class);
    Route::get('/suppliers', [SupplyManagementController::class, 'getSuppliers']);
    Route::post('/supply-offers/{id}/accept', [SupplyManagementController::class, 'acceptOffer']);
    Route::post('/supply-offers/{id}/reject', [SupplyManagementController::class, 'rejectOffer']);
    Route::post('/supply-purchase-bill', [SupplyManagementController::class, 'storePurchaseBill']);

    Route::get('/notifications', [NotificationManagementController::class, 'getAllManagerNotifications']);
    Route::patch('/notifications/{id}/seen', [NotificationManagementController::class, 'markAsSeen']);
});

// ......................................................Supplier Routes ......................................................

Route::middleware(['auth:sanctum', 'checkUserRole:supplier'])->prefix('user/supplier')->group(function () {

    Route::post('/offers', [SupplierController::class, 'store']);
    Route::get('/view-offers', [SupplierController::class, 'viewMyOffers']);

    //** supplier notification **//
    Route::get('/notifications', [NotificationManagementController::class, 'getAllSupplierNotifications']);
    Route::patch('/notifications/{id}/seen', [NotificationManagementController::class, 'markAsSeen']);
    Route::patch('/notifications/supply-requests/{id}/respond', [NotificationManagementController::class, 'respondToSupplyRequestNotification']);
});

// ....................................................customer Routes.....................................................

Route::middleware(['auth:sanctum', 'checkUserRole:customer'])->prefix('user/customer')->group(function () {

    Route::get('/table-reservation/available', [TableReservationController::class, 'indexAvailableTables']);
    Route::apiResource('/table-reservation', TableReservationController::class);

    Route::get('/menuitem', [OrderManagementController::class, 'fetchMenuItems']);
    Route::post('/orders/create', [OrderManagementController::class, 'createOrder']);
    Route::match(['get', 'put'], '/orders/{order}/edit', [OrderManagementController::class, 'editOrder']);

    Route::get('/myOrders', [OrderManagementController::class, 'getCustomerOrders']);
    Route::get('/myOrders/invoice/{id}', [OrderManagementController::class, 'viewOrderBill']);

    Route::delete('/orders/cancel/{id}', [OrderManagementController::class, 'cancelOrder']);
    Route::post('/orders/confirm/{id}', [OrderManagementController::class, 'confirmOrder']);

    //** customer notification **//
    Route::get('/notifications', [NotificationManagementController::class, 'getAllCustomerNotifications']);
    Route::patch('/notifications/{id}/seen', [NotificationManagementController::class, 'markAsSeen']);
});

// ......................................................Employee Routes ......................................................

Route::middleware(['auth:sanctum', 'checkUserRole:Employee'])->prefix('user/employee')->group(function () {

    Route::get('/menuitem', [OrderManagementController::class, 'fetchMenuItems']);
    Route::post('/orders/create', [OrderManagementController::class, 'createOrder']);
    Route::match(['get', 'put'], '/orders/{order}/edit', [OrderManagementController::class, 'editOrder']);

    Route::get('/myOrders', [OrderManagementController::class, 'getCustomerOrders']);
    Route::get('/myOrders/invoice/{id}', [OrderManagementController::class, 'viewOrderBill']);

    Route::get('/kitchen/orders', [OrderManagementController::class, 'getKitchenOrders']);
    Route::put('/kitchen/orders/{orderId}/status', [OrderManagementController::class, 'updateOrderStatus']);

    Route::get('/orders/search', [OrderManagementController::class, 'searchOrder']);
    Route::delete('/orders/cancel/{id}', [OrderManagementController::class, 'cancelOrder']);
    Route::post('/orders/confirm/{id}', [OrderManagementController::class, 'confirmOrder']);

    //** employee notification **//
    Route::get('/notifications', [NotificationManagementController::class, 'getAllCustomerNotifications']);
    Route::patch('/notifications/{id}/seen', [NotificationManagementController::class, 'markAsSeen']);
});
