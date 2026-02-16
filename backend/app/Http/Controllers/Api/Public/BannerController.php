<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    /**
     * Get active banners.
     */
    public function index(Request $request)
    {
        try {
            $query = Banner::active();

            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }

            $banners = $query->orderBy('sort_order', 'asc')
                            ->orderBy('created_at', 'desc')
                            ->get();

            return response()->json([
                'success' => true,
                'data' => $banners,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get banners: ' . $e->getMessage(),
            ], 500);
        }
    }
}
