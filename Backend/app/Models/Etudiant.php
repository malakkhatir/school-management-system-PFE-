<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Etudiant extends Model
{
    protected $table = 'etudiants';
    protected $fillable = ['user_id', 'nom', 'prenom', 'date_naissance', 'classe_id'];
    
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function classe()
    {
        return $this->belongsTo(Classe::class, 'classe_id');
    }
    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    public function absences()
    {
        return $this->hasMany(Absence::class);
    }
}