<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function noRole()
    {
        $users = User::whereDoesntHave('etudiant')
            ->whereDoesntHave('enseignant')
            ->whereDoesntHave('administrateur')
            ->get(['id', 'name', 'email']);
        return response()->json($users);
    }
}