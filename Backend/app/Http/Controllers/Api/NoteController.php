<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
public function index()
{
    $user = auth()->user();
    $enseignant = $user->enseignant;
    if ($enseignant) {
        // On filtre directement sur la matière de l'enseignant
        $notes = Note::with('etudiant')
                     ->where('matiere', $enseignant->matiere)
                     ->get();
    } else {
        $notes = Note::with('etudiant')->get();
    }
    return response()->json($notes);
}

    public function store(Request $request)
    {
        $request->validate([
            'etudiant_id' => 'required|exists:etudiants,id',
            'matiere' => 'required|string',
            'type_controle' => 'required|string|in:Contrôle 1,Contrôle 2,Contrôle 3',
            'note' => 'required|numeric|min:0|max:20',
        ]);

        $note = Note::create($request->all());
        return response()->json($note, 201);
    }

    public function show($id)
    {
        $note = Note::with('etudiant')->find($id);
        if (!$note) {
            return response()->json(['message' => 'Note non trouvée'], 404);
        }
        return response()->json($note);
    }

    public function update(Request $request, $id)
    {
        $note = Note::find($id);
        if (!$note) return response()->json(['message' => 'Note non trouvée'], 404);

        $request->validate([
            'etudiant_id' => 'sometimes|exists:etudiants,id',
            'matiere' => 'sometimes|string',
            'type_controle' => 'sometimes|string|in:Contrôle 1,Contrôle 2,Contrôle 3',
            'note' => 'sometimes|numeric|min:0|max:20',
        ]);

        $note->update($request->all());
        return response()->json($note);
    }

    public function destroy($id)
    {
        $note = Note::find($id);
        if (!$note) {
            return response()->json(['message' => 'Note non trouvée'], 404);
        }

        $note->delete();
        return response()->json(['message' => 'Note supprimée']);
    }

    public function getNotesByEtudiant($etudiantId)
    {
        try {
            $notes = Note::where('etudiant_id', $etudiantId)
                        ->get(['id', 'matiere', 'type_controle', 'note']); // ajout de type_controle
            return response()->json($notes);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getNotesByEtudiantAndMatiere($etudiantId)
    {
        $enseignant = auth()->user()->enseignant;
        if (!$enseignant) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $notes = Note::where('etudiant_id', $etudiantId)
                    ->where('matiere', $enseignant->matiere)
                    ->get(['id', 'matiere', 'type_controle', 'note']); // ajout de type_controle

        return response()->json($notes);
    }
    public function getAllNotesByEtudiant($etudiantId)
{
    $notes = Note::where('etudiant_id', $etudiantId)->get(['id', 'matiere', 'type_controle', 'note']);
    return response()->json($notes);
}
}