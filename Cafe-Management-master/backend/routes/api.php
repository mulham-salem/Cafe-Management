<?php

use App\Http\Controllers\ManagerAuthController;
use App\Http\Controllers\MenuManagementController;
use App\Http\Controllers\UserAuthController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Route;









//.......................User Routeesا.........................................................................................ه


Route::post('/user/login', [UserAuthController::class, 'login'])->middleware('throttle:3,1');
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/user/logout', [UserAuthController::class, 'logout']);
    Route::post('/user/change-password', [UserAuthController::class, 'changePassword']);
});


//.......................Manager Access ا...............................القصص يلي ما بيوصلا غير المدير ليطبق الشغلات الخاصة فيه
// middleware('throttle:3,1')->هاد مشان ما يمنعو يسجل دخول اذا حط كلمة السر خطا تلت مرات خطا او اليوزر نيم لمدة دقيقة 
Route::post('/manager/login', [ManagerAuthController::class, 'login'])->middleware('throttle:3,1');
Route::middleware(['auth:manager', 'isManager'])->group(function () {
      Route::post('/logout', [ManagerAuthController::class, 'logout']);
      Route::post('/change-password', [ManagerAuthController::class, 'changePassword']);
      //molham alghali هاد الراوت بيشمل الميثودات الاربعة)(crud) وكتبنا لانو رح يكون عنا كتير راوترات 
      Route::apiResource('/users', UserManagementController::class);
      Route::apiResource('/menuitem', MenuManagementController::class);


});