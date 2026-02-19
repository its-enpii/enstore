<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Services\SupabaseStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BannerController extends Controller
{
  protected $storage;

  public function __construct(SupabaseStorageService $storage)
  {
    $this->storage = $storage;
  }

  public function index(Request $request)
  {
    try {
      $query = Banner::query();

      if ($request->filled('search')) {
        $query->where(function ($q) use ($request) {
          $q->where('title', 'like', '%' . $request->search . '%')
            ->orWhere('subtitle', 'like', '%' . $request->search . '%')
            ->orWhere('description', 'like', '%' . $request->search . '%');
        });
      }

      if ($request->filled('is_active')) {
        $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
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

  public function store(Request $request)
  {
    $validator = Validator::make($request->all(), [
      'title' => 'required|string|max:255',
      'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
      'link' => 'nullable|string|max:255',
      'subtitle' => 'nullable|string|max:255',
      'description' => 'nullable|string',
      'is_active' => 'boolean',
      'sort_order' => 'integer',
      'start_date' => 'nullable|date',
      'end_date' => 'nullable|date|after_or_equal:start_date',
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

      if ($request->hasFile('image')) {
        $path = $this->storage->upload('banners', $request->file('image'));
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

  public function show($id)
  {
    try {
      $banner = Banner::findOrFail($id);
      return response()->json(['success' => true, 'data' => $banner]);
    } catch (\Exception $e) {
      return response()->json(['success' => false, 'message' => 'Banner not found'], 404);
    }
  }

  public function update(Request $request, $id)
  {
    try {
      $banner = Banner::findOrFail($id);

      $validator = Validator::make($request->all(), [
        'title' => 'sometimes|required|string|max:255',
        'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        'link' => 'nullable|string|max:255',
        'subtitle' => 'nullable|string|max:255',
        'description' => 'nullable|string',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'start_date' => 'nullable|date',
        'end_date' => 'nullable|date|after_or_equal:start_date',
      ]);

      if ($validator->fails()) {
        return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
      }

      $data = $validator->validated();

      if ($request->hasFile('image')) {
        if ($banner->image) $this->storage->delete($banner->image);
        $data['image'] = $this->storage->upload('banners', $request->file('image'));
      }

      $banner->update($data);

      return response()->json(['success' => true, 'message' => 'Banner updated successfully', 'data' => $banner]);
    } catch (\Exception $e) {
      return response()->json(['success' => false, 'message' => 'Failed: ' . $e->getMessage()], 500);
    }
  }

  public function destroy($id)
  {
    try {
      $banner = Banner::findOrFail($id);
      if ($banner->image) $this->storage->delete($banner->image);
      $banner->delete();
      return response()->json(['success' => true, 'message' => 'Deleted']);
    } catch (\Exception $e) {
      return response()->json(['success' => false, 'message' => 'Failed'], 500);
    }
  }

  public function updateSortOrder(Request $request)
  {
    $request->validate(['orders' => 'required|array']);
    foreach ($request->orders as $order) {
      Banner::where('id', $order['id'])->update(['sort_order' => $order['sort_order']]);
    }
    return response()->json(['success' => true]);
  }
}
