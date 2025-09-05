<?php

namespace App;

enum UserPermission: string
{
    case UserManagement = 'User Management';
    case MenuManagement = 'Menu Management';
    case TableManagement = 'Inventory Management';
    case InventorySupply = 'Supply Management';
    case PromotionManagement = 'Promotion Management';
    case ManagersNotifications = "Report Dashboard";

    case Default = 'Default';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
