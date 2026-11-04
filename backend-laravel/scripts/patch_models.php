<?php

$files = glob(__DIR__ . '/../app/Models/*.php');
foreach ($files as $f) {
    if (basename($f) === 'BaseModel.php' || basename($f) === 'User.php') continue;
    $content = file_get_contents($f);
    $content = str_replace('use Illuminate\Database\Eloquent\Model;', 'use App\Models\BaseModel;', $content);
    $content = preg_replace('/class (\w+) extends Model/', 'class $1 extends BaseModel', $content);
    file_put_contents($f, $content);
}
echo "All models successfully updated to extend BaseModel\n";

