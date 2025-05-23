<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <title>Login</title>
</head>
<body>
<h2>login</h2>

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

<form method="POST" action="{{ route('login') }}">
    @csrf
    <label for="username">Username:</label>
    <input type="text" autocomplete="off" name="username" id="username" value="{{'customer_1'}}" required>

    <br>
    <label for="password">Password:</label>
    <input type="password" name="password" id="password" required>

    <br>
    <input type="checkbox" name="remember" id="remember">
    <label for="remember">Remember Me</label>

    <br>
    <button type="submit">Login</button>
</form>
</body>
</html>
