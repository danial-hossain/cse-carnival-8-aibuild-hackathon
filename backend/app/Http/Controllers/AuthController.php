<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Authenticate user and issue Sanctum token.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        // Revoke previous tokens if any, or create a new token
        $token = $user->createToken('campus_os_auth_token', [$user->role])->plainTextToken;

        // Dispatch Role-based Login Notification
        // When Student or Teacher logs in, notify Admin & relevant faculties
        if ($user->role === 'student') {
            \App\Models\Notification::createNotification(
                'admin',
                'Student Logged In',
                "Student {$user->name} ({$user->email}) just logged into CampusOS.",
                $user,
                'login'
            );
        } elseif ($user->role === 'teacher') {
            \App\Models\Notification::createNotification(
                'admin',
                'Faculty Member Logged In',
                "Instructor {$user->name} ({$user->email}) is now active on CampusOS.",
                $user,
                'login'
            );
        } elseif ($user->role === 'admin') {
            \App\Models\Notification::createNotification(
                'teacher',
                'Administrator Active',
                "Campus Administrator {$user->name} is active on the system.",
                $user,
                'login'
            );
        }

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ]);
    }

    /**
     * Register a new student user.
     * Enforces student role strictly for public registration.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'student', // Strictly hardcoded to student for public registration
        ]);

        $token = $user->createToken('campus_os_auth_token', [$user->role])->plainTextToken;

        // Notify Admin and Teachers about new student registration
        \App\Models\Notification::createNotification(
            'admin',
            'New Student Registration',
            "{$user->name} ({$user->email}) has registered as a student on CampusOS.",
            $user,
            'create'
        );

        return response()->json([
            'message' => 'Registration successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ], 201);
    }

    /**
     * Get currently authenticated user profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ]);
    }

    /**
     * Log the user out (revoke current access token).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}
