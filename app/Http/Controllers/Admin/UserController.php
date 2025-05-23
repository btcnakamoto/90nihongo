            // 数据转换
            $users->getCollection()->transform(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'japanese_level' => $user->japanese_level,
                    'is_active' => $user->is_active,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                    'last_login_at' => $user->last_login_at ? $user->last_login_at->format('Y-m-d H:i:s') : null,
                    'study_start_date' => $user->study_start_date ? $user->study_start_date->format('Y-m-d') : null,
                    'daily_study_minutes' => $user->daily_study_minutes,
                    // 订阅信息
                    'subscription_type' => $user->subscription_type,
                    'subscription_expires_at' => $user->subscription_expires_at ? $user->subscription_expires_at->format('Y-m-d H:i:s') : null,
                    'total_spent' => $user->total_spent,
                    'is_premium' => $user->isPremium(),
                    'referral_code' => $user->referral_code,
                    'learning_progress' => [
                        'current_day' => $user->learningProgress->current_day ?? 1,
                        'total_study_minutes' => $user->learningProgress->total_study_minutes ?? 0,
                        'consecutive_days' => $user->learningProgress->consecutive_days ?? 0,
                        'listening_score' => $user->learningProgress->listening_score ?? 0,
                        'speaking_score' => $user->learningProgress->speaking_score ?? 0,
                        'vocabulary_score' => $user->learningProgress->vocabulary_score ?? 0,
                        'grammar_score' => $user->learningProgress->grammar_score ?? 0,
                    ],
                ];
            }); 