<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PromotionRequest extends FormRequest
{
    public function authorize(): bool
    {

        return auth('manager')->check();
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'discount_percentage' => 'required|numeric|min:0|max:100',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'description' => 'nullable|string',
            'product_names' => 'required|array',
            'product_names.*' => 'string|distinct|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'end_date.after' => 'End date connot be before start date',
        ];
    }
}
