<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SupabaseStorageService
{
    private string $disk = 'supabase';

    private string $supabaseUrl;

    private string $bucket;

    public function __construct()
    {
        $this->supabaseUrl = rtrim(config('services.supabase.url'), '/');
        $this->bucket = config('services.supabase.bucket', 'uploads');
    }

    /**
     * Upload a file to Supabase Storage via S3-compatible driver
     *
     * @param  string  $folder  Subfolder inside the bucket (e.g. 'products', 'avatars')
     * @param  UploadedFile  $file  The uploaded file
     * @return string The public URL of the uploaded file
     */
    public function upload(string $folder, UploadedFile $file): string
    {
        // Generate unique filename
        $extension = $file->getClientOriginalExtension();
        $filename = Str::uuid() . '.' . $extension;
        $filePath = trim($folder, '/') . '/' . $filename;

        // Upload via Laravel's Storage facade (S3 driver)
        Storage::disk($this->disk)->put($filePath, file_get_contents($file->getRealPath()), [
            'ContentType' => $file->getMimeType(),
            'visibility' => 'public',
        ]);

        return $this->getPublicUrl($filePath);
    }


    /**
     * Delete a file from Supabase Storage
     *
     * @param  string  $fileUrl  The full public URL of the file
     */
    public function delete(string $fileUrl): bool
    {
        $path = $this->parsePublicUrl($fileUrl);

        if (! $path) {
            Log::warning('Could not parse Supabase URL for deletion', ['url' => $fileUrl]);

            return false;
        }

        return Storage::disk($this->disk)->delete($path);
    }

    /**
     * Check if a file exists
     */
    public function exists(string $path): bool
    {
        return Storage::disk($this->disk)->exists($path);
    }

    /**
     * Get the public URL for a file
     */
    public function getPublicUrl(string $path): string
    {
        // Supabase public URL format:
        // https://{project-ref}.supabase.co/storage/v1/object/public/{bucket}/{path}
        return "{$this->supabaseUrl}/storage/v1/object/public/{$this->bucket}/{$path}";
    }

    /**
     * Parse a Supabase public URL to extract the file path
     */
    private function parsePublicUrl(string $url): ?string
    {
        // URL format: {supabase_url}/storage/v1/object/public/{bucket}/{path}
        $prefix = "{$this->supabaseUrl}/storage/v1/object/public/{$this->bucket}/";

        if (strpos($url, $prefix) === 0) {
            return substr($url, strlen($prefix));
        }

        return null;
    }
}
