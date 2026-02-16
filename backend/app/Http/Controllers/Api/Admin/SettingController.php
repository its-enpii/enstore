<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\SupabaseStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class SettingController extends Controller
{
    protected $supabaseStorage;

    public function __construct(SupabaseStorageService $supabaseStorage)
    {
        $this->supabaseStorage = $supabaseStorage;
    }

    /**
     * Get all settings
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = Setting::query();

            // Filter by group
            if ($request->has('group')) {
                $query->where('group', $request->group);
            }

            $settings = $query->orderBy('group')->orderBy('key')->get();

            // Group settings by group
            $grouped = $settings->groupBy('group');

            return response()->json([
                'success' => true,
                'data' => $grouped,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get settings: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get single setting
     *
     * @param  string  $key
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($key)
    {
        try {
            $setting = Setting::where('key', $key)->firstOrFail();

            return response()->json([
                'success' => true,
                'data' => $setting,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Setting not found',
            ], 404);
        }
    }

    /**
     * Create or update setting
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'key' => 'required|string|max:100',
            'value' => $request->hasFile('value') ? 'nullable' : 'required',
            'type' => 'required|in:string,number,boolean,json,image',
            'group' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'is_public' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $data = $validator->validated();

            // Handle File Upload for Branding (Logo)
            if ($data['key'] === 'site_logo' && $request->hasFile('value')) {
                // Delete old logo if exists
                $existing = Setting::where('key', 'site_logo')->first();
                if ($existing && $existing->value) {
                    try {
                        $this->supabaseStorage->delete($existing->value);
                    } catch (\Exception $e) {
                        // Continue even if delete fails
                    }
                }

                // Upload new logo
                $data['value'] = $this->supabaseStorage->upload('branding', $request->file('value'));
            } else {
                // Convert value based on type
                $data['value'] = $this->convertValue($data['value'], $data['type']);
            }

            $setting = Setting::updateOrCreate(
                ['key' => $data['key']],
                $data
            );

            // Clear cache
            Cache::forget('settings');
            Cache::forget('settings.'.$data['key']);

            return response()->json([
                'success' => true,
                'message' => 'Setting saved successfully',
                'data' => $setting,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save setting: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update multiple settings at once
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $updated = 0;

            foreach ($request->settings as $settingData) {
                $setting = Setting::where('key', $settingData['key'])->first();

                if ($setting) {
                    $value = $this->convertValue($settingData['value'], $setting->type);
                    $setting->update(['value' => $value]);
                    $updated++;
                }
            }

            // Clear cache
            Cache::forget('settings');

            return response()->json([
                'success' => true,
                'message' => "{$updated} settings updated successfully",
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete setting
     *
     * @param  string  $key
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($key)
    {
        try {
            $setting = Setting::where('key', $key)->firstOrFail();
            $setting->delete();

            // Clear cache
            Cache::forget('settings');
            Cache::forget('settings.'.$key);

            return response()->json([
                'success' => true,
                'message' => 'Setting deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete setting: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get profit margin settings
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProfitMargins()
    {
        try {
            $margins = Setting::where('group', 'profit_margin')->get();

            return response()->json([
                'success' => true,
                'data' => $margins,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get profit margins: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update profit margin settings
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProfitMargins(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'retail_margin' => 'required|numeric|min:0',
            'reseller_margin' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            Setting::updateOrCreate(
                ['key' => 'profit_margin.retail'],
                [
                    'value' => $request->retail_margin,
                    'type' => 'number',
                    'group' => 'profit_margin',
                    'description' => 'Profit margin for retail customers (%)',
                ]
            );

            Setting::updateOrCreate(
                ['key' => 'profit_margin.reseller'],
                [
                    'value' => $request->reseller_margin,
                    'type' => 'number',
                    'group' => 'profit_margin',
                    'description' => 'Profit margin for reseller customers (%)',
                ]
            );

            // Clear cache
            Cache::forget('settings');

            return response()->json([
                'success' => true,
                'message' => 'Profit margins updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profit margins: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Convert value based on type
     *
     * @param  mixed  $value
     * @param  string  $type
     * @return mixed
     */
    private function convertValue($value, $type)
    {
        return match ($type) {
            'number' => (float) $value,
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'json' => is_string($value) ? $value : json_encode($value),
            default => (string) $value,
        };
    }
}
