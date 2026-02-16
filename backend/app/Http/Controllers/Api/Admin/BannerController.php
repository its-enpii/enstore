<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Services\SupabaseStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Schema;

class BannerController extends Controller
{
    protected $storage;

    public function __construct(SupabaseStorageService $storage)
    {
        $this->storage = $storage;
    }

    /**
     * Display a listing of banners.
     */
    public function index(Request $request)
    {
        try {
            $query = Banner::query();

            // Simple filtering
            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }

            if ($request->filled('is_active')) {
                $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
            }

            if ($request->filled('search')) {
                $query->where('title', 'like', '%' . $request->search . '%');
            }

            $banners = $query->orderBy('sort_order', 'asc')
                            ->orderBy('created_at', 'desc')
                            ->paginate($request->get('per_page', 20));

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

    /**
     * Store a newly created banner.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'link' => 'nullable|string|max:255',
            'type' => 'required|in:slider,popup,promo,banner',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $data = $validator->validated();

            // Handle Image Upload
            if ($request->hasFile('image')) {
                $path = $this->storage->upload($request->file('image'), 'banners');
                $data['image'] = $path;
            }

            $banner = Banner::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Banner created successfully',
                'data' => $banner,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create banner: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified banner.
     */
    public function show($id)
    {
        try {
            $banner = Banner::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $banner,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Banner not found',
            ], 404);
        }
    }

    /**
     * Update the specified banner.
     */
    public function update(Request $request, $id)
    {
        try {
            $banner = Banner::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
                'link' => 'nullable|string|max:255',
                'type' => 'sometimes|required|in:slider,popup,promo,banner',
                'is_active' => 'boolean',
                'sort_order' => 'integer',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'description' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $data = $validator->validated();

            // Handle Image Update
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($banner->image) {
                    $this->storage->delete($banner->image);
                }
                $path = $this->storage->upload($request->file('image'), 'banners');
                $data['image'] = $path;
            }

            $banner->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Banner updated successfully',
                'data' => $banner,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update banner: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified banner.
     */
    public function destroy($id)
    {
        try {
            $banner = Banner::findOrFail($id);
            
            // Delete image from storage
            if ($banner->image) {
                $this->storage->delete($banner->image);
            }

            $banner->delete();

            return response()->json([
                'success' => true,
                'message' => 'Banner deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete banner: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update sort order for multiple banners.
     */
    public function updateSortOrder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'orders' => 'required|array',
            'orders.*.id' => 'required|exists:banners,id',
            'orders.*.sort_order' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            foreach ($request->orders as $order) {
                Banner::where('id', $order['id'])->update(['sort_order' => $order['sort_order']]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Sort order updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update sort order: ' . $e->getMessage(),
            ], 500);
        }
    }
}
