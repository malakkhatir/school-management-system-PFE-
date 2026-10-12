<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absence;
use Illuminate\Http\Request;

class AbsenceController extends Controller
{

    public function index()
    {
        $user = auth()->user();
        $enseignant = $user->enseignant;
        if ($enseignant) {
            $absences = Absence::where('enseignant_id', $enseignant->id)->with('etudiant')->get();
        } else {
            $absences = Absence::with('etudiant')->get();
        }
        return response()->json($absences);
    }
    public function store(Request $request)
    {
        $request->validate([
            'etudiant_id' => 'required|exists:etudiants,id',
            'date' => 'required|date',
            'nb_heures' => 'required|numeric|min:0.5',
            'justifiee' => 'sometimes|boolean',
        ]);

        // L'enseignant_id est déduit de l'utilisateur connecté
        $enseignant = auth()->user()->enseignant;
        if (!$enseignant) {
            return response()->json(['message' => 'Enseignant non trouvé'], 403);
        }

        $absence = Absence::create([
            'etudiant_id' => $request->etudiant_id,
            'enseignant_id' => $enseignant->id,
            'date' => $request->date,
            'nb_heures' => $request->nb_heures,
            'justifiee' => $request->justifiee ?? false,
        ]);

        return response()->json($absence, 201);
    }

    public function show($id)
    {
        $absence = Absence::with(['etudiant', 'enseignant'])->find($id);
        if (!$absence) {
            return response()->json(['message' => 'Absence non trouvée'], 404);
        }
        return response()->json($absence);
    }

    public function update(Request $request, $id)
    {
        $absence = Absence::find($id);
        if (!$absence) {
            return response()->json(['message' => 'Absence non trouvée'], 404);
        }

        // Validation étendue pour inclure justifiee
        $request->validate([
            'date' => 'sometimes|date',
            'nb_heures' => 'sometimes|numeric|min:0.5',
            'justifiee' => 'sometimes|boolean',
        ]);

        // Mise à jour des champs reçus
        $absence->update($request->only(['date', 'nb_heures', 'justifiee']));

        return response()->json($absence->load(['etudiant', 'enseignant']));
    }
    public function destroy($id)
    {
        $absence = Absence::find($id);
        if (!$absence) {
            return response()->json(['message' => 'Absence non trouvée'], 404);
        }

        $absence->delete();
        return response()->json(['message' => 'Absence supprimée']);
    }

    public function getAbsencesByEtudiant($etudiantId)
    {
        try {
            $absences = Absence::where('etudiant_id', $etudiantId)
                ->with('enseignant') 
                ->get(['id', 'date', 'enseignant_id', 'nb_heures', 'justifiee']);
            return response()->json($absences);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}