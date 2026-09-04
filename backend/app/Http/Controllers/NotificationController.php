<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get real-time notifications relevant to the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get notifications targeted to:
        // 1. This specific user
        // 2. All users ('all')
        // 3. User's specific role ('student', 'teacher', 'admin')
        $notifications = Notification::where(function ($q) use ($user) {
            $q->where('user_id', $user->id)
              ->orWhere('target_role', 'all')
              ->orWhere('target_role', $user->role);
        })
        ->orderBy('created_at', 'desc')
        ->limit(30)
        ->get();

        $unreadCount = $notifications->where('is_read', false)->count();

        return response()->json([
            'unread_count' => $unreadCount,
            'notifications' => $notifications,
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $notification = Notification::find($id);

        if ($notification) {
            $notification->update(['is_read' => true]);
        }

        return response()->json(['message' => 'Notification marked as read']);
    }

    /**
     * Mark all notifications as read for current user/role.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();

        Notification::where(function ($q) use ($user) {
            $q->where('user_id', $user->id)
              ->orWhere('target_role', 'all')
              ->orWhere('target_role', $user->role);
        })->update(['is_read' => true]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    /**
     * Clear / Delete notifications.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $notification = Notification::find($id);
        if ($notification) {
            $notification->delete();
        }

        return response()->json(['message' => 'Notification removed']);
    }
}
