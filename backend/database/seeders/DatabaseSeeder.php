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
            DeliveryWorkersSeeder::class,
            NotificationsTableSeeder::class,
            SuppliersTableSeeder::class,
            SupplyOffersTableSeeder::class,
            PurchaseBillsTableSeeder::class,
            OrdersTableSeeder::class,
            DeliveryOrderSeeder::class,
            TablesTableSeeder::class,
            ComplaintsTableSeeder::class,
            FinanicalReportsSeeder::class,
            SalesReportsSeeder::class,
            InternalMessagesSeeder::class,
            LiveLocationsSeeder::class,
            LoyalityAccountsSeeder::class,
            OrderControlSeeder::class,
            ReservationsTableSeeder::class,
            PromotionsTableSeeder::class,
            SupplyRequestsTableSeeder::class,
            BillsTableSeeder::class,
            PaymentTransactionsSeeder::class,
            MenuItemsTableSeeder::class,
            FavoriteItemsSeeder::class,
            OrderItemsTableSeeder::class,
            InventoryItemsTableSeeder::class,
            SupplyHistorySeeder::class,
            PermissionSeeder::class,
            MenuInventoryItemsTableSeeder::class,
            SupplyRequestItemsTableSeeder::class,
            SupplyOfferItemsTableSeeder::class,
            PromotionMenuItemsSeeder::class,
        ]);
    }
}
