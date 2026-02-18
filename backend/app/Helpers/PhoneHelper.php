<?php

namespace App\Helpers;

class PhoneHelper
{
    /**
     * Data mapping prefix HLR ke Provider.
     */
    public static array $providerMap = [
        // Telkomsel
        '0811' => ['name' => 'Telkomsel', 'code' => 'telkomsel'],
        '0812' => ['name' => 'Telkomsel', 'code' => 'telkomsel'],
        '0813' => ['name' => 'Telkomsel', 'code' => 'telkomsel'],
        '0821' => ['name' => 'Telkomsel', 'code' => 'telkomsel'],
        '0822' => ['name' => 'Telkomsel', 'code' => 'telkomsel'],
        '0823' => ['name' => 'Telkomsel', 'code' => 'telkomsel'],
        '0851' => ['name' => 'Telkomsel', 'code' => 'telkomsel'],
        '0852' => ['name' => 'Telkomsel', 'code' => 'telkomsel'],
        '0853' => ['name' => 'Telkomsel', 'code' => 'telkomsel'],

        // Indosat
        '0814' => ['name' => 'Indosat', 'code' => 'indosat'],
        '0815' => ['name' => 'Indosat', 'code' => 'indosat'],
        '0816' => ['name' => 'Indosat', 'code' => 'indosat'],
        '0855' => ['name' => 'Indosat', 'code' => 'indosat'],
        '0856' => ['name' => 'Indosat', 'code' => 'indosat'],
        '0857' => ['name' => 'Indosat', 'code' => 'indosat'],
        '0858' => ['name' => 'Indosat', 'code' => 'indosat'],

        // XL
        '0817' => ['name' => 'XL', 'code' => 'xl'],
        '0818' => ['name' => 'XL', 'code' => 'xl'],
        '0819' => ['name' => 'XL', 'code' => 'xl'],
        '0859' => ['name' => 'XL', 'code' => 'xl'],
        '0877' => ['name' => 'XL', 'code' => 'xl'],
        '0878' => ['name' => 'XL', 'code' => 'xl'],

        // Axis
        '0831' => ['name' => 'Axis', 'code' => 'axis'],
        '0832' => ['name' => 'Axis', 'code' => 'axis'],
        '0833' => ['name' => 'Axis', 'code' => 'axis'],
        '0838' => ['name' => 'Axis', 'code' => 'axis'],

        // Smartfren
        '0881' => ['name' => 'Smartfren', 'code' => 'smartfren'],
        '0882' => ['name' => 'Smartfren', 'code' => 'smartfren'],
        '0883' => ['name' => 'Smartfren', 'code' => 'smartfren'],
        '0884' => ['name' => 'Smartfren', 'code' => 'smartfren'],
        '0885' => ['name' => 'Smartfren', 'code' => 'smartfren'],
        '0886' => ['name' => 'Smartfren', 'code' => 'smartfren'],
        '0887' => ['name' => 'Smartfren', 'code' => 'smartfren'],
        '0888' => ['name' => 'Smartfren', 'code' => 'smartfren'],
        '0889' => ['name' => 'Smartfren', 'code' => 'smartfren'],

        // Three
        '0895' => ['name' => 'Tri', 'code' => 'three'],
        '0896' => ['name' => 'Tri', 'code' => 'three'],
        '0897' => ['name' => 'Tri', 'code' => 'three'],
        '0898' => ['name' => 'Tri', 'code' => 'three'],
        '0899' => ['name' => 'Tri', 'code' => 'three'],
    ];

    /**
     * Normalisasi nomor HP ke format 08...
     */
    public static function normalize(string $phone): string
    {
        $phone = preg_replace('/[^0-9+]/', '', $phone);
        
        if (str_starts_with($phone, '+62')) {
            return '0' . substr($phone, 3);
        } elseif (str_starts_with($phone, '62')) {
            return '0' . substr($phone, 2);
        }
        
        return $phone;
    }

    /**
     * Cari provider berdasarkan nomor HP.
     */
    public static function getProvider(string $phone): ?array
    {
        $normalized = self::normalize($phone);
        $prefix = substr($normalized, 0, 4);
        
        return self::$providerMap[$prefix] ?? null;
    }
}
