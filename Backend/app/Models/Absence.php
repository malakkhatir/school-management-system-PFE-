<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Absence extends Model
{
    protected $table = 'absences';
    protected $fillable = ['date', 'etudiant_id', 'enseignant_id', 'nb_heures', 'justifiee'];

    protected $casts = [
        'date' => 'date',
        'justifiee' => 'boolean',
    ];

    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class);
    }

    public function enseignant()
    {
        return $this->belongsTo(Enseignant::class);
    }
}