<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'sujet' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $user = $request->user();
        $nom = $user ? $user->name : ($request->nom ?? 'Anonyme');
        $email = $user ? $user->email : ($request->email ?? 'non renseigné');

        $contact = Contact::create([
            'nom' => $nom,
            'email' => $email,
            'sujet' => $request->sujet,
            'message' => $request->message,
        ]);

        return response()->json(['message' => 'Message envoyé avec succès', 'contact' => $contact], 201);
    }
    public function index()
    {
        $contacts = Contact::orderBy('created_at', 'desc')->get();
        return response()->json($contacts);
    }

    public function destroy($id)
    {
        $contact = Contact::findOrFail($id);
        $contact->delete();
        return response()->json(['message' => 'Message supprimé']);
    }
}
