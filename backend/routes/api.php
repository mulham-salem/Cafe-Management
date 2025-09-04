<?php

use App\Http\Controllers\BillManagementController;
use App\Http\Controllers\InventoryManagementController;
use App\Http\Controllers\ManagerAuthController;
use App\Http\Controllers\MenuManagementController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationManagementController;
use App\Http\Controllers\OrderManagementController;
use App\Http\Controllers\PromotionManagementController;
use App\Http\Controllers\ReportDashboardController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\supplyHistoryController;
use App\Http\Controllers\SupplyManagementController;
use App\Http\Controllers\TableManagementController;
use App\Http\Controllers\TableReservationController;
use App\Http\Controllers\UserAuthController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Route;

// .......................................................User Routes.........................................................

Route::post('/user/login', [UserAuthController::class, 'login'])->middleware('throttle:3,1');
Route::post('/user/reset-password-link', [UserAuthController::class, 'sendResetLink'])->middleware('throttle:3,1');
Route::post('/user/reset-password', [UserAuthController::class, 'resetPassword'])->middleware('throttle:3,1');

Route::middleware('auth:sanctum')->prefix('user')->group(function () {
    Route::get('/me', [UserAuthController::class, 'me']);
    Route::get('/profile', [UserAuthController::class, 'profile']);
    Route::post('/logout', [UserAuthController::class, 'logout']);
    Route::post('/change-password', [UserAuthController::class, 'changePassword']);
    
  
});

// ......................................................Manager Routes......................................................

Route::post('/manager/login', [ManagerAuthController::class, 'login'])->middleware('throttle:3,1');

Route::middleware(['auth:manager', 'isManager'])->prefix('manager')->group(function () {
    // ......................................Messaging..............................................

//    Route::get('/messages/contacts', [MessageController::class, 'contacts']);
//     Route::get('/messages/thread/{contactName}', [MessageController::class, 'thread']);
//     Route::post('/messages', [MessageController::class, 'store']);
//     Route::post('/messages/mark-read', [MessageController::class, 'markRead']);

    // .................................................................................................
    Route::get('/profile', [ManagerAuthController::class, 'profile']);
    Route::post('/logout', [ManagerAuthController::class, 'logout']);
    Route::post('/change-password', [ManagerAuthController::class, 'changePassword']);

    Route::get('/purchase-bills', [BillManagementController::class, 'index']);

    Route::get('/notifications', [NotificationManagementController::class, 'getAllManagerNotifications']);
    Route::patch('/notifications/{id}/seen', [NotificationManagementController::class, 'markAsSeen']);
  // .................................MyAccount...........................................................
    Route::get('/account', [UserAuthController::class, 'myAccount']);
    Route::put('/edit/account', [UserAuthController::class, 'updateMyAccount']);
    Route::post('/upload-avatar', [UserAuthController::class, 'uploadAvatar']);
});



// ....................................................if you gave new permission to a certain user he will pass from here ..............................
Route::prefix('Admin')->group(function () {
    Route::apiResource('/users', UserManagementController::class)->middleware('CheckPermission:User Management');
    Route::apiResource('/menuitem', MenuManagementController::class)->middleware('CheckPermission:Menu Management');
    Route::middleware('CheckPermission:Supply Management')->group(function () {

        Route::apiResource('/supply', SupplyManagementController::class);
        Route::get('/suppliers', [SupplyManagementController::class, 'getSuppliers']);
        Route::post('/supply-offers/{id}/accept', [SupplyManagementController::class, 'acceptOffer']);
        Route::post('/supply-offers/{id}/reject', [SupplyManagementController::class, 'rejectOffer']);
        Route::post('/supply-purchase-bill', [SupplyManagementController::class, 'storePurchaseBill']);
        Route::get('/supply-history', [supplyHistoryController::class, 'managerIndex']);

    });
    Route::apiResource('/inventory', InventoryManagementController::class)->middleware('CheckPermission:Inventory Management');

    Route::apiResource('/promotion', PromotionManagementController::class)->middleware('CheckPermission:Promotion Management');
    Route::middleware(['CheckPermission:Report Dashboard'])->group(function () {
        Route::post('/reports/sales', [ReportDashboardController::class, 'salesReport']);
        Route::post('/reports/finance', [ReportDashboardController::class, 'financialReport']);
    });
});


