<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use App\Models\Enseignant;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;

class EnseignantController extends Controller
{
    public function store(Request $request)
    {
        $rules = [
            'user_id' => 'nullable|exists:users,id',
            'nom' => 'required|string',
            'prenom' => 'nullable|string',
            'email' => 'required_without:user_id|email|unique:users',
            'password' => 'required_without:user_id|min:6',
            'matiere' => 'required|string',
            'coefficient' => 'nullable|numeric|min:0.5|max:10', // Ajout du coefficient
        ];

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->filled('user_id')) {
            $user = User::find($request->user_id);
            if (!$user) return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        } else {
            $user = User::create([
                'name' => $request->nom . ' ' . ($request->prenom ?? ''),
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);
        }

        $enseignant = Enseignant::create([
            'user_id' => $user->id,
            'nom' => $request->nom,
            'matiere' => $request->matiere,
            'coefficient' => $request->coefficient ?? 1, // Valeur par défaut 1
        ]);

        return response()->json($enseignant->load('user'), 201);
    }

    public function show($id)
    {
        $enseignant = Enseignant::with('user')->find($id);
        if (!$enseignant) {
            return response()->json(['message' => 'Enseignant non trouvé'], 404);
        }
        return response()->json([
            'id' => $enseignant->id,
            'nom' => $enseignant->nom,
            'matiere' => $enseignant->matiere,
            'coefficient' => $enseignant->coefficient ?? 1, 
            'user' => $enseignant->user
        ]);
    }

public function index()
{
    $enseignants = Enseignant::with('user')->get();
    return response()->json($enseignants);
}

    public function cours($id)
    {
        $enseignant = Enseignant::find($id);
        if (!$enseignant) {
            return response()->json(['message' => 'Enseignant non trouvé'], 404);
        }
        // Retourner les cours de cet enseignant (à adapter)
        $cours = []; 
        return response()->json($cours);
    }

    public function update(Request $request, $id)
    {
        $enseignant = Enseignant::find($id);
        if (!$enseignant) return response()->json(['message' => 'Enseignant non trouvé'], 404);

        $request->validate([
            'nom' => 'sometimes|string',
            'email' => 'nullable|email|unique:users,email,' . $enseignant->user_id,
            'password' => 'nullable|min:6',
            'matiere' => 'sometimes|string',
            'coefficient' => 'nullable|numeric|min:0.5|max:10',
        ]);

        if ($request->has('nom')) $enseignant->nom = $request->nom;
        if ($request->has('matiere')) $enseignant->matiere = $request->matiere;
        if ($request->has('coefficient')) $enseignant->coefficient = $request->coefficient;
        $enseignant->save();

        $user = $enseignant->user;
        if ($request->has('nom')) {
            $user->name = $request->nom;
        }
        if ($request->has('email')) $user->email = $request->email;
        if ($request->filled('password')) $user->password = Hash::make($request->password);
        $user->save();

        return response()->json($enseignant->load('user'));
    }

    public function destroy($id)
    {
        $enseignant = Enseignant::find($id);
        if (!$enseignant) {
            return response()->json(['message' => 'Enseignant non trouvé'], 404);
        }
        $enseignant->user->delete();
        $enseignant->delete();
        return response()->json(['message' => 'Enseignant supprimé']);
    }
}