<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Etudiant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class EtudiantController extends Controller
{
public function index(Request $request)
    {
        $query = Etudiant::with(['classe', 'user']);
        if ($request->has('classe_id')) {
            $query->where('classe_id', $request->classe_id);
        }
        $etudiants = $query->get();
        return response()->json($etudiants);
    }

    public function store(Request $request)
    {
        $data = $request->all();
        if (isset($data['date_naissance']) && $data['date_naissance'] === '') {
            $data['date_naissance'] = null;
        }

        $rules = [
            'user_id' => 'nullable|exists:users,id',
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'date_naissance' => 'nullable|date',
            'classe_id' => 'required|exists:classes,id',
            'email' => 'required_without:user_id|email|unique:users',
            'password' => 'required_without:user_id|min:6',
        ];

        $validator = Validator::make($data, $rules);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->filled('user_id')) {
            $user = User::find($request->user_id);
            if (!$user) return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        } else {
            $user = User::create([
                'name' => $request->nom . ' ' . $request->prenom,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);
        }

        $etudiant = Etudiant::create([
            'user_id' => $user->id,
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'date_naissance' => $data['date_naissance'],
            'classe_id' => $request->classe_id,
        ]);

        return response()->json($etudiant->load('user', 'classe'), 201);
    }
    public function show($id)
    {
        try {
            $etudiant = Etudiant::with(['classe', 'user'])->find($id);
            if (!$etudiant) {
                return response()->json(['message' => 'Étudiant non trouvé'], 404);
            }
            return response()->json([
                'id' => $etudiant->id,
                'nom' => $etudiant->nom,
                'prenom' => $etudiant->prenom,
                'date_naissance' => $etudiant->date_naissance,
                'classe' => $etudiant->classe ? ['nom' => $etudiant->classe->nom] : null,
                'user' => $etudiant->user ? ['email' => $etudiant->user->email] : null,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $etudiant = Etudiant::find($id);
        if (!$etudiant) {
            return response()->json(['message' => 'Étudiant non trouvé'], 404);
        }

        $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'date_naissance' => 'required|date',
            'email' => 'sometimes|email|unique:users,email,' . $etudiant->user_id,
            'classe_id' => 'required|exists:classes,id',
        ]);

        $etudiant->update([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'date_naissance' => $request->date_naissance,
            'classe_id' => $request->classe_id,
        ]);

        if ($request->has('email')) {
            $etudiant->user->update(['email' => $request->email]);
        }

        return response()->json($etudiant->load(['user', 'classe']));
    }

    public function destroy($id)
    {
        $etudiant = Etudiant::find($id);
        if (!$etudiant) {
            return response()->json(['message' => 'Étudiant non trouvé'], 404);
        }

        $etudiant->user->delete();
        $etudiant->delete();

        return response()->json(['message' => 'Étudiant supprimé']);
    }

    public function notes($id)
    {
        $etudiant = Etudiant::find($id);
        if (!$etudiant) {
            return response()->json(['message' => 'Étudiant non trouvé'], 404);
        }   
        $notes = $etudiant->notes()->get();
        return response()->json($notes);
    }

    public function absences($id)
    {
        $etudiant = Etudiant::find($id);
        if (!$etudiant) {
            return response()->json(['message' => 'Étudiant non trouvé'], 404);
        }
        $absences = $etudiant->absences()->get();
        return response()->json($absences);
    }
}