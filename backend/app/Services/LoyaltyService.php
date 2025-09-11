<?php

namespace App\Services;

use App\Models\LoyaltyAccount;

class LoyaltyService
{
    /**
     * إضافة نقاط وتحديث المستوى (tier)
     */
    public function addPoints(int $customerId, float $points): LoyaltyAccount
    {
        $account = LoyaltyAccount::firstOrCreate(['customer_id' => $customerId]);

        // تحديث الرصيد
        $account->points_balance += $points;

        // تحديث المستوى بناءً على الرصيد
        $account->tier = $this->getTier($account->points_balance);

        $account->last_update = now();

        $account->save();

        return $account;
    }

    /**
     * حساب المستوى بناءً على النقاط
     */
    private function getTier(float $points): string
    {
        if ($points >= 1000) {
            return 'platinum';
        } elseif ($points >= 500) {
            return 'gold';
        } elseif ($points >= 100) {
            return 'silver';
        }
        return 'bronze';
    }
}
