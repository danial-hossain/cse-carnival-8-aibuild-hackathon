<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'target_role',
        'actor_id',
        'actor_name',
        'actor_role',
        'type',
        'title',
        'message',
        'link',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    /**
     * Dispatch notification to target roles or user
     */
    public static function createNotification(
        ?string $targetRole,
        string $title,
        string $message,
        ?User $actor = null,
        string $type = 'update',
        ?string $link = null,
        ?int $userId = null
    ): self {
        return self::create([
            'user_id' => $userId,
            'target_role' => $targetRole,
            'actor_id' => $actor?->id,
            'actor_name' => $actor?->name ?? 'System',
            'actor_role' => $actor?->role ?? 'system',
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'link' => $link,
            'is_read' => false,
        ]);
    }
}

