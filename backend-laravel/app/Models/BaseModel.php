<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

abstract class BaseModel extends Model
{
    public function toArray()
    {
        return self::camelizeKeys(parent::toArray());
    }

    public static function camelizeKeys($data)
    {
        if (!is_array($data)) {
            return $data;
        }

        $result = [];
        foreach ($data as $key => $value) {
            // Keep keys like '+9647701234567' or numeric indices untouched
            if (is_numeric($key) || str_starts_with($key, '+')) {
                $camelKey = $key;
            } else {
                $camelKey = Str::camel($key);
            }
            $result[$camelKey] = is_array($value) ? self::camelizeKeys($value) : $value;
        }

        return $result;
    }
}

