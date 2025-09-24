<?php

use App\Http\Controllers\BillManagementController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\InventoryManagementController;
use App\Http\Controllers\ManagerAuthController;
use App\Http\Controllers\MenuManagementController;
use App\Http\Controllers\MenuSectionController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OrderManagementController;
use App\Http\Controllers\OrderPaymentController;
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

// ......................................................User Routes.........................................................

Route::post('/user/login', [UserAuthController::class, 'login'])->middleware('throttle:3,1');
Route::post('/user/reset-password-link', [UserAuthController::class, 'sendResetLink'])->middleware('throttle:3,1');
Route::post('/user/reset-password', [UserAuthController::class, 'resetPassword'])->middleware('throttle:3,1');

Route::middleware('auth:sanctum')->prefix('user')->group(function () {

    Route::get('/me', [UserAuthController::class, 'me']);
    Route::get('/profile', [UserAuthController::class, 'profile']);
    Route::post('/logout', [UserAuthController::class, 'logout']);
    Route::post('/change-password', [UserAuthController::class, 'changePassword']);

// .........................................................MyAccount...........................................................

    Route::get('/account', [UserAuthController::class, 'myAccount']);
    Route::put('/edit/account', [UserAuthController::class, 'updateMyAccount']);
    Route::post('/upload-avatar', [UserAuthController::class, 'uploadAvatar']);

// ..........................................................Messaging..............................................

    Route::get('/messages/contacts', [MessageController::class, 'contacts']);
    Route::get('/messages/thread/{contactName}', [MessageController::class, 'thread']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::post('/messages/mark-read', [MessageController::class, 'markRead']);
    Route::get('/current-user', [MessageController::class, 'currentUser']);

// ........................................................Notifications..............................................

    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);

});

// ......................................................Manager Routes......................................................

Route::post('/manager/login', [ManagerAuthController::class, 'login'])->middleware('throttle:3,1');

Route::middleware(['auth:manager', 'isManager'])->prefix('manager')->group(function () {

    Route::get('/profile', [ManagerAuthController::class, 'profile']);
    Route::post('/logout', [ManagerAuthController::class, 'logout']);
    Route::post('/change-password', [ManagerAuthController::class, 'changePassword']);

});

// ...........................if you gave new permission to a certain user he will pass from here ..............................

Route::prefix('admin')->group(function () {
    Route::apiResource('/users', UserManagementController::class)->middleware('CheckPermission:User Management');
    Route::apiResource('/menuitem', MenuManagementController::class)->middleware('CheckPermission:Menu Management');

    Route::middleware('CheckPermission:Supply Management')->group(function () {

        Route::apiResource('/supply', SupplyManagementController::class);
        Route::get('/suppliers', [SupplyManagementController::class, 'getSuppliers']);
        Route::post('/supply-offers/{id}/accept', [SupplyManagementController::class, 'acceptOffer']);
        Route::post('/supply-offers/{id}/reject', [SupplyManagementController::class, 'rejectOffer']);
        Route::get('/purchase-bills', [BillManagementController::class, 'fetchPurchaseBill']);
        Route::post('/supply-purchase-bill', [BillManagementController::class, 'storePurchaseBill']);
        Route::get('/supply-history', [supplyHistoryController::class, 'getManagerSupplyHistory']);

    });

    Route::apiResource('/inventory', InventoryManagementController::class)->middleware('CheckPermission:Inventory Management');
    Route::get('/notifications', [NotificationController::class, 'getAllManagerNotifications']);
    Route::patch('/notifications/{id}/seen', [NotificationController::class, 'markAsSeen']);
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
    Route::get('/supply-history', [supplyHistoryController::class, 'getSupplierSupplyHistory']);

    Route::get('/notifications', [NotificationController::class, 'getAllSupplierNotifications']);
    Route::patch('/notifications/{id}/seen', [NotificationController::class, 'markAsSeen']);
    Route::patch('/notifications/supply-requests/{id}/respond', [NotificationController::class, 'respondToSupplyRequestNotification']);

});

// ....................................................customer Routes.....................................................

