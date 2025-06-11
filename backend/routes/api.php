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
use Illuminate\Support\Facades\Route;

// .......................User Routeesا.........................................................................................ه

Route::post('/user/login', [UserAuthController::class, 'login'])->middleware('throttle:3,1');
Route::middleware('auth:sanctum')->prefix('user')->group(function () {
    Route::post('/logout', [UserAuthController::class, 'logout']);
    Route::post('/change-password', [UserAuthController::class, 'changePassword']);
});

// .......................Manager Access ...........................................................................................
Route::post('/manager/login', [ManagerAuthController::class, 'login'])->middleware('throttle:3,1');
Route::middleware(['auth:manager', 'isManager'])->prefix('manager')->group(function () {
    Route::post('/logout', [ManagerAuthController::class, 'logout']);
    Route::post('/change-password', [ManagerAuthController::class, 'changePassword']);
    // molham alghali هاد الراوت بيشمل الميثودات الاربعة)(crud) وكتبنا لانو رح يكون عنا كتير راوترات
    Route::apiResource('/users', UserManagementController::class);
    Route::apiResource('/menuitem', MenuManagementController::class);
    Route::apiResource('/table', TableManagementController::class);
    Route::apiResource('/promotion', PromotionManagementController::class);
    Route::apiResource('/inventory', InventoryManagementController::class);
    Route::apiResource('/supply', SupplyManagementController::class);
    Route::post('/supply-offers/{id}/accept', [SupplyManagementController::class, 'acceptOffer']);
    Route::post('/supply-offers/{id}/reject', [SupplyManagementController::class, 'rejectOffer']);
    Route::post('/supply-purchace-bill', [SupplyManagementController::class, 'storePurchaseBill']);
    // notification
    Route::get('/notification', [NotificationManagementController::class, 'index']);//supplyOffersNotificatoin
        Route::get('/notification2', [NotificationManagementController::class, 'index5']);//getResponseFromSupplierForManagerSupplyRequests


});
// .......................Supplier Access ..........................................................................................
Route::middleware(['auth:sanctum', 'checkUserRole:supplier'])->group(function () {
    Route::post('/supplier/offers', [SupplierController::class, 'store']);
    Route::get('/supplier/view-offers', [SupplierController::class, 'viewMyOffers']);
    // notification
    Route::get('/supplier/notification1', [NotificationManagementController::class, 'index2']);//responseFromManagerForMyFuckingOffers!!
    Route::get('/supplier/notification2', [NotificationManagementController::class, 'index3']);//getSupplyRequestsForSupplier
    Route::get('/supplier/notification3/{id}', [NotificationManagementController::class, 'index4']);//respondToSupplyRequest

});

// Route::middleware(['auth:sanctum', 'checkUserRole:employee'])->group(function () {
//     Route::get('/employee/tasks', [EmployeeController::class, 'dashboard']);
// });

// Route::middleware(['auth:manager', 'isManager'])->group(function () {
//     Route::get('/manager/dashboard', [ManagerController::class, 'dashboard']);
// });
