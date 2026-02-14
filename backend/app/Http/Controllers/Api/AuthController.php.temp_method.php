/**
* Get authenticated user profile
*/
public function profile(Request $request): JsonResponse
{
try {
$user = $request->user();

return response()->json([
'success' => true,
'data' => [
'id' => $user->id,
'name' => $user->name,
'email' => $user->email,
'phone' => $user->phone,
'role' => $user->role,
'customer_type' => $user->customer_type,
'avatar' => $user->avatar,
'balance' => $user->balance,
'referral_code' => $user->referral_code,
'status' => $user->status,
'email_verified_at' => $user->email_verified_at,
'phone_verified_at' => $user->phone_verified_at,
],
]);
} catch (\Exception $e) {
return response()->json([
'success' => false,
'message' => 'Gagal mengambil profil',
'error' => $e->getMessage(),
], 500);
}
}