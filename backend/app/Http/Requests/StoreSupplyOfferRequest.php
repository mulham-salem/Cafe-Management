<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSupplyOfferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth('user')->check() && auth('user')->user()->role === 'supplier';
    }

    public function rules()
    {
        return [
            'title' => 'required|string|max:255',
            'delivery_date' => 'required|date',
            'note' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.name' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit' => 'required|string|max:50',
            'items.*.unit_price' => 'required|numeric|min:0',
        ];
    }
}
