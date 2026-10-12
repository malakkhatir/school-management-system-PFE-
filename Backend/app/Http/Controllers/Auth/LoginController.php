<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class LoginController extends Controller
{
    use AuthenticatesUsers;

    /**
     * Where to redirect users after login.
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
        $this->middleware('guest')->except('logout');
        $this->middleware('auth')->only('logout');
    }

    /**
     * The user has been authenticated.
     * Vérifier le rôle après l'authentification
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  mixed  $user
     * @return mixed
     */
    protected function authenticated(Request $request, $user)
    {
        // Vérifier le rôle de l'utilisateur
        if ($user->isAdministrateur()) {
            return redirect()->route('admin.dashboard');
        }
        
        if ($user->isEnseignant()) {
            return redirect()->route('enseignant.dashboard');
        }
        
        if ($user->isEtudiant()) {
            return redirect()->route('etudiant.dashboard');
        }
        
        // Si aucun rôle n'est trouvé
        Auth::logout();
        return redirect()->route('login')->withErrors([
            'login' => 'Aucun rôle n\'est assigné à cet utilisateur.',
        ]);
    }

    /**
     * Get the needed authorization credentials from the request.
     * Utiliser 'login' comme champ d'authentification
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    protected function credentials(Request $request)
    {
        return [
            'login' => $request->input('login'),
            'password' => $request->input('password'),
        ];
    }

    /**
     * Get the login username to be used by the controller.
     * Changer le champ de connexion de 'email' à 'login'
     *
     * @return string
     */
    public function username()
    {
        return 'login';
    }

    /**
     * Validate the user login request.
     * Personnaliser les messages d'erreur
     *
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    protected function validateLogin(Request $request)
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);
    }

    /**
     * Attempt to log the user into the application.
     * Personnaliser la tentative de connexion
     *
     * @param  \Illuminate\Http\Request  $request
     * @return bool
     */
    protected function attemptLogin(Request $request)
    {
        $credentials = $this->credentials($request);
        
        return Auth::attempt($credentials);
    }

    /**
     * Send the response after the user was authenticated.
     * Personnaliser la redirection après login
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    protected function sendLoginResponse(Request $request)
    {
        $request->session()->regenerate();
        
        $this->clearLoginAttempts($request);
        
        $user = Auth::user();
        
        // Stocker le rôle dans la session
        if ($user->isAdministrateur()) {
            session(['user_role' => 'admin']);
            $redirectTo = route('admin.dashboard');
        } elseif ($user->isEnseignant()) {
            session(['user_role' => 'enseignant']);
            $redirectTo = route('enseignant.dashboard');
        } elseif ($user->isEtudiant()) {
            session(['user_role' => 'etudiant']);
            $redirectTo = route('etudiant.dashboard');
        } else {
            $redirectTo = route('login');
        }
        
        return redirect()->intended($redirectTo);
    }

    /**
     * Log the user out of the application.
     * Supprimer le rôle de la session lors de la déconnexion
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function logout(Request $request)
    {
        $request->session()->forget('user_role');
        
        $this->guard()->logout();
        
        $request->session()->invalidate();
        
        $request->session()->regenerateToken();
        
        return redirect('/login');
    }
}