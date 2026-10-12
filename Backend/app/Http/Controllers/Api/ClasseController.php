<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classe;
use Illuminate\Http\Request;

class ClasseController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $enseignant = $user->enseignant;
        if ($enseignant) {
            // Enseignant : ses propres classes avec relation enseignants (si besoin)
            $classes = $enseignant->classes()->with('enseignants')->withCount('etudiants')->get();
        } else {
            // Administrateur : toutes les classes avec leurs enseignants
            $classes = Classe::with('enseignants')->withCount('etudiants')->get();
        }
        return response()->json($classes);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'niveau' => 'nullable|string|max:100',
            'enseignant_ids' => 'array|exists:enseignants,id', // liste facultative
        ]);

        $classe = Classe::create($request->only(['nom', 'niveau']));

        if ($request->has('enseignant_ids')) {
            $classe->enseignants()->sync($request->enseignant_ids);
        }

        return response()->json($classe->load('enseignants'), 201);
    }

    public function show($id)
    {
        $classe = Classe::with('etudiants')->find($id);
        if (!$classe) {
            return response()->json(['message' => 'Classe non trouvée'], 404);
        }
        return response()->json($classe);
    }

    public function update(Request $request, $id)
    {
        $classe = Classe::findOrFail($id);
        $classe->update($request->only(['nom', 'niveau']));

        if ($request->has('enseignant_ids')) {
            $classe->enseignants()->sync($request->enseignant_ids);
        }

        return response()->json($classe->load('enseignants'));
    }

    public function destroy($id)
    {
        $classe = Classe::find($id);
        if (!$classe) {
            return response()->json(['message' => 'Classe non trouvée'], 404);
        }

        $classe->delete();
        return response()->json(['message' => 'Classe supprimée']);
    }
    public function assignTeacher(Request $request, $id)
    {
        $classe = Classe::findOrFail($id);
        $request->validate([
            'enseignant_id' => 'required|exists:enseignants,id'
        ]);

        // Remplace l’ensemble des enseignants par celui-ci (une classe peut avoir plusieurs enseignants, mais pour simplifier on en affecte un seul)
        $classe->enseignants()->sync([$request->enseignant_id]);

        return response()->json($classe->load('enseignants'));
    }
}