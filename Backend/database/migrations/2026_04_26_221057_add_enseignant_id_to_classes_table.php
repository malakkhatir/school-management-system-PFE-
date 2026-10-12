<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('classes', function (Blueprint $table) {
        $table->foreignId('enseignant_id')->nullable()->constrained('enseignants')->onDelete('set null');
    });
}

public function down()
{
    Schema::table('classes', function (Blueprint $table) {
        $table->dropForeign(['enseignant_id']);
        $table->dropColumn('enseignant_id');
    });
}
};
