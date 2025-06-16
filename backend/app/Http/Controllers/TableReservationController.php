<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Reservation;
use App\Models\Table;
use DateTime;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class TableReservationController extends Controller
{
    /**
     * Display a listing of available tables.
     * This method corresponds to the filtering and display of available tables in the React component.
     *

     * @param Request $request
     * @return JsonResponse
     **/
    public function indexAvailableTables(Request $request): JsonResponse
    {
        // Get guest count from request for filtering capacity, default to 1 if not provided
        $guestCount = $request->input('guest_count', 1);

        // Fetch tables that are available and have sufficient capacity
        $availableTables = Table::where('status', 'available')
            ->where('capacity', '>=', $guestCount)
            ->get();

        return response()->json($availableTables, Response::HTTP_OK);
    }

    /**
     * Display a listing of the user's reservations.
     * This corresponds to the 'My Reservations' tab in the React component.
     *
     * @return JsonResponse
     **/
    public function index(): JsonResponse
    {
        // Assuming you have authentication and can get the customer_id of the logged-in user
        // For now, let's assume customer_id is passed or hardcoded for demonstration
        $customerId = auth('api')->id(); // Or however you retrieve the authenticated customer's ID


        if (!$customerId) {
            return response()->json(['message' => 'Customer not authenticated.'], Response::HTTP_UNAUTHORIZED);
        }

        $reservations = Reservation::where('customer_id', $customerId)
            ->with('table') // Eager load table details if needed in the frontend
            ->get();

        return response()->json($reservations, Response::HTTP_OK);
    }

    /**
     * Store a newly created reservation in storage.
     * This method handles the 'Confirm Reservation' functionality.
     *
     * @param Request $request
     * @return JsonResponse
     * @throws Exception
     **/
    public function store(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'customer_id' => 'exists:customers,id',
                'table_id' => 'required|exists:tables,id',
                'reservation_time' => 'required|date_format:Y-m-d\TH:i:s', // Or 'Y-m-d H:i:s' depending on frontend format
                'numberOfGuests' => 'required|integer|min:1',
            ]);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $reservationTime = new DateTime($validatedData['reservation_time']);

        // Check for table availability at the specified time
        $conflict = Reservation::where('table_id', $validatedData['table_id'])
            ->where('reservation_time', $reservationTime)
            ->where('status', 'active') // Assuming 'active' indicates a confirmed reservation
            ->first();

        if ($conflict) {
            return response()->json(['message' => 'Selected table is not available at this time.'], Response::HTTP_CONFLICT);
        }

        // Check if the selected table is 'available' in the tables table
        $table = Table::find($validatedData['table_id']);

        if (!$table || $table->status !== 'available' || $table->capacity < $validatedData['numberOfGuests']) {
            return response()->json(['message' => 'Selected table is not suitable or available.'], Response::HTTP_BAD_REQUEST);
        }

        $userId = auth('api')->id();
        // Create the reservation
        $reservation = Reservation::create([
            'customer_id' => $userId,
            'table_id' => $validatedData['table_id'],
            'reservation_time' => $reservationTime,
            'numberOfGuests' => $validatedData['numberOfGuests'],
            'status' => 'active', // Default status for new confirmed reservations
        ]);

        // Update the table status to 'reserved'
        $table->status = 'reserved';
        $table->save();

        // جلب اسم الطاولة للرسالة
        $tableNumber = $table->number;

        $notificationMessage = "Your reservation #{$reservation->id} has been confirmed.\n";
        $notificationMessage .= "Table: No#{$tableNumber}\n";
        $notificationMessage .= "Time: " . $reservation->reservation_time->format('Y-m-d H:i') . "\n";
        $notificationMessage .= "Guests: {$reservation->numberOfGuests}";

        Notification::create([
            'user_id' => $userId, // <--- اربطه بـ ID العميل الذي قام بالحجز
            'sent_by' => 'System',
            'purpose' => 'Reservation Confirmation',
            'message' => $notificationMessage,
            'createdAt' => now(), // وقت إنشاء الإشعار
            'seen' => false,
        ]);
        return response()->json($reservation, Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Reservation $reservation)
    {
        //
    }


    /**
     * Update the specified reservation in storage.
     * This method handles the 'Save Changes' functionality after editing.
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     * @throws Exception
     **/
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'table_id' => 'required|exists:tables,id',
                'reservation_time' => 'required|date_format:Y-m-d\TH:i:s',
                'numberOfGuests' => 'required|integer|min:1',
            ]);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json(['message' => 'Reservation not found.'], Response::HTTP_NOT_FOUND);
        }

        // Check for table availability at the specified time for the new table if changed
        if ($reservation->table_id != $validatedData['table_id'] || $reservation->reservation_time != $validatedData['reservation_time']) {
            $conflict = Reservation::where('table_id', $validatedData['table_id'])
                ->where('reservation_time', new DateTime($validatedData['reservation_time']))
                ->where('status', 'active')
                ->where('id', '!=', $id) // Exclude current reservation from conflict check
                ->first();

            if ($conflict) {
                return response()->json(['message' => 'Selected table is not available at this time.'], Response::HTTP_CONFLICT);
            }

            // If table is changed, update old table status to available
            if ($reservation->table_id != $validatedData['table_id']) {
                $oldTable = Table::find($reservation->table_id);
                if ($oldTable) {
                    $oldTable->status = 'available';
                    $oldTable->save();
                }

                // Check suitability of the new table
                $newTable = Table::find($validatedData['table_id']);
                if (!$newTable || $newTable->status !== 'available' && $newTable->id !== $reservation->table_id || $newTable->capacity < $validatedData['numberOfGuests']) {
                    return response()->json(['message' => 'New selected table is not suitable or available.'], Response::HTTP_BAD_REQUEST);
                }
                // Update new table status to reserved
                $newTable->status = 'reserved';
                $newTable->save();
            }
        }

        $reservation->update([
            'table_id' => $validatedData['table_id'],
            'reservation_time' => $validatedData['reservation_time'],
            'numberOfGuests' => $validatedData['numberOfGuests'],
        ]);

        return response()->json($reservation, Response::HTTP_OK);
    }

    /**
     * Remove the specified reservation from storage.
     * This method handles the 'Cancel Reservation' functionality.
     *

     * @param string $id
     * @return JsonResponse
     **/
    public function destroy(string $id): JsonResponse
    {
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json(['message' => 'Reservation not found.'], Response::HTTP_NOT_FOUND);
        }

        // Set the reservation status to 'canceled' instead of deleting if you want to keep a record
        // Or directly delete if a hard delete is preferred
        $reservation->delete();

        // Update the associated table's status back to 'available'
        $table = Table::find($reservation->table_id);
        if ($table) {
            $table->status = 'available';
            $table->save();
        }

        return response()->json(['message' => 'Reservation canceled successfully.'], Response::HTTP_NO_CONTENT);
    }
}
