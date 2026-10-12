// app/Http/Controllers/Api/EtudiantController.php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Etudiant;
use Illuminate\Http\Request;

class EtudiantController extends Controller
{
    public function show($id)
    {
        $etudiant = Etudiant::with(['user', 'classe'])->find($id);
        if (!$etudiant) {
            return response()->json(['message' => 'Étudiant non trouvé'], 404);
        }
        return response()->json([
            'id' => $etudiant->id,
            'nom' => $etudiant->nom,
            'prenom' => $etudiant->prenom,
            'date_naissance' => $etudiant->date_naissance,
            'classe' => $etudiant->classe,
            'user' => $etudiant->user
        ]);
    }

    public function notes($id)
    {
        // À adapter selon votre table `notes`
        $notes = []; // Exemple vide
        return response()->json($notes);
    }

    public function absences($id)
    {
        // À adapter selon votre table `absences`
        $absences = []; // Exemple vide
        return response()->json($absences);
    }
}