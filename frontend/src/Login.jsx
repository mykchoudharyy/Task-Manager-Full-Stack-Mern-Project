import { useState } from 'react';

function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault(); 
        try {
            const response = await fetch('https://task-manager-p7q1.onrender.com/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password })
            });
            const data = await response.json();
            
            if (data.success) {
                alert('Login Successful! ');
                // Token ko browser ki memory (localStorage) mein save kar lenge
                localStorage.setItem('token', data.token); 
                
                // App.jsx ko batao ki login ho gaya hai taaki tasks dikhne lagein
                onLoginSuccess(); 
            } else {
                alert('Oops! ' + data.message);
            }
        } catch (error) {
            console.log("Error:", error);
            alert('Server Not Responding.');
        }
    };

    return (
        <div style={{ border: '2px solid #4CAF50', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
            <h2>Login to Your Account</h2>
            <form onSubmit={handleLogin}>
                <input 
                    type="email" placeholder="Enter Email" value={email}
                    onChange={(e) => setEmail(e.target.value)} required 
                    style={{ padding: '8px', margin: '10px 0', width: '200px' }}
                />
                <br />
                <input 
                    type="password" placeholder="Enter Password" value={password}
                    onChange={(e) => setPassword(e.target.value)} required 
                    style={{ padding: '8px', margin: '10px 0', width: '200px' }}
                />
                <br />
                <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer', marginTop: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}>
                    Login
                </button>
            </form>
        </div>
    );
}

export default Login;