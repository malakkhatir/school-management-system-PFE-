<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Administrateur;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdministrateurController extends Controller
{
    public function index()
    {
        $admins = Administrateur::with('user')->get();
        return response()->json($admins);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'nom' => 'required_without:user_id|string',
            'prenom' => 'required_without:user_id|string',
            'email' => 'required_without:user_id|email|unique:users',
            'password' => 'required_without:user_id|min:6',
        ]);

        if ($request->filled('user_id')) {
            $user = User::find($request->user_id);
        } else {
            $user = User::create([
                'name' => $request->nom . ' ' . $request->prenom,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);
        }

        return Administrateur::create(['user_id' => $user->id]);
    }

    public function update(Request $request, $id)
    {
        $admin = Administrateur::findOrFail($id);
        $user = $admin->user;

        if ($request->has('nom') || $request->has('prenom')) {
            $user->name = trim(($request->nom ?? '') . ' ' . ($request->prenom ?? ''));
            $user->save();
        }
        if ($request->has('email')) {
            $user->email = $request->email;
            $user->save();
        }
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
            $user->save();
        }

        return response()->json($admin->load('user'));
    }

    public function destroy($id)
    {
        $admin = Administrateur::findOrFail($id);
        $admin->user->delete();
        $admin->delete();
        return response()->json(['message' => 'Administrateur supprimé']);
    }
}