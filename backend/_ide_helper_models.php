<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * @property int $id
 * @property int $order_id
 * @property string $total_amount
 * @property string $payment_method
 * @property string $date_issued
 * @property string $used_loyalty_points
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Order $order
 * @property-read \App\Models\PaymentTransaction|null $paymentTransaction
 * @method static \Database\Factories\BillFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereDateIssued($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill wherePaymentMethod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereTotalAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereUsedLoyaltyPoints($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperBill {}
}

namespace App\Models{
/**
 * @method static inRandomOrder()
 * @property int $id
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MenuItem> $menuItems
 * @property-read int|null $menu_items_count
 * @method static \Database\Factories\CategoryFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperCategory {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $customer_id
 * @property int|null $order_id
 * @property int|null $reservation_id
 * @property int|null $employee_id
 * @property string $status
 * @property string|null $notes
 * @property string $description
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Customer $customer
 * @property-read \App\Models\Employee|null $employee
 * @property-read \App\Models\Order|null $order
 * @property-read \App\Models\Reservation|null $reservation
 * @method static \Database\Factories\ComplaintFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Complaint newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Complaint newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Complaint query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Complaint whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Complaint whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Complaint whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Complaint whereEmployeeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Complaint whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Complaint whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Complaint whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Complaint whereReservationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Complaint whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Complaint whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperComplaint {}
}

namespace App\Models{
/**
 * @method static inRandomOrder()
 * @property int $id
 * @property string|null $phone_number
 * @property string|null $address
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Complaint> $complaint
 * @property-read int|null $complaint_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\FavoriteItem> $favoriteItem
 * @property-read int|null $favorite_item_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LoyalityAccount> $loyalityAccount
 * @property-read int|null $loyality_account_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Order> $orders
 * @property-read int|null $orders_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Reservation> $reservations
 * @property-read int|null $reservations_count
 * @property-read \App\Models\User $user
 * @method static \Database\Factories\CustomerFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer wherePhoneNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customer whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperCustomer {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $delivery_worker_id
 * @property int|null $order_id
 * @property string $status
 * @property string $cost
 * @property string $address
 * @property string $pickup_time
 * @property string $estimated_time
 * @property string|null $rating_score
 * @property string|null $rating_comment
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\DeliveryWorker $deliveryWorker
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LiveLocation> $liveLocation
 * @property-read int|null $live_location_count
 * @property-read \App\Models\Order|null $order
 * @method static \Database\Factories\DeliveryOrderFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DeliveryOrder newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DeliveryOrder newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DeliveryOrder query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DeliveryOrder whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DeliveryOrder whereCost($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DeliveryOrder whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DeliveryOrder whereDeliveryWorkerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DeliveryOrder whereEstimatedTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DeliveryOrder whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DeliveryOrder whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DeliveryOrder wherePickupTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DeliveryOrder whereRatingComment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DeliveryOrder whereRatingScore($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DeliveryOrder whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DeliveryOrder whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperDeliveryOrder {}
}

namespace App\Models{
/**
 * @property int $user_id
 * @property string $transport
 * @property string $license
 * @property string $status
 * @property string|null $rating
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\DeliveryOrder> $deliveryOrders
 * @property-read int|null $delivery_orders_count
 * @property-read \App\Models\User $user
 * @method static \Database\Factories\DeliveryWorkerFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DeliveryWorker newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DeliveryWorker newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DeliveryWorker query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DeliveryWorker whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DeliveryWorker whereLicense($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DeliveryWorker whereRating($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DeliveryWorker whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DeliveryWorker whereTransport($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DeliveryWorker whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DeliveryWorker whereUserId($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperDeliveryWorker {}
}

namespace App\Models{
/**
 * @property int $id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Complaint|null $complaint
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\OrderControl> $orderControl
 * @property-read int|null $order_control_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Order> $orders
 * @property-read int|null $orders_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Table> $tables
 * @property-read int|null $tables_count
 * @property-read \App\Models\User $user
 * @method static \Database\Factories\EmployeeFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperEmployee {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $customer_id
 * @property int $menu_item_id
 * @property string $added_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Customer $customer
 * @property-read \App\Models\MenuItem $menuItem
 * @method static \Database\Factories\FavoriteItemFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FavoriteItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FavoriteItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FavoriteItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FavoriteItem whereAddedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FavoriteItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FavoriteItem whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FavoriteItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FavoriteItem whereMenuItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FavoriteItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperFavoriteItem {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $type
 * @property string $start_date
 * @property string $end_date
 * @property array<array-key, mixed> $data
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Manager|null $manager
 * @method static \Database\Factories\FinanicalReportFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanicalReport newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanicalReport newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanicalReport query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanicalReport whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanicalReport whereData($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanicalReport whereEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanicalReport whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanicalReport whereStartDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanicalReport whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanicalReport whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperFinanicalReport {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $sender_id
 * @property int $receiver_id
 * @property string $subject
 * @property string $body
 * @property string $sender_name
 * @property string $receiver_name
 * @property string $sent_at
 * @property string|null $read_at
 * @property int $unread
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $userReceiver
 * @property-read \App\Models\User $userSender
 * @method static \Database\Factories\InternalMessageFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalMessage newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalMessage newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalMessage query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalMessage whereBody($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalMessage whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalMessage whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalMessage whereReadAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalMessage whereReceiverId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalMessage whereReceiverName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalMessage whereSenderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalMessage whereSenderName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalMessage whereSentAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalMessage whereSubject($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalMessage whereUnread($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InternalMessage whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperInternalMessage {}
}

namespace App\Models{
/**
 * @method static inRandomOrder()
 * @property int $quantity
 * @property $threshold_level
 * @property int $id
 * @property int $manager_id
 * @property int|null $purchaseBill_id
 * @property string $name
 * @property string $unit
 * @property string|null $note
 * @property string $expiry_date
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Manager $manager
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MenuInventoryItem> $menuInventoryItems
 * @property-read int|null $menu_inventory_items_count
 * @property-read \App\Models\PurchaseBill|null $purchaseBill
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SupplyOfferItem> $supplyOfferItems
 * @property-read int|null $supply_offer_items_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SupplyRequestItem> $supplyRequestItems
 * @property-read int|null $supply_request_items_count
 * @method static \Database\Factories\InventoryItemFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryItem whereExpiryDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryItem whereManagerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryItem whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryItem whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryItem wherePurchaseBillId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryItem whereThresholdLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryItem whereUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperInventoryItem {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $delivery_order_id
 * @property float $latitude
 * @property float $longitude
 * @property string|null $description
 * @property string $timestamp
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\DeliveryOrder $deliveryOrder
 * @method static \Database\Factories\LiveLocationFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LiveLocation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LiveLocation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LiveLocation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LiveLocation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LiveLocation whereDeliveryOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LiveLocation whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LiveLocation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LiveLocation whereLatitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LiveLocation whereLongitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LiveLocation whereTimestamp($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LiveLocation whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperLiveLocation {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $customer_id
 * @property string $points_balance
 * @property string $tier
 * @property string $last_update
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Customer $customer
 * @method static \Database\Factories\LoyalityAccountFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyalityAccount newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyalityAccount newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyalityAccount query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyalityAccount whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyalityAccount whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyalityAccount whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyalityAccount whereLastUpdate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyalityAccount wherePointsBalance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyalityAccount whereTier($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoyalityAccount whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperLoyalityAccount {}
}

namespace App\Models{
/**
 * @method static where(string $string, mixed $username)
 * @property int $id
 * @property string $username
 * @property string $password
 * @property string|null $name
 * @property string $email
 * @property string $role
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\FinanicalReport> $finanicalReport
 * @property-read int|null $finanical_report_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\InventoryItem> $inventoryItems
 * @property-read int|null $inventory_items_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MenuItem> $menuItems
 * @property-read int|null $menu_items_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Notification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Promotion> $promotions
 * @property-read int|null $promotions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PurchaseBill> $purchaseBills
 * @property-read int|null $purchase_bills_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SalesReport> $salesReport
 * @property-read int|null $sales_report_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SupplyRequest> $supplyRequests
 * @property-read int|null $supply_requests_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Database\Factories\ManagerFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Manager newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Manager newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Manager query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Manager whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Manager whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Manager whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Manager whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Manager wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Manager whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Manager whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Manager whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Manager whereUsername($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperManager {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $menuItem_id
 * @property int $inventoryItem_id
 * @property int $quantity_used
 * @property string $unit
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\InventoryItem|null $inventoryItem
 * @property-read \App\Models\MenuItem $menuItem
 * @method static \Database\Factories\MenuInventoryItemFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuInventoryItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuInventoryItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuInventoryItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuInventoryItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuInventoryItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuInventoryItem whereInventoryItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuInventoryItem whereMenuItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuInventoryItem whereQuantityUsed($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuInventoryItem whereUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuInventoryItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperMenuInventoryItem {}
}

namespace App\Models{
/**
 * @method static inRandomOrder()
 * @property int $id
 * @property int $category_id
 * @property int $manager_id
 * @property string $name
 * @property string|null $description
 * @property float $price
 * @property string|null $image_url
 * @property int $available
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Category $category
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\FavoriteItem> $favoriteItem
 * @property-read int|null $favorite_item_count
 * @property-read \App\Models\Manager $manager
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MenuInventoryItem> $menuInventoryItems
 * @property-read int|null $menu_inventory_items_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\OrderItem> $orderItems
 * @property-read int|null $order_items_count
 * @property-read \App\Models\Promotion|null $promotion
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PromotionMenuItem> $promotionMenuItems
 * @property-read int|null $promotion_menu_items_count
 * @method static \Database\Factories\MenuItemFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem whereAvailable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem whereCategoryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem whereImageUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem whereManagerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem wherePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperMenuItem {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $supplyRequest_id
 * @property int|null $manager_id
 * @property int|null $user_id
 * @property string $sent_by
 * @property string $purpose
 * @property string $message
 * @property \Illuminate\Support\Carbon $createdAt
 * @property int $seen
 * @property string|null $created_at
 * @property string|null $updated_at
 * @property-read \App\Models\Manager|null $manager
 * @property-read \App\Models\SupplyRequest|null $supplyRequest
 * @property-read \App\Models\User|null $user
 * @method static \Database\Factories\NotificationFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereManagerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereMessage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification wherePurpose($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereSeen($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereSentBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereSupplyRequestId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereUserId($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperNotification {}
}

namespace App\Models{
/**
 * @method static inRandomOrder()
 * @property int $id
 * @property int|null $customer_id
 * @property int|null $employee_id
 * @property string $createdAt
 * @property string $confirmedAt
 * @property string $status
 * @property string|null $note
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property int $onHold
 * @property string $pickup_method
 * @property string|null $pickup_time
 * @property string|null $rating_score
 * @property string|null $rating_comment
 * @property string|null $used_loyalty_points
 * @property int $repreparation_request
 * @property string|null $repreparation_reason
 * @property-read \App\Models\Bill|null $bill
 * @property-read \App\Models\Complaint|null $complaint
 * @property-read \App\Models\Customer|null $customer
 * @property-read \App\Models\DeliveryOrder|null $deliveryOrder
 * @property-read \App\Models\Employee|null $employee
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\OrderItem> $orderItems
 * @property-read int|null $order_items_count
 * @method static \Database\Factories\OrderFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereConfirmedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereEmployeeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereOnHold($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order wherePickupMethod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order wherePickupTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereRatingComment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereRatingScore($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereRepreparationReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereRepreparationRequest($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereUsedLoyaltyPoints($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperOrder {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $employee_id
 * @property string $status
 * @property string $timestamp
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Employee $employee
 * @method static \Database\Factories\OrderControlFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderControl newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderControl newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderControl query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderControl whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderControl whereEmployeeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderControl whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderControl whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderControl whereTimestamp($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderControl whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperOrderControl {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $order_id
 * @property int $menuItem_id
 * @property string $item_name
 * @property int $quantity
 * @property string $price
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\MenuItem $menuItem
 * @property-read \App\Models\Order $order
 * @method static \Database\Factories\OrderItemFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereItemName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereMenuItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem wherePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperOrderItem {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $bill_id
 * @property string $method
 * @property string $status
 * @property string $transaction_code
 * @property string $processed_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Bill $bill
 * @method static \Database\Factories\PaymentTransactionFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PaymentTransaction newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PaymentTransaction newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PaymentTransaction query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PaymentTransaction whereBillId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PaymentTransaction whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PaymentTransaction whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PaymentTransaction whereMethod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PaymentTransaction whereProcessedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PaymentTransaction whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PaymentTransaction whereTransactionCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PaymentTransaction whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperPaymentTransaction {}
}

namespace App\Models{
/**
 * @method static create(array $array)
 * @property int $id
 * @property int $user_id
 * @property string $permission
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Database\Factories\PermissionFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission wherePermission($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereUserId($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperPermission {}
}

namespace App\Models{
/**
 * @method static inRandomOrder()
 * @property int $id
 * @property int $manager_id
 * @property string $title
 * @property string $discount_percentage
 * @property string $start_date
 * @property string $end_date
 * @property string|null $description
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Manager $manager
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MenuItem> $menuItems
 * @property-read int|null $menu_items_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PromotionMenuItem> $promotionMenuItems
 * @property-read int|null $promotion_menu_items_count
 * @method static \Database\Factories\PromotionFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Promotion newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Promotion newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Promotion query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Promotion whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Promotion whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Promotion whereDiscountPercentage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Promotion whereEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Promotion whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Promotion whereManagerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Promotion whereStartDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Promotion whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Promotion whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperPromotion {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $promotion_id
 * @property int $menu_item_id
 * @property int $quantity
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\MenuItem $menuItem
 * @property-read \App\Models\Promotion $promotion
 * @method static \Database\Factories\PromotionMenuItemFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PromotionMenuItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PromotionMenuItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PromotionMenuItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PromotionMenuItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PromotionMenuItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PromotionMenuItem whereMenuItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PromotionMenuItem wherePromotionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PromotionMenuItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PromotionMenuItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperPromotionMenuItem {}
}

namespace App\Models{
/**
 * @method static inRandomOrder()
 * @property int $id
 * @property int $manager_id
 * @property int $supply_offer_id
 * @property int $supplier_id
 * @property string|null $unit_price
 * @property string $total_amount
 * @property string $purchase_date
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\InventoryItem> $inventoryItems
 * @property-read int|null $inventory_items_count
 * @property-read \App\Models\Manager $manager
 * @property-read \App\Models\Supplier $supplier
 * @property-read \App\Models\SupplyOffer $supplyOffer
 * @method static \Database\Factories\PurchaseBillFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseBill newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseBill newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseBill query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseBill whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseBill whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseBill whereManagerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseBill wherePurchaseDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseBill whereSupplierId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseBill whereSupplyOfferId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseBill whereTotalAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseBill whereUnitPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseBill whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperPurchaseBill {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $customer_id
 * @property int $table_id
 * @property string $reservation_time
 * @property int $numberOfGuests
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Complaint|null $complaint
 * @property-read \App\Models\Customer $customer
 * @property-read \App\Models\Table $table
 * @method static \Database\Factories\ReservationFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation whereNumberOfGuests($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation whereReservationTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation whereTableId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperReservation {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $type
 * @property string $start_date
 * @property string $end_date
 * @property array<array-key, mixed> $data
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Manager|null $manager
 * @method static \Database\Factories\SalesReportFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReport newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReport newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReport query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReport whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReport whereData($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReport whereEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReport whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReport whereStartDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReport whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReport whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperSalesReport {}
}

namespace App\Models{
/**
 * @method static inRandomOrder()
 * @property int $id
 * @property string|null $company_name
 * @property string|null $phone_number
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PurchaseBill> $purchaseBills
 * @property-read int|null $purchase_bills_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SupplyOffer> $supplyOffers
 * @property-read int|null $supply_offers_count
 * @property-read \App\Models\User $user
 * @method static \Database\Factories\SupplierFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier whereCompanyName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier wherePhoneNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperSupplier {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $supply_request_id
 * @property int $supply_offer_id
 * @property string $status
 * @property string $type
 * @property string $supply_date
 * @property string $item_name
 * @property int $item_quantity
 * @property string|null $reject_reason
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\SupplyOffer $supplyOfferHistory
 * @property-read \App\Models\SupplyRequest $supplyRequestHistory
 * @method static \Database\Factories\SupplyHistoryFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyHistory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyHistory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyHistory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyHistory whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyHistory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyHistory whereItemName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyHistory whereItemQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyHistory whereRejectReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyHistory whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyHistory whereSupplyDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyHistory whereSupplyOfferId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyHistory whereSupplyRequestId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyHistory whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyHistory whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperSupplyHistory {}
}

namespace App\Models{
/**
 * @method static inRandomOrder()
 * @property int $id
 * @property int $supplier_id
 * @property string $title
 * @property string $total_price
 * @property \Illuminate\Support\Carbon $delivery_date
 * @property string|null $note
 * @property string $status
 * @property string|null $reject_reason
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\PurchaseBill|null $purchaseBill
 * @property-read \App\Models\Supplier $supplier
 * @property-read \App\Models\SupplyHistory|null $supplyHistory
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SupplyOfferItem> $supplyOfferItems
 * @property-read int|null $supply_offer_items_count
 * @method static \Database\Factories\SupplyOfferFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOffer newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOffer newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOffer query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOffer whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOffer whereDeliveryDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOffer whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOffer whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOffer whereRejectReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOffer whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOffer whereSupplierId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOffer whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOffer whereTotalPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOffer whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperSupplyOffer {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $supply_offer_id
 * @property int|null $inventory_item_id
 * @property string|null $name
 * @property int $quantity
 * @property string $unit
 * @property string $unit_price
 * @property string $total_price
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\InventoryItem|null $inventoryItem
 * @property-read \App\Models\SupplyOffer $supplyOffer
 * @method static \Database\Factories\SupplyOfferItemFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOfferItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOfferItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOfferItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOfferItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOfferItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOfferItem whereInventoryItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOfferItem whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOfferItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOfferItem whereSupplyOfferId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOfferItem whereTotalPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOfferItem whereUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOfferItem whereUnitPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyOfferItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperSupplyOfferItem {}
}

namespace App\Models{
/**
 * @method static inRandomOrder()
 * @property int $id
 * @property int $manager_id
 * @property string|null $title
 * @property string $request_date
 * @property string|null $note
 * @property string $status
 * @property string|null $reject_reason
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Manager $manager
 * @property-read \App\Models\SupplyHistory|null $supplyHistory
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SupplyRequestItem> $supplyRequestItems
 * @property-read int|null $supply_request_items_count
 * @method static \Database\Factories\SupplyRequestFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyRequest newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyRequest newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyRequest query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyRequest whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyRequest whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyRequest whereManagerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyRequest whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyRequest whereRejectReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyRequest whereRequestDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyRequest whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyRequest whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyRequest whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperSupplyRequest {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $supplyRequest_id
 * @property int $inventory_item_id
 * @property int $quantity
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\InventoryItem $inventoryItem
 * @property-read \App\Models\SupplyRequest $supplyRequest
 * @method static \Database\Factories\SupplyRequestItemFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyRequestItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyRequestItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyRequestItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyRequestItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyRequestItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyRequestItem whereInventoryItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyRequestItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyRequestItem whereSupplyRequestId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupplyRequestItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperSupplyRequestItem {}
}

namespace App\Models{
/**
 * @method static inRandomOrder()
 * @method static where(string $string, string $string1)
 * @property int $id
 * @property int $number
 * @property int $capacity
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property int|null $employee_id
 * @property-read \App\Models\Employee|null $employee
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Reservation> $reservations
 * @property-read int|null $reservations_count
 * @method static \Database\Factories\TableFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Table newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Table newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Table query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Table whereCapacity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Table whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Table whereEmployeeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Table whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Table whereNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Table whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Table whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperTable {}
}

namespace App\Models{
/**
 * @method static whereDoesntHave(string $string)
 * @method static where(string $string, mixed $username)
 * @method static whereIn(string $string, string[] $array)
 * @property $role
 * @property $id
 * @property \Illuminate\Database\Eloquent\Collection|\App\Models\Permission[] $permissions
 * @property int $manager_id
 * @property string $full_name
 * @property string $username
 * @property string $email
 * @property string $password
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string $first_name
 * @property string|null $last_name
 * @property string|null $image_url
 * @property-read \App\Models\Customer|null $customer
 * @property-read \App\Models\DeliveryWorker|null $deliveryWorker
 * @property-read \App\Models\Employee|null $employee
 * @property-read \App\Models\Manager $manager
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Notification> $notifications
 * @property-read int|null $notifications_count
 * @property-read int|null $permissions_count
 * @property-read \App\Models\Supplier|null $supplier
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\InternalMessage> $userReceiver
 * @property-read int|null $user_receiver_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\InternalMessage> $userSender
 * @property-read int|null $user_sender_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereFirstName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereFullName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereImageUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereLastName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereManagerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUsername($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperUser {}
}

