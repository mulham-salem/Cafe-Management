<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            ManagersTableSeeder::class,
            UsersTableSeeder::class,
            CategoriesTableSeeder::class,
            EmployeesTableSeeder::class,
            CustomersTableSeeder::class,
            NotificationsTableSeeder::class,
            SuppliersTableSeeder::class,
            SupplyOffersTableSeeder::class,
            PurchaseBillsTableSeeder::class,
            OrdersTableSeeder::class,
            TablesTableSeeder::class,
            ReservationsTableSeeder::class,
            PromotionsTableSeeder::class,
            SupplyRequestsTableSeeder::class,
            BillsTableSeeder::class,
            MenuItemsTableSeeder::class,
            OrderItemsTableSeeder::class,
            InventoryItemsTableSeeder::class,
            MenuInventoryItemsTableSeeder::class,
            SupplyRequestItemsTableSeeder::class,
            SupplyOfferItemsTableSeeder::class,
            PermissionSeeder::class,
        ]);
    }
}
