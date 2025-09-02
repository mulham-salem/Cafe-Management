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
     **/
    public function indexAvailableTables(Request $request): JsonResponse
    {
        $guestCount = $request->input('guest_count', 1);

        $availableTables = Table::where('status', 'available')
            ->where('capacity', '>=', $guestCount)
            ->get();

        return response()->json($availableTables, Response::HTTP_OK);
    }

    /**
     * Display a listing of the user's reservations.
     * This corresponds to the 'My Reservations' tab in the React component.
     *
     **/
    public function index(): JsonResponse
    {
        $customerId = auth('api')->id();

        if (! $customerId) {
            return response()->json(['message' => 'Customer not authenticated.'], Response::HTTP_UNAUTHORIZED);
        }

        $reservations = Reservation::where('customer_id', $customerId)
            ->with('table')
            ->get();

        return response()->json($reservations, Response::HTTP_OK);
    }

    /**
     * Store a newly created reservation in storage.
     * This method handles the 'Confirm Reservation' functionality.
     *
     * @throws Exception
     **/
    public function store(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'customer_id' => 'exists:customers,id',
                'table_id' => 'required|exists:tables,id',
                'reservation_time' => 'required|date_format:Y-m-d\TH:i:s',
                'numberOfGuests' => 'required|integer|min:1',
            ]);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $reservationTime = new DateTime($validatedData['reservation_time']);

        $conflict = Reservation::where('table_id', $validatedData['table_id'])
            ->where('reservation_time', $reservationTime)
            ->where('status', 'active')
            ->first();

        if ($conflict) {
            return response()->json(['message' => 'Selected table is not available at this time.'], Response::HTTP_CONFLICT);
        }

        $table = Table::find($validatedData['table_id']);

        if (! $table || $table->status !== 'available' || $table->capacity < $validatedData['numberOfGuests']) {
            return response()->json(['message' => 'Selected table is not suitable or available.'], Response::HTTP_BAD_REQUEST);
        }

        $userId = auth('api')->id();

        $reservation = Reservation::create([
            'customer_id' => $userId,
            'table_id' => $validatedData['table_id'],
            'reservation_time' => $reservationTime,
            'numberOfGuests' => $validatedData['numberOfGuests'],
            'status' => 'active',
        ]);

        $table->status = 'reserved';
        $table->save();

        $tableNumber = $table->number;

        $notificationMessage = "Your reservation #{$reservation->id} has been confirmed.\n";
        $notificationMessage .= "Table: No#{$tableNumber}\n";
        $notificationMessage .= 'Time: '.$reservation->reservation_time->format('Y-m-d H:i')."\n";
        $notificationMessage .= "Guests: {$reservation->numberOfGuests}";

        Notification::create([
            'user_id' => $userId,
            'sent_by' => 'System',
            'purpose' => 'Reservation Confirmation',
            'message' => $notificationMessage,
            'createdAt' => now(),
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

        if (! $reservation) {
            return response()->json(['message' => 'Reservation not found.'], Response::HTTP_NOT_FOUND);
        }

        if ($reservation->table_id != $validatedData['table_id'] || $reservation->reservation_time != $validatedData['reservation_time']) {
            $conflict = Reservation::where('table_id', $validatedData['table_id'])
                ->where('reservation_time', new DateTime($validatedData['reservation_time']))
                ->where('status', 'active')
                ->where('id', '!=', $id)
                ->first();

            if ($conflict) {
                return response()->json(['message' => 'Selected table is not available at this time.'], Response::HTTP_CONFLICT);
            }

            if ($reservation->table_id != $validatedData['table_id']) {
                $oldTable = Table::find($reservation->table_id);
                if ($oldTable) {
                    $oldTable->status = 'available';
                    $oldTable->save();
                }

                $newTable = Table::find($validatedData['table_id']);
                if (! $newTable || $newTable->status !== 'available' && $newTable->id !== $reservation->table_id || $newTable->capacity < $validatedData['numberOfGuests']) {
                    return response()->json(['message' => 'New selected table is not suitable or available.'], Response::HTTP_BAD_REQUEST);
                }

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
     **/
    public function destroy(string $id): JsonResponse
    {
        $reservation = Reservation::find($id);

        if (! $reservation) {
            return response()->json(['message' => 'Reservation not found.'], Response::HTTP_NOT_FOUND);
        }

        $reservation->delete();

        $table = Table::find($reservation->table_id);
        if ($table) {
            $table->status = 'available';
            $table->save();
        }

        return response()->json(['message' => 'Reservation canceled successfully.'], Response::HTTP_NO_CONTENT);
    }
}
