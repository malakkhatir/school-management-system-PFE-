<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'name',  
        'email',
        'password',
    ];
    
    protected $hidden = [
        'password',
        'remember_token',
    ];
    // Relations
    public function administrateur()
    {
        return $this->hasOne(Administrateur::class, 'user_id');
    }
    
    public function enseignant()
    {
        return $this->hasOne(Enseignant::class, 'user_id');
    }
    
    public function etudiant()
    {
        return $this->hasOne(Etudiant::class, 'user_id');
    }
    
    // Méthodes utilitaires
    public function isAdministrateur()
    {
        return $this->administrateur()->exists();
    }
    
    public function isEnseignant()
    {
        return $this->enseignant()->exists();
    }
    
    public function isEtudiant()
    {
        return $this->etudiant()->exists();
    }
}