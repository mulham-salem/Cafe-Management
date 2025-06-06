<?php

use App\Http\Controllers\ManagerAuthController;
use App\Http\Controllers\MenuManagementController;
use App\Http\Controllers\PromotionManagementController;
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

// .......................Manager Access ا...............................القصص يلي ما بيوصلا غير المدير ليطبق الشغلات الخاصة فيه
// middleware('throttle:3,1')->هاد مشان ما يمنعو يسجل دخول اذا حط كلمة السر خطا تلت مرات خطا او اليوزر نيم لمدة دقيقة
Route::post('/manager/login', [ManagerAuthController::class, 'login'])->middleware('throttle:3,1');
Route::middleware(['auth:manager', 'isManager'])->prefix('manager')->group(function () {
    Route::post('/logout', [ManagerAuthController::class, 'logout']);
    Route::post('/change-password', [ManagerAuthController::class, 'changePassword']);
    // molham alghali هاد الراوت بيشمل الميثودات الاربعة)(crud) وكتبنا لانو رح يكون عنا كتير راوترات
    Route::apiResource('/users', UserManagementController::class);
    Route::apiResource('/menuitem', MenuManagementController::class);
    Route::apiResource('/table', TableManagementController::class);
    Route::apiResource('/promotion', PromotionManagementController::class);

});
