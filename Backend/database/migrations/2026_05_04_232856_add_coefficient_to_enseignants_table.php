<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up()
    {
        Schema::table('enseignants', function (Blueprint $table) {
            $table->decimal('coefficient', 5, 2)->default(1)->after('matiere');
        });
    }

    public function down()
    {
        Schema::table('enseignants', function (Blueprint $table) {
            $table->dropColumn('coefficient');
        });
    }
};
