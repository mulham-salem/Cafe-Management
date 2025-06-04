@php
    use Illuminate\Support\Facades\Auth;

    if (Auth::guard('manager')->check()) {
        $actionRoute = route('manager.change-password');
    } elseif (Auth::check()) {
        $role = Auth::user()->role;
        $actionRoute = route("$role.change-password");
    } else {
        $actionRoute = '#';
    }
@endphp

<form method="POST" action="{{ $actionRoute }}">
    @csrf
    <label> Current Password: </label><br>
    <input type="password" name="current_password"><br>
    <label> New Password: </label><br>
    <input type="password" name="new_password"><br>
    <label> Confirm New Password: </label><br>
    <input type="password" name="new_password_confirmation"><br>
    <button type="submit">Change Password</button>
</form>
@if(session('message'))
    <p style="color: green;">{{ session('message') }}</p>
@endif

@if($errors->any())
    <ul style="color: red;">
        @foreach($errors->all() as $error)
            <li>{{ $error }}</li>
        @endforeach
    </ul>
@endif
