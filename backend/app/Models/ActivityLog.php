<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'model_type',
        'model_id',
        'description',
        'ip_address',
        'user_agent',
        'meta_data',
    ];

    protected $casts = [
        'meta_data' => 'array',
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the user that performed the action
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the model that was acted upon (polymorphic)
     */
    public function model()
    {
        return $this->morphTo();
    }

    // ==================== HELPER METHODS ====================

    /**
     * Log an activity
     */
    public static function log($action, $description, $model = null, $metaData = null)
    {
        return static::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'model_type' => $model ? get_class($model) : null,
            'model_id' => $model ? $model->id : null,
            'description' => $description,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'meta_data' => $metaData,
        ]);
    }
}
