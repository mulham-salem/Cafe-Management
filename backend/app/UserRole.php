<?php

namespace App;

enum UserRole: string
{
    case Employee = 'employee';
    case Customer = 'customer';
    case Supplier = 'supplier';
    case DeliveryWorker = 'delivery_worker';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
