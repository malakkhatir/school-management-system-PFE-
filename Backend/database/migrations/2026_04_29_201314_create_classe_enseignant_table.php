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
    Schema::create('classe_enseignant', function (Blueprint $table) {
        $table->id();
        $table->foreignId('classe_id')->constrained()->onDelete('cascade');
        $table->foreignId('enseignant_id')->constrained()->onDelete('cascade');
        $table->timestamps();
    });
}

public function down()
{
    Schema::dropIfExists('classe_enseignant');
}
};
