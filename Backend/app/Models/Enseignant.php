<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enseignant extends Model
{
    protected $table = 'enseignants';
    protected $fillable = ['user_id', 'nom', 'matiere', 'coefficient'];
    
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function classes()
    {
        return $this->belongsToMany(Classe::class, 'classe_enseignant');
    }
}