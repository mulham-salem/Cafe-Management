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
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\EmployeeController;
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

    //** manager notification **//
    Route::get('/notifications', [NotificationManagementController::class, 'getAllManagerNotifications']);
    Route::patch('/notifications/{id}/seen', [NotificationManagementController::class, 'markAsSeen']);
});

// ......................................................Supplier Routes ......................................................

Route::middleware(['auth:sanctum', 'checkUserRole:supplier'])->group(function () {

    Route::post('/supplier/offers', [SupplierController::class, 'store']);
    Route::get('/supplier/view-offers', [SupplierController::class, 'viewMyOffers']);

    //** supplier notification **//
    Route::get('/supplier/notifications', [NotificationManagementController::class, 'getAllSupplierNotifications']);
    Route::patch('/supplier/notifications/{id}/seen', [NotificationManagementController::class, 'markAsSeen']);
    Route::patch('/supplier/notifications/supply-requests/{id}/respond', [NotificationManagementController::class, 'respondToSupplyRequestNotification']);
});

// ....................................................customer Routes.....................................................

Route::middleware(['auth:sanctum', 'checkUserRole:customer'])->prefix('user/customer')->group(function () {

    Route::get('/table-reservation/available', [TableReservationController::class, 'indexAvailableTables']);
    Route::apiResource('/table-reservation', TableReservationController::class);
    Route::get('/menuItems', [CustomerController::class, 'index']); // get menuItems for view menu requirement.
    Route::post('/orders/create', [CustomerController::class, 'store']);
    Route::get('/myOrders', [CustomerController::class, 'index2']); // MyOrdersWithAllStatus .
    Route::get('/myOrders/invoice', [CustomerController::class, 'index3']); // show invoice when is delivered .
    Route::match(['get', 'put'], '/orders/{order}/edit', [CustomerController::class, 'editOrUpdateOrder']);
    Route::delete('/orders/create', [CustomerController::class, 'cancel']);
    Route::post('/orders/create', [CustomerController::class, 'confirm']);

    // ** notification **//

});

// ......................................................Employee Routes ......................................................

Route::middleware(['auth:sanctum', 'checkUserRole:Employee'])->prefix('user/employee')->group(function () {

    Route::get('/menuItems', [EmployeeController::class, 'index']); // get menuItems for view menu requirement.
    Route::post('/orders/create', [EmployeeController::class, 'store']);
    Route::get('/myOrders', [EmployeeController::class, 'index2']); // MyOrders.
    Route::get('/myOrders/invoice', [CustomerController::class, 'index3']); // show invoice when is delivered .
    Route::get('/kitchen/{id}', [EmployeeController::class, 'kitchen']); // with search feature
    Route::match(['get', 'put'], '/orders/{order}/edit', [EmployeeController::class, 'editOrUpdateOrder']);
    Route::delete('/orders/create', [EmployeeController::class, 'cancel']);
    Route::post('/orders/create', [EmployeeController::class, 'confirm']);

    // ** notification **//
});