// ......................................................Supplier Routes ......................................................

Route::middleware(['auth:sanctum', 'checkUserRole:supplier'])->prefix('user/supplier')->group(function () {

    Route::post('/offers', [SupplierController::class, 'store']);
    Route::get('/view-offers', [SupplierController::class, 'viewMyOffers']);
    Route::get('/supply-history', [supplyHistoryController::class, 'supplierIndex']);

    // ......................................Messaging..............................................

//    Route::get('/messages/contacts', [MessageController::class, 'contacts']);
//     Route::get('/messages/thread/{contactName}', [MessageController::class, 'thread']);
//     Route::post('/messages', [MessageController::class, 'store']);
//     Route::post('/messages/mark-read', [MessageController::class, 'markRead']);
    
    // .................................................................................................

    // ** supplier notification **//
    Route::get('/notifications', [NotificationManagementController::class, 'getAllSupplierNotifications']);
    Route::patch('/notifications/{id}/seen', [NotificationManagementController::class, 'markAsSeen']);
    Route::patch('/notifications/supply-requests/{id}/respond', [NotificationManagementController::class, 'respondToSupplyRequestNotification']);
       // .................................MyAccount...........................................................
    Route::get('/account', [UserAuthController::class, 'myAccount']);
    Route::put('/edit/account', [UserAuthController::class, 'updateMyAccount']);
    Route::post('/upload-avatar', [UserAuthController::class, 'uploadAvatar']);
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
    Route::get('/orders/short', [OrderManagementController::class, 'getCustomerOrdersShort']);

    // ** customer notification **//
    Route::get('/notifications', [NotificationManagementController::class, 'getAllCustomerNotifications']);
    Route::patch('/notifications/{id}/seen', [NotificationManagementController::class, 'markAsSeen']);
});

// ......................................................Employee Routes ......................................................

Route::middleware(['auth:sanctum', 'checkUserRole:employee'])->prefix('user/employee')->group(function () {

    Route::get('/menuitem', [OrderManagementController::class, 'fetchMenuItems']); // Done
    Route::post('/orders/create', [OrderManagementController::class, 'createOrder']); // Done
    Route::match(['get', 'put'], '/orders/{order}/edit', [OrderManagementController::class, 'editOrder']); // Done

    Route::get('/myOrders', [OrderManagementController::class, 'getCustomerOrders']); // Done
    Route::get('/myOrders/invoice/{id}', [OrderManagementController::class, 'viewOrderBill']); // Done

    Route::get('/kitchen/orders', [OrderManagementController::class, 'getKitchenOrders']);
    Route::put('/kitchen/orders/{orderId}/status', [OrderManagementController::class, 'updateOrderStatus']);

    Route::get('/orders/search', [OrderManagementController::class, 'searchOrder']);
    Route::delete('/orders/cancel/{id}', [OrderManagementController::class, 'cancelOrder']);
    Route::post('/orders/confirm/{id}', [OrderManagementController::class, 'confirmOrder']);
    Route::apiResource('/table', TableManagementController::class);

    // ** employee notification **//
    Route::get('/notifications', [NotificationManagementController::class, 'getAllCustomerNotifications']);
    Route::patch('/notifications/{id}/seen', [NotificationManagementController::class, 'markAsSeen']);
    // ......................................Messaging..............................................

//    Route::get('/messages/contacts', [MessageController::class, 'contacts']);
//     Route::get('/messages/thread/{contactName}', [MessageController::class, 'thread']);
//     Route::post('/messages', [MessageController::class, 'store']);
//     Route::post('/messages/mark-read', [MessageController::class, 'markRead']);
    
    // .................................................................................................
});
