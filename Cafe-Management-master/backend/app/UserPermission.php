<?php

namespace App;

enum UserPermission: string
{
    case UserManagement = 'User Management';
    case MenuManagement = 'Menu Management';
    case TableManagement = 'Table Management';
    case InventorySupply = 'Inventory & Supply';
    case PromotionManagement = 'Promotion Management';
    case ManagersNotifications = "Manager's Notifications";
    case Default = 'Default';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
