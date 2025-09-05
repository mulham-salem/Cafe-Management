<?php

namespace App\Http\Requests;

use App\UserRole;
use Illuminate\Foundation\Http\FormRequest;

class PromotionRequest extends FormRequest
{
    public function authorize(): bool
    {
        if (auth('manager')->check()) {
            return true;
        }
        if (auth('user')->check() && auth('user')->user()->role === UserRole::Employee->value) {
            return true;
        }
        return false;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'discount_percentage' => 'required|numeric|min:0|max:100',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'description' => 'nullable|string',
            'products' => 'required|array|min:1',
            'products.*.product_id' => 'required|integer|exists:menu_items,id',
            'products.*.quantity' => 'required|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'end_date.after' => 'End date cannot be before start date',
        ];
    }
}
