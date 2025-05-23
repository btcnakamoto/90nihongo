<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'email' => $this->email,
            'japanese_level' => $this->japanese_level,
            'avatar' => $this->avatar,
            'daily_study_minutes' => $this->daily_study_minutes,
            'study_start_date' => $this->study_start_date,
            'last_login_at' => $this->last_login_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            // 添加学习进度信息
            'learning_progress' => [
                'current_day' => $this->learningProgress?->current_day ?? 1,
                'total_study_minutes' => $this->learningProgress?->total_study_minutes ?? 0,
                'consecutive_days' => $this->learningProgress?->consecutive_days ?? 0,
            ],
        ];
    }
} 