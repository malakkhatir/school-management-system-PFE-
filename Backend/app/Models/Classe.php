<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Classe extends Model
{
    protected $fillable = ['nom', 'niveau'];

    public function enseignants()
    {
        return $this->belongsToMany(Enseignant::class, 'classe_enseignant')
                    ->withTimestamps();
    }

    public function etudiants()
    {
        return $this->hasMany(Etudiant::class);
    }
}