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
        Schema::table('absences', function (Blueprint $table) {
            $table->foreignId('enseignant_id')->nullable()->constrained()->onDelete('set null');
            $table->integer('nb_heures')->default(1);
            $table->boolean('justifiee')->default(false);
        });
    }

    public function down()
    {
        Schema::table('absences', function (Blueprint $table) {
            $table->dropForeign(['enseignant_id']);
            $table->dropColumn(['enseignant_id', 'nb_heures', 'justifiee']);
        });
    }
};