Route::middleware(['auth:sanctum', 'checkUserRole:customer'])->prefix('user/customer')->group(function () {

    Route::get('/table-reservation/available', [TableReservationController::class, 'indexAvailableTables']);
    Route::apiResource('/table-reservation', TableReservationController::class);
    Route::apiResource('/table', TableManagementController::class);

    Route::get('/menuitem', [MenuSectionController::class, 'fetchMenuItems']);
    Route::get('/top-sales', [MenuSectionController::class, 'fetchTopSales']);
    Route::get('/promotions', [MenuSectionController::class, 'fetchPromotions']);
    Route::get('/promotions/latest', [MenuSectionController::class, 'latestPromotion']);

    Route::post('/orders/create', [OrderManagementController::class, 'createOrder']);
    Route::match(['get', 'put'], '/orders/{order}/edit', [OrderManagementController::class, 'editOrder']);
    Route::get('/myOrders', [OrderManagementController::class, 'getCustomerOrders']);
    Route::delete('/orders/cancel/{id}', [OrderManagementController::class, 'cancelOrder']);
    Route::post('/orders/confirm/{id}', [OrderManagementController::class, 'confirmOrder']);
    Route::post('{orderId}/suspend', [OrderManagementController::class, 'suspend']);
    Route::post('{orderId}/resume', [OrderManagementController::class, 'resume']);
    Route::post('/orders/re-prepare', [OrderManagementController::class, 'requestRePreparation']);
    Route::post('/orders/{order}/reorder', [OrderManagementController::class, 'reorderOrder']);
    Route::post('/orders/rate', [OrderManagementController::class, 'rateOrder']);

    Route::post('/orders/{order}/confirm-receipt', [DeliveryController::class, 'confirmReceipt']);

    Route::get('/myOrders/invoice/{id}', [OrderPaymentController::class, 'viewOrderBill']);
    Route::post('/loyalty/apply', [OrderPaymentController::class, 'applyPoints']);
    Route::post('/loyalty/preview-points', [OrderPaymentController::class, 'previewPoints']);
    Route::post('/orders/{orderId}/mark-paid', [OrderPaymentController::class, 'markPaid']);
    Route::post('/payments/charge', [OrderPaymentController::class, 'charge']);

    Route::post('/complaints', [OrderManagementController::class, 'storeComplaint']);

    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{menu_item_id}', [FavoriteController::class, 'destroy']);
    Route::get('/favorites', [FavoriteController::class, 'favorites']);

    Route::get('/notifications', [NotificationController::class, 'getAllCustomerNotifications']);
    Route::patch('/notifications/{id}/seen', [NotificationController::class, 'markAsSeen']);
});

// ......................................................Employee Routes ......................................................

Route::middleware(['auth:sanctum', 'checkUserRole:employee'])->prefix('user/employee')->group(function () {

    Route::apiResource('/table', TableManagementController::class);

    Route::get('/menuitem', [MenuSectionController::class, 'fetchMenuItems']);
    Route::get('/top-sales', [MenuSectionController::class, 'fetchTopSales']);
    Route::get('/promotions', [MenuSectionController::class, 'fetchPromotions']);

    Route::post('/orders/create', [OrderManagementController::class, 'createOrder']);
    Route::match(['get', 'put'], '/orders/{order}/edit', [OrderManagementController::class, 'editOrder']);

    Route::get('/customers/{order}/contact', [OrderManagementController::class, 'getContactInfo']);

    Route::post('{orderId}/suspend', [OrderManagementController::class, 'suspend']);
    Route::post('{orderId}/resume', [OrderManagementController::class, 'resume']);

    Route::get('/get-status', [OrderManagementController::class, 'getOrderControlStatus']);
    Route::post('/pause', [OrderManagementController::class, 'pauseOrders']);
    Route::post('/resume', [OrderManagementController::class, 'resumeOrders']);

    Route::get('/myOrders', [OrderManagementController::class, 'getCustomerOrders']);
    Route::get('/orders/search', [OrderManagementController::class, 'searchOrder']);
    Route::delete('/orders/cancel/{id}', [OrderManagementController::class, 'cancelOrder']);
    Route::post('/orders/confirm/{id}', [OrderManagementController::class, 'confirmOrder']);

    Route::get('/myOrders/invoice/{id}', [OrderPaymentController::class, 'viewOrderBill']);

    Route::get('/kitchen/orders', [OrderManagementController::class, 'getKitchenOrders']);
    Route::put('/kitchen/orders/{orderId}/status', [OrderManagementController::class, 'updateOrderStatus']);

    Route::get('/notifications', [NotificationController::class, 'getAllCustomerNotifications']);
    Route::patch('/notifications/{id}/seen', [NotificationController::class, 'markAsSeen']);

});

// ......................................................Delivery Routes ......................................................

Route::middleware(['auth:sanctum', 'checkUserRole:delivery_worker'])->prefix('user/delivery-worker')->group(function () {

    Route::get('/delivery-orders', [DeliveryController::class, 'index']);
    Route::patch('/delivery-orders/{id}', [DeliveryController::class, 'update']);
    Route::post('/orders/{id}/confirm-receipt', [DeliveryController::class, 'confirmDelivered']);
    Route::get('/delivery-orders/check-new', [DeliveryController::class, 'checkNewOrders']);

    Route::get('/notifications', [NotificationController::class, 'getAllCustomerNotifications']);
    Route::patch('/notifications/{id}/seen', [NotificationController::class, 'markAsSeen']);

});
