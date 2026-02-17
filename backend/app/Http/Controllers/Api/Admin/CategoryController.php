<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = ProductCategory::query()->withCount('products');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active === 'true' || $request->is_active === '1');
        }

        $query->orderBy('sort_order', 'asc')->orderBy('name', 'asc');

        $categories = $query->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:product_categories,slug',
            'type' => 'required|string|in:PHYSICAL,VIRTUAL',
            'description' => 'nullable|string',
            'icon' => 'nullable|image|max:2048', // Allow image upload
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Handle Image Upload
        if ($request->hasFile('icon')) {
            $path = $request->file('icon')->store('categories', 'public');
            $validated['icon'] = $path;
        }

        $category = ProductCategory::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully',
            'data' => $category,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $category = ProductCategory::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $category,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $category = ProductCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('product_categories', 'slug')->ignore($category->id)],
            'type' => 'sometimes|required|string|in:PHYSICAL,VIRTUAL',
            'description' => 'nullable|string',
            'icon' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if (isset($validated['name']) && empty($validated['slug']) && $category->name !== $validated['name']) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        if ($request->hasFile('icon')) {
             // Ideally delete old icon here
            $path = $request->file('icon')->store('categories', 'public');
            $validated['icon'] = $path;
        }

        $category->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully',
            'data' => $category,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $category = ProductCategory::findOrFail($id);

        // Check for dependencies (products)
        if ($category->products()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category with associated products.',
            ], 400);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully',
        ]);
    }
}
