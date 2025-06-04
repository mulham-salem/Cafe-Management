<?php

namespace App;

enum UserRole:string
{


    case Employee = 'employee';
    case Customer = 'customer';
    case Supplier = 'supplier';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

