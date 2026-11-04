<?php

$src = new PDO('sqlite:c:/Users/zakar/BazMart/backend/prisma/dev.db');
$tables = $src->query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")->fetchAll(PDO::FETCH_COLUMN);
print_r($tables);

