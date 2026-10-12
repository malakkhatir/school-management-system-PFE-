<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EnseignantController;
use App\Http\Controllers\Api\EtudiantController;
use App\Http\Controllers\Api\NoteController;  
use App\Http\Controllers\Api\AbsenceController;
use App\Http\Controllers\Api\ClasseController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\AdministrateurController; 
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Enseignants
    Route::apiResource('/enseignants', EnseignantController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::get('/enseignants/{id}', [EnseignantController::class, 'show']); 
    Route::get('/enseignants/{id}/cours', [EnseignantController::class, 'cours']);

    // Étudiants
    Route::apiResource('/etudiants', EtudiantController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
    Route::get('/etudiants/{id}/notes', [NoteController::class, 'getNotesByEtudiant']);
    Route::get('/etudiants/{id}/absences', [AbsenceController::class, 'getAbsencesByEtudiant']);
    Route::get('/etudiants/{etudiantId}/notes/matiere', [NoteController::class, 'getNotesByEtudiantAndMatiere']);
    Route::get('/etudiants/{id}/all-notes', [NoteController::class, 'getAllNotesByEtudiant']);

    // Classes
    Route::apiResource('/classes', ClasseController::class);
    Route::put('/classes/{id}/assign-teacher', [ClasseController::class, 'assignTeacher']);

    // Notes et Absences 
    Route::apiResource('/notes', NoteController::class);
    Route::apiResource('/absences', AbsenceController::class);
    

    // Contacts (message du formulaire)
    Route::get('/contacts', [ContactController::class, 'index']);
    Route::post('/contacts', [ContactController::class, 'store']);  
    Route::delete('/contacts/{id}', [ContactController::class, 'destroy']);
    Route::post('/contacts', [ContactController::class, 'store']);

    // Administrateurs
    Route::apiResource('/administrateurs', AdministrateurController::class)->only(['index', 'store', 'update', 'destroy']);


    Route::get('/users/no-role', [UserController::class, 'noRole']);
    
});