<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Etudiant;
use App\Models\Enseignant;
use App\Models\Administrateur;
use Illuminate\Foundation\Auth\RegistersUsers;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Registered;

class RegisterController extends Controller
{
    use RegistersUsers;

    /**
     * Where to redirect users after registration.
     *
     * @var string
     */
    protected $redirectTo = '/home';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest');
    }

    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data)
    {
        return Validator::make($data, [
            'login' => ['required', 'string', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
            'role' => ['required', 'in:etudiant,enseignant,admin'],
            
            // Validation pour étudiant
            'nom' => ['required_if:role,etudiant', 'string', 'max:255'],
            'prenom' => ['required_if:role,etudiant', 'string', 'max:255'],
            'date_naissance' => ['required_if:role,etudiant', 'date'],
            'classe_id' => ['required_if:role,etudiant', 'exists:classes,id'],
            
            // Validation pour enseignant
            'nom_enseignant' => ['required_if:role,enseignant', 'string', 'max:255'],
            'matiere' => ['required_if:role,enseignant', 'string', 'max:255'],
        ]);
    }

    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array  $data
     * @return \App\Models\User
     */
    protected function create(array $data)
    {
        // Créer l'utilisateur de base
        $user = User::create([
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        // Créer l'entité selon le rôle
        switch ($data['role']) {
            case 'etudiant':
                Etudiant::create([
                    'user_id' => $user->id,
                    'nom' => $data['nom'],
                    'prenom' => $data['prenom'],
                    'date_naissance' => $data['date_naissance'],
                    'classe_id' => $data['classe_id'],
                ]);
                break;
                
            case 'enseignant':
                Enseignant::create([
                    'user_id' => $user->id,
                    'nom' => $data['nom_enseignant'],
                    'matiere' => $data['matiere'],
                ]);
                break;
                
            case 'admin':
                Administrateur::create([
                    'user_id' => $user->id,
                ]);
                break;
        }

        return $user;
    }

    /**
     * Handle a registration request for the application.
     * Personnaliser la redirection après inscription
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function register(Request $request)
    {
        $this->validator($request->all())->validate();

        event(new Registered($user = $this->create($request->all())));

        $this->guard()->login($user);

        // Rediriger selon le rôle
        if ($user->isAdministrateur()) {
            return redirect()->route('admin.dashboard');
        }
        
        if ($user->isEnseignant()) {
            return redirect()->route('enseignant.dashboard');
        }
        
        if ($user->isEtudiant()) {
            return redirect()->route('etudiant.dashboard');
        }

        return redirect($this->redirectPath());
    }

    /**
     * Show the application registration form.
     * Personnaliser le formulaire d'inscription
     *
     * @return \Illuminate\View\View
     */
    public function showRegistrationForm()
    {
        $classes = \App\Models\Classe::all();
        return view('auth.register', compact('classes'));
    }
}